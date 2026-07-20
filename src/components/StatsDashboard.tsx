import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, Film, Star, Timer, Trophy, X } from 'lucide-react';
import { useUi } from '../store/ui';
import { useStore } from '../store/store';
import { useUnits } from '../context/CatalogContext';
import { computeStats } from '../data/selectors';
import { openUnit } from '../hooks/useHashRoute';
import { formatDate, formatDuration, marathonEstimate, pct } from '../lib/format';
import ProgressBar from './ProgressBar';

function Ring({ value, size = 64 }: { value: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--surface-3))" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * value) / 100 }}
        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      />
    </svg>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4">
      <div className="mb-2 flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-display text-3xl tracking-wide">{value}</div>
    </div>
  );
}

export default function StatsDashboard() {
  const open = useUi((s) => s.statsOpen);
  const toggleStats = useUi((s) => s.toggleStats);
  const progress = useStore((s) => s.progress);
  const settings = useStore((s) => s.settings);
  const units = useUnits();
  const [hoursPerWeek, setHoursPerWeek] = useState(6);

  const stats = useMemo(
    () => computeStats(units, progress, settings),
    [units, progress, settings],
  );
  const overall = pct(stats.watchedUnits, stats.totalUnits);
  const marathon = marathonEstimate(stats.remainingMinutes, hoursPerWeek);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleStats(false)}
        >
          <div className="flex min-h-full items-start justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-7"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-4xl tracking-wide">Your MCU stats</h2>
                <button
                  onClick={() => toggleStats(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted hover:text-ink"
                  aria-label="Close stats"
                >
                  <X size={18} />
                </button>
              </div>

              {/* headline */}
              <div className="mb-4 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface-2 p-5 sm:flex-row sm:items-center">
                <div className="relative grid place-items-center">
                  <Ring value={overall} size={104} />
                  <span className="absolute font-display text-3xl">{overall}%</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted">Overall completion</p>
                  <p className="font-display text-2xl">
                    {stats.watchedUnits} of {stats.totalUnits} watch-units
                  </p>
                  <ProgressBar value={overall} className="mt-2" />
                  <p className="mt-2 text-xs text-muted">
                    {formatDuration(stats.watchedMinutes)} watched ·{' '}
                    {formatDuration(stats.remainingMinutes)} remaining
                  </p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat icon={<Film size={15} />} label="Watched" value={`${stats.watchedUnits}`} />
                <Stat icon={<Timer size={15} />} label="Hours in" value={formatDuration(stats.watchedMinutes)} />
                <Stat
                  icon={<Star size={15} />}
                  label="Avg rating"
                  value={stats.avgRating ? `${stats.avgRating.toFixed(1)}` : '–'}
                />
                <Stat icon={<Trophy size={15} />} label="Rated" value={`${stats.ratedCount}`} />
              </div>

              {/* marathon planner */}
              <div className="mb-5 rounded-2xl border border-border bg-surface-2 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock size={16} className="text-accent-soft" />
                  <h3 className="font-display text-xl tracking-wide">Marathon planner</h3>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-3 text-sm">
                    <span className="text-muted">Hours / week</span>
                    <input
                      type="range"
                      min={1}
                      max={40}
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                      className="accent-[rgb(var(--accent))]"
                    />
                    <span className="w-10 font-display text-2xl tabular-nums">{hoursPerWeek}</span>
                  </label>
                  <div className="text-sm">
                    {marathon ? (
                      <span className="text-muted">
                        ~<b className="text-ink">{Math.ceil(marathon.weeks)}</b> weeks left · finish by{' '}
                        <b className="text-ink">{formatDate(marathon.date)}</b>
                      </span>
                    ) : (
                      <span className="text-muted">All caught up — nothing left to watch.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* per phase */}
              <div className="mb-5">
                <h3 className="mb-3 font-display text-xl tracking-wide">Completion by phase</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stats.phases.map((p) => (
                    <div
                      key={p.key}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3"
                    >
                      <div className="relative grid shrink-0 place-items-center">
                        <Ring value={pct(p.watched, p.total)} size={48} />
                        <span className="absolute text-[10px] font-bold tabular-nums">
                          {pct(p.watched, p.total)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.label}</p>
                        <p className="truncate text-xs text-muted">{p.saga}</p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted">
                        {p.watched}/{p.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* favorites */}
              {stats.favorites.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display text-xl tracking-wide">Top rated</h3>
                  <div className="flex flex-col gap-1.5">
                    {stats.favorites.map(({ unit, rating }) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          toggleStats(false);
                          openUnit(unit.id);
                        }}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-2.5 text-left transition hover:bg-surface-3"
                      >
                        <span className="flex w-12 shrink-0 items-center gap-1 font-display text-xl text-gold">
                          <Star size={14} fill="currentColor" />
                          {rating.toFixed(rating % 1 ? 1 : 0)}
                        </span>
                        <span className="truncate text-sm font-semibold">{unit.title}</span>
                        <span className="ml-auto shrink-0 text-xs text-muted">{unit.timelineLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
