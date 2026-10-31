// Bloxwire static site builder. No dependencies: `node src/build.mjs`
// Reads site.json, data/*.json and content/posts/*.md, writes dist/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, markdown, escapeHtml as esc } from './md.mjs';
import { coverSvg, MOTIFS, BACKGROUNDS } from './covers.mjs';

const DEFAULT_COVER = { trending: 'arrow', updates: 'controller', guides: 'trophy', 'hidden-gems': 'star' };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const site = readJson('site.json');
const games = readJson('data/games.json').games;
const chart = fs.existsSync(path.join(ROOT, 'data/chart.json')) ? readJson('data/chart.json') : null;
// Live player counts written by src/live.mjs in CI. Ignored if missing or older than 6 hours.
let live = fs.existsSync(path.join(ROOT, 'data/live.json')) ? readJson('data/live.json') : null;
if (live && !(Date.now() - Date.parse(live.fetchedAt) < 6 * 3600e3)) live = null;

// URL setup. Priority: env (set by GitHub Actions) > customDomain > site.json
if (site.customDomain) { site.url = `https://${site.customDomain}`; site.basePath = ''; }
if (process.env.SITE_URL) site.url = process.env.SITE_URL.replace(/\/$/, '');
if (process.env.BASE_PATH !== undefined) site.basePath = process.env.BASE_PATH.replace(/\/$/, '');
const BASE = site.basePath || '';
const u = (p = '/') => `${BASE}${p}`;
const abs = (p = '/') => `${site.url}${BASE}${p}`;
const HAS_OG = fs.existsSync(path.join(ROOT, 'public/og.png'));
const fixUrl = (href) => (href.startsWith('/') && !href.startsWith('//') ? u(href) : href);

// ---------- Load + validate posts ----------
const errors = [];
const postsDir = path.join(ROOT, 'content/posts');
const includeDrafts = process.argv.includes('--drafts');
const posts = fs.readdirSync(postsDir)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(postsDir, file), 'utf8'));
    const slug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    for (const key of ['title', 'description', 'date', 'category']) {
      if (!data[key]) errors.push(`${file}: missing "${key}" in frontmatter`);
    }
    if (data.category && !site.categories[data.category]) {
      errors.push(`${file}: unknown category "${data.category}" (use one of: ${Object.keys(site.categories).join(', ')})`);
    }
    if (data.promo && !games[data.promo]) {
      errors.push(`${file}: unknown promo "${data.promo}" (use one of: ${Object.keys(games).join(', ')})`);
    }
    if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
      errors.push(`${file}: date must look like 2026-10-22`);
    }
    if (data.description && String(data.description).length > 170) {
      errors.push(`${file}: description is ${String(data.description).length} chars, keep it under 170`);
    }
    const cover = data.cover ? (Array.isArray(data.cover) ? data.cover : [data.cover]) : [DEFAULT_COVER[data.category] || 'controller'];
    for (const m of cover) if (!MOTIFS[m]) errors.push(`${file}: unknown cover "${m}" (use: ${Object.keys(MOTIFS).join(', ')})`);
    if (data.coverBg && !BACKGROUNDS[data.coverBg]) errors.push(`${file}: unknown coverBg "${data.coverBg}" (use: ${Object.keys(BACKGROUNDS).join(', ')})`);
    data.cover = cover;
    const { html, headings } = markdown(body, { fixUrl });
    const words = body.split(/\s+/).filter(Boolean).length;
    return {
      ...data, file, slug, html, headings,
      date: String(data.date),
      minutes: Math.max(1, Math.round(words / 220)),
      url: `/posts/${slug}/`,
      coverUrl: `/covers/${slug}.svg`,
    };
  })
  .filter((p) => includeDrafts || !p.draft)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

