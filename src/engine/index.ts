/**
 * Workout & nutrition engine — the rule-based brain of the app. Pure functions,
 * no network/AI. This barrel is the single import surface for the engine.
 *
 * Extension point: future "AI Adaptive Programming" can implement the same
 * `generateProgram(input) => WorkoutProgram` contract and be swapped in behind
 * a feature flag without touching callers. See docs/ARCHITECTURE.md.
 */
export { generateProgram } from './generateProgram';
export { recommendSplit, type SplitRecommendation } from './recommendSplit';
export {
  buildProgressionStrategy,
  estimateOneRepMax,
  suggestNextWeight,
} from './progression';
export {
  calcBmr,
  calcTdee,
  calcMacroTargets,
  type NutritionInput,
} from './nutritionTargets';
export { exerciseCountForDuration, resolveRepFocus, REP_SCHEMES } from './constants';
