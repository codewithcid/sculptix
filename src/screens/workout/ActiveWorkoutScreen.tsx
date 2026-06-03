import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Badge,
  Button,
  Card,
  ExercisePlayer,
  LoadingState,
  ProgressBar,
  RestTimer,
  Text,
} from '@/components';
import { getExercise } from '@/data';
import { useActiveProgram, useFinishWorkout, useStartWorkout } from '@/hooks';
import {
  sessionProgress,
  sessionToSetInputs,
  useWorkoutSessionStore,
} from '@/store';
import { usePalette } from '@/theme';
import { formatDuration, formatReps } from '@/utils';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'ActiveWorkout'>;

export function ActiveWorkoutScreen({ route, navigation }: Props) {
  const { programDayIndex } = route.params;
  const palette = usePalette();
  const { data: program } = useActiveProgram();
  const day = program?.days[programDayIndex];

  const session = useWorkoutSessionStore((s) => s.session);
  const startFromProgramDay = useWorkoutSessionStore((s) => s.startFromProgramDay);
  const setWorkoutId = useWorkoutSessionStore((s) => s.setWorkoutId);
  const updateSet = useWorkoutSessionStore((s) => s.updateSet);
  const toggleSetComplete = useWorkoutSessionStore((s) => s.toggleSetComplete);
  const addSet = useWorkoutSessionStore((s) => s.addSet);
  const removeSet = useWorkoutSessionStore((s) => s.removeSet);
  const skipExercise = useWorkoutSessionStore((s) => s.skipExercise);
  const goToNext = useWorkoutSessionStore((s) => s.goToNext);
  const goToPrev = useWorkoutSessionStore((s) => s.goToPrev);
  const clear = useWorkoutSessionStore((s) => s.clear);

  const startWorkout = useStartWorkout();
  const finishWorkout = useFinishWorkout();

  const [elapsed, setElapsed] = useState(0);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Initialise a session from the program day if needed.
  useEffect(() => {
    if (!day) return;
    if (!session || session.programDayId !== day.id) {
      startFromProgramDay(day, { programId: program?.id ?? null, programDayId: day.id ?? null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.id]);

  // Create the DB workout row once we have a session without an id.
  useEffect(() => {
    if (session && !session.workoutId && day && !startWorkout.isPending) {
      startWorkout
        .mutateAsync({
          name: day.name,
          programId: program?.id ?? null,
          programDayId: day.id ?? null,
        })
        .then((w) => setWorkoutId(w.id))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.workoutId, day?.id]);

  // Tick the elapsed timer.
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - session.startedAtMs) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [session?.startedAtMs]);

  if (!day || !session) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState label="Setting up your workout…" />
      </SafeAreaView>
    );
  }

  const exIndex = session.currentIndex;
  const sessionExercise = session.exercises[exIndex];
  const exercise = sessionExercise ? getExercise(sessionExercise.exerciseId) : undefined;
  const progress = sessionProgress(session);
  const isLastExercise = exIndex >= session.exercises.length - 1;

  const onToggleSet = (setIdx: number) => {
    const wasComplete = sessionExercise?.sets[setIdx]?.completed;
    toggleSetComplete(exIndex, setIdx);
    if (!wasComplete && sessionExercise) {
      setRestSeconds(sessionExercise.restSeconds);
    }
  };

  const onFinish = async () => {
    if (!session.workoutId) {
      // Workout row not created (offline / error). Just clear locally.
      clear();
      navigation.popToTop();
      return;
    }
    setFinishing(true);
    try {
      await finishWorkout.mutateAsync({
        workoutId: session.workoutId,
        sets: sessionToSetInputs(session),
        durationSeconds: elapsed,
      });
      const workoutId = session.workoutId;
      clear();
      navigation.replace('WorkoutSummary', { workoutId });
    } catch {
      setFinishing(false);
    }
  };

  if (!sessionExercise || !exercise) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      {/* Header */}
      <View className="gap-2 px-5 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()} className="active:opacity-60">
            <Text className="text-primary">‹ Back</Text>
          </Pressable>
          <Badge label={`⏱ ${formatDuration(elapsed)}`} tone="primary" />
          <Text variant="caption">
            {exIndex + 1}/{session.exercises.length}
          </Text>
        </View>
        <ProgressBar progress={progress.total ? progress.done / progress.total : 0} />
        <Text variant="caption">
          {progress.done} of {progress.total} sets done
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-6" showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise.id })}
        >
          <ExercisePlayer exercise={exercise} height={200} />
        </Pressable>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-1">
            <Text variant="heading">{exercise.name}</Text>
            <Text variant="caption">
              {sessionExercise.sets.length} sets · {formatReps(sessionExercise.repRange)} reps ·{' '}
              {sessionExercise.restSeconds}s rest
            </Text>
          </View>
        </View>

        {sessionExercise.note ? (
          <Card className="mt-3">
            <Text variant="caption">💡 {sessionExercise.note}</Text>
          </Card>
        ) : null}

        {/* Sets table */}
        <View className="mt-4 gap-2">
          <View className="flex-row px-2">
            <Text variant="label" className="w-10">
              Set
            </Text>
            <Text variant="label" className="flex-1 text-center">
              kg
            </Text>
            <Text variant="label" className="flex-1 text-center">
              Reps
            </Text>
            <Text variant="label" className="w-12 text-center">
              ✓
            </Text>
          </View>

          {sessionExercise.sets.map((st, setIdx) => (
            <View
              key={setIdx}
              className={`flex-row items-center rounded-2xl border p-2 ${
                st.completed ? 'border-success/40 bg-success/10' : 'border-border bg-surface'
              }`}
            >
              <Pressable
                onLongPress={() => removeSet(exIndex, setIdx)}
                className="w-10 items-center"
              >
                <Text className="font-bold text-text">{setIdx + 1}</Text>
              </Pressable>
              <View className="flex-1 px-1">
                <TextInput
                  keyboardType="decimal-pad"
                  value={st.weightKg != null ? String(st.weightKg) : ''}
                  onChangeText={(t) =>
                    updateSet(exIndex, setIdx, { weightKg: t ? parseFloat(t) : null })
                  }
                  placeholder="—"
                  placeholderTextColor={palette.textMuted}
                  className="h-10 rounded-xl bg-surface-elevated text-center text-base text-text"
                />
              </View>
              <View className="flex-1 px-1">
                <TextInput
                  keyboardType="number-pad"
                  value={st.reps != null ? String(st.reps) : ''}
                  onChangeText={(t) =>
                    updateSet(exIndex, setIdx, { reps: t ? parseInt(t, 10) : null })
                  }
                  placeholder={st.targetReps ? String(st.targetReps) : '—'}
                  placeholderTextColor={palette.textMuted}
                  className="h-10 rounded-xl bg-surface-elevated text-center text-base text-text"
                />
              </View>
              <Pressable onPress={() => onToggleSet(setIdx)} className="w-12 items-center">
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full border-2 ${
                    st.completed ? 'border-success bg-success' : 'border-border'
                  }`}
                >
                  {st.completed ? <Text className="text-white">✓</Text> : null}
                </View>
              </Pressable>
            </View>
          ))}

          <View className="flex-row gap-2">
            <Button
              title="+ Add set"
              variant="secondary"
              fullWidth={false}
              className="flex-1"
              onPress={() => addSet(exIndex)}
            />
            <Button
              title="Skip exercise"
              variant="ghost"
              fullWidth={false}
              className="flex-1"
              onPress={() => skipExercise(exIndex)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View className="flex-row gap-3 border-t border-border px-5 pb-1 pt-3">
        <Button
          title="Previous"
          variant="secondary"
          fullWidth={false}
          className="flex-1"
          disabled={exIndex === 0}
          onPress={goToPrev}
        />
        {isLastExercise ? (
          <Button
            title="Finish"
            className="flex-1"
            loading={finishing}
            onPress={onFinish}
          />
        ) : (
          <Button title="Next" className="flex-1" onPress={goToNext} />
        )}
      </View>

      {/* Rest timer overlay */}
      <Modal visible={restSeconds != null} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/70 px-6">
          {restSeconds != null ? (
            <View className="w-full items-center rounded-3xl bg-surface p-6">
              <RestTimer
                seconds={restSeconds}
                onComplete={() => setRestSeconds(null)}
                onDismiss={() => setRestSeconds(null)}
              />
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
