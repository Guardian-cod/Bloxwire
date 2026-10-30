// Brick-mosaic cover art. Each motif is a small pixel map; every pixel is
// drawn as a brick with a stud, so covers look built out of bricks.
// Add a motif: give it a grid (one string per row, "." = empty) and a palette.

export const MOTIFS = {
  pumpkin: {
    use: 'Halloween, horror, seasonal events',
    palette: { g: '#3E8E3A', o: '#F28C28', O: '#C9611A', y: '#FFE066' },
    grid: [
      '......gg.....',
      '.....gg......',
      '..oooOoOooo..',
      '.ooooOoOoooO.',
      'oooyooOooyooO',
      'ooyyyoOoyyyoO',
      'ooooooyoooooO',
      'ooyoooOoooyoO',
      'oooyyyyyyyooO',
      '.oooyoyoyooO.',
      '..ooooOoooO..',
      '...OOOOOOO...',
    ],
  },
  egg: {
    use: 'pets, hatching, collecting, Steal An Egg style games',
    palette: { w: '#FFF6DC', W: '#E8D3A2', s: '#FFFFFF', p: '#46C2B4', P: '#FF7FA8' },
    grid: [
      '....wwww....',
      '...wwwwwW...',
      '..wswwwwwW..',
      '..swwPwwwW..',
      '.wswwwwwwwW.',
      '.wwwwwwpwwW.',
      '.wPwwwwwwwW.',
      '.wwwwwPwwwW.',
      '.wwpwwwwwwW.',
      '.wwwwwwwwWW.',
      '..wwwwwwWW..',
      '...WWWWWW...',
    ],
  },
  dice: {
    use: 'rolling, gacha, luck, RNG games',
    palette: { w: '#FFFFFF', W: '#D9DEEA', d: '#18203D', r: '#E8424F' },
    grid: [
      '.wwwwwwwwww.',
      'wwwwwwwwwwwW',
      'wrrwwwwwwwwW',
      'wrrwwwwwwwwW',
      'wwwwwwwwwwwW',
      'wwwwwddwwwwW',
      'wwwwwddwwwwW',
      'wwwwwwwwwwwW',
      'wwwwwwwwddwW',
      'wwwwwwwwddwW',
      'wwwwwwwwwwwW',
      '.WWWWWWWWWW.',
    ],
  },
  ghost: {
    use: 'horror, scary games, haunted maps',
    palette: { w: '#F4F6FF', W: '#C9CFEA', d: '#18203D', p: '#FF9EBB' },
    grid: [
      '...wwwwww...',
      '..wwwwwwwW..',
      '.wwwwwwwwwW.',
      '.wwddwwddwW.',
      '.wwddwwddwW.',
      '.wpwwwwwwpW.',
      '.wwwwddwwwW.',
      '.wwwwddwwwW.',
      '.wwwwwwwwwW.',
      '.wwwwwwwwwW.',
      '.wwWwwWwwWW.',
      '.w..w..w..W.',
    ],
  },
  trophy: {
    use: 'rankings, charts, records, best-of lists',
    palette: { y: '#F6C83A', Y: '#C99A12', s: '#FFF2B0', d: '#18203D', D: '#2D3866' },
    grid: [
      '.yyyyyyyyyy.',
      'ysyyyyyyyyYy',
      'y.syyyyyyY.y',
      'y.yyyyyyyY.y',
      'yy.yyyyyY.yy',
      '...yyyyyY...',
      '....yyyY....',
      '.....yY.....',
      '.....yY.....',
      '....yyYY....',
      '...dddddd...',
      '...DDDDDD...',
    ],
  },
  bolt: {
    use: 'action, speed, PvP, fighting, competitive games',
    palette: { y: '#FFE066', Y: '#F6C83A', w: '#FFFFFF' },
    grid: [
      '......yyyy..',
      '.....yyyY...',
      '....ywyY....',
      '...ywyY.....',
      '..yyyyyyyy..',
      '..YYYYyyyY..',
      '.....yyyY...',
      '....yyyY....',
      '...yyyY.....',
      '..yyY.......',
      '.yY.........',
    ],
  },
  arrow: {
    use: 'trending, rising games, new hits climbing the charts',
    palette: { g: '#5BE38A', G: '#2FB566', w: '#E9FFF0' },
    grid: [
      '.....gg.....',
      '....gwgG....',
      '...gwggGG...',
      '..gwgggGGG..',
      '.gggggggGGG.',
      'GGGGggggGGGG',
      '....gggG....',
      '....gggG....',
      '....gggG....',
      '....gggG....',
      '....gggG....',
      '....GGGG....',
    ],
  },
  house: {
    use: 'roleplay, life sim, building, tycoon, Brookhaven style games',
    palette: { r: '#E8424F', R: '#B42D39', w: '#FFF6DC', W: '#E8D3A2', b: '#7FD6FF', d: '#7A4A2A' },
    grid: [
      '.....rr.....',
      '....rrrR....',
      '...rrrrRR...',
      '..rrrrrrRR..',
      '.rrrrrrrrRR.',
      'RRRRRRRRRRRR',
      '.wwwwwwwwwW.',
      '.wbbwwwbbwW.',
      '.wbbwwwbbwW.',
      '.wwwwddwwwW.',
      '.wwwwddwwwW.',
      '.WWWWddWWWW.',
    ],
  },
  fish: {
    use: 'fishing games, ocean, Fisch style games',
    palette: { o: '#FF9F43', O: '#D9731B', w: '#FFFFFF', d: '#18203D' },
    grid: [
      '......ooo.....',
      '.....oooO.....',
      '...ooooooO..oo',
      '..owdoooooOooO',
      '.oooooooooOoO.',
      '.ooooooooooO..',
      '..ooooooooOoO.',
      '...ooooooO.oOO',
      '.....oooO...OO',
      '......oO......',
    ],
  },
  drop: {
    use: 'water, pools, swimming, splash games, Poolrooms style horror',
    palette: { b: '#4FB3FF', B: '#2A7FD1', w: '#E6F6FF' },
    grid: [
      '.....bb.....',
      '.....bb.....',
      '....bbbB....',
      '....bbbB....',
      '...bwbbbB...',
      '..bwbbbbbB..',
      '..bwbbbbbB..',
      '.bwbbbbbbbB.',
      '.bbbbbbbbbB.',
      '.bbbbbbbbBB.',
      '..bbbbbbBB..',
      '...BBBBBB...',
    ],
  },
  sword: {
    use: 'anime fighting, RPGs, adventure, Blox Fruits style games',
    palette: { s: '#E9EDFB', S: '#A6AED0', y: '#F6C83A', Y: '#C99A12', b: '#7A3FD1' },
    grid: [
      '..........ss',
      '.........ssS',
      '........ssS.',
      '.......ssS..',
      '......ssS...',
      '.....ssS....',
      '..y.ssS.....',
      '..yYsS......',
      '...YY.......',
      '..bYyY......',
      '.bb..y......',
      'bb..........',
    ],
  },
  star: {
    use: 'hidden gems, recommendations, favorites',
    palette: { y: '#FFE066', Y: '#F6C83A', w: '#FFFFFF' },
    grid: [
      '.....yy.....',
      '.....yy.....',
      '....ywyY....',
      '....yyyY....',
      'yyyyyyyyyyyY',
      '.yyyyyyyyyY.',
      '..yyyyyyyY..',
      '...yyyyyY...',
      '...yyYyyY...',
      '..yyY..yyY..',
      '..yY....yY..',
      '.yY......yY.',
    ],
  },
  brain: {
    use: 'brainrot games, meme games, fusion and merging games',
    palette: { p: '#FF9EBB', P: '#E06A92', w: '#FFE3EC' },
    grid: [
      '...pppppp...',
      '..pwppPppp..',
      '.pwpPppppPp.',
      'pppPppPppPpP',
      'pPpppPpppppP',
      'ppPpppPppPpP',
      '.pppPpppPppP',
      '..pppppppPP.',
      '.....PPP....',
      '.....PP.....',
    ],
  },
  gem: {
    use: 'gems, mining, loot, treasure, rare items',
    palette: { c: '#56D8F0', C: '#2BA3C4', w: '#E6FBFF' },
    grid: [
      '...cccccc...',
      '..cwccccCC..',
      '.cwccccccCC.',
      'CCCCCCCCCCCC',
      '.ccwccccccC.',
      '..cwccccCC..',
      '...cccccC...',
      '....cccC....',
      '.....cC.....',
    ],
  },
  controller: {
    use: 'general Roblox news, platform updates, anything else',
    palette: { d: '#2D3866', D: '#18203D', w: '#E9EDFB', r: '#E8424F', g: '#5BE38A', y: '#F6C83A', b: '#7FA2FF' },
    grid: [
      '..dddddddddd..',
      '.dddddddddddd.',
      'ddwdddddddyddD',
      'dwwwddddddbdgD',
      'ddwdddddddrddD',
      'dddddddddddddD',
      'ddddDDDDDDdddD',
      'dddD......DddD',
      '.DD........DD.',
    ],
  },
};

