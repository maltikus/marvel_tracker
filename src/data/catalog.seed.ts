import type { SeedUnit, UnitType, Canon, ArcRange } from './types';

/**
 * Canonical, curated granular MCU timeline (Source of Truth for ORDER, splits,
 * canon and split-viewing notes). Enriched with TMDB metadata at build time.
 *
 * Do NOT reorder. Where the seed uses arc granularity, keep it — add a
 * `// TODO: verify` instead of inventing finer episode splits.
 *
 * Saga buckets: "Infinity Saga" | "Multiverse Saga" | "Defenders Saga" |
 * "Marvel Television". Phase is numeric for Marvel Studios core properties and
 * a string bucket for adjacent TV / Netflix titles that don't map to a film phase.
 */

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface RowExtra {
  titleId?: string;
  seriesTitle?: string;
  searchTitle?: string;
  searchYear?: number;
  arc?: ArcRange;
  note?: string;
  revisit?: boolean;
  optional?: boolean;
  multiverseLayer?: boolean;
}

interface Row {
  title: string;
  type: UnitType;
  canon: Canon;
  saga: string;
  phase: number | string;
  timelineLabel: string;
  extra?: RowExtra;
}

const r = (
  title: string,
  type: UnitType,
  canon: Canon,
  saga: string,
  phase: number | string,
  timelineLabel: string,
  extra?: RowExtra,
): Row => ({ title, type, canon, saga, phase, timelineLabel, extra });

const MT = 'Marvel Television';
const DEF = 'Defenders Saga';
const INF = 'Infinity Saga';
const MULTI = 'Multiverse Saga';

// Helper for an Agents of S.H.I.E.L.D. arc unit (they all share one titleId).
const aos = (
  season: number,
  from: number,
  to: number,
  timelineLabel: string,
  label = `Agents of S.H.I.E.L.D. · S${season} · E${from}–${to === -1 ? 'end' : to}`,
): Row =>
  r(label, 'series', 'adjacent', MT, MT, timelineLabel, {
    titleId: 'agents-of-shield',
    seriesTitle: 'Agents of S.H.I.E.L.D.',
    searchTitle: 'Agents of S.H.I.E.L.D.',
    searchYear: 2013,
    arc: { season, fromEpisode: from, toEpisode: to },
  });

