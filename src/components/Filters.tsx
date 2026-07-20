import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { hasActiveFilters, useUi } from '../store/ui';
import { useUnits } from '../context/CatalogContext';
import { phaseLabel } from '../lib/format';
import type { UnitType } from '../data/types';

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-semibold uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Filters() {
  const open = useUi((s) => s.filtersOpen);
  const filters = useUi((s) => s.filters);
  const setFilter = useUi((s) => s.setFilter);
  const resetFilters = useUi((s) => s.resetFilters);
  const units = useUnits();

  const sagas = ['all', ...Array.from(new Set(units.map((u) => u.saga)))];
  const phases = ['all', ...Array.from(new Set(units.map((u) => phaseLabel(u.phase))))];
  const types: (UnitType | 'all')[] = ['all', 'film', 'series', 'oneshot', 'special', 'short'];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface-2/60 p-4">
            <Select
              label="Saga"
              value={filters.saga}
              onChange={(v) => setFilter('saga', v)}
              options={sagas.map((s) => ({ value: s, label: s === 'all' ? 'All sagas' : s }))}
            />
            <Select
              label="Phase"
              value={filters.phase}
              onChange={(v) => setFilter('phase', v)}
              options={phases.map((p) => ({ value: p, label: p === 'all' ? 'All phases' : p }))}
            />
            <Select
              label="Type"
              value={filters.type}
              onChange={(v) => setFilter('type', v as UnitType | 'all')}
              options={types.map((t) => ({ value: t, label: t === 'all' ? 'All types' : t }))}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(v) => setFilter('status', v as typeof filters.status)}
              options={[
                { value: 'all', label: 'Any status' },
                { value: 'unwatched', label: 'Unwatched' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'watched', label: 'Watched' },
              ]}
            />
            {hasActiveFilters(filters) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:text-ink"
              >
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
