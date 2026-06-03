import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarChart,
  Card,
  LineChart,
  LoadingState,
  StatCard,
  Text,
} from '@/components';
import { useAnalytics, useProfile } from '@/hooks';
import { displayWeight, formatShortDate, formatVolume, pluralize } from '@/utils';

export function AnalyticsScreen() {
  const { workoutStats, weightTrend, volumeSeries, isLoading } = useAnalytics();
  const { data: profile } = useProfile();
  const unit = profile?.unitSystem ?? 'metric';

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const volumeBars = volumeSeries.map((v) => ({
    label: formatShortDate(v.date).split(' ')[1] ?? '',
    value: v.volume,
  }));
  const weightLine = weightTrend.series.slice(-30).map((s) => ({ x: s.date, y: s.weightKg }));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Text variant="title" className="py-4">
          Analytics
        </Text>

        <View className="flex-row gap-3">
          <StatCard
            label="Workouts"
            value={`${workoutStats.workoutsLast30}`}
            sublabel="last 30 days"
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
            value={formatVolume(workoutStats.volumeLast30)}
            sublabel="last 30 days"
            icon="📈"
          />
          <StatCard
            label="Total"
            value={`${workoutStats.totalWorkouts}`}
            sublabel="workouts"
            icon="✅"
          />
        </View>

        <Card className="mt-5 gap-3">
          <Text variant="label">Training volume · last 7 days</Text>
          <BarChart data={volumeBars} />
        </Card>

        <Card className="mt-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="label">Body weight · last 30 days</Text>
            {weightTrend.latest != null ? (
              <Text variant="caption">{displayWeight(weightTrend.latest, unit)}</Text>
            ) : null}
          </View>
          <LineChart data={weightLine} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
