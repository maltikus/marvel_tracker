import { createContext, useContext } from 'react';
import type { WatchUnit } from '../data/types';

export const CatalogContext = createContext<WatchUnit[]>([]);
export const useUnits = () => useContext(CatalogContext);
