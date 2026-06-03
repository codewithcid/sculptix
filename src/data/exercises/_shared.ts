/**
 * Shared helpers for the exercise database.
 *
 * `equipment` on an Exercise lists every equipment TIER the movement can be
 * performed with. The engine keeps an exercise if the user's tier is in the
 * list. Bodyweight moves are valid everywhere; machine/cable moves require a
 * full gym.
 */
import type { EquipmentAccess } from '@/types';

/** Doable with literally anything (pure bodyweight). */
export const ANY: EquipmentAccess[] = ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight_only'];
/** Needs at least a pair of dumbbells. */
export const DB_PLUS: EquipmentAccess[] = ['full_gym', 'home_gym', 'dumbbells_only'];
/** Needs a barbell / rack (assumed present in home + full gyms). */
export const BARBELL: EquipmentAccess[] = ['full_gym', 'home_gym'];
/** Needs cables / machines (full gym only). */
export const GYM_ONLY: EquipmentAccess[] = ['full_gym'];
