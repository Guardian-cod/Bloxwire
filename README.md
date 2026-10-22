# Bloxwire

A blog about trending Roblox games. Static site, no dependencies.

- `content/posts/` – one Markdown file per post
- `data/chart.json` – the weekly Bloxwire Chart on the front page
- `data/games.json` – our own games (used for promo boxes, always with disclosure)
- `site.json` – title, categories, URL and optional custom domain
- `EDITORIAL.md` – rules for writing posts (followed by the automated writer)

## Build and preview

```
node src/build.mjs          # builds into dist/
npm run preview             # builds incl. drafts and serves on http://localhost:4321
```

## Publishing

Every push to `main` builds and publishes the site via GitHub Pages
(Settings → Pages → Source: GitHub Actions). New posts arrive as pull
requests; merging one publishes it.

## Custom domain / subdomain

1. Create a DNS record: `CNAME` `bloxwire` → `guardian-cod.github.io`
2. Put the full name in `site.json` → `"customDomain": "bloxwire.example.ch"`
3. In GitHub: Settings → Pages → Custom domain, enter the same name, then tick "Enforce HTTPS".
