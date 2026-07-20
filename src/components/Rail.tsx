import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WatchUnit } from '../data/types';
import UnitCard from './UnitCard';
import ProgressBar from './ProgressBar';
import { useStore } from '../store/store';
import { deriveStatus } from '../data/selectors';
import { pct } from '../lib/format';

interface Props {
  title: string;
  subtitle?: string;
  units: WatchUnit[];
  /** Render flat cards (no shared-element layoutId) to avoid duplicates. */
  flat?: boolean;
}

export default function Rail({ title, subtitle, units, flat }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useStore((s) => s.progress);
  if (!units.length) return null;

  const countable = units.filter((u) => !u.revisit);
  const watched = countable.filter((u) => deriveStatus(u, progress) === 'watched').length;

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="group/rail">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-wide">{title}</h2>
          {subtitle && subtitle !== title && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden w-32 items-center gap-2 sm:flex">
            <ProgressBar value={pct(watched, countable.length)} height={6} />
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {watched}/{countable.length}
            </span>
          </div>
          <div className="hidden gap-1 md:flex">
            <button
              onClick={() => scroll(-1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-muted transition hover:text-ink"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-muted transition hover:text-ink"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2"
      >
        {units.map((u, i) => (
          <div key={u.id} className="w-32 shrink-0 snap-start sm:w-36 md:w-40">
            <UnitCard unit={u} index={i} flat={flat} />
          </div>
        ))}
      </div>
    </section>
  );
}
