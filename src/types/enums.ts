/**
 * Enumerations shared across the domain. These mirror the Postgres enums
 * defined in supabase/migrations/0001_init.sql — keep them in sync.
 */

export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EQUIPMENT_ACCESS = [
  'full_gym',
  'home_gym',
  'dumbbells_only',
  'bodyweight_only',
] as const;
export type EquipmentAccess = (typeof EQUIPMENT_ACCESS)[number];

export const PRIMARY_GOALS = ['build_muscle', 'lose_fat', 'recomp', 'strength'] as const;
export type PrimaryGoal = (typeof PRIMARY_GOALS)[number];

export const UNIT_SYSTEMS = ['metric', 'imperial'] as const;
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];

export const SPLIT_TYPES = [
  'ppl',
  'upper_lower',
  'arnold',
  'full_body',
  'bro_split',
  'custom',
] as const;
export type SplitType = (typeof SPLIT_TYPES)[number];

export const WORKOUT_STATUSES = ['pending', 'in_progress', 'completed', 'skipped'] as const;
export type WorkoutStatus = (typeof WORKOUT_STATUSES)[number];

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const PHOTO_POSES = ['front', 'side', 'back'] as const;
export type PhotoPose = (typeof PHOTO_POSES)[number];

/** Muscle groups used by the exercise database and physique-goal priorities. */
export const MUSCLE_GROUPS = [
  'chest',
  'upper_chest',
  'lats',
  'upper_back',
  'lower_back',
  'traps',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
  'obliques',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Human-readable labels for each enum value, used throughout the UI. */
export const LABELS = {
  gender: { male: 'Male', female: 'Female', other: 'Other' },
  experience: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
  equipment: {
    full_gym: 'Full Gym',
    home_gym: 'Home Gym',
    dumbbells_only: 'Dumbbells Only',
    bodyweight_only: 'Bodyweight Only',
  },
  goal: {
    build_muscle: 'Build Muscle',
    lose_fat: 'Lose Fat',
    recomp: 'Recomp',
    strength: 'Strength',
  },
  split: {
    ppl: 'Push / Pull / Legs',
    upper_lower: 'Upper / Lower',
    arnold: 'Arnold Split',
    full_body: 'Full Body',
    bro_split: 'Bro Split',
    custom: 'Custom',
  },
  muscle: {
    chest: 'Chest',
    upper_chest: 'Upper Chest',
    lats: 'Lats',
    upper_back: 'Upper Back',
    lower_back: 'Lower Back',
    traps: 'Traps',
    front_delts: 'Front Delts',
    side_delts: 'Side Delts',
    rear_delts: 'Rear Delts',
    biceps: 'Biceps',
    triceps: 'Triceps',
    forearms: 'Forearms',
    quads: 'Quads',
    hamstrings: 'Hamstrings',
    glutes: 'Glutes',
    calves: 'Calves',
    abs: 'Abs',
    obliques: 'Obliques',
  },
} as const;
