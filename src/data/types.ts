// Shared types used by both the build script and the frontend.

export type UnitType = 'film' | 'series' | 'oneshot' | 'special' | 'short';
export type Canon = 'core' | 'adjacent';

export interface ArcRange {
  season: number;
  fromEpisode: number;
  toEpisode: number;
}

/**
 * A SeedUnit is the hand-curated timeline entry (Source of Truth for order,
 * splits and canon). The build script enriches these with TMDB metadata to
 * produce the WatchUnits in data.json.
 */
export interface SeedUnit {
  id: string;
  order: number;
  titleId: string;
  title: string;
  seriesTitle?: string;
  type: UnitType;
  canon: Canon;
  saga: string;
  phase: number | string;
  timelineLabel: string;
  /** TMDB search hint: title + year. */
  searchTitle: string;
  searchYear?: number;
  arc?: ArcRange;
  note?: string;
  revisit?: boolean;
  optional?: boolean;
  /** 3b optional multiverse/animation layer, hidden by default. */
  multiverseLayer?: boolean;
}

export interface Episode {
  season: number;
  episodeNumber: number;
  name: string;
  overview: string;
  runtimeMinutes: number;
  still: { w300: string; original: string };
}

export interface WatchUnit {
  id: string;
  order: number;
  titleId: string;
  title: string;
  seriesTitle?: string;
  type: UnitType;
  canon: Canon;
  saga: string;
  phase: number | string;
  releaseYear: number;
  releaseDate: string;
  timelineLabel: string;
  tmdbId?: number;
  overview: string;
  genres: string[];
  runtimeMinutes: number;
  watchTimeMinutes: number;
  voteAverage?: number;
  poster: { w500: string; original: string };
  backdrop: { w1280: string; original: string };
  arc?: ArcRange;
  episodes?: Episode[];
  note?: string;
  revisit?: boolean;
  optional?: boolean;
  multiverseLayer?: boolean;
}

export interface CatalogData {
  generatedAt: string;
  source: 'tmdb' | 'placeholder';
  units: WatchUnit[];
}
