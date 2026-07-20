/**
 * build-data.ts — turns the curated seed (src/data/catalog.seed.ts) into
 * public/data.json.
 *
 *   npm run build:data          # TMDB enrichment (needs TMDB_API_KEY)
 *   npm run seed:placeholder    # offline placeholder data (no key needed)
 *
 * The TMDB API key is read from env (TMDB_API_KEY, v3 key, or TMDB_READ_TOKEN,
 * v4 bearer). It NEVER ends up in the browser bundle — this is a Node-only step.
 *
 * If no key is present (or --placeholder is passed) we emit deterministic
 * placeholder data with inline SVG posters so the app is immediately runnable.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import SEED from '../src/data/catalog.seed.ts';
import type { CatalogData, Episode, SeedUnit, WatchUnit } from '../src/data/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/data.json');

// Load a local .env if present (Node 20.12+/22). tsx does not auto-load .env,
// so without this a key set in .env would be ignored and we'd fall back to
// placeholder data. CI passes real env vars, where there is no .env file.
try {
  process.loadEnvFile(resolve(__dirname, '../.env'));
} catch {
  /* no .env file — rely on process.env (e.g. GitHub Actions secrets) */
}

const API_KEY = process.env.TMDB_API_KEY ?? '';
const READ_TOKEN = process.env.TMDB_READ_TOKEN ?? '';
const PLACEHOLDER = process.argv.includes('--placeholder') || (!API_KEY && !READ_TOKEN);

const IMG = 'https://image.tmdb.org/t/p';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Fallback episode counts for whole-season arcs (arc.toEpisode === -1).
// Real-ish counts; also used for placeholder image/runtime generation.
// ---------------------------------------------------------------------------
const SEASON_EPISODES: Record<string, number> = {
  'eyes-of-wakanda#1': 4,
  'agent-carter#1': 8,
  'agent-carter#2': 10,
  'i-am-groot#1': 5,
  'i-am-groot#2': 5,
  'daredevil#1': 13,
  'daredevil#2': 13,
  'daredevil#3': 13,
  'jessica-jones#1': 13,
  'jessica-jones#2': 13,
  'jessica-jones#3': 13,
  'luke-cage#1': 13,
  'luke-cage#2': 13,
  'iron-fist#1': 13,
  'iron-fist#2': 10,
  'the-defenders#1': 8,
  'the-punisher#1': 13,
  'the-punisher#2': 13,
  'inhumans#1': 8,
  'runaways#1': 10,
  'runaways#2': 13,
  'runaways#3': 10,
  'cloak-and-dagger#1': 10,
  'cloak-and-dagger#2': 10,
  'agents-of-shield#6': 13,
  'agents-of-shield#7': 13,
  'loki#1': 6,
  'loki#2': 6,
  'what-if#1': 9,
  'what-if#2': 9,
  'what-if#3': 8,
  'wandavision#1': 9,
  'falcon-and-winter-soldier#1': 6,
  'hawkeye#1': 6,
  'moon-knight#1': 6,
  'echo#1': 5,
  'she-hulk#1': 9,
  'ms-marvel#1': 6,
  'ironheart#1': 6,
  'secret-invasion#1': 6,
  'agatha-all-along#1': 9,
  'wonder-man#1': 8,
  'daredevil-born-again#1': 9,
  'daredevil-born-again#2': 8,
  'marvel-zombies#1': 4,
  'your-friendly-neighborhood-spider-man#1': 10,
  'x-men-97#1': 10,
};

const seasonLen = (titleId: string, season: number): number =>
  SEASON_EPISODES[`${titleId}#${season}`] ?? 8;

const arcEpisodeNumbers = (unit: SeedUnit): number[] => {
  if (!unit.arc) return [];
  const { season, fromEpisode, toEpisode } = unit.arc;
  const end = toEpisode === -1 ? seasonLen(unit.titleId, season) : toEpisode;
  const out: number[] = [];
  for (let n = fromEpisode; n <= end; n++) out.push(n);
  return out;
};

