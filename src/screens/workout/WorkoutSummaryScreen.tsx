import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, LoadingState, StatCard, Text } from '@/components';
import { useWorkout } from '@/hooks';
import { formatDuration, formatVolume, pluralize } from '@/utils';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSummary'>;

export function WorkoutSummaryScreen({ route, navigation }: Props) {
  const { data: workout, isLoading } = useWorkout(route.params.workoutId);

  if (isLoading || !workout) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const completedSets = (workout.sets ?? []).filter((s) => s.completed && !s.isWarmup).length;
  const exerciseCount = new Set((workout.sets ?? []).map((s) => s.exerciseId)).size;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="items-center gap-2 py-8">
          <Text className="text-6xl">🎉</Text>
          <Text variant="title">Workout complete!</Text>
          <Text variant="caption">{workout.name}</Text>
        </View>

        <View className="flex-row gap-3">
          <StatCard
            label="Duration"
            value={formatDuration(workout.durationSeconds ?? 0)}
            icon="⏱"
            tone="primary"
          />
          <StatCard label="Volume" value={formatVolume(workout.totalVolume)} icon="🏋️" tone="accent" />
        </View>
        <View className="mt-3 flex-row gap-3">
          <StatCard label="Sets" value={`${completedSets}`} sublabel="completed" icon="✅" />
          <StatCard label="Exercises" value={`${exerciseCount}`} icon="📋" />
        </View>

        <Card className="mt-5 gap-1">
          <Text variant="label">Nice work</Text>
          <Text variant="body" className="text-text-muted">
            You logged {pluralize(completedSets, 'set')} across {pluralize(exerciseCount, 'exercise')}.
            Consistency is what builds the physique — keep stacking sessions.
          </Text>
        </Card>

        <Button title="Done" className="mt-6" onPress={() => navigation.popToTop()} />
        <Button
          title="View workout details"
          variant="ghost"
          onPress={() => navigation.replace('WorkoutDetail', { workoutId: workout.id })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
