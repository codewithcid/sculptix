/**
 * Workout split definitions. Each split exposes a `weeklyLayout` keyed by the
 * number of training days, returning the ordered day templates for that week.
 * The workout engine fills each day's muscles with exercises.
 */
import type { MuscleGroup, SplitDefinition, SplitType } from '@/types';

// Reusable muscle groupings ------------------------------------------------
const PUSH: MuscleGroup[] = ['chest', 'upper_chest', 'front_delts', 'side_delts', 'triceps'];
const PULL: MuscleGroup[] = ['lats', 'upper_back', 'rear_delts', 'biceps', 'traps'];
const LEGS: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'calves'];
const UPPER: MuscleGroup[] = [
  'chest',
  'upper_chest',
  'lats',
  'upper_back',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
];
const LOWER: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'calves', 'abs'];
const FULL: MuscleGroup[] = ['quads', 'chest', 'lats', 'side_delts', 'hamstrings', 'biceps', 'triceps'];

export const SPLITS: SplitDefinition[] = [
  {
    type: 'ppl',
    name: 'Push / Pull / Legs',
    description:
      'Train pushing muscles, pulling muscles and legs on separate days. Scales beautifully from 3 to 6 days.',
    supportedDays: [3, 4, 5, 6],
    bestFor: ['intermediate', 'advanced'],
    weeklyLayout: {
      3: [
        { name: 'Push', focus: 'Chest · Shoulders · Triceps', muscles: PUSH },
        { name: 'Pull', focus: 'Back · Rear Delts · Biceps', muscles: PULL },
        { name: 'Legs', focus: 'Quads · Hamstrings · Calves', muscles: LEGS },
      ],
      4: [
        { name: 'Push', focus: 'Chest · Shoulders · Triceps', muscles: PUSH },
        { name: 'Pull', focus: 'Back · Rear Delts · Biceps', muscles: PULL },
        { name: 'Legs', focus: 'Quads · Hamstrings · Calves', muscles: LEGS },
        { name: 'Upper', focus: 'Chest · Back · Arms', muscles: UPPER },
      ],
      5: [
        { name: 'Push', focus: 'Chest · Shoulders · Triceps', muscles: PUSH },
        { name: 'Pull', focus: 'Back · Rear Delts · Biceps', muscles: PULL },
        { name: 'Legs', focus: 'Quads · Hamstrings · Calves', muscles: LEGS },
        { name: 'Upper', focus: 'Chest · Back · Arms', muscles: UPPER },
        { name: 'Lower', focus: 'Quads · Hamstrings · Glutes', muscles: LOWER },
      ],
      6: [
        { name: 'Push A', focus: 'Chest-focused push', muscles: PUSH },
        { name: 'Pull A', focus: 'Back width', muscles: PULL },
        { name: 'Legs A', focus: 'Quad-focused', muscles: LEGS },
        { name: 'Push B', focus: 'Shoulder-focused push', muscles: PUSH },
        { name: 'Pull B', focus: 'Back thickness', muscles: PULL },
        { name: 'Legs B', focus: 'Hamstring / glute-focused', muscles: LEGS },
      ],
    },
  },
  {
    type: 'upper_lower',
    name: 'Upper / Lower',
    description:
      'Alternate upper-body and lower-body days. A great balance of frequency and recovery for most lifters.',
    supportedDays: [3, 4, 5, 6],
    bestFor: ['beginner', 'intermediate', 'advanced'],
    weeklyLayout: {
      3: [
        { name: 'Upper', focus: 'Chest · Back · Shoulders · Arms', muscles: UPPER },
        { name: 'Lower', focus: 'Quads · Hamstrings · Glutes · Calves', muscles: LOWER },
        { name: 'Full Upper', focus: 'Balanced upper body', muscles: UPPER },
      ],
      4: [
        { name: 'Upper A', focus: 'Strength-focused upper', muscles: UPPER },
        { name: 'Lower A', focus: 'Quad-focused lower', muscles: LOWER },
        { name: 'Upper B', focus: 'Hypertrophy-focused upper', muscles: UPPER },
        { name: 'Lower B', focus: 'Posterior-chain lower', muscles: LOWER },
      ],
      5: [
        { name: 'Upper A', focus: 'Strength-focused upper', muscles: UPPER },
        { name: 'Lower A', focus: 'Quad-focused lower', muscles: LOWER },
        { name: 'Upper B', focus: 'Hypertrophy-focused upper', muscles: UPPER },
        { name: 'Lower B', focus: 'Posterior-chain lower', muscles: LOWER },
        { name: 'Upper C', focus: 'Weak-point upper', muscles: UPPER },
      ],
      6: [
        { name: 'Upper A', focus: 'Strength-focused upper', muscles: UPPER },
        { name: 'Lower A', focus: 'Quad-focused lower', muscles: LOWER },
        { name: 'Upper B', focus: 'Hypertrophy-focused upper', muscles: UPPER },
        { name: 'Lower B', focus: 'Posterior-chain lower', muscles: LOWER },
        { name: 'Upper C', focus: 'Pump-focused upper', muscles: UPPER },
        { name: 'Lower C', focus: 'Glute / calf-focused', muscles: LOWER },
      ],
    },
  },
  {
    type: 'arnold',
    name: 'Arnold Split',
    description:
      'Chest+Back, Shoulders+Arms, Legs — trained twice a week. High volume for advanced lifters.',
    supportedDays: [6],
    bestFor: ['advanced'],
    weeklyLayout: {
      6: [
        { name: 'Chest & Back', focus: 'Chest · Lats · Upper Back', muscles: ['chest', 'upper_chest', 'lats', 'upper_back'] },
        { name: 'Shoulders & Arms', focus: 'Delts · Biceps · Triceps', muscles: ['side_delts', 'front_delts', 'rear_delts', 'biceps', 'triceps'] },
        { name: 'Legs', focus: 'Quads · Hamstrings · Calves', muscles: LEGS },
        { name: 'Chest & Back', focus: 'Chest · Lats · Upper Back', muscles: ['chest', 'upper_chest', 'lats', 'upper_back'] },
        { name: 'Shoulders & Arms', focus: 'Delts · Biceps · Triceps', muscles: ['side_delts', 'front_delts', 'rear_delts', 'biceps', 'triceps'] },
        { name: 'Legs', focus: 'Quads · Hamstrings · Calves', muscles: LEGS },
      ],
    },
  },
  {
    type: 'full_body',
    name: 'Full Body',
    description:
      'Hit the whole body each session. Time-efficient and ideal for beginners or 3-day weeks.',
    supportedDays: [3, 4],
    bestFor: ['beginner', 'intermediate'],
    weeklyLayout: {
      3: [
        { name: 'Full Body A', focus: 'Squat · Press · Row', muscles: FULL },
        { name: 'Full Body B', focus: 'Hinge · Bench · Pulldown', muscles: FULL },
        { name: 'Full Body C', focus: 'Lunge · Incline · Pull-up', muscles: FULL },
      ],
      4: [
        { name: 'Full Body A', focus: 'Squat · Press · Row', muscles: FULL },
        { name: 'Full Body B', focus: 'Hinge · Bench · Pulldown', muscles: FULL },
        { name: 'Full Body C', focus: 'Lunge · Incline · Pull-up', muscles: FULL },
        { name: 'Full Body D', focus: 'Deadlift · OHP · Chin-up', muscles: FULL },
      ],
    },
  },
  {
    type: 'bro_split',
    name: 'Bro Split',
    description:
      'One muscle group per day. Maximum per-session volume; best when training 5 days a week.',
    supportedDays: [5],
    bestFor: ['intermediate', 'advanced'],
    weeklyLayout: {
      5: [
        { name: 'Chest', focus: 'Chest · Upper Chest', muscles: ['chest', 'upper_chest'] },
        { name: 'Back', focus: 'Lats · Upper Back · Traps', muscles: ['lats', 'upper_back', 'traps', 'lower_back'] },
        { name: 'Shoulders', focus: 'All three delts', muscles: ['side_delts', 'front_delts', 'rear_delts'] },
        { name: 'Legs', focus: 'Quads · Hamstrings · Calves', muscles: LEGS },
        { name: 'Arms', focus: 'Biceps · Triceps · Forearms', muscles: ['biceps', 'triceps', 'forearms'] },
      ],
    },
  },
  {
    type: 'custom',
    name: 'Custom Split',
    description: 'Design your own day-by-day layout.',
    supportedDays: [3, 4, 5, 6],
    bestFor: ['intermediate', 'advanced'],
    weeklyLayout: {
      3: [
        { name: 'Day 1', focus: 'Custom', muscles: FULL },
        { name: 'Day 2', focus: 'Custom', muscles: FULL },
        { name: 'Day 3', focus: 'Custom', muscles: FULL },
      ],
    },
  },
];

export const SPLITS_BY_TYPE: Record<SplitType, SplitDefinition> = Object.fromEntries(
  SPLITS.map((s) => [s.type, s]),
) as Record<SplitType, SplitDefinition>;

export function getSplit(type: SplitType): SplitDefinition {
  return SPLITS_BY_TYPE[type];
}
