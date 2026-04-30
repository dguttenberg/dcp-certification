-- DCP AI Foundations Certification — Supabase schema
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent enough to run twice.
--
-- Auth note: this app does not use Supabase Auth. Sign-in is handled by
-- a signed-cookie session keyed on email (see src/lib/session.ts).
-- All data access goes through Next.js API routes using the service role,
-- which bypasses RLS. RLS is left enabled with no policies so anon/authenticated
-- direct queries are blocked.

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------
create table if not exists public.employees (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  full_name   text not null,
  job_title   text,
  agency      text not null,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists employees_email_lower_idx on public.employees (lower(email));

create table if not exists public.section_progress (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  section_id   text not null,
  completed_at timestamptz not null default now(),
  unique (email, section_id)
);
create index if not exists section_progress_email_idx on public.section_progress (email);

create table if not exists public.quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  score         integer not null,
  total         integer not null,
  passed        boolean not null,
  answers       jsonb not null,
  attempted_at  timestamptz not null default now()
);
create index if not exists quiz_attempts_email_idx on public.quiz_attempts (email);

create table if not exists public.completions (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  quiz_attempt_id   uuid references public.quiz_attempts(id) on delete set null,
  completed_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. RLS
-- Enabled with no policies. Service role bypasses RLS; everything else is denied.
-- ---------------------------------------------------------------------------
alter table public.employees        enable row level security;
alter table public.section_progress enable row level security;
alter table public.quiz_attempts    enable row level security;
alter table public.completions      enable row level security;
