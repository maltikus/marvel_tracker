import type { WatchUnit } from './types';
import type { Progress, Settings, UnitStatus } from '../store/store';
import { epKey } from '../store/store';
import { phaseLabel } from '../lib/format';

export const hasEpisodes = (u: WatchUnit): boolean => !!(u.episodes && u.episodes.length);

export function arcEpisodeKeys(u: WatchUnit): string[] {
  if (!u.episodes) return [];
  return u.episodes.map((e) => epKey(e.season, e.episodeNumber));
}

export function seenEpisodeCount(u: WatchUnit, progress: Progress): number {
  if (!u.episodes) return 0;
  const seen = new Set(progress.episodes[u.titleId] ?? []);
  return arcEpisodeKeys(u).filter((k) => seen.has(k)).length;
}

export function deriveStatus(u: WatchUnit, progress: Progress): UnitStatus {
  if (hasEpisodes(u)) {
    const total = u.episodes!.length;
    const seen = seenEpisodeCount(u, progress);
    if (seen >= total) return 'watched';
    if (seen > 0) return 'in_progress';
    return 'unwatched';
  }
  return progress.units[u.id]?.status ?? 'unwatched';
}

export function getRating(u: WatchUnit, progress: Progress): number | undefined {
  return progress.units[u.id]?.rating;
}

/** Watch-minutes already seen for a unit (episode-accurate for series). */
export function watchedMinutes(u: WatchUnit, progress: Progress): number {
  if (hasEpisodes(u)) {
    const seen = new Set(progress.episodes[u.titleId] ?? []);
    return u
      .episodes!.filter((e) => seen.has(epKey(e.season, e.episodeNumber)))
      .reduce((a, e) => a + e.runtimeMinutes, 0);
  }
  return deriveStatus(u, progress) === 'watched' ? u.watchTimeMinutes : 0;
}

/** Filter + sort units for the active settings. Revisit units stay in the list. */
export function visibleUnits(units: WatchUnit[], settings: Settings): WatchUnit[] {
  const filtered = units.filter((u) => {
    if (u.multiverseLayer && !settings.showOptionalMultiverse) return false;
    if (u.canon === 'adjacent' && !u.multiverseLayer && !settings.showAdjacent) return false;
    return true;
  });
  if (settings.order === 'release') {
    return [...filtered].sort(
      (a, b) =>
        (a.releaseDate || '').localeCompare(b.releaseDate || '') || a.order - b.order,
    );
  }
  return [...filtered].sort((a, b) => a.order - b.order);
}

export interface FilterInput {
  query: string;
  saga: string | 'all';
  phase: string | 'all';
  type: string | 'all';
  status: 'all' | 'unwatched' | 'in_progress' | 'watched';
}

export function applyFilters(
  units: WatchUnit[],
  filters: FilterInput,
  progress: Progress,
): WatchUnit[] {
  const q = filters.query.trim().toLowerCase();
  return units.filter((u) => {
    if (filters.saga !== 'all' && u.saga !== filters.saga) return false;
    if (filters.phase !== 'all' && phaseLabel(u.phase) !== filters.phase) return false;
    if (filters.type !== 'all' && u.type !== filters.type) return false;
    if (filters.status !== 'all' && deriveStatus(u, progress) !== filters.status) return false;
    if (q) {
      const hay = `${u.title} ${u.seriesTitle ?? ''} ${u.overview} ${u.saga} ${u.timelineLabel}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function nextUp(units: WatchUnit[], progress: Progress): WatchUnit | null {
  return units.find((u) => deriveStatus(u, progress) !== 'watched') ?? null;
}

export function continueWatching(units: WatchUnit[], progress: Progress): WatchUnit[] {
  return units.filter((u) => deriveStatus(u, progress) === 'in_progress');
}

/** Units that count toward totals (revisit dupes excluded). */
const countable = (units: WatchUnit[]) => units.filter((u) => !u.revisit);

export interface PhaseStat {
  key: string;
  label: string;
  saga: string;
  watched: number;
  total: number;
  watchedMinutes: number;
  totalMinutes: number;
}

export interface Stats {
  watchedUnits: number;
  totalUnits: number;
  watchedMinutes: number;
  totalMinutes: number;
  remainingMinutes: number;
  avgRating: number | null;
  ratedCount: number;
  phases: PhaseStat[];
  favorites: { unit: WatchUnit; rating: number }[];
}

export function computeStats(allUnits: WatchUnit[], progress: Progress, settings: Settings): Stats {
  const units = countable(visibleUnits(allUnits, settings));

  let watchedUnits = 0;
  let watchedMin = 0;
  let totalMin = 0;
  const ratings: number[] = [];
  const favorites: { unit: WatchUnit; rating: number }[] = [];
  const phaseMap = new Map<string, PhaseStat>();

  for (const u of units) {
    const status = deriveStatus(u, progress);
    totalMin += u.watchTimeMinutes;
    watchedMin += watchedMinutes(u, progress);
    if (status === 'watched') watchedUnits++;

    const rating = getRating(u, progress);
    if (typeof rating === 'number') {
      ratings.push(rating);
      favorites.push({ unit: u, rating });
    }

    const key = `${u.saga}::${phaseLabel(u.phase)}`;
    const ps =
      phaseMap.get(key) ??
      {
        key,
        label: phaseLabel(u.phase),
        saga: u.saga,
        watched: 0,
        total: 0,
        watchedMinutes: 0,
        totalMinutes: 0,
      };
    ps.total++;
    ps.totalMinutes += u.watchTimeMinutes;
    ps.watchedMinutes += watchedMinutes(u, progress);
    if (status === 'watched') ps.watched++;
    phaseMap.set(key, ps);
  }

  favorites.sort((a, b) => b.rating - a.rating);

  return {
    watchedUnits,
    totalUnits: units.length,
    watchedMinutes: watchedMin,
    totalMinutes: totalMin,
    remainingMinutes: Math.max(0, totalMin - watchedMin),
    avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    ratedCount: ratings.length,
    phases: [...phaseMap.values()],
    favorites: favorites.slice(0, 8),
  };
}
