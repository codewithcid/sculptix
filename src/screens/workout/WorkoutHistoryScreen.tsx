import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  Text,
} from '@/components';
import { usePersonalRecords, useWorkoutHistory } from '@/hooks';
import { formatDate, formatDuration, formatVolume } from '@/utils';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutHistory'>;

export function WorkoutHistoryScreen({ navigation }: Props) {
  const { data: workouts, isLoading } = useWorkoutHistory(100);
  const { data: prs } = usePersonalRecords();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const completed = (workouts ?? []).filter((w) => w.status === 'completed');
  const topPrs = (prs ?? []).filter((p) => p.recordType === 'est_1rm').slice(0, 5);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Text variant="title" className="py-4">
          History
        </Text>

        {topPrs.length ? (
          <Card className="mb-5 gap-3">
            <Text variant="label">Personal records · est. 1RM</Text>
            {topPrs.map((pr) => (
              <View key={pr.id} className="flex-row items-center justify-between">
                <Text className="flex-1 text-text" numberOfLines={1}>
                  {pr.exerciseName}
                </Text>
                <Badge label={`${Math.round(pr.value)} kg`} tone="success" />
              </View>
            ))}
          </Card>
        ) : null}

        {completed.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No workouts yet"
            description="Your completed workouts will appear here."
          />
        ) : (
          <View className="gap-3">
            {completed.map((w) => (
              <Card
                key={w.id}
                elevated
                onPress={() => navigation.navigate('WorkoutDetail', { workoutId: w.id })}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text variant="subheading">{w.name}</Text>
                    <Text variant="caption">{formatDate(w.date)}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-primary">{formatVolume(w.totalVolume)}</Text>
                    <Text variant="caption">{formatDuration(w.durationSeconds ?? 0)}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
