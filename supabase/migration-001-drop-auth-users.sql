-- Migration 001 — Drop Supabase auth.users dependency.
-- We're using a signed-cookie session keyed on email instead of Supabase Auth,
-- so the user_id columns + auth-based RLS policies are no longer needed.
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent: safe to re-run.

-- 1. Drop policies that referenced auth.uid() / auth.jwt()
drop policy if exists section_progress_self_select  on public.section_progress;
drop policy if exists section_progress_self_insert  on public.section_progress;
drop policy if exists section_progress_admin_select on public.section_progress;
drop policy if exists quiz_attempts_self_select     on public.quiz_attempts;
drop policy if exists quiz_attempts_self_insert     on public.quiz_attempts;
drop policy if exists quiz_attempts_admin_select    on public.quiz_attempts;
drop policy if exists completions_self_select       on public.completions;
drop policy if exists completions_self_insert       on public.completions;
drop policy if exists completions_admin_select      on public.completions;
drop policy if exists employees_read_self           on public.employees;
drop policy if exists employees_read_admin          on public.employees;
drop policy if exists employees_admin_write         on public.employees;

-- 2. Drop user_id columns and related FK/uniqueness
alter table public.section_progress drop constraint if exists section_progress_user_id_section_id_key;
alter table public.section_progress drop constraint if exists section_progress_user_id_fkey;
drop index if exists public.section_progress_user_idx;
alter table public.section_progress drop column if exists user_id;

alter table public.quiz_attempts drop constraint if exists quiz_attempts_user_id_fkey;
drop index if exists public.quiz_attempts_user_idx;
alter table public.quiz_attempts drop column if exists user_id;

alter table public.completions drop constraint if exists completions_user_id_fkey;
alter table public.completions drop constraint if exists completions_user_id_key;
alter table public.completions drop column if exists user_id;

-- 3. Add email-based uniqueness + indexes
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'section_progress_email_section_id_key'
  ) then
    alter table public.section_progress
      add constraint section_progress_email_section_id_key unique (email, section_id);
  end if;
end $$;

create index if not exists section_progress_email_idx on public.section_progress (email);
create index if not exists quiz_attempts_email_idx    on public.quiz_attempts    (email);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'completions_email_key'
  ) then
    alter table public.completions add constraint completions_email_key unique (email);
  end if;
end $$;

-- 4. Drop helper functions that referenced auth.jwt()
drop function if exists public.is_admin();
drop function if exists public.is_on_roster(text);

-- RLS remains enabled. With no policies, only the service role (which bypasses RLS)
-- can read/write these tables. All data access goes through Next.js API routes.
