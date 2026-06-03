import {
  computeWeeklyStreak,
  computeWeightTrend,
  computeWorkoutStats,
  daysAgoIso,
  todayIso,
  volumeByDay,
} from '@/utils';
import type { WeightEntry, Workout } from '@/types';

function workout(date: string, volume = 1000, status: Workout['status'] = 'completed'): Workout {
  return {
    id: `w-${date}-${Math.random()}`,
    userId: 'u',
    programId: null,
    programDayId: null,
    name: 'Test',
    date,
    status,
    durationSeconds: 3600,
    totalVolume: volume,
    notes: null,
    startedAt: null,
    completedAt: null,
    createdAt: date,
  };
}

function weight(date: string, kg: number): WeightEntry {
  return { id: `e-${date}`, date, weightKg: kg, bodyFatPct: null, notes: null };
}

describe('computeWorkoutStats', () => {
  it('counts completed workouts in each window', () => {
    const data = [
      workout(todayIso(), 1000),
      workout(daysAgoIso(3), 2000),
      workout(daysAgoIso(20), 1500),
      workout(todayIso(), 500, 'pending'), // excluded
    ];
    const stats = computeWorkoutStats(data);
    expect(stats.totalWorkouts).toBe(3);
    expect(stats.workoutsLast7).toBe(2);
    expect(stats.workoutsLast30).toBe(3);
    expect(stats.volumeLast7).toBe(3000);
  });
});

describe('computeWeeklyStreak', () => {
  it('is at least 1 when there is a workout this week', () => {
    expect(computeWeeklyStreak([workout(todayIso())])).toBeGreaterThanOrEqual(1);
  });
  it('is 0 with no completed workouts', () => {
    expect(computeWeeklyStreak([])).toBe(0);
  });
});

describe('computeWeightTrend', () => {
  it('reports the latest weight and a 7-day change', () => {
    const trend = computeWeightTrend([weight(daysAgoIso(8), 82), weight(todayIso(), 80)]);
    expect(trend.latest).toBe(80);
    expect(trend.change7).toBe(-2);
    expect(trend.series).toHaveLength(2);
  });
  it('handles empty input', () => {
    const trend = computeWeightTrend([]);
    expect(trend.latest).toBeNull();
  });
});

describe('volumeByDay', () => {
  it('returns a series of the requested length', () => {
    expect(volumeByDay([workout(todayIso(), 1000)], 7)).toHaveLength(7);
  });
});