const rows: Row[] = [
  // ---- Deep past / Phase 1 ----
  r('Eyes of Wakanda', 'series', 'core', MULTI, 5, '1260 BCE+', {
    searchYear: 2025,
    note: 'Anthology across millennia; curated at the head of the timeline.',
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Captain America: The First Avenger', 'film', 'core', INF, 1, '1943–1945', { searchYear: 2011 }),
  r('Agent Carter', 'series', 'adjacent', MT, MT, '1946', {
    titleId: 'agent-carter',
    seriesTitle: 'Agent Carter',
    searchTitle: 'Marvel’s Agent Carter',
    searchYear: 2015,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
    note: 'TODO: verify placement (1946).',
  }),
  r('Agent Carter (Season 2)', 'series', 'adjacent', MT, MT, '1947', {
    titleId: 'agent-carter',
    seriesTitle: 'Agent Carter',
    searchTitle: 'Marvel’s Agent Carter',
    searchYear: 2015,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
    note: 'TODO: verify placement (1947).',
  }),
  r('One-Shot: Agent Carter', 'oneshot', 'core', INF, 1, '1946', {
    searchTitle: 'Marvel One-Shot: Agent Carter',
    searchYear: 2013,
  }),
  r('Captain Marvel', 'film', 'core', INF, 3, '1995', {
    searchYear: 2019,
    note: 'Watch the mid-credits scene only after Avengers: Infinity War.',
  }),
  r('Iron Man', 'film', 'core', INF, 1, '2010', { searchYear: 2008 }),
  r('Iron Man 2', 'film', 'core', INF, 1, '2011', { searchYear: 2010 }),
  r('The Incredible Hulk', 'film', 'core', INF, 1, '2011', { searchYear: 2008 }),
  r("One-Shot: A Funny Thing Happened on the Way to Thor's Hammer", 'oneshot', 'core', INF, 1, '2011', {
    searchTitle: 'A Funny Thing Happened on the Way to Thor’s Hammer',
    searchYear: 2011,
  }),
  r('Thor', 'film', 'core', INF, 1, '2011', { searchYear: 2011 }),
  r('One-Shot: The Consultant', 'oneshot', 'core', INF, 1, '2012', {
    searchTitle: 'Marvel One-Shot: The Consultant',
    searchYear: 2011,
  }),
  r('The Avengers', 'film', 'core', INF, 1, '2012', { searchYear: 2012 }),
  r('One-Shot: Item 47', 'oneshot', 'core', INF, 1, '2012', {
    searchTitle: 'Marvel One-Shot: Item 47',
    searchYear: 2012,
  }),

  // ---- Phase 2 era, interleaved with AoS ----
  aos(1, 1, 7, '2013'),
  r('Thor: The Dark World', 'film', 'core', INF, 2, '2013', { searchYear: 2013 }),
  aos(1, 8, 16, '2013–2014'),
  r('Iron Man 3', 'film', 'core', INF, 2, '2013', { searchYear: 2013 }),
  r('One-Shot: All Hail the King', 'oneshot', 'core', INF, 2, '2014', {
    searchTitle: 'Marvel One-Shot: All Hail the King',
    searchYear: 2014,
  }),
  r('Captain America: The Winter Soldier', 'film', 'core', INF, 2, '2014', { searchYear: 2014 }),
  aos(1, 17, 22, '2014'),
  r('Guardians of the Galaxy', 'film', 'core', INF, 2, '2014', { searchYear: 2014 }),
  r('Guardians of the Galaxy Vol. 2', 'film', 'core', INF, 3, '2014', { searchYear: 2017 }),
  r('I Am Groot (Season 1)', 'short', 'core', MULTI, 4, '2014', {
    titleId: 'i-am-groot',
    seriesTitle: 'I Am Groot',
    searchYear: 2022,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('I Am Groot (Season 2)', 'short', 'core', MULTI, 5, '2014', {
    titleId: 'i-am-groot',
    seriesTitle: 'I Am Groot',
    searchYear: 2022,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Daredevil (Season 1)', 'series', 'core', DEF, DEF, '2015', {
    titleId: 'daredevil',
    seriesTitle: 'Daredevil',
    searchTitle: 'Marvel’s Daredevil',
    searchYear: 2015,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  aos(2, 1, 10, '2014'),
  r('Jessica Jones (Season 1)', 'series', 'core', DEF, DEF, '2015', {
    titleId: 'jessica-jones',
    seriesTitle: 'Jessica Jones',
    searchTitle: 'Marvel’s Jessica Jones',
    searchYear: 2015,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  aos(2, 11, 19, '2015'),
  r('Avengers: Age of Ultron', 'film', 'core', INF, 2, '2015', { searchYear: 2015 }),
  aos(2, 20, 22, '2015'),
  r('Ant-Man', 'film', 'core', INF, 2, '2015', { searchYear: 2015 }),
  r('Daredevil (Season 2)', 'series', 'core', DEF, DEF, '2016', {
    titleId: 'daredevil',
    seriesTitle: 'Daredevil',
    searchTitle: 'Marvel’s Daredevil',
    searchYear: 2015,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Luke Cage (Season 1)', 'series', 'core', DEF, DEF, '2016', {
    titleId: 'luke-cage',
    seriesTitle: 'Luke Cage',
    searchTitle: 'Marvel’s Luke Cage',
    searchYear: 2016,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  aos(3, 1, 10, '2015'),
  aos(3, 11, 19, '2016'),
  r('Iron Fist (Season 1)', 'series', 'core', DEF, DEF, '2016', {
    titleId: 'iron-fist',
    seriesTitle: 'Iron Fist',
    searchTitle: 'Marvel’s Iron Fist',
    searchYear: 2017,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('The Defenders', 'series', 'core', DEF, DEF, '2016', {
    titleId: 'the-defenders',
    seriesTitle: 'The Defenders',
    searchTitle: 'Marvel’s The Defenders',
    searchYear: 2017,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Captain America: Civil War', 'film', 'core', INF, 3, '2016', { searchYear: 2016 }),
  r('One-Shot: Team Thor: Part 1', 'oneshot', 'adjacent', MT, MT, '2016', {
    titleId: 'team-thor',
    searchTitle: 'Team Thor',
    searchYear: 2016,
  }),
  r('One-Shot: Team Thor: Part 2', 'oneshot', 'adjacent', MT, MT, '2017', {
    titleId: 'team-thor-2',
    searchTitle: 'Team Thor: Part 2',
    searchYear: 2017,
  }),
  r('Black Widow', 'film', 'core', MULTI, 4, '2016', {
    searchYear: 2021,
    note: 'Watch the credits scene only after Avengers: Endgame.',
  }),
  aos(3, 20, 22, '2016'),
  aos(4, 1, 6, '2016'),
  r('Black Panther', 'film', 'core', INF, 3, '2016', { searchYear: 2018 }),
  aos(4, 7, 22, '2016–2017', 'Agents of S.H.I.E.L.D. · S4 · E7–22 (+ Slingshot)'),
  r('Spider-Man: Homecoming', 'film', 'core', INF, 3, '2016', { searchYear: 2017 }),
  r('The Punisher (Season 1)', 'series', 'core', DEF, DEF, '2016', {
    titleId: 'the-punisher',
    seriesTitle: 'The Punisher',
    searchTitle: 'Marvel’s The Punisher',
    searchYear: 2017,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Doctor Strange', 'film', 'core', INF, 3, '2016–2017', {
    searchYear: 2016,
    note: 'Timeline placement is loosely bound.',
  }),
  r('Jessica Jones (Season 2)', 'series', 'core', DEF, DEF, '2018', {
    titleId: 'jessica-jones',
    seriesTitle: 'Jessica Jones',
    searchTitle: 'Marvel’s Jessica Jones',
    searchYear: 2015,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Luke Cage (Season 2)', 'series', 'core', DEF, DEF, '2018', {
    titleId: 'luke-cage',
    seriesTitle: 'Luke Cage',
    searchTitle: 'Marvel’s Luke Cage',
    searchYear: 2016,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Iron Fist (Season 2)', 'series', 'core', DEF, DEF, '2018', {
    titleId: 'iron-fist',
    seriesTitle: 'Iron Fist',
    searchTitle: 'Marvel’s Iron Fist',
    searchYear: 2017,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Daredevil (Season 3)', 'series', 'core', DEF, DEF, '2018', {
    titleId: 'daredevil',
    seriesTitle: 'Daredevil',
    searchTitle: 'Marvel’s Daredevil',
    searchYear: 2015,
    arc: { season: 3, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Thor: Ragnarok', 'film', 'core', INF, 3, '2017', { searchYear: 2017 }),
  r('One-Shot: Team Darryl', 'oneshot', 'adjacent', MT, MT, '2017', {
    titleId: 'team-darryl',
    searchTitle: 'Team Darryl',
    searchYear: 2018,
  }),
  r('Inhumans (Season 1)', 'series', 'adjacent', MT, MT, '2017', {
    titleId: 'inhumans',
    seriesTitle: 'Inhumans',
    searchTitle: 'Marvel’s Inhumans',
    searchYear: 2017,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Runaways (Season 1)', 'series', 'adjacent', MT, MT, '2017', {
    titleId: 'runaways',
    seriesTitle: 'Runaways',
    searchTitle: 'Marvel’s Runaways',
    searchYear: 2017,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  aos(5, 1, 18, '2017'),
  r('Cloak & Dagger (Season 1)', 'series', 'adjacent', MT, MT, '2018', {
    titleId: 'cloak-and-dagger',
    seriesTitle: 'Cloak & Dagger',
    searchTitle: 'Marvel’s Cloak & Dagger',
    searchYear: 2018,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Cloak & Dagger (Season 2)', 'series', 'adjacent', MT, MT, '2019', {
    titleId: 'cloak-and-dagger',
    seriesTitle: 'Cloak & Dagger',
    searchTitle: 'Marvel’s Cloak & Dagger',
    searchYear: 2018,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Runaways (Season 2)', 'series', 'adjacent', MT, MT, '2018', {
    titleId: 'runaways',
    seriesTitle: 'Runaways',
    searchTitle: 'Marvel’s Runaways',
    searchYear: 2017,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('The Punisher (Season 2)', 'series', 'core', DEF, DEF, '2018', {
    titleId: 'the-punisher',
    seriesTitle: 'The Punisher',
    searchTitle: 'Marvel’s The Punisher',
    searchYear: 2017,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Jessica Jones (Season 3)', 'series', 'core', DEF, DEF, '2019', {
    titleId: 'jessica-jones',
    seriesTitle: 'Jessica Jones',
    searchTitle: 'Marvel’s Jessica Jones',
    searchYear: 2015,
    arc: { season: 3, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Ant-Man and the Wasp', 'film', 'core', INF, 3, '2018', {
    searchYear: 2018,
    note: 'Watch the mid-credits scene only after Avengers: Infinity War.',
  }),
  r('Avengers: Infinity War', 'film', 'core', INF, 3, '2018', { searchYear: 2018 }),
  aos(5, 19, 22, '2018'),
  aos(6, 1, -1, '2019', 'Agents of S.H.I.E.L.D. · S6'),
  aos(7, 1, -1, '2019', 'Agents of S.H.I.E.L.D. · S7'),
  r('Runaways (Season 3)', 'series', 'adjacent', MT, MT, '2019', {
    titleId: 'runaways',
    seriesTitle: 'Runaways',
    searchTitle: 'Marvel’s Runaways',
    searchYear: 2017,
    arc: { season: 3, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Avengers: Endgame', 'film', 'core', INF, 3, '2018', {
    titleId: 'avengers-endgame',
    searchYear: 2019,
    note: 'Opening (before the five-year jump).',
  }),

  // ---- Multiverse Saga / post-Blip ----
  r('Loki (Season 1)', 'series', 'core', MULTI, 4, 'Out of time', {
    titleId: 'loki',
    seriesTitle: 'Loki',
    searchYear: 2021,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
    note: 'Takes place "outside of time".',
  }),
  r('What If…? (Season 1)', 'series', 'core', MULTI, 4, 'Multiverse', {
    titleId: 'what-if',
    seriesTitle: 'What If…?',
    searchTitle: 'What If...?',
    searchYear: 2021,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
    note: 'Multiverse — placement here is curatorial.',
  }),
  r('WandaVision', 'series', 'core', MULTI, 4, '2023', {
    titleId: 'wandavision',
    seriesTitle: 'WandaVision',
    searchYear: 2021,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Avengers: Endgame (Finale Revisit)', 'film', 'core', INF, 3, '2023', {
    titleId: 'avengers-endgame',
    searchYear: 2019,
    revisit: true,
    note: 'Resume/finish Endgame after the five-year jump. Does not count twice.',
  }),
  r('Shang-Chi and the Legend of the Ten Rings', 'film', 'core', MULTI, 4, '2023', { searchYear: 2021 }),
  r('The Falcon and the Winter Soldier', 'series', 'core', MULTI, 4, '2023', {
    titleId: 'falcon-and-winter-soldier',
    seriesTitle: 'The Falcon and the Winter Soldier',
    searchYear: 2021,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Spider-Man: Far From Home', 'film', 'core', INF, 3, '2024', { searchYear: 2019 }),
  r('Eternals', 'film', 'core', MULTI, 4, '2023', { searchYear: 2021 }),
  r('Spider-Man: No Way Home', 'film', 'core', MULTI, 4, '2024', { searchYear: 2021 }),
  r('Doctor Strange in the Multiverse of Madness', 'film', 'core', MULTI, 4, '2024', { searchYear: 2022 }),
  r('Hawkeye', 'series', 'core', MULTI, 4, '2024', {
    titleId: 'hawkeye',
    seriesTitle: 'Hawkeye',
    searchYear: 2021,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Moon Knight', 'series', 'core', MULTI, 4, '2024', {
    titleId: 'moon-knight',
    seriesTitle: 'Moon Knight',
    searchYear: 2022,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Black Panther: Wakanda Forever', 'film', 'core', MULTI, 4, '2024', { searchYear: 2022 }),
  r('Echo', 'series', 'core', MULTI, 5, '2024', {
    titleId: 'echo',
    seriesTitle: 'Echo',
    searchYear: 2024,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('She-Hulk: Attorney at Law', 'series', 'core', MULTI, 4, '2024', {
    titleId: 'she-hulk',
    seriesTitle: 'She-Hulk: Attorney at Law',
    searchYear: 2022,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Ms. Marvel', 'series', 'core', MULTI, 4, '2024', {
    titleId: 'ms-marvel',
    seriesTitle: 'Ms. Marvel',
    searchYear: 2022,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Thor: Love and Thunder', 'film', 'core', MULTI, 4, '2024', { searchYear: 2022 }),
  r('Ironheart', 'series', 'core', MULTI, 5, '2024', {
    titleId: 'ironheart',
    seriesTitle: 'Ironheart',
    searchYear: 2025,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Werewolf by Night', 'special', 'core', MULTI, 4, '2024', { searchYear: 2022 }),
  r('The Guardians of the Galaxy Holiday Special', 'special', 'core', MULTI, 4, '2025', { searchYear: 2022 }),
  r('Ant-Man and the Wasp: Quantumania', 'film', 'core', MULTI, 5, '2025', { searchYear: 2023 }),
  r('Guardians of the Galaxy Vol. 3', 'film', 'core', MULTI, 5, '2025', { searchYear: 2023 }),
  r('Secret Invasion', 'series', 'core', MULTI, 5, '2025', {
    titleId: 'secret-invasion',
    seriesTitle: 'Secret Invasion',
    searchYear: 2023,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('The Marvels', 'film', 'core', MULTI, 5, '2025', { searchYear: 2023 }),
  r('Loki (Season 2)', 'series', 'core', MULTI, 5, 'Out of time', {
    titleId: 'loki',
    seriesTitle: 'Loki',
    searchYear: 2021,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
  }),
  r('What If…? (Season 2)', 'series', 'core', MULTI, 5, 'Multiverse', {
    titleId: 'what-if',
    seriesTitle: 'What If…?',
    searchTitle: 'What If...?',
    searchYear: 2021,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
    note: 'Multiverse.',
  }),
  r('Deadpool & Wolverine', 'film', 'core', MULTI, 5, '2025', { searchYear: 2024 }),
  r('Agatha All Along', 'series', 'core', MULTI, 5, '2025', {
    titleId: 'agatha-all-along',
    seriesTitle: 'Agatha All Along',
    searchYear: 2024,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('What If…? (Season 3)', 'series', 'core', MULTI, 5, 'Multiverse', {
    titleId: 'what-if',
    seriesTitle: 'What If…?',
    searchTitle: 'What If...?',
    searchYear: 2021,
    arc: { season: 3, fromEpisode: 1, toEpisode: -1 },
    note: 'Multiverse.',
  }),
  r('Wonder Man', 'series', 'core', MULTI, 6, '2025', {
    titleId: 'wonder-man',
    seriesTitle: 'Wonder Man',
    searchYear: 2025,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Daredevil: Born Again (Season 1)', 'series', 'core', MULTI, 6, '2025', {
    titleId: 'daredevil-born-again',
    seriesTitle: 'Daredevil: Born Again',
    searchYear: 2025,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
  }),
  r('Captain America: Brave New World', 'film', 'core', MULTI, 5, '2025', { searchYear: 2025 }),
  r('Thunderbolts*', 'film', 'core', MULTI, 5, '2025', { searchTitle: 'Thunderbolts', searchYear: 2025 }),
  r('The Fantastic Four: First Steps', 'film', 'core', MULTI, 6, 'Earth-828', { searchYear: 2025 }),
  r('Daredevil: Born Again (Season 2)', 'series', 'core', MULTI, 6, '2026', {
    titleId: 'daredevil-born-again',
    seriesTitle: 'Daredevil: Born Again',
    searchYear: 2025,
    arc: { season: 2, fromEpisode: 1, toEpisode: -1 },
    note: 'TODO: verify placement (2026).',
  }),
  r('The Punisher: One Last Kill', 'special', 'core', MULTI, 6, '2026', {
    searchYear: 2026,
    note: 'TODO: verify placement (2026).',
  }),

  // ---- 3b. Optional multiverse / animation layer (hidden by default) ----
  r('Marvel Zombies', 'series', 'adjacent', MULTI, 'Multiverse (Optional)', 'Multiverse', {
    titleId: 'marvel-zombies',
    seriesTitle: 'Marvel Zombies',
    searchYear: 2025,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
    optional: true,
    multiverseLayer: true,
    note: 'Explicitly outside the Sacred Timeline (animation, multiverse).',
  }),
  r('Your Friendly Neighborhood Spider-Man', 'series', 'adjacent', MULTI, 'Multiverse (Optional)', 'Alt. continuity', {
    titleId: 'your-friendly-neighborhood-spider-man',
    seriesTitle: 'Your Friendly Neighborhood Spider-Man',
    searchYear: 2025,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
    optional: true,
    multiverseLayer: true,
    note: 'Alternate continuity (animation).',
  }),
  r("X-Men '97", 'series', 'adjacent', MULTI, 'Multiverse (Optional)', 'Multiverse', {
    titleId: 'x-men-97',
    seriesTitle: "X-Men '97",
    searchYear: 2024,
    arc: { season: 1, fromEpisode: 1, toEpisode: -1 },
    optional: true,
    multiverseLayer: true,
    note: 'Multiverse (animation).',
  }),
];

export const SEED: SeedUnit[] = rows.map((row, i): SeedUnit => {
  const e = row.extra ?? {};
  return {
    id: e.arc
      ? `${e.titleId ?? slug(row.title)}-s${e.arc.season}-e${e.arc.fromEpisode}-${
          e.arc.toEpisode === -1 ? 'end' : e.arc.toEpisode
        }`
      : slug(row.title),
    order: i + 1,
    titleId: e.titleId ?? slug(row.title),
    title: row.title,
    seriesTitle: e.seriesTitle,
    type: row.type,
    canon: row.canon,
    saga: row.saga,
    phase: row.phase,
    timelineLabel: row.timelineLabel,
    searchTitle: e.searchTitle ?? row.title.replace(/^One-Shot:\s*/, '').replace(/\s*\(Season.*\)$/, ''),
    searchYear: e.searchYear,
    arc: e.arc,
    note: e.note,
    revisit: e.revisit,
    optional: e.optional,
    multiverseLayer: e.multiverseLayer,
  };
});

export default SEED;
