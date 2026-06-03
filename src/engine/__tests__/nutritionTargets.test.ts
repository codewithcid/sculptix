import { calcMacroTargets, type NutritionInput } from '@/engine';

const base: NutritionInput = {
  weightKg: 80,
  heightCm: 180,
  age: 28,
  gender: 'male',
  goal: 'recomp',
  daysPerWeek: 4,
};

describe('calcMacroTargets', () => {
  it('puts a fat-loss goal in a deficit and bulking in a surplus', () => {
    const cut = calcMacroTargets({ ...base, goal: 'lose_fat' });
    const bulk = calcMacroTargets({ ...base, goal: 'build_muscle' });
    expect(cut.calories).toBeLessThan(cut.tdee);
    expect(bulk.calories).toBeGreaterThan(bulk.tdee);
  });

  it('scales protein with bodyweight and goal', () => {
    const cut = calcMacroTargets({ ...base, goal: 'lose_fat' });
    expect(cut.proteinG).toBe(Math.round(base.weightKg * 2.2));
  });

  it('keeps macro calories roughly equal to the calorie target', () => {
    const t = calcMacroTargets(base);
    const fromMacros = t.proteinG * 4 + t.carbsG * 4 + t.fatG * 9;
    expect(Math.abs(fromMacros - t.calories)).toBeLessThan(60);
  });

  it('never drops below a 1200 kcal floor', () => {
    const tiny = calcMacroTargets({ ...base, weightKg: 40, heightCm: 150, goal: 'lose_fat' });
    expect(tiny.calories).toBeGreaterThanOrEqual(1200);
  });
});
