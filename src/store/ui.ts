import { create } from 'zustand';
import type { UnitType } from '../data/types';

export interface Filters {
  query: string;
  saga: string | 'all';
  phase: string | 'all';
  type: UnitType | 'all';
  status: 'all' | 'unwatched' | 'in_progress' | 'watched';
}

interface UiState {
  filters: Filters;
  filtersOpen: boolean;
  settingsOpen: boolean;
  statsOpen: boolean;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  toggleFilters: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  toggleStats: (open?: boolean) => void;
}

const emptyFilters: Filters = {
  query: '',
  saga: 'all',
  phase: 'all',
  type: 'all',
  status: 'all',
};

export const useUi = create<UiState>((set) => ({
  filters: emptyFilters,
  filtersOpen: false,
  settingsOpen: false,
  statsOpen: false,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: emptyFilters }),
  toggleFilters: (open) => set((s) => ({ filtersOpen: open ?? !s.filtersOpen })),
  toggleSettings: (open) => set((s) => ({ settingsOpen: open ?? !s.settingsOpen })),
  toggleStats: (open) => set((s) => ({ statsOpen: open ?? !s.statsOpen })),
}));

export const hasActiveFilters = (f: Filters): boolean =>
  f.query !== '' || f.saga !== 'all' || f.phase !== 'all' || f.type !== 'all' || f.status !== 'all';
