/** Workout session + set logging + personal-record persistence. */
import { estimateOneRepMax } from '@/engine';
import { supabase } from '@/lib/supabase';
import type { PersonalRecord, SetLog, Workout } from '@/types';
import { todayIso } from '@/utils/date';
import { mapPersonalRecord, mapSetLog, mapWorkout } from './mappers';

export interface StartWorkoutInput {
  name: string;
  programId?: string | null;
  programDayId?: string | null;
  date?: string;
}

export async function startWorkout(userId: string, input: StartWorkoutInput): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      name: input.name,
      program_id: input.programId ?? null,
      program_day_id: input.programDayId ?? null,
      date: input.date ?? todayIso(),
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapWorkout(data);
}

/** A set the client wants to persist when finishing a workout. */
export interface SetInput {
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  targetReps: number | null;
  reps: number | null;
  weightKg: number | null;
  isWarmup: boolean;
  completed: boolean;
  restSeconds: number | null;
}

function computeVolume(sets: SetInput[]): number {
  return sets.reduce((sum, s) => {
    if (!s.completed || s.isWarmup) return sum;
    return sum + (s.weightKg ?? 0) * (s.reps ?? 0);
  }, 0);
}

/**
 * Finish a workout: persist all sets, compute total volume, mark complete and
 * refresh personal records. Returns the completed workout with its sets.
 */
export async function finishWorkout(
  userId: string,
  workoutId: string,
  sets: SetInput[],
  durationSeconds: number,
): Promise<Workout> {
  const completedSets = sets.filter((s) => s.completed);

  if (completedSets.length) {
    const rows = completedSets.map((s) => ({
      user_id: userId,
      workout_id: workoutId,
      exercise_id: s.exerciseId,
      exercise_name: s.exerciseName,
      set_index: s.setIndex,
      target_reps: s.targetReps,
      reps: s.reps,
      weight_kg: s.weightKg,
      is_warmup: s.isWarmup,
      completed: true,
      rest_seconds: s.restSeconds,
    }));
    const { error: setErr } = await supabase.from('workout_set_logs').insert(rows);
    if (setErr) throw new Error(setErr.message);
  }

  const totalVolume = computeVolume(sets);
  const { data, error } = await supabase
    .from('workouts')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      total_volume: totalVolume,
    })
    .eq('id', workoutId)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await refreshPersonalRecords(userId, workoutId, completedSets);
  return mapWorkout(data);
}

/** Upsert PRs (best est-1RM and max weight) from a finished workout's sets. */
async function refreshPersonalRecords(userId: string, workoutId: string, sets: SetInput[]) {
  const bestByExercise = new Map<string, { name: string; e1rm: number; maxWeight: number }>();
  for (const s of sets) {
    if (s.isWarmup || !s.weightKg || !s.reps) continue;
    const e1rm = estimateOneRepMax(s.weightKg, s.reps);
    const cur = bestByExercise.get(s.exerciseId);
    bestByExercise.set(s.exerciseId, {
      name: s.exerciseName,
      e1rm: Math.max(cur?.e1rm ?? 0, e1rm),
      maxWeight: Math.max(cur?.maxWeight ?? 0, s.weightKg),
    });
  }

  for (const [exerciseId, best] of bestByExercise) {
    for (const [recordType, value] of [
      ['est_1rm', best.e1rm],
      ['max_weight', best.maxWeight],
    ] as const) {
      // Only update if it beats the existing record.
      const { data: existing } = await supabase
        .from('personal_records')
        .select('value')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .eq('record_type', recordType)
        .maybeSingle();
      if (existing && existing.value >= value) continue;

      await supabase.from('personal_records').upsert(
        {
          user_id: userId,
          exercise_id: exerciseId,
          exercise_name: best.name,
          record_type: recordType,
          value,
          unit: 'kg',
          workout_id: workoutId,
          achieved_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,exercise_id,record_type' },
      );
    }
  }
}

export async function listWorkouts(userId: string, limit = 50): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapWorkout(r));
}

export async function getWorkout(userId: string, workoutId: string): Promise<Workout | null> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: setRows, error: setErr } = await supabase
    .from('workout_set_logs')
    .select('*')
    .eq('workout_id', workoutId)
    .order('set_index', { ascending: true });
  if (setErr) throw new Error(setErr.message);

  return mapWorkout(data, (setRows ?? []).map(mapSetLog));
}

export async function listPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPersonalRecord);
}

/** Last logged set for an exercise — used to pre-fill weights in a session. */
export async function getLastSetForExercise(
  userId: string,
  exerciseId: string,
): Promise<SetLog | null> {
  const { data, error } = await supabase
    .from('workout_set_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('is_warmup', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapSetLog(data) : null;
}
