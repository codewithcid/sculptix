/**
 * Rule-based nutrition target calculator (no external services).
 * Mifflin–St Jeor BMR → TDEE via an activity multiplier → goal-adjusted
 * calories → macro split. Protein is anchored per kg of bodyweight.
 */
import type { Gender, MacroTargets, PrimaryGoal } from '@/types';

export interface NutritionInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goal: PrimaryGoal;
  /** Training days per week, used to estimate activity. */
  daysPerWeek: number;
}

function activityMultiplier(daysPerWeek: number): number {
  if (daysPerWeek <= 2) return 1.375; // light
  if (daysPerWeek <= 4) return 1.55; // moderate
  if (daysPerWeek <= 5) return 1.65; // active
  return 1.725; // very active
}

/** Mifflin–St Jeor basal metabolic rate. */
export function calcBmr(i: NutritionInput): number {
  const s = i.gender === 'female' ? -161 : 5; // 'other' uses the male constant
  return 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + s;
}

export function calcTdee(i: NutritionInput): number {
  return Math.round(calcBmr(i) * activityMultiplier(i.daysPerWeek));
}

/** Calorie adjustment relative to TDEE for each goal. */
const GOAL_CALORIE_DELTA: Record<PrimaryGoal, number> = {
  build_muscle: +250, // lean surplus
  lose_fat: -500, // moderate deficit
  recomp: 0, // maintenance
  strength: +150, // slight surplus
};

/** Protein grams per kg bodyweight for each goal. */
const GOAL_PROTEIN_PER_KG: Record<PrimaryGoal, number> = {
  build_muscle: 2.0,
  lose_fat: 2.2, // higher to preserve muscle in a deficit
  recomp: 2.1,
  strength: 1.8,
};

export function calcMacroTargets(i: NutritionInput): MacroTargets & { tdee: number; bmr: number } {
  const bmr = Math.round(calcBmr(i));
  const tdee = calcTdee(i);
  const calories = Math.max(1200, tdee + GOAL_CALORIE_DELTA[i.goal]);

  const proteinG = Math.round(i.weightKg * GOAL_PROTEIN_PER_KG[i.goal]);
  const proteinKcal = proteinG * 4;

  // Fat ~25% of calories; remainder to carbs.
  const fatKcal = calories * 0.25;
  const fatG = Math.round(fatKcal / 9);
  const carbsKcal = Math.max(0, calories - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);

  return {
    calories: Math.round(calories),
    proteinG,
    carbsG,
    fatG,
    tdee,
    bmr,
  };
}