const slugs = new Set();
for (const p of posts) {
  if (slugs.has(p.slug)) errors.push(`duplicate slug "${p.slug}"`);
  slugs.add(p.slug);
}
if (chart) {
  for (const e of chart.entries) {
    if (e.post && !slugs.has(e.post)) errors.push(`data/chart.json: entry "${e.name}" links to missing post "${e.post}"`);
  }
}
if (errors.length) {
  console.error('Build failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}

// ---------- Helpers ----------
const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const catName = (c) => site.categories[c]?.name || c;

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

// ---------- Layout ----------
function layout({ title, description, pathname, body, type = 'website', extraHead = '', bodyClass = '' }) {
  const fullTitle = title ? `${title} | ${site.title}` : `${site.title}: ${site.tagline}`;
  const nav = Object.entries(site.categories)
    .map(([k, c]) => `<a href="${u(`/category/${k}/`)}"${pathname === `/category/${k}/` ? ' aria-current="page"' : ''}>${esc(c.name)}</a>`)
    .join('');
  return `<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.description)}">
<link rel="canonical" href="${abs(pathname)}">
<meta property="og:site_name" content="${esc(site.title)}">
<meta property="og:title" content="${esc(title || site.title)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${abs(pathname)}">
${HAS_OG ? `<meta property="og:image" content="${abs('/og.png')}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#2557E8">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">` : ''}
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(site.title)}" href="${u('/rss.xml')}">
<link rel="preload" href="${u('/fonts/LilitaOne-Regular.woff')}" as="font" type="font/woff" crossorigin>
<link rel="preload" href="${u('/fonts/AtkinsonHyperlegible-Regular.woff')}" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="${u('/style.css')}">
<script>(function(){var on;try{var v=localStorage.getItem('bw-anim');if(v)on=v==='on';}catch(e){}if(on===undefined)on=!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);if(on)document.documentElement.classList.add('anim-on');})();</script>
${extraHead}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="wrap masthead-inner">
    <a class="logo" href="${u('/')}" aria-label="${esc(site.title)} home"><span class="logo-brick" aria-hidden="true"></span>${esc(site.title)}</a>
    <nav class="nav" aria-label="Sections">${nav}</nav>
  </div>
</header>
<div class="rail rail-left" aria-hidden="true">
  <div class="obby">
    <span class="plat p1"></span><span class="plat p2"></span><span class="plat p3"></span><span class="plat p4"></span><span class="plat p5"></span>
    <span class="flag"></span>
    <span class="coin c1"></span><span class="coin c2"></span><span class="coin c3"></span>
    <span class="bot"><svg viewBox="0 0 28 44" width="28" height="44"><rect x="4" y="0" width="20" height="16" rx="3" fill="#2557E8"/><rect x="7" y="5" width="14" height="5" rx="2" fill="#F6C83A"/><rect x="2" y="17" width="24" height="14" rx="2" fill="#FFFFFF"/><rect x="11" y="20" width="6" height="6" rx="1" fill="#E8424F"/><rect x="0" y="17" width="4" height="12" rx="2" fill="#2557E8"/><rect x="24" y="17" width="4" height="12" rx="2" fill="#2557E8"/><rect x="4" y="31" width="9" height="13" rx="2" fill="#18203D"/><rect x="15" y="31" width="9" height="13" rx="2" fill="#18203D"/></svg></span>
  </div>
</div>
<div class="rail rail-right" aria-hidden="true">
  <div class="stack">${[1,2,3,4,5,6,7].map((i) => `<span class="drop d${i}"></span>`).join('')}<span class="baseplate"></span></div>
</div>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-logo">${esc(site.title)}</p>
      <p>${esc(site.description)}</p>
    </div>
    <div>
      <p><a href="${u('/about/')}">About Bloxwire</a></p>
      <p><a href="${u('/games/')}">Games we make</a></p>
      ${site.community?.url ? `<p><a href="${esc(site.community.url)}" rel="noopener" target="_blank">Our Roblox community</a></p>` : ''}
      <p><a href="${u('/rss.xml')}">RSS feed</a></p>
    </div>
    <p class="footer-fine">Bloxwire is an independent fan site and is not affiliated with or endorsed by Roblox Corporation. Game names belong to their creators. When we write about a game we made ourselves, we say so right there in the article.</p>
  </div>
</footer>
<button class="anim-toggle" type="button" aria-pressed="false">Pause animation</button>
<script>(function(){var b=document.querySelector('.anim-toggle'),r=document.documentElement;if(!b)return;function show(){var on=r.classList.contains('anim-on');b.textContent=on?'\u275A\u275A Pause animation':'\u25B6 Play animation';b.setAttribute('aria-pressed',String(!on));}show();b.addEventListener('click',function(){var on=!r.classList.contains('anim-on');r.classList.toggle('anim-on',on);try{localStorage.setItem('bw-anim',on?'on':'off');}catch(e){}show();});})();</script>
${site.goatcounter ? `<script data-goatcounter="https://${esc(site.goatcounter)}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>` : ''}
</body>
</html>`;
}

// ---------- Components ----------
function postRow(p) {
  return `<li class="row">
  <a class="row-link" href="${u(p.url)}">
    <img class="thumb" src="${u(p.coverUrl)}" alt="" width="120" height="120" loading="lazy">
    <span class="row-text">
      <span class="row-cat cat-${esc(p.category)}">${esc(catName(p.category))}</span>
      <span class="row-title">${esc(p.title)}</span>
      <span class="row-desc">${esc(p.description)}</span>
      <span class="row-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time>, ${p.minutes} min read${p.promo ? ', features our own game' : ''}</span>
    </span>
  </a>
</li>`;
}

function promoBox(key) {
  const g = games[key];
  if (!g) return '';
  const live = g.status === 'live' && g.url;
  return `<aside class="promo" aria-label="Our own game">
  ${g.cover ? `<img class="promo-art" src="${u(`/covers/game-${key}.svg`)}" alt="" width="1200" height="630" loading="lazy">` : ''}
  <p class="promo-kicker">From the Bloxwire workshop</p>
  <h2 class="promo-name">${esc(g.name)}</h2>
  <p>${esc(g.pitch)}</p>
  ${g.perk ? `<p class="promo-perk">${esc(g.perk)}${site.community?.url ? ` <a href="${esc(site.community.url)}" rel="noopener" target="_blank">Join ${esc(site.community.name)}</a>` : ''}</p>` : ''}
  ${live
    ? `<p><a class="button" href="${esc(g.url)}" rel="noopener" target="_blank">Play ${esc(g.name)} on Roblox</a></p>`
    : `<p class="promo-status">Still in development. We'll post here the day it goes live.</p>`}
  ${site.community?.url && !g.perk ? `<p class="promo-community"><a href="${esc(site.community.url)}" rel="noopener" target="_blank">Join ${esc(site.community.name)} on Roblox</a> ${live ? 'for updates, events and codes.' : 'to hear first when it launches.'}</p>` : ''}
  <p class="promo-disclosure">Full disclosure: this game is made by the person who runs Bloxwire. We only mention it where it genuinely fits the topic.</p>
</aside>`;
}

function chartBlock() {
  if (!chart || !chart.entries?.length) return '';
  const rows = chart.entries.map((e) => {
    let move = '';
    if (e.prev === null) move = '<span class="move move-new">New</span>';
    else if (typeof e.prev === 'number') {
      const d = e.prev - e.rank;
      move = d > 0 ? `<span class="move move-up" title="Up ${d}">&#9650; ${d}</span>`
        : d < 0 ? `<span class="move move-down" title="Down ${-d}">&#9660; ${-d}</span>`
        : '<span class="move move-same" title="No change">&#9644;</span>';
    }
    const now = live && e.placeId && live.games?.[e.placeId];
    const playing = now ? `<p class="chart-live"><span class="live-dot" aria-hidden="true"></span>${now.playing.toLocaleString('en-US')} playing now</p>` : '';
    const name = e.post ? `<a href="${u(`/posts/${e.post}/`)}">${esc(e.name)}</a>`
      : e.url ? `<a href="${esc(e.url)}" rel="noopener" target="_blank">${esc(e.name)}</a>` : esc(e.name);
    return `<li class="chart-row">
  <span class="brick" aria-label="Rank ${e.rank}">${e.rank}</span>
  <div class="chart-body">
    <p class="chart-name">${name}</p>
    <p class="chart-note">${esc(e.note)}</p>
    ${playing}
  </div>
  <div class="chart-side">${move}<span class="chart-genre">${esc(e.genre || '')}</span></div>
</li>`;
  }).join('\n');
  return `<section class="chart" aria-labelledby="chart-title">
  <div class="chart-head">
    <h2 id="chart-title">The Bloxwire Chart</h2>
    <p>Week of ${fmtDate(chart.week)}. ${esc(chart.intro || '')}</p>
  </div>
  <ol class="chart-list">
${rows}
  </ol>
  ${chart.method ? `<p class="chart-method">${esc(chart.method)}</p>` : ''}
  ${live && Object.keys(live.games || {}).length ? `<p class="chart-method">"Playing now" comes straight from Roblox and was last updated ${new Date(live.fetchedAt).toISOString().slice(11, 16)} UTC on ${fmtDate(live.fetchedAt.slice(0, 10))}. The ranking itself is set once a week.</p>` : ''}
</section>`;
}

