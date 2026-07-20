import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, Info, Star, X } from 'lucide-react';
import { useUnits } from '../context/CatalogContext';
import { useStore } from '../store/store';
import { deriveStatus, getRating, hasEpisodes } from '../data/selectors';
import { useWatchActions } from '../hooks/useWatchActions';
import { closeUnit, openUnit } from '../hooks/useHashRoute';
import { formatDuration, phaseLabel } from '../lib/format';
import SmartImage from './SmartImage';
import RatingStars from './RatingStars';
import EpisodeList from './EpisodeList';

export default function DetailView({ unitId }: { unitId: string }) {
  const units = useUnits();
  const unit = units.find((u) => u.id === unitId);

  const progress = useStore((s) => s.progress);
  const setRating = useStore((s) => s.setRating);
  const spoilerFree = useStore((s) => s.settings.spoilerFree);
  const { setWatched } = useWatchActions();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUnit();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [unitId]);

  if (!unit) return null;

  const status = deriveStatus(unit, progress);
  const watched = status === 'watched';
  const rating = getRating(unit, progress);
  const spoiler = spoilerFree && !watched;
  const siblings = units
    .filter((u) => u.titleId === unit.titleId && u.id !== unit.id)
    .sort((a, b) => a.order - b.order);

  return (
    <AnimatePresence>
      <motion.div
        key="scrim"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeUnit}
      >
        <div className="flex min-h-full items-start justify-center p-3 sm:p-6">
          <motion.div
            layoutId={`card-shell-${unit.id}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface-2 shadow-card"
          >
            {/* header backdrop */}
            <div className="relative h-48 sm:h-64">
              <SmartImage src={unit.backdrop.w1280} alt="" className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-surface-2/50 to-transparent" />
              <button
                onClick={closeUnit}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative -mt-20 flex gap-4 px-5 sm:px-7">
              <motion.div
                layoutId={`poster-${unit.id}`}
                className="w-28 shrink-0 overflow-hidden rounded-xl border border-border shadow-card sm:w-36"
              >
                <SmartImage src={unit.poster.w500} alt={unit.title} className="aspect-[2/3] w-full" />
              </motion.div>
              <div className="flex flex-1 flex-col justify-end pb-1">
                <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <span className="rounded bg-surface-3 px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                    {unit.type}
                  </span>
                  {unit.canon === 'adjacent' && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                      {unit.multiverseLayer ? 'Optional' : 'Adjacent'}
                    </span>
                  )}
                  <span className="tabular-nums">{unit.timelineLabel}</span>
                </div>
                <h2 className="font-display text-3xl leading-none sm:text-4xl">{unit.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span>
                    {phaseLabel(unit.phase) === unit.saga
                      ? unit.saga
                      : `${unit.saga} · ${phaseLabel(unit.phase)}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatDuration(unit.watchTimeMinutes)}
                  </span>
                  {typeof unit.voteAverage === 'number' && unit.voteAverage > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-gold" fill="currentColor" />
                      {unit.voteAverage.toFixed(1)} TMDB
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-5 sm:p-7">
              {unit.note && (
                <div className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <span>{unit.note}</span>
                </div>
              )}

              <p className={`text-sm leading-relaxed text-muted ${spoiler ? 'spoiler-blur' : ''}`}>
                {unit.overview}
              </p>

              {/* actions */}
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                <button
                  onClick={() => setWatched(unit, !watched)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition active:scale-95 ${
                    watched
                      ? 'border border-accent/50 bg-accent/10 text-accent-soft'
                      : 'bg-accent text-white shadow-glow hover:brightness-110'
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                  {watched ? 'Watched' : hasEpisodes(unit) ? 'Mark arc watched' : 'Mark watched'}
                </button>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Your rating
                  </span>
                  <RatingStars value={rating} onChange={(v) => setRating(unit.id, v)} />
                </div>
              </div>

              {hasEpisodes(unit) && <EpisodeList unit={unit} />}

              {siblings.length > 0 && (
                <div>
                  <h3 className="mb-2 font-display text-lg tracking-wide">
                    More of {unit.seriesTitle ?? unit.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {siblings.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => openUnit(s.id)}
                        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium transition hover:bg-surface-3"
                      >
                        {deriveStatus(s, progress) === 'watched' && (
                          <Check size={12} className="text-accent" strokeWidth={3} />
                        )}
                        {s.title.replace(`${s.seriesTitle} · `, '').replace(s.seriesTitle ?? '', '') || s.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
