import { useCallback } from 'react';
import type { WatchUnit } from '../data/types';
import { epKey, useStore } from '../store/store';
import { useUnits } from '../context/CatalogContext';
import { arcEpisodeKeys, deriveStatus, hasEpisodes, visibleUnits } from '../data/selectors';
import { phaseLabel } from '../lib/format';
import { bigCelebrate, celebrate } from '../lib/confetti';
import { toast } from './useToast';

export function useWatchActions() {
  const units = useUnits();

  const setUnitStatus = useStore((s) => s.setUnitStatus);
  const setArcEpisodes = useStore((s) => s.setArcEpisodes);

  /**
   * Run `mutate`, then (when advancing progress) fire a toast + celebrate any
   * arc/phase/saga milestone that was just completed.
   */
  const withMilestones = useCallback(
    (unit: WatchUnit, mutate: () => void, doneMessage: string | null) => {
      const store = useStore.getState();
      const before = analyze(units, store.progress, store.settings);
      const arcDoneBefore = hasEpisodes(unit) ? deriveStatus(unit, store.progress) === 'watched' : false;

      mutate();

      if (!doneMessage) return;

      queueMicrotask(() => {
        const s = useStore.getState();
        const after = analyze(units, s.progress, s.settings);
        toast(doneMessage, 'success');

        // An episode action may have just completed the whole arc.
        if (hasEpisodes(unit) && !arcDoneBefore && deriveStatus(unit, s.progress) === 'watched') {
          toast(`${unit.title} complete`, 'success');
        }

        if (after.overallPct === 100 && before.overallPct < 100) {
          bigCelebrate();
          toast('Saga complete — you watched the entire MCU! 🎉', 'success');
          return;
        }
        const key = `${unit.saga}::${phaseLabel(unit.phase)}`;
        if (before.byPhase[key] !== undefined && before.byPhase[key] < 100 && after.byPhase[key] === 100) {
          celebrate();
          toast(`${phaseLabel(unit.phase)} complete!`, 'success');
        } else if (before.bySaga[unit.saga] < 100 && after.bySaga[unit.saga] === 100) {
          celebrate();
          toast(`${unit.saga} complete!`, 'success');
        }
      });
    },
    [units],
  );

  /** Mark an entire unit (film, one-shot, or whole series arc) watched/unwatched. */
  const setWatched = useCallback(
    (unit: WatchUnit, watched: boolean) => {
      withMilestones(
        unit,
        () => {
          if (hasEpisodes(unit)) setArcEpisodes(unit.titleId, arcEpisodeKeys(unit), watched);
          else setUnitStatus(unit.id, watched ? 'watched' : 'unwatched');
        },
        watched ? `Marked “${unit.title}” as watched` : null,
      );
    },
    [withMilestones, setArcEpisodes, setUnitStatus],
  );

  /** Mark a single episode of a series watched/unwatched, with milestones. */
  const setEpisode = useCallback(
    (unit: WatchUnit, key: string, season: number, episode: number, watched: boolean) => {
      withMilestones(
        unit,
        () => setArcEpisodes(unit.titleId, [key], watched),
        watched ? `Marked S${season}·E${episode} watched` : null,
      );
    },
    [withMilestones, setArcEpisodes],
  );

  /** Mark the next unwatched episode of a series arc watched (advances the arc). */
  const watchNextEpisode = useCallback(
    (unit: WatchUnit) => {
      if (!unit.episodes?.length) return;
      const s = useStore.getState();
      const seen = new Set(s.progress.episodes[unit.titleId] ?? []);
      const next = unit.episodes.find((e) => !seen.has(epKey(e.season, e.episodeNumber)));
      if (!next) return;
      setEpisode(unit, epKey(next.season, next.episodeNumber), next.season, next.episodeNumber, true);
    },
    [setEpisode],
  );

  const toggleWatched = useCallback(
    (unit: WatchUnit) => {
      const s = useStore.getState();
      setWatched(unit, deriveStatus(unit, s.progress) !== 'watched');
    },
    [setWatched],
  );

  return { setWatched, setEpisode, watchNextEpisode, toggleWatched };
}

interface Analysis {
  overallPct: number;
  byPhase: Record<string, number>;
  bySaga: Record<string, number>;
}

function analyze(
  units: WatchUnit[],
  progress: ReturnType<typeof useStore.getState>['progress'],
  settings: ReturnType<typeof useStore.getState>['settings'],
): Analysis {
  const list = visibleUnits(units, settings).filter((u) => !u.revisit);
  let watched = 0;
  const phaseTotals: Record<string, [number, number]> = {};
  const sagaTotals: Record<string, [number, number]> = {};

  for (const u of list) {
    const done = deriveStatus(u, progress) === 'watched' ? 1 : 0;
    watched += done;
    const pk = `${u.saga}::${phaseLabel(u.phase)}`;
    phaseTotals[pk] = [(phaseTotals[pk]?.[0] ?? 0) + done, (phaseTotals[pk]?.[1] ?? 0) + 1];
    sagaTotals[u.saga] = [(sagaTotals[u.saga]?.[0] ?? 0) + done, (sagaTotals[u.saga]?.[1] ?? 0) + 1];
  }

  const toPct = (r: Record<string, [number, number]>) =>
    Object.fromEntries(Object.entries(r).map(([k, [w, t]]) => [k, t ? Math.round((w / t) * 100) : 0]));

  return {
    overallPct: list.length ? Math.round((watched / list.length) * 100) : 0,
    byPhase: toPct(phaseTotals),
    bySaga: toPct(sagaTotals),
  };
}