// ---------- Pages ----------
fs.rmSync(DIST, { recursive: true, force: true });
copyDir(path.join(ROOT, 'public'), DIST);
for (const p of posts) write(`covers/${p.slug}.svg`, coverSvg(p.cover, p.coverBg || p.category, p.title));
for (const [k, g] of Object.entries(games)) {
  if (g.cover) write(`covers/game-${k}.svg`, coverSvg(g.cover, g.coverBg || 'night', g.name));
}

// Home
{
  const lead = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p !== lead);
  const leadHtml = lead ? `<article class="lead">
  <a href="${u(lead.url)}" class="lead-link">
    <img class="lead-art" src="${u(lead.coverUrl)}" alt="" width="1200" height="630">
    <span class="lead-text">
      <span class="row-cat cat-${esc(lead.category)}">${esc(catName(lead.category))}</span>
      <span class="lead-title">${esc(lead.title)}</span>
      <span class="lead-desc">${esc(lead.description)}</span>
      <span class="row-meta"><time datetime="${lead.date}">${fmtDate(lead.date)}</time>, ${lead.minutes} min read</span>
    </span>
  </a>
</article>` : '<p>No stories yet. The first ones are on their way.</p>';
  const body = `<div class="wrap home">
  <section class="intro">
    <h1>${esc(site.tagline)}</h1>
  </section>
  ${leadHtml}
  <div class="home-grid">
    ${chartBlock()}
    <section class="latest" aria-labelledby="latest-title">
      <h2 id="latest-title" class="section-title">Latest stories</h2>
      <ul class="rows">${rest.slice(0, 12).map(postRow).join('\n')}</ul>
    </section>
  </div>
</div>`;
  write('index.html', layout({ pathname: '/', body, bodyClass: 'is-home' }));
}

