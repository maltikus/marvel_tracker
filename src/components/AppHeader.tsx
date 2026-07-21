import { useEffect, useRef } from 'react';
import { BarChart3, Cloud, CloudOff, EyeOff, Grid2x2, Rows3, Search, SlidersHorizontal, Tv, X } from 'lucide-react';
import { hasActiveFilters, useUi } from '../store/ui';
import { useStore } from '../store/store';
import { useAuth } from '../store/auth';

function SegToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex rounded-lg border border-border bg-surface-2 p-0.5" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
            value === o.value ? 'bg-accent text-white' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={value === o.value}
        >
          {o.icon}
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function AppHeader() {
  const filters = useUi((s) => s.filters);
  const setFilter = useUi((s) => s.setFilter);
  const filtersOpen = useUi((s) => s.filtersOpen);
  const toggleFilters = useUi((s) => s.toggleFilters);
  const toggleSettings = useUi((s) => s.toggleSettings);
  const toggleStats = useUi((s) => s.toggleStats);
  const toggleAuth = useUi((s) => s.toggleAuth);
  const authStatus = useAuth((s) => s.status);

  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'f' && !typing) {
        e.preventDefault();
        toggleFilters();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFilters]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <a href="#/" className="flex items-center gap-2 pr-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-display text-lg text-white shadow-glow">
            M
          </span>
          <span className="hidden font-display text-2xl tracking-wide sm:block">
            MCU Timeline
          </span>
        </a>

        <div className="relative order-last w-full sm:order-none sm:w-auto sm:flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            value={filters.query}
            onChange={(e) => setFilter('query', e.target.value)}
            placeholder="Search titles…  ( / )"
            className="w-full rounded-xl border border-border bg-surface-2 py-2 pl-9 pr-9 text-sm outline-none focus:border-accent sm:max-w-md"
          />
          {filters.query && (
            <button
              onClick={() => setFilter('query', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SegToggle
            ariaLabel="Sort order"
            value={settings.order}
            onChange={(v) => setSetting('order', v)}
            options={[
              { value: 'chronological', label: 'Chrono' },
              { value: 'release', label: 'Release' },
            ]}
          />
          <SegToggle
            ariaLabel="Layout"
            value={settings.layout}
            onChange={(v) => setSetting('layout', v)}
            options={[
              { value: 'rails', label: 'Rails', icon: <Rows3 size={14} /> },
              { value: 'grid', label: 'Grid', icon: <Grid2x2 size={14} /> },
            ]}
          />

          <button
            onClick={() => setSetting('showAdjacent', !settings.showAdjacent)}
            title="Toggle Timeline-adjacent titles"
            className={`grid h-9 w-9 place-items-center rounded-lg border transition ${
              settings.showAdjacent
                ? 'border-accent bg-accent/15 text-accent-soft'
                : 'border-border bg-surface-2 text-muted hover:text-ink'
            }`}
            aria-pressed={settings.showAdjacent}
          >
            <Tv size={16} />
          </button>
          <button
            onClick={() => setSetting('spoilerFree', !settings.spoilerFree)}
            title="Toggle spoiler-free mode"
            className={`grid h-9 w-9 place-items-center rounded-lg border transition ${
              settings.spoilerFree
                ? 'border-accent bg-accent/15 text-accent-soft'
                : 'border-border bg-surface-2 text-muted hover:text-ink'
            }`}
            aria-pressed={settings.spoilerFree}
          >
            <EyeOff size={16} />
          </button>
          <button
            onClick={() => toggleFilters()}
            title="Filters (f)"
            className={`relative grid h-9 w-9 place-items-center rounded-lg border transition ${
              filtersOpen || hasActiveFilters(filters)
                ? 'border-accent bg-accent/15 text-accent-soft'
                : 'border-border bg-surface-2 text-muted hover:text-ink'
            }`}
          >
            <SlidersHorizontal size={16} />
            {hasActiveFilters(filters) && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
            )}
          </button>
          <button
            onClick={() => toggleStats(true)}
            title="Stats"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-muted transition hover:text-ink"
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => toggleAuth(true)}
            title={authStatus === 'signed_in' ? 'Account & sync' : 'Sign in for cross-device sync'}
            aria-label="Account and cloud sync"
            className={`grid h-9 w-9 place-items-center rounded-lg border transition ${
              authStatus === 'signed_in'
                ? 'border-accent bg-accent/15 text-accent-soft'
                : 'border-border bg-surface-2 text-muted hover:text-ink'
            }`}
          >
            {authStatus === 'signed_in' ? <Cloud size={16} /> : <CloudOff size={16} />}
          </button>
          <button
            onClick={() => toggleSettings(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-muted transition hover:text-ink"
            title="Settings"
            aria-label="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
