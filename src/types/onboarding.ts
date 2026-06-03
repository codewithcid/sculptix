/**
 * The in-progress onboarding answers held in the onboarding Zustand store.
 * Every field is optional until the user has progressed far enough to set it.
 */
import type {
  EquipmentAccess,
  ExperienceLevel,
  Gender,
  PrimaryGoal,
  SplitType,
} from './enums';

export interface OnboardingDraft {
  name?: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  experience?: ExperienceLevel;
  equipment?: EquipmentAccess;
  daysPerWeek?: number;
  sessionDurationMin?: number;
  primaryGoal?: PrimaryGoal;
  physiqueGoalId?: string;
  /** Undefined means "let the app recommend a split". */
  splitType?: SplitType;
}

/** Inputs the workout engine needs to generate a program. */
export interface ProgramGenerationInput {
  physiqueGoalId: string;
  splitType: SplitType;
  daysPerWeek: number;
  sessionDurationMin: number;
  experience: ExperienceLevel;
  equipment: EquipmentAccess;
  primaryGoal: PrimaryGoal;
}
