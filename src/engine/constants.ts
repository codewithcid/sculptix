/**
 * Tunable parameters for the workout generation engine. Everything the engine
 * decides quantitatively is sourced from here, so you can tweak programming
 * philosophy in one place.
 */
import type { ExperienceLevel, PhysiqueGoal, PrimaryGoal } from '@/types';

/** Approximate number of exercises that fit in a session of a given length. */
export const EXERCISES_PER_SESSION: Record<number, number> = {
  30: 3,
  45: 4,
  60: 5,
  75: 6,
  90: 7,
};

/** Resolve exercise count for an arbitrary duration (nearest configured bucket). */
export function exerciseCountForDuration(durationMin: number, experience: ExperienceLevel): number {
  const buckets = Object.keys(EXERCISES_PER_SESSION)
    .map(Number)
    .sort((a, b) => a - b);
  let chosen = buckets[0]!;
  for (const b of buckets) if (durationMin >= b) chosen = b;
  let count = EXERCISES_PER_SESSION[chosen]!;
  // Advanced lifters work a touch denser; beginners a touch leaner.
  if (experience === 'advanced') count += 1;
  if (experience === 'beginner') count = Math.max(3, count - 1);
  return Math.min(8, Math.max(3, count));
}

export interface RepScheme {
  sets: number;
  repRange: [number, number];
  restSeconds: number;
}

export type RepFocus = PhysiqueGoal['repFocus'];

/**
 * Base rep schemes keyed by rep focus, then by movement pattern. The engine
 * applies experience/goal modifiers on top.
 */
export const REP_SCHEMES: Record<RepFocus, { compound: RepScheme; isolation: RepScheme }> = {
  strength: {
    compound: { sets: 4, repRange: [4, 6], restSeconds: 180 },
    isolation: { sets: 3, repRange: [6, 10], restSeconds: 120 },
  },
  hypertrophy: {
    compound: { sets: 4, repRange: [6, 10], restSeconds: 120 },
    isolation: { sets: 3, repRange: [10, 15], restSeconds: 75 },
  },
  metabolic: {
    compound: { sets: 3, repRange: [10, 15], restSeconds: 60 },
    isolation: { sets: 3, repRange: [12, 20], restSeconds: 45 },
  },
  mixed: {
    compound: { sets: 4, repRange: [6, 10], restSeconds: 120 },
    isolation: { sets: 3, repRange: [10, 12], restSeconds: 75 },
  },
};

/** Sets added/removed based on training experience. */
export const EXPERIENCE_SET_MODIFIER: Record<ExperienceLevel, number> = {
  beginner: -1,
  intermediate: 0,
  advanced: 1,
};

/** How the primary goal nudges the rep focus chosen by the physique template. */
export function resolveRepFocus(physiqueFocus: RepFocus, goal: PrimaryGoal): RepFocus {
  if (goal === 'strength') return 'strength';
  if (goal === 'lose_fat') return physiqueFocus === 'strength' ? 'mixed' : 'metabolic';
  if (goal === 'build_muscle') return physiqueFocus === 'strength' ? 'mixed' : 'hypertrophy';
  return physiqueFocus; // recomp respects the physique template
}

/** Extra weekly sets granted to a priority muscle (spread across its sessions). */
export const PRIORITY_VOLUME_BONUS = 1;
