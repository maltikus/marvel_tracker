import { motion } from 'framer-motion';
import { Check, CheckCheck, Info, Play, Sparkles } from 'lucide-react';
import type { WatchUnit } from '../data/types';
import { useStore } from '../store/store';
import { deriveStatus, hasEpisodes, seenEpisodeCount } from '../data/selectors';
import { useWatchActions } from '../hooks/useWatchActions';
import { openUnit } from '../hooks/useHashRoute';
import SmartImage from './SmartImage';
import { formatDuration } from '../lib/format';

interface Props {
  unit: WatchUnit | null;
}

export default function HeroNextUp({ unit }: Props) {
  const progress = useStore((s) => s.progress);
  const spoilerFree = useStore((s) => s.settings.spoilerFree);
  const { setWatched, watchNextEpisode } = useWatchActions();

  if (!unit) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-2 p-10 text-center">
        <Sparkles className="mx-auto mb-3 text-gold" size={40} />
        <h2 className="font-display text-4xl">Timeline complete</h2>
        <p className="mt-2 text-muted">
          You've watched everything in the current view. Toggle adjacent titles or the multiverse
          layer to keep going.
        </p>
      </div>
    );
  }

  const nextEp =
    hasEpisodes(unit) && unit.episodes
      ? unit.episodes[seenEpisodeCount(unit, progress)] ?? unit.episodes[0]
      : null;
  const spoiler = spoilerFree && deriveStatus(unit, progress) !== 'watched';

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-3xl border border-border shadow-card"
    >
      <div className="absolute inset-0">
        <SmartImage src={unit.backdrop.w1280} alt="" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>

      <div className="relative flex flex-col gap-4 p-6 sm:p-9 md:max-w-2xl md:p-10">
        <span className="flex w-fit items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-soft">
          <Play size={12} fill="currentColor" /> Next up
        </span>

        <div>
          <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="tabular-nums">{unit.timelineLabel}</span>
            <span className="opacity-40">•</span>
            <span>{unit.saga}</span>
            <span className="opacity-40">•</span>
            <span>{formatDuration(unit.watchTimeMinutes)}</span>
          </div>
          <h1 className="font-display text-4xl leading-none sm:text-5xl md:text-6xl">
            {unit.title}
          </h1>
          {nextEp && (
            <p className="mt-2 font-semibold text-accent-soft">
              Continue at S{nextEp.season} · E{nextEp.episodeNumber}
              {nextEp.name ? ` — ${nextEp.name}` : ''}
            </p>
          )}
        </div>

        <p className={`max-w-xl text-sm leading-relaxed text-muted ${spoiler ? 'spoiler-blur' : ''}`}>
          {unit.overview}
        </p>

        {unit.note && (
          <div className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>{unit.note}</span>
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-3">
          {nextEp ? (
            <button
              onClick={() => watchNextEpisode(unit)}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-white shadow-glow transition hover:brightness-110 active:scale-95"
            >
              <Check size={18} strokeWidth={3} />
              Watched S{nextEp.season}·E{nextEp.episodeNumber}
            </button>
          ) : (
            <button
              onClick={() => setWatched(unit, true)}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-white shadow-glow transition hover:brightness-110 active:scale-95"
            >
              <Check size={18} strokeWidth={3} />
              Mark watched
            </button>
          )}
          {hasEpisodes(unit) && (
            <button
              onClick={() => setWatched(unit, true)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/70 px-5 py-3 font-semibold backdrop-blur transition hover:bg-surface-3"
            >
              <CheckCheck size={16} />
              Whole arc
            </button>
          )}
          <button
            onClick={() => openUnit(unit.id)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/70 px-5 py-3 font-semibold backdrop-blur transition hover:bg-surface-3"
          >
            {hasEpisodes(unit) ? 'All episodes' : 'Details'}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