export const BACKGROUNDS = {
  trending: ['#2557E8', '#1A3FB0'],
  updates: ['#6B33C4', '#4F2296'],
  guides: ['#0F7C8C', '#0A5A66'],
  'hidden-gems': ['#B5541A', '#8A3D10'],
  night: ['#1D2347', '#121733'],
};

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt)))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Renders a 1200x630 SVG. `motifs` can be one name or a list (main first).
export function coverSvg(motifs, bgKey = 'trending', title = '') {
  const list = (Array.isArray(motifs) ? motifs : [motifs]).filter((m) => MOTIFS[m]);
  if (!list.length) list.push('controller');
  const [bg, bgDark] = BACKGROUNDS[bgKey] || BACKGROUNDS.trending;
  const W = 1200, H = 630;
  const parts = [];

  const brick = (x, y, s, color) => {
    const r = Math.max(2, s * 0.12);
    const stud = s * 0.27;
    return `<rect x="${x + s * 0.04}" y="${y + s * 0.04}" width="${s * 0.92}" height="${s * 0.92}" rx="${r}" fill="${color}"/>` +
      `<rect x="${x + s * 0.04}" y="${y + s * 0.8}" width="${s * 0.92}" height="${s * 0.16}" rx="${r}" fill="${shade(color, -0.22)}"/>` +
      `<circle cx="${x + s / 2}" cy="${y + s / 2 + s * 0.03}" r="${stud}" fill="${shade(color, -0.16)}"/>` +
      `<circle cx="${x + s / 2}" cy="${y + s / 2 - s * 0.02}" r="${stud}" fill="${color}"/>` +
      `<circle cx="${x + s / 2 - stud * 0.35}" cy="${y + s / 2 - stud * 0.4}" r="${stud * 0.32}" fill="${shade(color, 0.45)}" opacity=".8"/>`;
  };

  const drawMotif = (name, cx, cy, size, rot = 0) => {
    const m = MOTIFS[name];
    const rows = m.grid.length, cols = Math.max(...m.grid.map((r) => r.length));
    const s = size / Math.max(rows, cols);
    const ox = cx - (cols * s) / 2, oy = cy - (rows * s) / 2;
    const out = [`<g transform="rotate(${rot} ${cx} ${cy})">`];
    // drop shadow
    m.grid.forEach((row, j) => [...row].forEach((ch, i) => {
      if (m.palette[ch]) out.push(`<rect x="${ox + i * s + s * 0.18}" y="${oy + j * s + s * 0.28}" width="${s * 0.92}" height="${s * 0.92}" rx="${s * 0.12}" fill="#000" opacity=".18"/>`);
    }));
    m.grid.forEach((row, j) => [...row].forEach((ch, i) => {
      if (m.palette[ch]) out.push(brick(ox + i * s, oy + j * s, s, m.palette[ch]));
    }));
    out.push('</g>');
    return out.join('');
  };

  // Baseplate background with faint studs
  parts.push(`<defs><pattern id="studs" width="30" height="30" patternUnits="userSpaceOnUse">` +
    `<circle cx="15" cy="16.5" r="8" fill="${bgDark}" opacity=".55"/><circle cx="15" cy="14.5" r="8" fill="${shade(bg, 0.1)}" opacity=".7"/></pattern>` +
    `<radialGradient id="glow" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`);
  parts.push(`<rect width="${W}" height="${H}" fill="${bg}"/><rect width="${W}" height="${H}" fill="url(#studs)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`);

  // Seeded scatter of loose bricks for a "workshop table" feel
  let seed = [...list.join('') + title].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const loose = ['#F6C83A', '#FFFFFF', '#E8424F', '#5BE38A', '#7FD6FF'];
  for (let k = 0; k < 9; k++) {
    const x = rnd() * W, y = rnd() * H;
    if (Math.abs(x - W / 2) < 300 && Math.abs(y - H / 2) < 250) continue;
    const s = 26 + rnd() * 22;
    parts.push(`<g transform="rotate(${Math.round(rnd() * 50 - 25)} ${x} ${y})" opacity=".9">${brick(x - s / 2, y - s / 2, s, loose[k % loose.length])}${rnd() > 0.5 ? brick(x + s / 2, y - s / 2, s, loose[k % loose.length]) : ''}</g>`);
  }

  if (list.length === 1) {
    parts.push(drawMotif(list[0], W / 2, H / 2 + 6, 440));
  } else {
    const extra = list.slice(1, 3);
    parts.push(drawMotif(list[0], W / 2, H / 2 + 6, 420));
    if (extra[0]) parts.push(drawMotif(extra[0], W / 2 - 360, H / 2 + 90, 200, -10));
    if (extra[1]) parts.push(drawMotif(extra[1], W / 2 + 360, H / 2 - 80, 200, 10));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title.replace(/"/g, '&quot;')}">${parts.join('')}</svg>`;
}
