/**
 * Progression strategy + small strength-math helpers used during workouts.
 */
import type { ExperienceLevel, PrimaryGoal } from '@/types';

/** Epley estimated 1-rep-max from a working set. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/**
 * Suggest the next set's weight given the last performance against a rep target.
 * Double-progression: hit the top of the range → add load; below the bottom →
 * back off slightly; in range → repeat and try to add reps.
 */
export function suggestNextWeight(
  lastWeightKg: number,
  lastReps: number,
  repRange: [number, number],
  experience: ExperienceLevel,
): { weightKg: number; advice: string } {
  const [low, high] = repRange;
  // Smallest sensible jump scales with experience/strength.
  const increment = experience === 'beginner' ? 2.5 : lastWeightKg >= 60 ? 5 : 2.5;

  if (lastReps >= high) {
    return {
      weightKg: Math.round((lastWeightKg + increment) * 2) / 2,
      advice: `Great work — add ${increment}kg next session.`,
    };
  }
  if (lastReps < low) {
    return {
      weightKg: Math.max(0, Math.round((lastWeightKg - increment) * 2) / 2),
      advice: `Drop ${increment}kg and rebuild reps in the ${low}–${high} range.`,
    };
  }
  return {
    weightKg: lastWeightKg,
    advice: `Stay at ${lastWeightKg}kg and add a rep toward ${high}.`,
  };
}

export function buildProgressionStrategy(
  experience: ExperienceLevel,
  goal: PrimaryGoal,
): string {
  const base =
    'Use double progression: work within each exercise’s rep range, and when you hit the ' +
    'top of the range on all sets, add weight next session and rebuild your reps from the bottom.';

  const byExperience: Record<ExperienceLevel, string> = {
    beginner:
      'As a beginner you can add a little weight almost every session (linear progression). ' +
      'Focus on clean technique and a consistent tempo.',
    intermediate:
      'Aim to beat the previous session by a rep or a small load increase each week. ' +
      'Deload roughly every 6–8 weeks if progress stalls.',
    advanced:
      'Progress is slower now — track sets close to failure (RIR 1–2) and autoregulate ' +
      'volume week to week. Plan a deload every 4–6 weeks.',
  };

  const byGoal: Record<PrimaryGoal, string> = {
    build_muscle: 'Prioritise total weekly volume on your priority muscles and chase progressive overload.',
    lose_fat: 'Keep the loads heavy to preserve muscle; the calorie deficit drives fat loss, not endless reps.',
    recomp: 'Push performance in the gym while eating at/near maintenance — strength up, waist down.',
    strength: 'Treat the main lifts as the priority: low reps, full rest, add load before adding volume.',
  };

  return `${base}\n\n${byExperience[experience]}\n\n${byGoal[goal]}`;
}
