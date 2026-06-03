/**
 * The rule-based workout generation engine.
 *
 * Pure, deterministic (seeded), zero external/AI dependencies. Given the user's
 * onboarding answers it produces a full weekly program: days, exercises, sets,
 * reps, rest and a progression strategy.
 *
 * Pipeline per week:
 *   1. Resolve physique template (muscle priorities + rep focus).
 *   2. Resolve the split's day layout for the chosen frequency.
 *   3. For each day, allocate exercise slots across that day's muscles,
 *      weighting priority muscles higher.
 *   4. Select a concrete exercise per slot (equipment/experience aware,
 *      avoiding weekly repeats).
 *   5. Prescribe sets/reps/rest from the resolved rep scheme.
 */
import { getPhysiqueGoal, getSplit } from '@/data';
import { LABELS } from '@/types';
import type {
  MuscleGroup,
  ProgramDay,
  ProgrammedExercise,
  ProgramGenerationInput,
  SplitDayTemplate,
  WorkoutProgram,
} from '@/types';
import {
  EXPERIENCE_SET_MODIFIER,
  PRIORITY_VOLUME_BONUS,
  REP_SCHEMES,
  exerciseCountForDuration,
  resolveRepFocus,
} from './constants';
import { buildProgressionStrategy } from './progression';
import { hashString, mulberry32, type Rng } from './rng';
import { selectExercise, type SelectionContext } from './selectExercises';

/** A muscle's weight when distributing slots within a day. */
function muscleWeight(
  muscle: MuscleGroup,
  priority: MuscleGroup[],
  deprioritized: MuscleGroup[],
): number {
  if (priority.includes(muscle)) return 3;
  if (deprioritized.includes(muscle)) return 1;
  return 2;
}

/**
 * Distribute `count` exercise slots across the day's muscles using a weighted
 * priority queue: each pick lowers a muscle's effective weight, so high-weight
 * muscles get ~2 slots and others ~1, capped at 3 per muscle.
 */
function allocateSlots(
  muscles: MuscleGroup[],
  count: number,
  priority: MuscleGroup[],
  deprioritized: MuscleGroup[],
): MuscleGroup[] {
  const assigned = new Map<MuscleGroup, number>(muscles.map((m) => [m, 0]));
  const slots: MuscleGroup[] = [];

  for (let i = 0; i < count; i++) {
    let best: MuscleGroup | undefined;
    let bestScore = -Infinity;
    for (const m of muscles) {
      const a = assigned.get(m)!;
      if (a >= 3) continue; // cap per muscle
      const score = muscleWeight(m, priority, deprioritized) / (a + 1);
      if (score > bestScore) {
        bestScore = score;
        best = m;
      }
    }
    if (!best) break;
    assigned.set(best, assigned.get(best)! + 1);
    slots.push(best);
  }
  return slots;
}

function buildDay(
  dayIndex: number,
  template: SplitDayTemplate,
  input: ProgramGenerationInput,
  priority: MuscleGroup[],
  deprioritized: MuscleGroup[],
  weeklyUsed: Set<string>,
  rng: Rng,
): ProgramDay {
  const repFocus = resolveRepFocus(getPhysiqueGoal(input.physiqueGoalId)?.repFocus ?? 'mixed', input.primaryGoal);
  const count = exerciseCountForDuration(input.sessionDurationMin, input.experience);

  // Order the day's muscles by weight so priority muscles are programmed first.
  const orderedMuscles = [...template.muscles].sort(
    (a, b) => muscleWeight(b, priority, deprioritized) - muscleWeight(a, priority, deprioritized),
  );
  const slots = allocateSlots(orderedMuscles, count, priority, deprioritized);

  const ctx: SelectionContext = {
    equipment: input.equipment,
    experience: input.experience,
    usedIds: weeklyUsed,
    rng,
  };

  // Track how many slots each muscle has consumed so the first is a compound.
  const perMuscleCount = new Map<MuscleGroup, number>();
  const built: (ProgrammedExercise & { pattern: 'compound' | 'isolation' })[] = [];

  for (const muscle of slots) {
    const nth = perMuscleCount.get(muscle) ?? 0;
    perMuscleCount.set(muscle, nth + 1);
    const preferCompound = nth === 0;

    const exercise = selectExercise(muscle, ctx, preferCompound);
    if (!exercise) continue;

    const scheme = REP_SCHEMES[repFocus][exercise.pattern];
    const isPriority = priority.includes(muscle);
    const sets = Math.max(
      2,
      scheme.sets + EXPERIENCE_SET_MODIFIER[input.experience] + (isPriority ? PRIORITY_VOLUME_BONUS : 0),
    );

    built.push({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets,
      repRange: scheme.repRange,
      restSeconds: scheme.restSeconds,
      note: isPriority ? 'Priority muscle — push the last set close to failure.' : undefined,
      pattern: exercise.pattern,
    });
  }

  // Big compounds first, isolation last, for a sensible session order.
  built.sort((a, b) => (a.pattern === b.pattern ? 0 : a.pattern === 'compound' ? -1 : 1));
  const exercises: ProgrammedExercise[] = built.map(({ pattern, ...rest }) => rest);

  return {
    dayIndex,
    name: template.name,
    focus: template.focus,
    exercises,
  };
}

/** Resolve the day templates for a frequency, padding/truncating if needed. */
function resolveLayout(input: ProgramGenerationInput): SplitDayTemplate[] {
  const split = getSplit(input.splitType);
  const layout = split.weeklyLayout;
  const exact = layout[input.daysPerWeek];
  if (exact) return exact;

  // Find the best available key (largest <= requested, else smallest).
  const keys = Object.keys(layout)
    .map(Number)
    .sort((a, b) => a - b);
  const lower = keys.filter((k) => k <= input.daysPerWeek).pop();
  const baseKey = lower ?? keys[0]!;
  const base = layout[baseKey]!;

  if (base.length === input.daysPerWeek) return base;
  // Cycle through base days to reach the requested frequency.
  const out: SplitDayTemplate[] = [];
  for (let i = 0; i < input.daysPerWeek; i++) out.push(base[i % base.length]!);
  return out;
}

export function generateProgram(input: ProgramGenerationInput, userId = ''): WorkoutProgram {
  const physique = getPhysiqueGoal(input.physiqueGoalId);
  const priority = physique?.priorityMuscles ?? [];
  const deprioritized = physique?.deprioritizedMuscles ?? [];

  const seed = hashString(
    [
      input.physiqueGoalId,
      input.splitType,
      input.daysPerWeek,
      input.sessionDurationMin,
      input.experience,
      input.equipment,
      input.primaryGoal,
    ].join('|'),
  );
  const rng = mulberry32(seed);

  const templates = resolveLayout(input);
  const weeklyUsed = new Set<string>();
  const days = templates.map((t, i) =>
    buildDay(i, t, input, priority, deprioritized, weeklyUsed, rng),
  );

  const now = new Date().toISOString();
  const splitLabel = LABELS.split[input.splitType];
  const name = physique ? `${physique.name} · ${splitLabel}` : splitLabel;

  return {
    id: `local-${seed.toString(36)}`,
    userId,
    name,
    splitType: input.splitType,
    physiqueGoalId: input.physiqueGoalId,
    daysPerWeek: input.daysPerWeek,
    sessionDurationMin: input.sessionDurationMin,
    experience: input.experience,
    equipment: input.equipment,
    primaryGoal: input.primaryGoal,
    isActive: true,
    days,
    progressionStrategy: buildProgressionStrategy(input.experience, input.primaryGoal),
    createdAt: now,
    updatedAt: now,
  };
}
