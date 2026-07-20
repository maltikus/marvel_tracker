import { useEffect, useState } from 'react';
import { fetchCatalog } from '../data/catalog';
import type { CatalogData } from '../data/types';

export function useCatalog() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCatalog()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error, loading: !data && !error };
}
