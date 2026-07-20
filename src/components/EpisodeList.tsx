import { Check, CheckCheck } from 'lucide-react';
import type { WatchUnit } from '../data/types';
import { epKey, useStore } from '../store/store';
import { seenEpisodeCount } from '../data/selectors';
import { useWatchActions } from '../hooks/useWatchActions';
import SmartImage from './SmartImage';
import ProgressBar from './ProgressBar';
import { formatDuration, pct } from '../lib/format';

export default function EpisodeList({ unit }: { unit: WatchUnit }) {
  const progress = useStore((s) => s.progress);
  const spoilerFree = useStore((s) => s.settings.spoilerFree);
  const { setWatched, setEpisode } = useWatchActions();

  if (!unit.episodes?.length) return null;
  const seen = new Set(progress.episodes[unit.titleId] ?? []);
  const total = unit.episodes.length;
  const seenCount = seenEpisodeCount(unit, progress);
  const allWatched = seenCount >= total;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-xl tracking-wide">Episodes</h3>
          <span className="text-sm text-muted">
            {seenCount}/{total}
          </span>
        </div>
        <button
          onClick={() => setWatched(unit, !allWatched)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold transition hover:bg-surface-3"
        >
          <CheckCheck size={14} />
          {allWatched ? 'Unwatch arc' : 'Mark whole arc'}
        </button>
      </div>

      <ProgressBar value={pct(seenCount, total)} className="mb-4" />

      <ul className="flex flex-col gap-2">
        {unit.episodes.map((ep) => {
          const key = epKey(ep.season, ep.episodeNumber);
          const isSeen = seen.has(key);
          const spoiler = spoilerFree && !isSeen;
          return (
            <li key={key}>
              <button
                onClick={() => setEpisode(unit, key, ep.season, ep.episodeNumber, !isSeen)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                  isSeen
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-border bg-surface-2 hover:bg-surface-3'
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                    isSeen ? 'border-accent bg-accent text-white' : 'border-border text-transparent'
                  }`}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                  <SmartImage src={ep.still.w300} alt={ep.name} className="h-full w-full" spoiler={spoiler} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted tabular-nums">
                      S{ep.season}·E{ep.episodeNumber}
                    </span>
                    <span className="truncate text-sm font-semibold">
                      {spoiler ? '•••••' : ep.name}
                    </span>
                  </div>
                  {ep.overview && (
                    <p className={`line-clamp-1 text-xs text-muted ${spoiler ? 'spoiler-blur' : ''}`}>
                      {ep.overview}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted tabular-nums">
                  {formatDuration(ep.runtimeMinutes)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
