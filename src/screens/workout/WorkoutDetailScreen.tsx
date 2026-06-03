import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, LoadingState, StatCard, Text } from '@/components';
import { useWorkout } from '@/hooks';
import type { SetLog } from '@/types';
import { formatDate, formatDuration, formatVolume } from '@/utils';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutDetail'>;

export function WorkoutDetailScreen({ route }: Props) {
  const { data: workout, isLoading } = useWorkout(route.params.workoutId);

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; sets: SetLog[] }>();
    for (const s of workout?.sets ?? []) {
      const entry = map.get(s.exerciseId) ?? { name: s.exerciseName, sets: [] };
      entry.sets.push(s);
      map.set(s.exerciseId, entry);
    }
    return Array.from(map.values());
  }, [workout?.sets]);

  if (isLoading || !workout) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text variant="title">{workout.name}</Text>
          <Text variant="caption">{formatDate(workout.date)}</Text>
        </View>

        <View className="flex-row gap-3">
          <StatCard label="Volume" value={formatVolume(workout.totalVolume)} tone="primary" />
          <StatCard label="Duration" value={formatDuration(workout.durationSeconds ?? 0)} />
        </View>

        <View className="mt-5 gap-3">
          {grouped.map((g, i) => (
            <Card key={i} elevated className="gap-2">
              <Text variant="subheading">{g.name}</Text>
              {g.sets.map((s) => (
                <View key={s.id} className="flex-row items-center justify-between">
                  <Text variant="caption">Set {s.setIndex + 1}</Text>
                  <Text className="text-text">
                    {s.weightKg ?? 0} kg × {s.reps ?? 0}
                  </Text>
                </View>
              ))}
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
