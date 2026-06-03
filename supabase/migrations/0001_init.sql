-- ============================================================================
-- Sculptix — Core schema
-- Migration 0001: enums, tables, indexes, updated_at triggers
--
-- Every user-owned table carries a `user_id` referencing auth.users and is
-- protected by Row Level Security (see 0002_rls.sql). Reference data
-- (exercises, physique_goals) is world-readable.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type gender             as enum ('male', 'female', 'other');
create type experience_level   as enum ('beginner', 'intermediate', 'advanced');
create type equipment_access   as enum ('full_gym', 'home_gym', 'dumbbells_only', 'bodyweight_only');
create type primary_goal       as enum ('build_muscle', 'lose_fat', 'recomp', 'strength');
create type unit_system        as enum ('metric', 'imperial');
create type split_type         as enum ('ppl', 'upper_lower', 'arnold', 'full_body', 'bro_split', 'custom');
create type workout_status     as enum ('pending', 'in_progress', 'completed', 'skipped');
create type meal_type          as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type photo_pose         as enum ('front', 'side', 'back');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users, holds onboarding answers
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  email                text,
  name                 text,
  age                  integer check (age between 10 and 120),
  gender               gender,
  height_cm            numeric(5, 1) check (height_cm > 0),
  weight_kg            numeric(5, 1) check (weight_kg > 0),
  experience           experience_level,
  equipment            equipment_access,
  days_per_week        integer check (days_per_week between 1 and 7),
  session_duration_min integer check (session_duration_min between 15 and 180),
  primary_goal         primary_goal,
  physique_goal_id     text,                     -- soft ref into app JSON config
  split_type           split_type,
  unit_system          unit_system not null default 'metric',
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- settings — per-user app preferences
-- ---------------------------------------------------------------------------
create table public.settings (
  user_id                    uuid primary key references auth.users (id) on delete cascade,
  theme                      text not null default 'system' check (theme in ('system', 'light', 'dark')),
  unit_system                unit_system not null default 'metric',
  rest_timer_default_seconds integer not null default 90 check (rest_timer_default_seconds between 0 and 600),
  notifications_enabled      boolean not null default true,
  updated_at                 timestamptz not null default now()
);

create trigger trg_settings_updated
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workout_programs — a generated/saved training program
-- ---------------------------------------------------------------------------
create table public.workout_programs (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  name                 text not null,
  split_type           split_type not null,
  physique_goal_id     text,
  days_per_week        integer not null,
  session_duration_min integer not null,
  experience           experience_level not null,
  equipment            equipment_access not null,
  primary_goal         primary_goal not null,
  is_active            boolean not null default true,
  generated_config     jsonb not null default '{}'::jsonb, -- full engine snapshot
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index idx_programs_user_active on public.workout_programs (user_id, is_active);

create trigger trg_programs_updated
  before update on public.workout_programs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- program_days — one training day template inside a program
-- ---------------------------------------------------------------------------
create table public.program_days (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.workout_programs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  day_index   integer not null,            -- 0-based order within the week
  name        text not null,               -- e.g. "Push A"
  focus       text,                        -- e.g. "Chest / Shoulders / Triceps"
  exercises   jsonb not null default '[]'::jsonb, -- [{exerciseId, sets, reps, restSeconds, ...}]
  created_at  timestamptz not null default now()
);

create index idx_program_days_program on public.program_days (program_id, day_index);

-- ---------------------------------------------------------------------------
-- workouts — a session instance (scheduled or performed)
-- ---------------------------------------------------------------------------
create table public.workouts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  program_id      uuid references public.workout_programs (id) on delete set null,
  program_day_id  uuid references public.program_days (id) on delete set null,
  name            text not null,
  date            date not null default current_date,
  status          workout_status not null default 'pending',
  duration_seconds integer,
  total_volume    numeric(10, 1) not null default 0, -- sum(weight*reps)
  notes           text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_workouts_user_date on public.workouts (user_id, date desc);
create index idx_workouts_user_status on public.workouts (user_id, status);

-- ---------------------------------------------------------------------------
-- workout_set_logs — each set performed in a workout
-- ---------------------------------------------------------------------------
create table public.workout_set_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  workout_id    uuid not null references public.workouts (id) on delete cascade,
  exercise_id   text not null,             -- ref into app JSON exercise db
  exercise_name text not null,             -- denormalized for history resilience
  set_index     integer not null,
  target_reps   integer,
  reps          integer,
  weight_kg     numeric(6, 2),
  rpe           numeric(3, 1),
  is_warmup     boolean not null default false,
  completed     boolean not null default false,
  rest_seconds  integer,
  created_at    timestamptz not null default now()
);

