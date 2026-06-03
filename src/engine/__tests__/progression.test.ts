import { estimateOneRepMax, recommendSplit, suggestNextWeight } from '@/engine';
import { getSplit } from '@/data';

describe('estimateOneRepMax (Epley)', () => {
  it('returns the weight itself for a single rep', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });
  it('estimates higher for more reps', () => {
    expect(estimateOneRepMax(60, 10)).toBeCloseTo(80, 1);
  });
  it('returns 0 for zero reps', () => {
    expect(estimateOneRepMax(100, 0)).toBe(0);
  });
});

describe('suggestNextWeight (double progression)', () => {
  it('adds load when the top of the range is hit', () => {
    const next = suggestNextWeight(50, 12, [8, 12], 'intermediate');
    expect(next.weightKg).toBeGreaterThan(50);
  });
  it('backs off below the bottom of the range', () => {
    const next = suggestNextWeight(50, 5, [8, 12], 'intermediate');
    expect(next.weightKg).toBeLessThan(50);
  });
  it('holds steady within the range', () => {
    const next = suggestNextWeight(50, 10, [8, 12], 'intermediate');
    expect(next.weightKg).toBe(50);
  });
});

describe('recommendSplit', () => {
  it('only recommends a split that supports the requested frequency', () => {
    for (const days of [3, 4, 5, 6]) {
      const rec = recommendSplit({
        daysPerWeek: days,
        sessionDurationMin: 60,
        experience: 'intermediate',
        physiqueGoalId: 'athletic',
      });
      expect(rec.splitType).not.toBe('custom');
      expect(getSplit(rec.splitType).supportedDays).toContain(days);
    }
  });
});
