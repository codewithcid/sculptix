/**
 * Domain models. These are the camelCase shapes the app works with; the
 * service layer (src/services) maps to/from the snake_case database rows.
 */
import type {
  Difficulty,
  EquipmentAccess,
  ExperienceLevel,
  Gender,
  MealType,
  MuscleGroup,
  PhotoPose,
  PrimaryGoal,
  SplitType,
  UnitSystem,
  WorkoutStatus,
} from './enums';

// ── Exercise database ──────────────────────────────────────────────────────
export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentAccess[]; // equipment tiers this exercise is valid for
  difficulty: Difficulty;
  /** 'compound' exercises are prioritised earlier in a session. */
  pattern: 'compound' | 'isolation';
  description: string;
  instructions: string[];
  commonMistakes: string[];
  alternativeIds: string[];
  gifUrl?: string;
  videoUrl?: string;
  /** Default rep target if the engine doesn't override (UI fallback). */
  isUnilateral?: boolean;
}

// ── Physique goals ─────────────────────────────────────────────────────────
export interface PhysiqueGoal {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Muscles to emphasise, in descending priority. */
  priorityMuscles: MuscleGroup[];
  /** Muscles intentionally trained with lower volume. */
  deprioritizedMuscles: MuscleGroup[];
  /** Relative weekly volume guidance (working sets per muscle / week). */
  recommendedWeeklyVolume: 'low' | 'moderate' | 'high';
  recommendedSplits: SplitType[];
  /** Default rep-range emphasis for this look. */
  repFocus: 'strength' | 'hypertrophy' | 'metabolic' | 'mixed';
  imageKey?: string;
}

// ── Workout split definition ───────────────────────────────────────────────
export interface SplitDayTemplate {
  name: string; // "Push", "Upper", "Legs A"
  focus: string; // human label
  muscles: MuscleGroup[]; // muscles trained this day
}

export interface SplitDefinition {
  type: SplitType;
  name: string;
  description: string;
  /** Supported training frequencies (days/week). */
  supportedDays: number[];
  /** Best-fit experience levels. */
  bestFor: ExperienceLevel[];
  /** Day rotation for a given frequency, keyed by days/week. */
  weeklyLayout: Record<number, SplitDayTemplate[]>;
}

// ── User profile ───────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  age: number | null;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  experience: ExperienceLevel | null;
  equipment: EquipmentAccess | null;
  daysPerWeek: number | null;
  sessionDurationMin: number | null;
  primaryGoal: PrimaryGoal | null;
  physiqueGoalId: string | null;
  splitType: SplitType | null;
  unitSystem: UnitSystem;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Generated program ──────────────────────────────────────────────────────
/** A single prescribed exercise slot inside a program day. */
export interface ProgrammedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  /** Inclusive rep range, e.g. [8, 12]. */
  repRange: [number, number];
  restSeconds: number;
  /** Notes such as "last set to failure" or "tempo 3-1-1". */
  note?: string;
}

export interface ProgramDay {
  id?: string;
  dayIndex: number;
  name: string;
  focus: string;
  exercises: ProgrammedExercise[];
}

export interface WorkoutProgram {
  id: string;
  userId: string;
  name: string;
  splitType: SplitType;
  physiqueGoalId: string | null;
  daysPerWeek: number;
  sessionDurationMin: number;
  experience: ExperienceLevel;
  equipment: EquipmentAccess;
  primaryGoal: PrimaryGoal;
  isActive: boolean;
  days: ProgramDay[];
  /** Free-form progression strategy text shown to the user. */
  progressionStrategy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Logged workouts ────────────────────────────────────────────────────────
export interface SetLog {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  targetReps: number | null;
  reps: number | null;
  weightKg: number | null;
  rpe: number | null;
  isWarmup: boolean;
  completed: boolean;
  restSeconds: number | null;
}

export interface Workout {
  id: string;
  userId: string;
  programId: string | null;
  programDayId: string | null;
  name: string;
  date: string; // ISO date
  status: WorkoutStatus;
  durationSeconds: number | null;
  totalVolume: number;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  sets?: SetLog[];
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  recordType: 'est_1rm' | 'max_weight' | 'max_reps' | 'max_volume';
  value: number;
  unit: string;
  achievedAt: string;
}

// ── Nutrition ──────────────────────────────────────────────────────────────
export interface Food {
  id: string;
  userId: string | null;
  name: string;
  brand: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  sugarG: number | null;
  barcode: string | null;
  source: 'custom' | 'seed' | 'usda';
}

export interface NutritionLog {
  id: string;
  foodId: string | null;
  date: string;
  meal: MealType;
  name: string;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DailyNutritionTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MacroTargets extends DailyNutritionTotals {}

// ── Body metrics & photos ──────────────────────────────────────────────────
export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct: number | null;
  notes: string | null;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  pose: PhotoPose;
  storagePath: string;
  weightKg: number | null;
  notes: string | null;
  /** Populated client-side with a signed URL for display. */
  signedUrl?: string;
}

// ── Settings ───────────────────────────────────────────────────────────────
export interface UserSettings {
  theme: 'system' | 'light' | 'dark';
  unitSystem: UnitSystem;
  restTimerDefaultSeconds: number;
  notificationsEnabled: boolean;
}
