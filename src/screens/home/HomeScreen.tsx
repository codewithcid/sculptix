import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  LoadingState,
  StatCard,
  Text,
} from '@/components';
import { getPhysiqueGoal } from '@/data';
import { useActiveProgram, useAnalytics, useProfile, useWorkoutHistory } from '@/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatVolume, pluralize } from '@/utils';

/** Pick the next program day to train: rotate by completed workout count. */
function useTodaysDayIndex(daysLength: number) {
  const { data: history } = useWorkoutHistory(200);
  return useMemo(() => {
    if (!daysLength) return 0;
    const completed = (history ?? []).filter((w) => w.status === 'completed').length;
    return completed % daysLength;
  }, [history, daysLength]);
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: profile } = useProfile();
  const { data: program, isLoading, refetch, isRefetching } = useActiveProgram();
  const { workoutStats } = useAnalytics();

  const todayIndex = useTodaysDayIndex(program?.days.length ?? 0);
  const todayDay = program?.days[todayIndex];
  const physique = getPhysiqueGoal(profile?.physiqueGoalId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState label="Loading your plan…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View className="flex-row items-center justify-between py-4">
          <View>
            <Text variant="caption">Welcome back</Text>
            <Text variant="title">{profile?.name ?? 'Athlete'} 👋</Text>
          </View>
          {physique ? <Badge label={physique.name} tone="primary" /> : null}
        </View>

        {/* Today's workout */}
        {todayDay ? (
          <Card elevated className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="label">Today's workout</Text>
              <Badge label={`${todayDay.exercises.length} exercises`} tone="neutral" />
            </View>
            <Text variant="heading">{todayDay.name}</Text>
            <Text variant="caption">{todayDay.focus}</Text>
            <Button
              title="Start workout"
              className="mt-1"
              onPress={() =>
                navigation.navigate('WorkoutTab', {
                  screen: 'ActiveWorkout',
                  params: { programDayIndex: todayIndex },
                })
              }
            />
            <Button
              title="View full program"
              variant="ghost"
              onPress={() => navigation.navigate('WorkoutTab', { screen: 'Program' })}
            />
          </Card>
        ) : (
          <Card elevated className="gap-3">
            <Text variant="heading">No active program</Text>
            <Text variant="caption">Generate a program to get started.</Text>
            <Button
              title="View workouts"
              onPress={() => navigation.navigate('WorkoutTab', { screen: 'Program' })}
            />
          </Card>
        )}

        {/* Quick stats */}
        <Text variant="label" className="mb-2 mt-6">
          This week
        </Text>
        <View className="flex-row gap-3">
          <StatCard
            label="Workouts"
            value={`${workoutStats.workoutsLast7}`}
            sublabel="last 7 days"
            icon="🏋️"
            tone="primary"
          />
          <StatCard
            label="Streak"
            value={`${workoutStats.currentStreakWeeks}`}
            sublabel={pluralize(workoutStats.currentStreakWeeks, 'week')}
            icon="🔥"
            tone="accent"
          />
        </View>
        <View className="mt-3 flex-row gap-3">
          <StatCard
            label="Volume"
            value={formatVolume(workoutStats.volumeLast7)}
            sublabel="last 7 days"
            icon="📈"
          />
          <StatCard
            label="Total"
            value={`${workoutStats.totalWorkouts}`}
            sublabel="workouts logged"
            icon="✅"
          />
        </View>

        <Button
          title="Browse exercise library"
          variant="secondary"
          className="mt-6"
          onPress={() => navigation.navigate('WorkoutTab', { screen: 'ExerciseLibrary' })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