// Posts
posts.forEach((p) => {
  const related = posts.filter((x) => x !== p && x.category === p.category).slice(0, 3);
  const more = related.length ? related : posts.filter((x) => x !== p).slice(0, 3);
  const toc = p.headings.length >= 3
    ? `<nav class="toc" aria-label="In this story"><p>In this story</p><ol>${p.headings.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol></nav>`
    : '';
  const sources = Array.isArray(p.sources) && p.sources.length
    ? `<section class="sources"><h2>Sources</h2><ul>${p.sources.map((s) => `<li><a href="${esc(s)}" rel="noopener nofollow" target="_blank">${esc(s.replace(/^https?:\/\/(www\.)?/, '').split('/')[0])}</a></li>`).join('')}</ul></section>`
    : '';
  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated || p.date, author: { '@type': 'Organization', name: site.author },
    publisher: { '@type': 'Organization', name: site.title }, mainEntityOfPage: abs(p.url),
  });
  const body = `<article class="wrap post">
  <header class="post-head">
    <a class="row-cat cat-${esc(p.category)}" href="${u(`/category/${p.category}/`)}">${esc(catName(p.category))}</a>
    <h1>${esc(p.title)}</h1>
    <p class="post-deck">${esc(p.description)}</p>
    <p class="row-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time>, ${p.minutes} min read${p.updated ? `, updated ${fmtDate(String(p.updated))}` : ''}</p>
  </header>
  <img class="post-art" src="${u(p.coverUrl)}" alt="" width="1200" height="630">
  ${toc}
  <div class="prose">
${p.html}
  </div>
  ${p.promo ? promoBox(p.promo) : ''}
  ${sources}
  <section class="more" aria-labelledby="more-title">
    <h2 id="more-title" class="section-title">Keep reading</h2>
    <ul class="rows">${more.map(postRow).join('\n')}</ul>
  </section>
</article>`;
  write(`posts/${p.slug}/index.html`, layout({
    title: p.title, description: p.description, pathname: p.url, body, type: 'article', bodyClass: 'is-post',
    extraHead: `<meta property="article:published_time" content="${p.date}">\n<script type="application/ld+json">${ld.replace(/</g, '\\u003c')}</script>`,
  }));
});

// Categories
for (const [key, c] of Object.entries(site.categories)) {
  const list = posts.filter((p) => p.category === key);
  const body = `<div class="wrap listing">
  <header class="listing-head"><h1>${esc(c.name)}</h1><p>${esc(c.blurb)}</p></header>
  ${list.length ? `<ul class="rows">${list.map(postRow).join('\n')}</ul>` : '<p class="empty">Nothing here yet. New stories land twice a week, so check back soon.</p>'}
</div>`;
  write(`category/${key}/index.html`, layout({ title: c.name, description: c.blurb, pathname: `/category/${key}/`, body }));
}

