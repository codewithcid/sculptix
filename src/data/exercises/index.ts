/**
 * Exercise database aggregation + lookup helpers.
 *
 * The 100+ exercises are split by muscle group into sibling files for
 * maintainability. This module concatenates them and exposes lookups + a
 * media-URL resolver.
 *
 * Demonstration GIFs: set EXPO_PUBLIC_EXERCISE_MEDIA_BASE in your .env to a
 * base URL hosting `<exercise_id>.gif`. With nothing configured, the UI shows
 * a graceful placeholder. (A good free option is the public-domain
 * `free-exercise-db` image set, or your own Supabase Storage bucket.)
 */
import type { Exercise, EquipmentAccess, MuscleGroup } from '@/types';
import { ARM_EXERCISES } from './arms';
import { BACK_EXERCISES } from './back';
import { CHEST_EXERCISES } from './chest';
import { CORE_EXERCISES } from './core';
import { LEG_EXERCISES } from './legs';
import { SHOULDER_EXERCISES } from './shoulders';

export const EXERCISES: Exercise[] = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...ARM_EXERCISES,
  ...LEG_EXERCISES,
  ...CORE_EXERCISES,
];

export const EXERCISES_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
);

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES_BY_ID[id];
}

/** All exercises whose primary muscle matches. */
export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return EXERCISES.filter((e) => e.primaryMuscle === muscle);
}

/** Exercises performable with the user's equipment tier. */
export function getExercisesForEquipment(equipment: EquipmentAccess): Exercise[] {
  return EXERCISES.filter((e) => e.equipment.includes(equipment));
}

const MEDIA_BASE = process.env.EXPO_PUBLIC_EXERCISE_MEDIA_BASE?.replace(/\/$/, '');

/** Resolve a demonstration GIF URL for an exercise, or undefined if unset. */
export function getExerciseGifUrl(exercise: Pick<Exercise, 'id' | 'gifUrl'>): string | undefined {
  if (exercise.gifUrl) return exercise.gifUrl;
  if (MEDIA_BASE) return `${MEDIA_BASE}/${exercise.id}.gif`;
  return undefined;
}

export {
  ARM_EXERCISES,
  BACK_EXERCISES,
  CHEST_EXERCISES,
  CORE_EXERCISES,
  LEG_EXERCISES,
  SHOULDER_EXERCISES,
};
