import { useMemo } from 'react';
import { PlayCircle } from 'lucide-react';
import type { WatchUnit } from '../data/types';
import { useUnits } from '../context/CatalogContext';
import { useStore } from '../store/store';
import { hasActiveFilters, useUi } from '../store/ui';
import {
  applyFilters,
  computeStats,
  continueWatching,
  nextUp,
  visibleUnits,
} from '../data/selectors';
import { phaseLabel, pct } from '../lib/format';
import HeroNextUp from './HeroNextUp';
import Rail from './Rail';
import Grid from './Grid';
import ProgressBar from './ProgressBar';

export default function Home() {
  const units = useUnits();
  const progress = useStore((s) => s.progress);
  const settings = useStore((s) => s.settings);
  const filters = useUi((s) => s.filters);

  const visible = useMemo(() => visibleUnits(units, settings), [units, settings]);
  const filtered = useMemo(
    () => applyFilters(visible, filters, progress),
    [visible, filters, progress],
  );
  const next = useMemo(() => nextUp(visible, progress), [visible, progress]);
  const inProgress = useMemo(() => continueWatching(visible, progress), [visible, progress]);
  const stats = useMemo(() => computeStats(units, progress, settings), [units, progress, settings]);
  const overall = pct(stats.watchedUnits, stats.totalUnits);

  const filtering = hasActiveFilters(filters);

  // Group filtered units by saga · phase. Units keep chronological/release order
  // within a rail; the rails themselves run saga → phase order so the phase
  // headings read 1 → 6 rather than the interleaved chronology.
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { label: string; saga: string; phase: number | string; units: WatchUnit[] }
    >();
    for (const u of filtered) {
      const key = `${u.saga}::${phaseLabel(u.phase)}`;
      if (!map.has(key))
        map.set(key, { label: phaseLabel(u.phase), saga: u.saga, phase: u.phase, units: [] });
      map.get(key)!.units.push(u);
    }
    const sagaRank: Record<string, number> = {
      'Infinity Saga': 0,
      'Multiverse Saga': 1,
      'Defenders Saga': 2,
      'Marvel Television': 3,
    };
    const rank = (g: { saga: string; phase: number | string }) =>
      (sagaRank[g.saga] ?? 4) * 100 + (typeof g.phase === 'number' ? g.phase : 99);
    return [...map.values()].sort((a, b) => rank(a) - rank(b));
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {!filtering && (
        <>
          <HeroNextUp unit={next} />

          {/* overall progress strip */}
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-surface-2/60 p-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl">{overall}%</span>
              <span className="text-sm text-muted">
                {stats.watchedUnits}/{stats.totalUnits} watched
              </span>
            </div>
            <ProgressBar value={overall} className="flex-1" />
            <span className="text-xs text-muted">
              {Math.round(stats.remainingMinutes / 60)}h left in this view
            </span>
          </div>

          {inProgress.length > 0 && (
            <div className="mt-8">
              <Rail
                title="Continue watching"
                subtitle="Series and arcs you've started"
                units={inProgress}
                flat
              />
            </div>
          )}
        </>
      )}

      {filtering && (
        <div className="mb-2 flex items-center gap-2 text-sm text-muted">
          <PlayCircle size={16} />
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-10">
        {settings.layout === 'grid' || filtering ? (
          filtered.length ? (
            <Grid units={filtered} />
          ) : (
            <Empty />
          )
        ) : groups.length ? (
          groups.map((g) => (
            <Rail key={`${g.saga}-${g.label}`} title={g.label} subtitle={g.saga} units={g.units} />
          ))
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
      Nothing matches your filters. Try clearing them or enabling adjacent titles.
    </div>
  );
}