create index idx_set_logs_workout on public.workout_set_logs (workout_id);
create index idx_set_logs_user_exercise on public.workout_set_logs (user_id, exercise_id, created_at desc);

-- ---------------------------------------------------------------------------
-- personal_records — best lift per exercise/record type (kept up to date by app)
-- ---------------------------------------------------------------------------
create table public.personal_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  exercise_id   text not null,
  exercise_name text not null,
  record_type   text not null check (record_type in ('est_1rm', 'max_weight', 'max_reps', 'max_volume')),
  value         numeric(10, 2) not null,
  unit          text not null default 'kg',
  workout_id    uuid references public.workouts (id) on delete set null,
  achieved_at   timestamptz not null default now(),
  unique (user_id, exercise_id, record_type)
);

create index idx_prs_user on public.personal_records (user_id, exercise_id);

-- ---------------------------------------------------------------------------
-- foods — USDA-compatible food items. user_id NULL == global/seed food.
-- ---------------------------------------------------------------------------
create table public.foods (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete cascade, -- null = global
  name         text not null,
  brand        text,
  serving_size numeric(8, 2) not null default 100, -- amount per serving
  serving_unit text not null default 'g',
  calories     numeric(8, 2) not null,             -- per serving
  protein_g    numeric(7, 2) not null default 0,
  carbs_g      numeric(7, 2) not null default 0,
  fat_g        numeric(7, 2) not null default 0,
  fiber_g      numeric(7, 2),
  sugar_g      numeric(7, 2),
  barcode      text,
  source       text not null default 'custom' check (source in ('custom', 'seed', 'usda')),
  created_at   timestamptz not null default now()
);

create index idx_foods_name on public.foods using gin (to_tsvector('simple', name));
create index idx_foods_user on public.foods (user_id);

-- ---------------------------------------------------------------------------
-- nutrition_logs — a logged food entry on a date. Macros are snapshotted.
-- ---------------------------------------------------------------------------
create table public.nutrition_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  food_id    uuid references public.foods (id) on delete set null,
  date       date not null default current_date,
  meal       meal_type not null default 'breakfast',
  name       text not null,                  -- snapshot
  servings   numeric(6, 2) not null default 1,
  calories   numeric(8, 2) not null default 0,
  protein_g  numeric(7, 2) not null default 0,
  carbs_g    numeric(7, 2) not null default 0,
  fat_g      numeric(7, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index idx_nutrition_user_date on public.nutrition_logs (user_id, date desc);

-- ---------------------------------------------------------------------------
-- weight_entries — body weight log (one per day per user)
-- ---------------------------------------------------------------------------
create table public.weight_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  date         date not null default current_date,
  weight_kg    numeric(5, 1) not null check (weight_kg > 0),
  body_fat_pct numeric(4, 1),
  notes        text,
  created_at   timestamptz not null default now(),
  unique (user_id, date)
);

create index idx_weight_user_date on public.weight_entries (user_id, date desc);

-- ---------------------------------------------------------------------------
-- progress_photos — pointers into the `progress-photos` storage bucket
-- ---------------------------------------------------------------------------
create table public.progress_photos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  date         date not null default current_date,
  pose         photo_pose not null,
  storage_path text not null,               -- e.g. {user_id}/2026-06-03/front.jpg
  weight_kg    numeric(5, 1),
  notes        text,
  created_at   timestamptz not null default now()
);

create index idx_photos_user_date on public.progress_photos (user_id, date desc);

-- ---------------------------------------------------------------------------
-- Reference tables (world-readable). The mobile app ships this data as JSON
-- (src/data) for offline use; these tables let a future backend drive content
-- server-side without an app release. Seed them with scripts/seed-reference.ts.
-- ---------------------------------------------------------------------------
create table public.exercises (
  id             text primary key,
  name           text not null,
  primary_muscle text not null,
  equipment      text not null,
  difficulty     text,
  data           jsonb not null default '{}'::jsonb
);

create table public.physique_goals (
  id   text primary key,
  name text not null,
  data jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- On signup: create an empty profile + settings row for the new user.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
