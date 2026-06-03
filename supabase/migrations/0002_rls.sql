-- ============================================================================
-- Migration 0002: Row Level Security
--
-- Principle: a user can only ever see/modify rows where user_id = auth.uid()
-- (or id = auth.uid() for the profiles/settings tables). Reference tables are
-- read-only to everyone; foods additionally expose global (user_id IS NULL)
-- rows to all authenticated users.
-- ============================================================================

-- Enable RLS on every table -------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.settings          enable row level security;
alter table public.workout_programs  enable row level security;
alter table public.program_days      enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_set_logs  enable row level security;
alter table public.personal_records  enable row level security;
alter table public.foods             enable row level security;
alter table public.nutrition_logs    enable row level security;
alter table public.weight_entries    enable row level security;
alter table public.progress_photos   enable row level security;
alter table public.exercises         enable row level security;
alter table public.physique_goals    enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- settings ------------------------------------------------------------------
create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Generic owner-only policy for the remaining user tables -------------------
-- (kept explicit per-table for clarity / auditability)

create policy "programs_all_own" on public.workout_programs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "program_days_all_own" on public.program_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workouts_all_own" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "set_logs_all_own" on public.workout_set_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "prs_all_own" on public.personal_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "nutrition_all_own" on public.nutrition_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weight_all_own" on public.weight_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "photos_all_own" on public.progress_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- foods: read global + own; write only own --------------------------------
create policy "foods_select_global_or_own" on public.foods
  for select using (user_id is null or auth.uid() = user_id);
create policy "foods_insert_own" on public.foods
  for insert with check (auth.uid() = user_id);
create policy "foods_update_own" on public.foods
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "foods_delete_own" on public.foods
  for delete using (auth.uid() = user_id);

-- Reference tables: world-readable, no client writes ----------------------
create policy "exercises_read_all" on public.exercises
  for select using (true);
create policy "physique_goals_read_all" on public.physique_goals
  for select using (true);