// ---------------------------------------------------------------------------
// Placeholder generation (inline SVG data URIs — fully offline).
// ---------------------------------------------------------------------------
function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function svgDataUri(text: string, w: number, h: number, seed: string): string {
  const hue = hashHue(seed);
  const esc = (t: string) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const label = esc(text.length > 42 ? text.slice(0, 40) + '…' : text);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
<stop offset='0' stop-color='hsl(${hue} 45% 22%)'/>
<stop offset='1' stop-color='hsl(${(hue + 40) % 360} 55% 10%)'/>
</linearGradient></defs>
<rect width='${w}' height='${h}' fill='url(#g)'/>
<rect x='0' y='${h - 6}' width='${w}' height='6' fill='hsl(${hue} 70% 45%)'/>
<text x='50%' y='50%' fill='rgba(255,255,255,0.92)' font-family='Arial,Helvetica,sans-serif' font-size='${Math.round(
    w / 16,
  )}' font-weight='700' text-anchor='middle' dominant-baseline='middle'>${label}</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function placeholderRuntime(unit: SeedUnit): number {
  switch (unit.type) {
    case 'film':
      return 130;
    case 'oneshot':
      return 4;
    case 'short':
      return 4;
    case 'special':
      return 50;
    default:
      return 45;
  }
}

function buildPlaceholderEpisodes(unit: SeedUnit): Episode[] | undefined {
  if (!unit.arc) return undefined;
  const nums = arcEpisodeNumbers(unit);
  const per = unit.type === 'short' ? 4 : unit.type === 'series' ? 42 : 30;
  return nums.map((n) => ({
    season: unit.arc!.season,
    episodeNumber: n,
    name: `Episode ${n}`,
    overview: '',
    runtimeMinutes: per,
    still: {
      w300: svgDataUri(`${unit.seriesTitle ?? unit.title} · E${n}`, 300, 169, `${unit.id}-e${n}`),
      original: svgDataUri(`${unit.seriesTitle ?? unit.title} · E${n}`, 1280, 720, `${unit.id}-e${n}`),
    },
  }));
}

function toPlaceholderUnit(unit: SeedUnit): WatchUnit {
  const episodes = buildPlaceholderEpisodes(unit);
  const runtime = placeholderRuntime(unit);
  const watchTime = episodes
    ? episodes.reduce((a, e) => a + e.runtimeMinutes, 0)
    : runtime;
  const year = unit.searchYear ?? 2015;
  return {
    id: unit.id,
    order: unit.order,
    titleId: unit.titleId,
    title: unit.title,
    seriesTitle: unit.seriesTitle,
    type: unit.type,
    canon: unit.canon,
    saga: unit.saga,
    phase: unit.phase,
    releaseYear: year,
    releaseDate: `${year}-01-01`,
    timelineLabel: unit.timelineLabel,
    overview:
      'Metadata placeholder. Run `npm run build:data` with a TMDB_API_KEY to fetch the real synopsis, artwork and episode data.',
    genres: [],
    runtimeMinutes: runtime,
    watchTimeMinutes: watchTime,
    poster: {
      w500: svgDataUri(unit.title, 500, 750, unit.titleId),
      original: svgDataUri(unit.title, 1000, 1500, unit.titleId),
    },
    backdrop: {
      w1280: svgDataUri(unit.seriesTitle ?? unit.title, 1280, 720, unit.titleId + 'bd'),
      original: svgDataUri(unit.seriesTitle ?? unit.title, 1920, 1080, unit.titleId + 'bd'),
    },
    arc: unit.arc,
    episodes,
    note: unit.note,
    revisit: unit.revisit,
    optional: unit.optional,
    multiverseLayer: unit.multiverseLayer,
  };
}

// ---------------------------------------------------------------------------
// TMDB enrichment path
// ---------------------------------------------------------------------------

