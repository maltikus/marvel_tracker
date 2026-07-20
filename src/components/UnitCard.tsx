import { motion } from 'framer-motion';
import { Check, Clapperboard, Star, Tv } from 'lucide-react';
import type { WatchUnit } from '../data/types';
import { useStore } from '../store/store';
import { deriveStatus, getRating, hasEpisodes, seenEpisodeCount } from '../data/selectors';
import { openUnit } from '../hooks/useHashRoute';
import SmartImage from './SmartImage';
import { pct } from '../lib/format';

interface Props {
  unit: WatchUnit;
  index?: number;
  /** Disable the shared-element layoutId (use when the same unit may render
   * elsewhere simultaneously, e.g. the Continue Watching rail). */
  flat?: boolean;
}

const typeLabels: Record<string, string> = {
  film: 'Film',
  series: 'Series',
  oneshot: 'One-Shot',
  special: 'Special',
  short: 'Short',
};

export default function UnitCard({ unit, index = 0, flat = false }: Props) {
  const progress = useStore((s) => s.progress);
  const spoilerFree = useStore((s) => s.settings.spoilerFree);
  const status = deriveStatus(unit, progress);
  const rating = getRating(unit, progress);
  const watched = status === 'watched';

  const epTotal = unit.episodes?.length ?? 0;
  const epSeen = hasEpisodes(unit) ? seenEpisodeCount(unit, progress) : 0;
  const spoiler = spoilerFree && !watched;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      whileHover={{ y: -6 }}
      onClick={() => openUnit(unit.id)}
      className="group relative w-full text-left focus:outline-none"
      aria-label={`${unit.title} — ${typeLabels[unit.type]}, ${status.replace('_', ' ')}`}
    >
      <motion.div
        layoutId={flat ? undefined : `poster-${unit.id}`}
        className={`relative aspect-[2/3] overflow-hidden rounded-xl border border-border shadow-card transition ${
          watched ? 'saturate-[0.75]' : ''
        }`}
      >
        <SmartImage src={unit.poster.w500} alt={unit.title} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        {/* top badges */}
        <div className="absolute inset-x-2 top-2 flex items-start justify-between">
          <span className="flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
            {unit.type === 'series' || unit.type === 'short' ? (
              <Tv size={11} />
            ) : (
              <Clapperboard size={11} />
            )}
            {typeLabels[unit.type]}
          </span>
          {watched && (
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white shadow-glow">
              <Check size={14} strokeWidth={3} />
            </span>
          )}
        </div>

        {/* adjacent / optional pill */}
        {unit.canon === 'adjacent' && (
          <span className="absolute left-2 top-9 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80 backdrop-blur">
            {unit.multiverseLayer ? 'Optional' : 'Adjacent'}
          </span>
        )}

        {/* bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <div className="mb-1 flex items-center gap-2 text-[10px] text-white/70">
            <span className="tabular-nums">{unit.timelineLabel}</span>
            {typeof rating === 'number' && (
              <span className="flex items-center gap-0.5 text-gold">
                <Star size={10} fill="currentColor" />
                {rating.toFixed(rating % 1 ? 1 : 0)}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white">{unit.title}</h3>
          {hasEpisodes(unit) && (
            <div className="mt-1.5">
              <div className="mb-1 flex items-center justify-between text-[10px] text-white/60">
                <span>
                  {epSeen}/{epTotal} eps
                </span>
                {status === 'in_progress' && <span className="text-accent-soft">Continue</span>}
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft"
                  style={{ width: `${pct(epSeen, epTotal)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {spoiler && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-md">
            <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white/80">
              Spoiler-free
            </span>
          </div>
        )}
      </motion.div>
    </motion.button>
  );
}
