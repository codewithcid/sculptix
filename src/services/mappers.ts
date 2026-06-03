/**
 * Pure mappers between snake_case database rows and camelCase domain models.
 * Keeping these in one place means the rest of the app never sees DB shapes.
 */
import type {
  Food,
  NutritionLog,
  PersonalRecord,
  ProgramDay,
  Profile,
  ProgressPhoto,
  SetLog,
  UserSettings,
  WeightEntry,
  Workout,
  WorkoutProgram,
} from '@/types';
import type { Database } from '@/types';

type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export function mapProfile(r: Row<'profiles'>): Profile {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    age: r.age,
    gender: r.gender,
    heightCm: r.height_cm,
    weightKg: r.weight_kg,
    experience: r.experience,
    equipment: r.equipment,
    daysPerWeek: r.days_per_week,
    sessionDurationMin: r.session_duration_min,
    primaryGoal: r.primary_goal,
    physiqueGoalId: r.physique_goal_id,
    splitType: r.split_type,
    unitSystem: r.unit_system,
    onboardingCompleted: r.onboarding_completed,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapSettings(r: Row<'settings'>): UserSettings {
  return {
    theme: r.theme,
    unitSystem: r.unit_system,
    restTimerDefaultSeconds: r.rest_timer_default_seconds,
    notificationsEnabled: r.notifications_enabled,
  };
}

export function mapProgram(
  r: Row<'workout_programs'>,
  days: ProgramDay[] = [],
): WorkoutProgram {
  const cfg = (r.generated_config ?? {}) as { progressionStrategy?: string; days?: ProgramDay[] };
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    splitType: r.split_type,
    physiqueGoalId: r.physique_goal_id,
    daysPerWeek: r.days_per_week,
    sessionDurationMin: r.session_duration_min,
    experience: r.experience,
    equipment: r.equipment,
    primaryGoal: r.primary_goal,
    isActive: r.is_active,
    days: days.length ? days : (cfg.days ?? []),
    progressionStrategy: cfg.progressionStrategy ?? '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapProgramDay(r: Row<'program_days'>): ProgramDay {
  return {
    id: r.id,
    dayIndex: r.day_index,
    name: r.name,
    focus: r.focus ?? '',
    exercises: (r.exercises as ProgramDay['exercises']) ?? [],
  };
}

export function mapSetLog(r: Row<'workout_set_logs'>): SetLog {
  return {
    id: r.id,
    workoutId: r.workout_id,
    exerciseId: r.exercise_id,
    exerciseName: r.exercise_name,
    setIndex: r.set_index,
    targetReps: r.target_reps,
    reps: r.reps,
    weightKg: r.weight_kg,
    rpe: r.rpe,
    isWarmup: r.is_warmup,
    completed: r.completed,
    restSeconds: r.rest_seconds,
  };
}

export function mapWorkout(r: Row<'workouts'>, sets?: SetLog[]): Workout {
  return {
    id: r.id,
    userId: r.user_id,
    programId: r.program_id,
    programDayId: r.program_day_id,
    name: r.name,
    date: r.date,
    status: r.status,
    durationSeconds: r.duration_seconds,
    totalVolume: r.total_volume,
    notes: r.notes,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    createdAt: r.created_at,
    sets,
  };
}

export function mapPersonalRecord(r: Row<'personal_records'>): PersonalRecord {
  return {
    id: r.id,
    exerciseId: r.exercise_id,
    exerciseName: r.exercise_name,
    recordType: r.record_type,
    value: r.value,
    unit: r.unit,
    achievedAt: r.achieved_at,
  };
}

export function mapFood(r: Row<'foods'>): Food {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    brand: r.brand,
    servingSize: r.serving_size,
    servingUnit: r.serving_unit,
    calories: r.calories,
    proteinG: r.protein_g,
    carbsG: r.carbs_g,
    fatG: r.fat_g,
    fiberG: r.fiber_g,
    sugarG: r.sugar_g,
    barcode: r.barcode,
    source: r.source,
  };
}

export function mapNutritionLog(r: Row<'nutrition_logs'>): NutritionLog {
  return {
    id: r.id,
    foodId: r.food_id,
    date: r.date,
    meal: r.meal,
    name: r.name,
    servings: r.servings,
    calories: r.calories,
    proteinG: r.protein_g,
    carbsG: r.carbs_g,
    fatG: r.fat_g,
  };
}

export function mapWeightEntry(r: Row<'weight_entries'>): WeightEntry {
  return {
    id: r.id,
    date: r.date,
    weightKg: r.weight_kg,
    bodyFatPct: r.body_fat_pct,
    notes: r.notes,
  };
}

export function mapProgressPhoto(r: Row<'progress_photos'>): ProgressPhoto {
  return {
    id: r.id,
    date: r.date,
    pose: r.pose,
    storagePath: r.storage_path,
    weightKg: r.weight_kg,
    notes: r.notes,
  };
}
