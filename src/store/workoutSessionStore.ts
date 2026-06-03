/**
 * Live workout session state — the engine behind Workout Session Mode.
 *
 * Persisted so an interrupted session (app killed mid-workout) can resume.
 * Builds from a ProgramDay, tracks each set's reps/weight/completion, exposes
 * the current exercise pointer, and produces SetInput[] for finishWorkout().
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ProgramDay } from '@/types';
import type { SetInput } from '@/services/workouts';

export interface SessionSet {
  setIndex: number;
  targetReps: number | null;
  reps: number | null;
  weightKg: number | null;
  isWarmup: boolean;
  completed: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  repRange: [number, number];
  restSeconds: number;
  note?: string;
  sets: SessionSet[];
}

export interface ActiveSession {
  workoutId: string | null;
  name: string;
  programId: string | null;
  programDayId: string | null;
  startedAtMs: number;
  currentIndex: number;
  exercises: SessionExercise[];
}

interface SessionState {
  session: ActiveSession | null;
  startFromProgramDay: (
    day: ProgramDay,
    meta: { programId?: string | null; programDayId?: string | null },
  ) => void;
  setWorkoutId: (id: string) => void;
  setCurrentIndex: (i: number) => void;
  goToNext: () => void;
  goToPrev: () => void;
  updateSet: (exIdx: number, setIdx: number, patch: Partial<SessionSet>) => void;
  toggleSetComplete: (exIdx: number, setIdx: number) => void;
  addSet: (exIdx: number) => void;
  removeSet: (exIdx: number, setIdx: number) => void;
  skipExercise: (exIdx: number) => void;
  clear: () => void;
}

function midReps(range: [number, number]): number {
  return Math.round((range[0] + range[1]) / 2);
}

export const useWorkoutSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      session: null,

      startFromProgramDay: (day, meta) => {
        const exercises: SessionExercise[] = day.exercises.map((pe) => ({
          exerciseId: pe.exerciseId,
          exerciseName: pe.exerciseName,
          repRange: pe.repRange,
          restSeconds: pe.restSeconds,
          note: pe.note,
          sets: Array.from({ length: pe.sets }, (_, i) => ({
            setIndex: i,
            targetReps: midReps(pe.repRange),
            reps: null,
            weightKg: null,
            isWarmup: false,
            completed: false,
          })),
        }));
        set({
          session: {
            workoutId: null,
            name: day.name,
            programId: meta.programId ?? null,
            programDayId: meta.programDayId ?? null,
            startedAtMs: Date.now(),
            currentIndex: 0,
            exercises,
          },
        });
      },

      setWorkoutId: (id) =>
        set((s) => (s.session ? { session: { ...s.session, workoutId: id } } : s)),

      setCurrentIndex: (i) =>
        set((s) => (s.session ? { session: { ...s.session, currentIndex: i } } : s)),

      goToNext: () =>
        set((s) => {
          if (!s.session) return s;
          const max = s.session.exercises.length - 1;
          return { session: { ...s.session, currentIndex: Math.min(max, s.session.currentIndex + 1) } };
        }),

      goToPrev: () =>
        set((s) => {
          if (!s.session) return s;
          return { session: { ...s.session, currentIndex: Math.max(0, s.session.currentIndex - 1) } };
        }),

      updateSet: (exIdx, setIdx, patch) =>
        set((s) => mutateSet(s, exIdx, setIdx, (st) => ({ ...st, ...patch }))),

      toggleSetComplete: (exIdx, setIdx) =>
        set((s) => mutateSet(s, exIdx, setIdx, (st) => ({ ...st, completed: !st.completed }))),

      addSet: (exIdx) =>
        set((s) => {
          if (!s.session) return s;
          const exercises = s.session.exercises.map((ex, i) => {
            if (i !== exIdx) return ex;
            const last = ex.sets[ex.sets.length - 1];
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  setIndex: ex.sets.length,
                  targetReps: last?.targetReps ?? midReps(ex.repRange),
                  reps: null,
                  weightKg: last?.weightKg ?? null,
                  isWarmup: false,
                  completed: false,
                },
              ],
            };
          });
          return { session: { ...s.session, exercises } };
        }),

      removeSet: (exIdx, setIdx) =>
        set((s) => {
          if (!s.session) return s;
          const exercises = s.session.exercises.map((ex, i) => {
            if (i !== exIdx) return ex;
            const sets = ex.sets
              .filter((_, j) => j !== setIdx)
              .map((st, j) => ({ ...st, setIndex: j }));
            return { ...ex, sets };
          });
          return { session: { ...s.session, exercises } };
        }),

      skipExercise: (exIdx) =>
        set((s) => {
          if (!s.session) return s;
          const exercises = s.session.exercises.map((ex, i) =>
            i === exIdx ? { ...ex, sets: ex.sets.map((st) => ({ ...st, completed: false })) } : ex,
          );
          const max = exercises.length - 1;
          return {
            session: {
              ...s.session,
              exercises,
              currentIndex: Math.min(max, exIdx + 1),
            },
          };
        }),

      clear: () => set({ session: null }),
    }),
    {
      name: 'active-workout-session',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

function mutateSet(
  s: SessionState,
  exIdx: number,
  setIdx: number,
  fn: (st: SessionSet) => SessionSet,
): Partial<SessionState> {
  if (!s.session) return s;
  const exercises = s.session.exercises.map((ex, i) => {
    if (i !== exIdx) return ex;
    return { ...ex, sets: ex.sets.map((st, j) => (j === setIdx ? fn(st) : st)) };
  });
  return { session: { ...s.session, exercises } };
}

// ── Selectors / derivations ────────────────────────────────────────────────

/** Flatten the session into SetInput[] for persistence. */
export function sessionToSetInputs(session: ActiveSession): SetInput[] {
  const out: SetInput[] = [];
  for (const ex of session.exercises) {
    for (const st of ex.sets) {
      out.push({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        setIndex: st.setIndex,
        targetReps: st.targetReps,
        reps: st.reps,
        weightKg: st.weightKg,
        isWarmup: st.isWarmup,
        completed: st.completed,
        restSeconds: ex.restSeconds,
      });
    }
  }
  return out;
}

export function sessionProgress(session: ActiveSession): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const ex of session.exercises) {
    for (const st of ex.sets) {
      total++;
      if (st.completed) done++;
    }
  }
  return { done, total };
}

export function sessionVolume(session: ActiveSession): number {
  let v = 0;
  for (const ex of session.exercises) {
    for (const st of ex.sets) {
      if (st.completed && !st.isWarmup) v += (st.weightKg ?? 0) * (st.reps ?? 0);
    }
  }
  return v;
}
