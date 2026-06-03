/**
 * Physique goal templates. This is the configurable JSON-style structure that
 * drives muscle prioritisation in the workout engine. Add or tweak entries
 * freely — the engine reads `priorityMuscles`, `deprioritizedMuscles`,
 * `recommendedWeeklyVolume`, `recommendedSplits` and `repFocus`.
 */
import type { PhysiqueGoal } from '@/types';

export const PHYSIQUE_GOALS: PhysiqueGoal[] = [
  {
    id: 'v_taper',
    name: 'V-Taper',
    tagline: 'Wide shoulders, narrow waist',
    description:
      'The classic wide-to-narrow silhouette. Built by maximising lat width and shoulder caps while keeping the waist tight.',
    priorityMuscles: ['lats', 'side_delts', 'rear_delts', 'upper_chest', 'upper_back'],
    deprioritizedMuscles: ['quads', 'hamstrings', 'calves'],
    recommendedWeeklyVolume: 'high',
    recommendedSplits: ['ppl', 'upper_lower', 'arnold'],
    repFocus: 'hypertrophy',
    imageKey: 'v_taper',
  },
  {
    id: 'mens_physique',
    name: "Men's Physique",
    tagline: 'Stage-ready upper body, board-shorts legs',
    description:
      'Emphasises a capped, round delt and a wide, full upper body. Legs are maintained but not the focus.',
    priorityMuscles: ['side_delts', 'lats', 'upper_chest', 'rear_delts', 'triceps'],
    deprioritizedMuscles: ['quads', 'hamstrings', 'calves'],
    recommendedWeeklyVolume: 'high',
    recommendedSplits: ['ppl', 'arnold', 'bro_split'],
    repFocus: 'hypertrophy',
    imageKey: 'mens_physique',
  },
  {
    id: 'classic_physique',
    name: 'Classic Physique',
    tagline: 'Golden-era proportions',
    description:
      'Balanced, proportionate mass with a small waist — chest, delts, arms and legs all developed in harmony.',
    priorityMuscles: ['upper_chest', 'side_delts', 'lats', 'quads', 'biceps', 'triceps'],
    deprioritizedMuscles: [],
    recommendedWeeklyVolume: 'high',
    recommendedSplits: ['arnold', 'ppl', 'bro_split'],
    repFocus: 'hypertrophy',
    imageKey: 'classic_physique',
  },
  {
    id: 'athletic',
    name: 'Athletic',
    tagline: 'Functional, well-rounded muscle',
    description:
      'A balanced, capable look. Even development across pushing, pulling and lower body with a focus on strength carryover.',
    priorityMuscles: ['quads', 'glutes', 'lats', 'chest', 'front_delts'],
    deprioritizedMuscles: [],
    recommendedWeeklyVolume: 'moderate',
    recommendedSplits: ['upper_lower', 'full_body', 'ppl'],
    repFocus: 'mixed',
    imageKey: 'athletic',
  },
  {
    id: 'lean_model',
    name: 'Lean Model',
    tagline: 'Lean, defined, proportionate',
    description:
      'A magazine-cover look: lower body fat with enough muscle for definition. Moderate volume paired with conditioning.',
    priorityMuscles: ['upper_chest', 'side_delts', 'abs', 'lats'],
    deprioritizedMuscles: ['traps'],
    recommendedWeeklyVolume: 'moderate',
    recommendedSplits: ['upper_lower', 'ppl', 'full_body'],
    repFocus: 'mixed',
    imageKey: 'lean_model',
  },
  {
    id: 'powerbuilding',
    name: 'Powerbuilding',
    tagline: 'Big and strong',
    description:
      'Marries powerlifting strength on the big lifts with bodybuilding accessory volume. Size and numbers go up together.',
    priorityMuscles: ['chest', 'lats', 'quads', 'glutes', 'front_delts', 'triceps'],
    deprioritizedMuscles: [],
    recommendedWeeklyVolume: 'high',
    recommendedSplits: ['upper_lower', 'ppl', 'full_body'],
    repFocus: 'mixed',
    imageKey: 'powerbuilding',
  },
  {
    id: 'strength_focused',
    name: 'Strength Focused',
    tagline: 'Maximal force on the main lifts',
    description:
      'Built around squat, bench, deadlift and press. Lower reps, higher intensity, longer rest. Accessories support the lifts.',
    priorityMuscles: ['quads', 'glutes', 'chest', 'lower_back', 'front_delts'],
    deprioritizedMuscles: ['calves', 'forearms'],
    recommendedWeeklyVolume: 'moderate',
    recommendedSplits: ['upper_lower', 'full_body'],
    repFocus: 'strength',
    imageKey: 'strength_focused',
  },
  {
    id: 'fat_loss',
    name: 'Fat Loss',
    tagline: 'Preserve muscle, drop body fat',
    description:
      'Full-body, higher-density training to retain muscle in a calorie deficit. Shorter rest, compound-led sessions.',
    priorityMuscles: ['quads', 'glutes', 'chest', 'lats', 'abs'],
    deprioritizedMuscles: [],
    recommendedWeeklyVolume: 'moderate',
    recommendedSplits: ['full_body', 'upper_lower', 'ppl'],
    repFocus: 'metabolic',
    imageKey: 'fat_loss',
  },
];

export const PHYSIQUE_GOALS_BY_ID: Record<string, PhysiqueGoal> = Object.fromEntries(
  PHYSIQUE_GOALS.map((g) => [g.id, g]),
);

export function getPhysiqueGoal(id: string | null | undefined): PhysiqueGoal | undefined {
  return id ? PHYSIQUE_GOALS_BY_ID[id] : undefined;
}
