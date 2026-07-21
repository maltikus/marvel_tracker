-- MCU Timeline Tracker — cloud sync schema.
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
--
-- One JSONB row per user holds the whole progress blob. Row Level Security
-- ensures each signed-in user can only read/write their own row, so multiple
-- people can share the same deployment with fully private progress.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Recreate policies idempotently.
drop policy if exists "own progress - select" on public.progress;
drop policy if exists "own progress - insert" on public.progress;
drop policy if exists "own progress - update" on public.progress;
drop policy if exists "own progress - delete" on public.progress;

create policy "own progress - select"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "own progress - insert"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "own progress - update"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own progress - delete"
  on public.progress for delete
  using (auth.uid() = user_id);
