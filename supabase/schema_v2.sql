-- ============================================================
-- СЦК — Schema v2: Users, Sessions, Orders update
-- Запустить в: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── users ────────────────────────────────────────────────────

create table if not exists public.users (
  id           uuid primary key default gen_random_uuid(),
  telegram_id  text unique not null,
  name         text,
  username     text,
  photo_url    text,
  created_at   timestamptz default now()
);

alter table public.users enable row level security;

create policy "users_public_read" on public.users
  for select using (true);

-- ── user_sessions ─────────────────────────────────────────────

create table if not exists public.user_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade not null,
  token       uuid default gen_random_uuid() unique not null,
  expires_at  timestamptz default (now() + interval '30 days') not null,
  created_at  timestamptz default now()
);

alter table public.user_sessions enable row level security;

create policy "sessions_all" on public.user_sessions
  for all using (true) with check (true);

-- ── orders: add user_id ───────────────────────────────────────

alter table public.orders
  add column if not exists user_id uuid references public.users(id);
