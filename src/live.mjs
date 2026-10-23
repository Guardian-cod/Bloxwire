// Fetches current player counts for the chart games from Roblox's public API
// and writes data/live.json (not committed; used by build.mjs).
// Run by GitHub Actions before each build: `node src/live.mjs`
// Never fails the build: on any problem it logs a warning and writes nothing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data/live.json');
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function main() {
  fs.rmSync(OUT, { force: true });
  const chart = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/chart.json'), 'utf8'));
  const entries = (chart.entries || []).filter((e) => e.placeId);
  if (!entries.length) { console.log('live: no chart entries with placeId, skipping'); return; }

  // placeId -> universeId (one small request per game)
  const universe = {};
  for (const e of entries) {
    try {
      const r = await getJson(`https://apis.roblox.com/universes/v1/places/${e.placeId}/universe`);
      if (r.universeId) universe[e.placeId] = r.universeId;
    } catch (err) { console.warn(`live: could not resolve place ${e.placeId} (${e.name}): ${err.message}`); }
  }
  const ids = Object.values(universe);
  if (!ids.length) { console.warn('live: no universes resolved, skipping'); return; }

  const { data = [] } = await getJson(`https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`);
  const byUniverse = Object.fromEntries(data.map((g) => [g.id, g]));
  const games = {};
  for (const e of entries) {
    const g = byUniverse[universe[e.placeId]];
    if (!g || typeof g.playing !== 'number') continue;
    // Safety net against a wrong placeId: the Roblox name must contain the chart name.
    if (!norm(g.name).includes(norm(e.name))) {
      console.warn(`live: placeId ${e.placeId} is "${g.name}" on Roblox, not "${e.name}". Skipping it.`);
      continue;
    }
    games[e.placeId] = { name: g.name, playing: g.playing, visits: g.visits };
  }
  fs.writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), games }, null, 2));
  console.log(`live: player counts for ${Object.keys(games).length}/${entries.length} chart games written to data/live.json`);
}

main().catch((err) => { console.warn(`live: skipped (${err.message})`); });
