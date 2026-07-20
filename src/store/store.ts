import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UnitStatus = 'unwatched' | 'in_progress' | 'watched';

export interface UnitProgress {
  status: UnitStatus;
  rating?: number;
  updatedAt: string;
}

export interface Progress {
  units: Record<string, UnitProgress>;
  /** Per series titleId → list of seen "s{n}e{m}" keys. */
  episodes: Record<string, string[]>;
}

export interface Settings {
  order: 'chronological' | 'release';
  theme: 'dark' | 'light';
  layout: 'rails' | 'grid';
  spoilerFree: boolean;
  showAdjacent: boolean;
  showOptionalMultiverse: boolean;
  reduceMotion: boolean;
}

export interface StoreState {
  progress: Progress;
  settings: Settings;
  hydrated: boolean;
  // actions
  setUnitStatus: (unitId: string, status: UnitStatus) => void;
  setRating: (unitId: string, rating: number | undefined) => void;
  toggleEpisode: (titleId: string, epKey: string) => void;
  setArcEpisodes: (titleId: string, epKeys: string[], watched: boolean) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  importState: (data: { progress?: Progress; settings?: Partial<Settings> }) => void;
  reset: () => void;
}

export const epKey = (season: number, episode: number) => `s${season}e${episode}`;

const now = () => new Date().toISOString();

const defaultSettings: Settings = {
  order: 'chronological',
  theme: 'dark',
  layout: 'rails',
  spoilerFree: false,
  showAdjacent: false,
  showOptionalMultiverse: false,
  reduceMotion: false,
};

const defaultProgress: Progress = { units: {}, episodes: {} };

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      progress: defaultProgress,
      settings: defaultSettings,
      hydrated: false,

      setUnitStatus: (unitId, status) =>
        set((s) => ({
          progress: {
            ...s.progress,
            units: {
              ...s.progress.units,
              [unitId]: {
                ...s.progress.units[unitId],
                status,
                updatedAt: now(),
              },
            },
          },
        })),

      setRating: (unitId, rating) =>
        set((s) => {
          const prev = s.progress.units[unitId];
          return {
            progress: {
              ...s.progress,
              units: {
                ...s.progress.units,
                [unitId]: {
                  status: prev?.status ?? 'watched',
                  rating,
                  updatedAt: now(),
                },
              },
            },
          };
        }),

      toggleEpisode: (titleId, key) =>
        set((s) => {
          const seen = new Set(s.progress.episodes[titleId] ?? []);
          if (seen.has(key)) seen.delete(key);
          else seen.add(key);
          return {
            progress: {
              ...s.progress,
              episodes: { ...s.progress.episodes, [titleId]: [...seen] },
            },
          };
        }),

      setArcEpisodes: (titleId, keys, watched) =>
        set((s) => {
          const seen = new Set(s.progress.episodes[titleId] ?? []);
          for (const k of keys) {
            if (watched) seen.add(k);
            else seen.delete(k);
          }
          return {
            progress: {
              ...s.progress,
              episodes: { ...s.progress.episodes, [titleId]: [...seen] },
            },
          };
        }),

      setSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      importState: (data) =>
        set((s) => ({
          progress: data.progress ?? s.progress,
          settings: { ...s.settings, ...(data.settings ?? {}) },
        })),

      reset: () => set({ progress: defaultProgress, settings: defaultSettings }),
    }),
    {
      name: 'mcu-tracker-v1',
      partialize: (s) => ({ progress: s.progress, settings: s.settings }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