// Games we make
{
  const cards = Object.entries(games).map(([k, g]) => `<section class="game">
  ${g.cover ? `<img class="game-art" src="${u(`/covers/game-${k}.svg`)}" alt="" width="1200" height="630" loading="lazy">` : ''}
  <h2>${esc(g.name)}</h2>
  <p class="game-genre">${esc(g.genre)}</p>
  <p>${esc(g.pitch)}</p>
  ${g.perk ? `<p class="promo-perk">${esc(g.perk)}</p>` : ''}
  ${g.status === 'live' && g.url ? `<p><a class="button" href="${esc(g.url)}" rel="noopener" target="_blank">Play on Roblox</a></p>` : '<p class="promo-status">In development</p>'}
  ${posts.some((p) => p.promo === k) ? `<p><a href="${u('/')}#latest-title">Stories that mention it</a></p>` : ''}
</section>`).join('\n');
  const body = `<div class="wrap listing">
  <header class="listing-head"><h1>Games we make</h1><p>The person behind Bloxwire also builds Roblox games. These are ours. Whenever one shows up in an article, it comes with a clear note saying so.</p></header>
  ${site.community?.url ? `<section class="community-box"><div><h2>${esc(site.community.name)}</h2><p>${esc(site.community.blurb || '')}</p></div><p><a class="button" href="${esc(site.community.url)}" rel="noopener" target="_blank">Join the community on Roblox</a></p></section>` : ''}
  <div class="games">${cards}</div>
</div>`;
  write('games/index.html', layout({ title: 'Games we make', description: 'Roblox games made by the person behind Bloxwire.', pathname: '/games/', body }));
}

// About
{
  const body = `<div class="wrap listing prose-page">
  <header class="listing-head"><h1>About Bloxwire</h1></header>
  <div class="prose">
    <p>Roblox moves fast. A game nobody had heard of on Monday can have half a million players by Friday. Bloxwire keeps track of what is actually trending, explains why, and tells you whether it is worth jumping in.</p>
    <h2 id="how-we-work">How we work</h2>
    <ul>
      <li><strong>Twice a week:</strong> new stories on trending games, big updates, events and hidden gems.</li>
      <li><strong>The Bloxwire Chart</strong> ranks what is hot right now, based on public player counts, Roblox's own charts and what the community is talking about.</li>
      <li><strong>Sources are linked</strong> at the end of every story, so you can check the numbers yourself.</li>
      <li>We use AI tools to help research and draft stories. A human reviews and approves every post before it goes live.</li>
    </ul>
    <h2 id="our-own-games">Our own games</h2>
    <p>Bloxwire is run by a Roblox developer. Now and then we write about one of <a href="/games/">our own games</a>, but only when it fits the topic, and always with a clear note. No paid placements.</p>
    ${site.goatcounter ? `<h2 id="privacy">Privacy</h2>
    <p>We count page views with GoatCounter, which uses no cookies and collects no personal data. We only see totals, like how many people read a post.</p>
    ` : ''}<h2 id="not-official">Not official</h2>
    <p>Bloxwire is an independent fan site. It is not affiliated with or endorsed by Roblox Corporation.</p>
  </div>
</div>`;
  write('about/index.html', layout({ title: 'About', description: 'What Bloxwire is and how it works.', pathname: '/about/', body: body.replace('href="/games/"', `href="${u('/games/')}"`) }));
}

// 404
write('404.html', layout({
  title: 'Page not found', pathname: '/404.html',
  body: `<div class="wrap listing"><header class="listing-head"><h1>This page despawned</h1><p>The link may be old or mistyped. <a href="${u('/')}">Go to the front page</a> to see what's trending.</p></header></div>`,
}));

// RSS
{
  const items = posts.slice(0, 30).map((p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${abs(p.url)}</link>
  <guid>${abs(p.url)}</guid>
  <pubDate>${new Date(`${p.date}T08:00:00Z`).toUTCString()}</pubDate>
  <category>${esc(catName(p.category))}</category>
  <description>${esc(p.description)}</description>
</item>`).join('\n');
  write('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(site.title)}</title>
<link>${abs('/')}</link>
<description>${esc(site.description)}</description>
<language>${site.language}</language>
${items}
</channel></rss>`);
}

// Sitemap + robots
{
  const urls = ['/', '/about/', '/games/', ...Object.keys(site.categories).map((k) => `/category/${k}/`), ...posts.map((p) => p.url)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `<url><loc>${abs(p)}</loc></url>`).join('\n')}
</urlset>`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${abs('/sitemap.xml')}\n`);
  if (site.customDomain) write('CNAME', `${site.customDomain}\n`);
  write('.nojekyll', '');
}

console.log(`Built ${posts.length} post(s) into dist/ (base path "${BASE || '/'}")`);
