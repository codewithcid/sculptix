/** Workout program persistence. */
import { supabase } from '@/lib/supabase';
import type { WorkoutProgram } from '@/types';
import { mapProgram, mapProgramDay } from './mappers';

/**
 * Save a generated program: deactivate any current program, insert the new one
 * plus its normalized day rows, and stash the full structure in
 * `generated_config` for a fast single-row read.
 */
export async function saveProgram(
  userId: string,
  program: WorkoutProgram,
): Promise<WorkoutProgram> {
  // Deactivate existing active programs.
  await supabase
    .from('workout_programs')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  const { data: inserted, error } = await supabase
    .from('workout_programs')
    .insert({
      user_id: userId,
      name: program.name,
      split_type: program.splitType,
      physique_goal_id: program.physiqueGoalId,
      days_per_week: program.daysPerWeek,
      session_duration_min: program.sessionDurationMin,
      experience: program.experience,
      equipment: program.equipment,
      primary_goal: program.primaryGoal,
      is_active: true,
      generated_config: {
        days: program.days,
        progressionStrategy: program.progressionStrategy,
      },
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  // Insert normalized day rows.
  if (program.days.length) {
    const rows = program.days.map((d) => ({
      program_id: inserted.id,
      user_id: userId,
      day_index: d.dayIndex,
      name: d.name,
      focus: d.focus,
      exercises: d.exercises,
    }));
    const { error: dayErr } = await supabase.from('program_days').insert(rows);
    if (dayErr) throw new Error(dayErr.message);
  }

  return mapProgram(inserted, program.days);
}

export async function getActiveProgram(userId: string): Promise<WorkoutProgram | null> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: dayRows, error: dayErr } = await supabase
    .from('program_days')
    .select('*')
    .eq('program_id', data.id)
    .order('day_index', { ascending: true });
  if (dayErr) throw new Error(dayErr.message);

  return mapProgram(data, (dayRows ?? []).map(mapProgramDay));
}

export async function listPrograms(userId: string): Promise<WorkoutProgram[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapProgram(r));
}
