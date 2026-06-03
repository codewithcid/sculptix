/**
 * Exercise selection. Given a target muscle and the user's constraints, pick a
 * suitable exercise — preferring compounds for primary slots, respecting
 * equipment + experience, and avoiding repeats already used elsewhere in the
 * week (so e.g. Push A and Push B differ).
 */
import { EXERCISES } from '@/data';
import type { Difficulty, EquipmentAccess, Exercise, ExperienceLevel, MuscleGroup } from '@/types';
import { shuffle, type Rng } from './rng';

const DIFFICULTY_RANK: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };

/** Max difficulty a lifter of the given experience should be auto-prescribed. */
function maxDifficulty(experience: ExperienceLevel): number {
  return DIFFICULTY_RANK[experience];
}

export interface SelectionContext {
  equipment: EquipmentAccess;
  experience: ExperienceLevel;
  /** Exercise ids already used this week (soft-avoided). */
  usedIds: Set<string>;
  rng: Rng;
}

function candidatesFor(muscle: MuscleGroup, ctx: SelectionContext): Exercise[] {
  const ceiling = maxDifficulty(ctx.experience);
  return EXERCISES.filter(
    (e) =>
      e.primaryMuscle === muscle &&
      e.equipment.includes(ctx.equipment) &&
      DIFFICULTY_RANK[e.difficulty] <= ceiling,
  );
}

/**
 * Select one exercise for a muscle.
 * @param preferCompound when true (primary slots) compounds are chosen first.
 */
export function selectExercise(
  muscle: MuscleGroup,
  ctx: SelectionContext,
  preferCompound: boolean,
): Exercise | undefined {
  let pool = candidatesFor(muscle, ctx);

  // If experience filtering left nothing, relax the difficulty ceiling.
  if (pool.length === 0) {
    pool = EXERCISES.filter(
      (e) => e.primaryMuscle === muscle && e.equipment.includes(ctx.equipment),
    );
  }
  if (pool.length === 0) return undefined;

  const ordered = shuffle(ctx.rng, pool).sort((a, b) => {
    // 1. Unused before used.
    const aUsed = ctx.usedIds.has(a.id) ? 1 : 0;
    const bUsed = ctx.usedIds.has(b.id) ? 1 : 0;
    if (aUsed !== bUsed) return aUsed - bUsed;
    // 2. Pattern preference.
    if (preferCompound) {
      const aC = a.pattern === 'compound' ? 0 : 1;
      const bC = b.pattern === 'compound' ? 0 : 1;
      if (aC !== bC) return aC - bC;
    } else {
      const aI = a.pattern === 'isolation' ? 0 : 1;
      const bI = b.pattern === 'isolation' ? 0 : 1;
      if (aI !== bI) return aI - bI;
    }
    return 0;
  });

  const chosen = ordered[0];
  if (chosen) ctx.usedIds.add(chosen.id);
  return chosen;
}
