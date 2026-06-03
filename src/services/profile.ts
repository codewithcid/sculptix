/** Profile + settings persistence. */
import { supabase } from '@/lib/supabase';
import type { OnboardingDraft, Profile, UserSettings } from '@/types';
import { mapProfile, mapSettings } from './mappers';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProfile(data) : null;
}

/** Persist onboarding answers and mark onboarding complete. */
export async function completeOnboarding(
  userId: string,
  draft: OnboardingDraft,
  email: string | null,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      name: draft.name ?? null,
      age: draft.age ?? null,
      gender: draft.gender ?? null,
      height_cm: draft.heightCm ?? null,
      weight_kg: draft.weightKg ?? null,
      experience: draft.experience ?? null,
      equipment: draft.equipment ?? null,
      days_per_week: draft.daysPerWeek ?? null,
      session_duration_min: draft.sessionDurationMin ?? null,
      primary_goal: draft.primaryGoal ?? null,
      physique_goal_id: draft.physiqueGoalId ?? null,
      split_type: draft.splitType ?? null,
      onboarding_completed: true,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapProfile(data);
}

export async function updateProfile(
  userId: string,
  patch: Partial<Profile>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: patch.name ?? undefined,
      age: patch.age ?? undefined,
      height_cm: patch.heightCm ?? undefined,
      weight_kg: patch.weightKg ?? undefined,
      experience: patch.experience ?? undefined,
      equipment: patch.equipment ?? undefined,
      days_per_week: patch.daysPerWeek ?? undefined,
      session_duration_min: patch.sessionDurationMin ?? undefined,
      primary_goal: patch.primaryGoal ?? undefined,
      physique_goal_id: patch.physiqueGoalId ?? undefined,
      split_type: patch.splitType ?? undefined,
      unit_system: patch.unitSystem ?? undefined,
    })
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapProfile(data);
}

export async function getSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapSettings(data) : null;
}

export async function updateSettings(
  userId: string,
  patch: Partial<UserSettings>,
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      theme: patch.theme ?? undefined,
      unit_system: patch.unitSystem ?? undefined,
      rest_timer_default_seconds: patch.restTimerDefaultSeconds ?? undefined,
      notifications_enabled: patch.notificationsEnabled ?? undefined,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapSettings(data);
}