// Manual overrides for titles TMDB can't resolve cleanly (one-shots, shorts,
// specials). Key = seed id. Provide a tmdbId and/or a full fallback record.
const OVERRIDES: Record<string, { movieId?: number; tvId?: number }> = {
  // Fill in verified TMDB ids here if search disambiguation fails, e.g.:
  // 'one-shot-item-47': { movieId: 137299 },
};

type Json = Record<string, any>;

async function tmdb(path: string, params: Record<string, string> = {}): Promise<Json> {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (API_KEY) url.searchParams.set('api_key', API_KEY);
  const headers: Record<string, string> = { accept: 'application/json' };
  if (!API_KEY && READ_TOKEN) headers.authorization = `Bearer ${READ_TOKEN}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers });
    if (res.status === 429) {
      const retry = Number(res.headers.get('retry-after') ?? '2');
      await sleep((retry + 0.5) * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`TMDB ${res.status} ${res.statusText} for ${path}`);
    return (await res.json()) as Json;
  }
  throw new Error(`TMDB rate-limited repeatedly for ${path}`);
}

const img = (path: string | null, size: string): string =>
  path ? `${IMG}/${size}${path}` : '';

// Cache resolved title lookups + season data so arcs of the same series reuse them.
const movieCache = new Map<string, Json>();
const tvCache = new Map<string, Json>();
const seasonCache = new Map<string, Json>();

async function resolveMovie(unit: SeedUnit): Promise<Json | null> {
  const key = unit.titleId;
  if (movieCache.has(key)) return movieCache.get(key)!;
  let id = OVERRIDES[unit.id]?.movieId;
  if (!id) {
    const search = await tmdb('/search/movie', {
      query: unit.searchTitle,
      ...(unit.searchYear ? { primary_release_year: String(unit.searchYear) } : {}),
    });
    const results: Json[] = search.results ?? [];
    const best =
      results.find((x) => (x.release_date ?? '').startsWith(String(unit.searchYear))) ??
      results[0];
    if (!best) return null;
    id = best.id;
  }
  const details = await tmdb(`/movie/${id}`);
  movieCache.set(key, details);
  return details;
}

async function resolveTv(unit: SeedUnit): Promise<Json | null> {
  const key = unit.titleId;
  if (tvCache.has(key)) return tvCache.get(key)!;
  let id = OVERRIDES[unit.id]?.tvId;
  if (!id) {
    const search = await tmdb('/search/tv', {
      query: unit.searchTitle,
      ...(unit.searchYear ? { first_air_date_year: String(unit.searchYear) } : {}),
    });
    const results: Json[] = search.results ?? [];
    const best = results[0];
    if (!best) return null;
    id = best.id;
  }
  const details = await tmdb(`/tv/${id}`);
  tvCache.set(key, details);
  return details;
}

async function getSeason(tvId: number, season: number): Promise<Json | null> {
  const key = `${tvId}#${season}`;
  if (seasonCache.has(key)) return seasonCache.get(key)!;
  try {
    const data = await tmdb(`/tv/${tvId}/season/${season}`);
    seasonCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

async function enrich(unit: SeedUnit): Promise<WatchUnit> {
  const placeholder = toPlaceholderUnit(unit);
  try {
    if (unit.type === 'series' || unit.type === 'short') {
      const tv = await resolveTv(unit);
      if (!tv) {
        console.warn(`⚠︎  Unresolved (tv): ${unit.title}`);
        return placeholder;
      }
      const season = unit.arc?.season ?? 1;
      const seasonData = await getSeason(tv.id, season);
      const backdrop = tv.backdrop_path ?? seasonData?.poster_path ?? tv.poster_path;

      let episodes: Episode[] | undefined;
      let watchTime = 0;
      if (seasonData?.episodes) {
        const nums = new Set(arcEpisodeNumbers(unit));
        episodes = (seasonData.episodes as Json[])
          .filter((ep) => nums.size === 0 || nums.has(ep.episode_number))
          .map((ep): Episode => {
            const rt = ep.runtime ?? tv.episode_run_time?.[0] ?? 42;
            watchTime += rt;
            return {
              season,
              episodeNumber: ep.episode_number,
              name: ep.name ?? `Episode ${ep.episode_number}`,
              overview: ep.overview ?? '',
              runtimeMinutes: rt,
              still: {
                w300: img(ep.still_path, 'w300') || placeholder.backdrop.w1280,
                original: img(ep.still_path, 'original') || placeholder.backdrop.original,
              },
            };
          });
      }
      if (!episodes || episodes.length === 0) {
        episodes = placeholder.episodes;
        watchTime = placeholder.watchTimeMinutes;
      }

      const year = Number((tv.first_air_date ?? '').slice(0, 4)) || placeholder.releaseYear;
      return {
        ...placeholder,
        tmdbId: tv.id,
        overview: tv.overview || placeholder.overview,
        genres: (tv.genres ?? []).map((g: Json) => g.name),
        runtimeMinutes: tv.episode_run_time?.[0] ?? placeholder.runtimeMinutes,
        watchTimeMinutes: watchTime || placeholder.watchTimeMinutes,
        voteAverage: tv.vote_average,
        releaseYear: year,
        releaseDate: tv.first_air_date || placeholder.releaseDate,
        poster: {
          w500: img(tv.poster_path, 'w500') || placeholder.poster.w500,
          original: img(tv.poster_path, 'original') || placeholder.poster.original,
        },
        backdrop: {
          w1280: img(backdrop, 'w1280') || placeholder.backdrop.w1280,
          original: img(backdrop, 'original') || placeholder.backdrop.original,
        },
        episodes,
      };
    }

    // film / oneshot / special
    const movie = await resolveMovie(unit);
    if (!movie) {
      console.warn(`⚠︎  Unresolved (movie): ${unit.title}`);
      return placeholder;
    }
    const year = Number((movie.release_date ?? '').slice(0, 4)) || placeholder.releaseYear;
    const runtime = movie.runtime || placeholder.runtimeMinutes;
    return {
      ...placeholder,
      tmdbId: movie.id,
      overview: movie.overview || placeholder.overview,
      genres: (movie.genres ?? []).map((g: Json) => g.name),
      runtimeMinutes: runtime,
      watchTimeMinutes: runtime,
      voteAverage: movie.vote_average,
      releaseYear: year,
      releaseDate: movie.release_date || placeholder.releaseDate,
      poster: {
        w500: img(movie.poster_path, 'w500') || placeholder.poster.w500,
        original: img(movie.poster_path, 'original') || placeholder.poster.original,
      },
      backdrop: {
        w1280: img(movie.backdrop_path, 'w1280') || placeholder.backdrop.w1280,
        original: img(movie.backdrop_path, 'original') || placeholder.backdrop.original,
      },
    };
  } catch (err) {
    console.warn(`⚠︎  Error enriching ${unit.title}:`, (err as Error).message);
    return placeholder;
  }
}

async function main() {
  let units: WatchUnit[];
  let source: CatalogData['source'];

  if (PLACEHOLDER) {
    console.log('▶ Generating placeholder data.json (no TMDB key / --placeholder).');
    units = SEED.map(toPlaceholderUnit);
    source = 'placeholder';
  } else {
    console.log(`▶ Enriching ${SEED.length} units from TMDB…`);
    units = [];
    for (const unit of SEED) {
      units.push(await enrich(unit));
      await sleep(120); // polite rate limiting
    }
    source = 'tmdb';
  }

  const data: CatalogData = {
    generatedAt: new Date().toISOString(),
    source,
    units: units.sort((a, b) => a.order - b.order),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(data, null, 2));
  console.log(`✔ Wrote ${units.length} units → ${OUT} (source: ${source})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
