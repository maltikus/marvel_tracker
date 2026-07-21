import { useEffect } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useCatalog } from './hooks/useCatalog';
import { useHashRoute } from './hooks/useHashRoute';
import { CatalogContext, useUnits } from './context/CatalogContext';
import { useStore } from './store/store';
import { useAuth } from './store/auth';
import { visibleUnits, nextUp, hasEpisodes } from './data/selectors';
import { useWatchActions } from './hooks/useWatchActions';
import AppHeader from './components/AppHeader';
import Filters from './components/Filters';
import Home from './components/Home';
import DetailView from './components/DetailView';
import SettingsPanel from './components/SettingsPanel';
import StatsDashboard from './components/StatsDashboard';
import AuthPanel from './components/AuthPanel';
import Toaster from './components/Toaster';
import Footer from './components/Footer';

/** Global shortcut: Enter (when not typing / no overlay) marks the next-up unit watched. */
function EnterToWatch() {
  const units = useUnits();
  const { setWatched, watchNextEpisode } = useWatchActions();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key !== 'Enter' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (window.location.hash.startsWith('#/unit/')) return;
      const s = useStore.getState();
      const next = nextUp(visibleUnits(units, s.settings), s.progress);
      if (!next) return;
      // Mirror the hero's primary action: advance one episode for series.
      if (hasEpisodes(next)) watchNextEpisode(next);
      else setWatched(next, true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [units, setWatched, watchNextEpisode]);
  return null;
}

export default function App() {
  const { data, error, loading } = useCatalog();
  const route = useHashRoute();
  const theme = useStore((s) => s.settings.theme);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const initAuth = useAuth((s) => s.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-accent font-display text-3xl text-white">
            M
          </span>
          <p className="text-muted">Loading the timeline…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="font-display text-3xl">Couldn't load the catalog</h1>
          <p className="mt-2 max-w-md text-muted">
            Run <code className="rounded bg-surface-3 px-1.5 py-0.5">npm run seed:placeholder</code>{' '}
            (or <code className="rounded bg-surface-3 px-1.5 py-0.5">npm run build:data</code> with a
            TMDB key) to generate <code>public/data.json</code>.
          </p>
          <p className="mt-3 text-xs text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <CatalogContext.Provider value={data.units}>
      <LayoutGroup>
        <div className="min-h-screen">
          <AppHeader />
          <EnterToWatch />
          <div className="mx-auto max-w-7xl px-4 pt-3">
            <Filters />
          </div>
          <main>
            <Home />
          </main>
          <Footer />

          {route.path === '/unit' && route.unitId && <DetailView unitId={route.unitId} />}
          <SettingsPanel />
          <StatsDashboard />
          <AuthPanel />
          <Toaster />
        </div>
      </LayoutGroup>
    </CatalogContext.Provider>
  );
}
