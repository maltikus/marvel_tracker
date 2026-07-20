import { useEffect, useState } from 'react';

export interface Route {
  path: string;
  unitId?: string;
}

function parse(hash: string): Route {
  const clean = hash.replace(/^#/, '') || '/';
  const unitMatch = clean.match(/^\/unit\/(.+)$/);
  if (unitMatch) return { path: '/unit', unitId: decodeURIComponent(unitMatch[1]) };
  if (clean.startsWith('/stats')) return { path: '/stats' };
  return { path: '/' };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const navigate = (path: string) => {
  window.location.hash = path;
};

export const openUnit = (id: string) => navigate(`/unit/${encodeURIComponent(id)}`);
export const closeUnit = () => {
  // Preserve current base route; unit overlay is closed by clearing hash to home
  if (window.location.hash.startsWith('#/unit/')) window.history.back();
  else navigate('/');
};
