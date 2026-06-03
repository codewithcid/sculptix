/** Unit conversion + display helpers. Internally everything is metric (kg/cm). */
import type { UnitSystem } from '@/types';

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const cmToIn = (cm: number) => cm / CM_PER_IN;
export const inToCm = (inch: number) => inch * CM_PER_IN;

export function displayWeight(kg: number | null | undefined, unit: UnitSystem, digits = 1): string {
  if (kg == null) return '—';
  if (unit === 'imperial') return `${kgToLb(kg).toFixed(digits)} lb`;
  return `${kg.toFixed(digits)} kg`;
}

export function weightUnitLabel(unit: UnitSystem): string {
  return unit === 'imperial' ? 'lb' : 'kg';
}

/** Convert a user-entered weight (in their unit) to the kg we store. */
export function toStoredKg(value: number, unit: UnitSystem): number {
  return unit === 'imperial' ? lbToKg(value) : value;
}

/** Convert stored kg to the user's unit for editing. */
export function fromStoredKg(kg: number, unit: UnitSystem): number {
  return unit === 'imperial' ? kgToLb(kg) : kg;
}

export function displayHeight(cm: number | null | undefined, unit: UnitSystem): string {
  if (cm == null) return '—';
  if (unit === 'imperial') {
    const totalIn = cmToIn(cm);
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn - ft * 12);
    return `${ft}'${inch}"`;
  }
  return `${Math.round(cm)} cm`;
}
