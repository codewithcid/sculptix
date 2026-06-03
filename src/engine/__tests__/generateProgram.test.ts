import { EXERCISES_BY_ID } from '@/data';
import { generateProgram } from '@/engine';
import type { ProgramGenerationInput } from '@/types';

const base: ProgramGenerationInput = {
  physiqueGoalId: 'v_taper',
  splitType: 'ppl',
  daysPerWeek: 4,
  sessionDurationMin: 60,
  experience: 'intermediate',
  equipment: 'full_gym',
  primaryGoal: 'build_muscle',
};

describe('generateProgram', () => {
  it('is deterministic for the same inputs', () => {
    const a = generateProgram(base);
    const b = generateProgram(base);
    // Timestamps differ, but the prescribed program must be identical.
    expect(JSON.stringify(a.days)).toEqual(JSON.stringify(b.days));
    expect(a.splitType).toBe(b.splitType);
  });

  it('produces one day per training day', () => {
    expect(generateProgram({ ...base, daysPerWeek: 4 }).days).toHaveLength(4);
    expect(
      generateProgram({ ...base, splitType: 'full_body', daysPerWeek: 3 }).days,
    ).toHaveLength(3);
  });

  it('scales exercises-per-session with session duration', () => {
    const short = generateProgram({ ...base, sessionDurationMin: 30 });
    const long = generateProgram({ ...base, sessionDurationMin: 90 });
    const avg = (p: ReturnType<typeof generateProgram>) =>
      p.days.reduce((s, d) => s + d.exercises.length, 0) / p.days.length;
    expect(avg(long)).toBeGreaterThan(avg(short));
  });

  it('keeps every day within a sensible exercise count', () => {
    for (const day of generateProgram(base).days) {
      expect(day.exercises.length).toBeGreaterThanOrEqual(3);
      expect(day.exercises.length).toBeLessThanOrEqual(8);
    }
  });

  it('only prescribes exercises valid for the chosen equipment', () => {
    const program = generateProgram({ ...base, equipment: 'bodyweight_only' });
    for (const day of program.days) {
      for (const ex of day.exercises) {
        const def = EXERCISES_BY_ID[ex.exerciseId];
        expect(def).toBeDefined();
        expect(def!.equipment).toContain('bodyweight_only');
      }
      // Bodyweight days still program at least one movement.
      expect(day.exercises.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('emphasises the physique goal’s priority muscles', () => {
    const program = generateProgram(base); // v_taper → lats, side_delts, ...
    const muscles = new Set(
      program.days.flatMap((d) =>
        d.exercises.map((e) => EXERCISES_BY_ID[e.exerciseId]?.primaryMuscle),
      ),
    );
    expect(muscles.has('lats')).toBe(true);
  });

  it('uses low rep ranges for a strength goal', () => {
    const program = generateProgram({ ...base, primaryGoal: 'strength' });
    const hasHeavyCompound = program.days.some((d) =>
      d.exercises.some((e) => e.repRange[1] <= 6),
    );
    expect(hasHeavyCompound).toBe(true);
  });

  it('never prescribes fewer than 2 sets', () => {
    for (const day of generateProgram({ ...base, experience: 'beginner' }).days) {
      for (const ex of day.exercises) expect(ex.sets).toBeGreaterThanOrEqual(2);
    }
  });

  it('names the program after the physique and split', () => {
    expect(generateProgram(base).name).toContain('V-Taper');
    expect(generateProgram(base).name).toContain('Push');
  });
});
