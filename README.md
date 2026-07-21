# MCU Timeline Tracker

A static, client-side web app for tracking the **complete, granular** Marvel
Cinematic Universe timeline — every film, series, Marvel One-Shot, special and
short — including cases where a single season or episode arc is slotted into
different points of the chronology (e.g. *Agents of S.H.I.E.L.D.* interleaved
with the films).

It shows what to watch next, overall + per-phase progress, lets you rate titles
as you check them off, and tracks series **episode-by-episode**. No backend —
progress lives in `localStorage`; catalog/image data is baked into a static
`public/data.json` at build time from TMDB (no API key in the browser).

## Features

- **Next up** hero card — the first unwatched unit in the active order, with a
  "continue at S1·E3" hint for series arcs.
- **Two granularities:** timeline placement in *watch-units* (a film, a one-shot,
  a whole season, or an episode arc like *AoS S1 · E1–7*); progress tracked
  per-episode for series.
- **Progress by units and by hours**, plus per-phase / per-saga completion rings.
  Revisit dupes (e.g. the Endgame finale revisit) never double-count.
- **Chronological ⇄ Release** order toggle.
- **Canon filters:** hide/show *Timeline-adjacent* titles (Marvel Television /
  Netflix / ABC) and an *optional multiverse/animation* layer. Core-only by default.
- **Ratings** (1–10, half steps), **filters & search**, **stats dashboard**,
  **marathon planner** (finish-by estimate), **Continue Watching**,
  **spoiler-free mode**, **export/import** of progress, and confetti on
  phase/saga completion.
- Framer Motion throughout (shared-element card → detail, staggered rails,
  animated progress), `prefers-reduced-motion` respected. Responsive from ~360px.

## Getting started

```bash
npm install
npm run seed:placeholder   # generate offline placeholder data.json (no key needed)
npm run dev
```

Open the printed local URL. The placeholder build uses inline SVG artwork so the
app is fully functional without any credentials.

### Real TMDB data (posters, synopses, episodes)

1. Create a free TMDB account and API key: https://www.themoviedb.org/settings/api
2. Copy `.env.example` → `.env` and set `TMDB_API_KEY` (v3) **or**
   `TMDB_READ_TOKEN` (v4 bearer).
3. Regenerate the catalog:

   ```bash
   npm run build:data
   ```

The key is read only by `scripts/build-data.ts` (Node) and never reaches the
browser bundle. Unresolvable titles fall back to placeholders automatically; add
verified TMDB ids to the `OVERRIDES` map in `scripts/build-data.ts` for one-shots
/ shorts / specials that don't resolve cleanly.

## Cloud sync & login (optional)

By default progress is stored per-browser in `localStorage`. To sync across
devices and let multiple people use one deployment (each with private
progress), wire up a free **Supabase** project. The app degrades gracefully to
local-only when this isn't configured.

1. Create a project at https://supabase.com.
2. **SQL Editor → New query** → paste [`supabase/schema.sql`](supabase/schema.sql)
   → **Run**. This creates a `progress` table with Row Level Security so each
   user only ever sees their own row.
3. **Authentication → Providers → Email**: keep *Email* enabled. For quick
   testing you may turn *Confirm email* off (Authentication → Sign In / Providers);
   otherwise new users must click the confirmation link before signing in.
4. **Project Settings → API keys**: copy the **Project URL** and the
   **Publishable key** (`sb_publishable_…`) into your `.env`:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   These are *public* values (safe in the browser and in the repo) — the
   publishable key is only useful together with the RLS policies above. (The
   legacy `anon` key still works via `VITE_SUPABASE_ANON_KEY` as a fallback.)
5. For the deployed site, add the same two as repository **Variables** (not
   secrets): **Settings → Secrets and variables → Actions → Variables** →
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. The deploy workflow
   reads them.

Then the ☁ button in the header offers sign-in / sign-up. On first sign-in, any
guest progress already on the device is merged into the account. After that,
changes push automatically (debounced) and other devices pull on load.

> Sync is a whole-blob, last-write-wins model with a union-merge on first
> sign-in. It's built for accumulating progress across devices; two devices
> editing *concurrently* can resurrect an un-checked item. Fine for one person
> on several devices; not a real-time collaborative editor.

## Deploying to GitHub Pages

1. Push to GitHub and set **Settings → Pages → Source: GitHub Actions**.
2. For a **project site** (`user.github.io/<repo>`), add a repository variable
   `BASE_PATH` = `/<repo>/`. For a user/org or custom-domain site, leave it `/`.
3. (Optional) Add a repository secret `TMDB_API_KEY` (or `TMDB_READ_TOKEN`) so
   the deploy fetches real data. Without it, the site still deploys with
   placeholder artwork.
4. Push to `main` — `.github/workflows/deploy.yml` builds data, builds the site
   and deploys.

The app uses hash-based routing, so deep links (`#/unit/:id`) work on Pages with
no `404.html` redirect needed.

## Data model & canon notes

- Timeline order is the curated **Source of Truth** in
  [`src/data/catalog.seed.ts`](src/data/catalog.seed.ts); the build script only
  adds metadata/images. Where the seed uses arc granularity it stays that way —
  finer splits are marked `// TODO: verify` rather than guessed.
- **Split-viewing** notes (Captain Marvel, Black Widow, Ant-Man and the Wasp)
  flag post-/mid-credits scenes to watch later — shown as a hint, not duplicated
  as separate units.
- **Adjacent** titles (AoS, Agent Carter, Inhumans, Runaways, Cloak & Dagger,
  Team-Thor/Darryl shorts) aren't in Marvel Studios' official timeline and are
  labelled as such, off by default.
- Order is a defensible curation, not "the one true" ordering; where reputable
  sources disagree (e.g. exact AoS episode boundaries) we pick one consistent cut.

## Keyboard shortcuts

- `/` focus search · `f` toggle filters · `Enter` mark the next-up unit watched
  · `Esc` close detail.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. This is
an unofficial fan project with no affiliation to Marvel, Disney or TMDB.

## Tech

React + TypeScript + Vite · Tailwind CSS · Framer Motion · Zustand · lucide-react
· canvas-confetti.
