-- SHRED tracker schema + Row Level Security.
-- Paste this whole file into the Supabase SQL editor and run it once.
--
-- Security model: single personal user. Every table carries user_id and RLS
-- restricts all access to auth.uid() = user_id. This is what makes shipping the
-- public anon key safe — without a valid login it can read/write nothing here.
-- Composite primary key (user_id, id) keeps the app's deterministic string ids
-- (e.g. "w9-d1", "2026-03-15") unique per user and idempotent for upserts.

-- ── profiles (one row per user) ────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  goal_weight  numeric not null default 195,
  start_weight numeric not null default 230,
  updated_at   timestamptz not null default now()
);

-- ── weight_entries (id = entry date 'YYYY-MM-DD') ──────────────────────────
create table if not exists public.weight_entries (
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  id         text not null,
  weight     numeric not null,
  entry_date date not null,
  note       text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ── sessions (per-day note/completion, id = dayId e.g. 'w9-d1') ─────────────
create table if not exists public.sessions (
  user_id      uuid not null default auth.uid() references auth.users on delete cascade,
  id           text not null,
  note         text not null default '',
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, id)
);

-- ── set_logs (id = 'w9-d1.s0.e0.set0') ─────────────────────────────────────
create table if not exists public.set_logs (
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  id             text not null,
  day_id         text not null,
  week           int  not null,
  exercise_slug  text not null,
  exercise_name  text not null,
  section_index  int  not null,
  exercise_index int  not null,
  set_index      int  not null,
  target_reps    text not null default '',
  weight         numeric,
  reps           int,
  rpe            numeric,
  completed      boolean not null default false,
  updated_at     timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists set_logs_slug_idx on public.set_logs (user_id, exercise_slug);
create index if not exists set_logs_day_idx  on public.set_logs (user_id, day_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.weight_entries enable row level security;
alter table public.sessions       enable row level security;
alter table public.set_logs       enable row level security;

-- profiles keyed by id = the user's auth id
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own weights" on public.weight_entries;
create policy "own weights" on public.weight_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sessions" on public.sessions;
create policy "own sessions" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own setlogs" on public.set_logs;
create policy "own setlogs" on public.set_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row on first sign-in.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
