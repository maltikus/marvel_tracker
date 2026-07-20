import type { CatalogData } from './types';

let cache: CatalogData | null = null;

export async function fetchCatalog(): Promise<CatalogData> {
  if (cache) return cache;
  const url = `${import.meta.env.BASE_URL}data.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load catalog (${res.status})`);
  cache = (await res.json()) as CatalogData;
  return cache;
}
