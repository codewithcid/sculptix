import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Divider,
  Input,
  LineChart,
  LoadingState,
  SegmentedControl,
  StatCard,
  Text,
} from '@/components';
import { useDeleteWeightEntry, useLogWeight, useProfile, useWeightEntries } from '@/hooks';
import { computeWeightTrend } from '@/utils';
import { displayWeight, formatShortDate } from '@/utils';
import type { ProgressStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ProgressStackParamList, 'ProgressHome'>;
type Range = '7' | '30' | 'all';

export function ProgressHomeScreen({ navigation }: Props) {
  const { data: entries, isLoading } = useWeightEntries();
  const { data: profile } = useProfile();
  const logWeight = useLogWeight();
  const deleteEntry = useDeleteWeightEntry();
  const unit = profile?.unitSystem ?? 'metric';

  const [range, setRange] = useState<Range>('30');
  const [input, setInput] = useState('');

  const trend = useMemo(() => computeWeightTrend(entries ?? []), [entries]);

  const chartData = useMemo(() => {
    const series = trend.series;
    const sliced =
      range === 'all' ? series : series.slice(-(range === '7' ? 7 : 30));
    return sliced.map((s) => ({ x: s.date, y: s.weightKg }));
  }, [trend.series, range]);

  const onLog = async () => {
    const value = parseFloat(input);
    if (!value) return;
    // Input is in the user's unit; convert if imperial.
    const kg = unit === 'imperial' ? value * 0.45359237 : value;
    await logWeight.mutateAsync({ weightKg: Math.round(kg * 10) / 10 });
    setInput('');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between py-4">
          <Text variant="title">Progress</Text>
          <Button
            title="Photos"
            variant="ghost"
            fullWidth={false}
            onPress={() => navigation.navigate('Photos')}
          />
        </View>

        {/* Log weight */}
        <Card elevated className="gap-3">
          <Text variant="label">Log today's weight</Text>
          <View className="flex-row gap-3">
            <Input
              containerClassName="flex-1"
              keyboardType="decimal-pad"
              value={input}
              onChangeText={setInput}
              placeholder={unit === 'imperial' ? 'lb' : 'kg'}
            />
            <Button
              title="Save"
              fullWidth={false}
              className="px-8"
              onPress={onLog}
              loading={logWeight.isPending}
            />
          </View>
        </Card>

        {/* Trend stats */}
        <View className="mt-4 flex-row gap-3">
          <StatCard
            label="Current"
            value={trend.latest != null ? displayWeight(trend.latest, unit, 1) : '—'}
            tone="primary"
          />
          <StatCard
            label="7-day"
            value={trend.change7 != null ? `${trend.change7 > 0 ? '+' : ''}${displayWeight(trend.change7, unit, 1)}` : '—'}
          />
          <StatCard
            label="30-day"
            value={trend.change30 != null ? `${trend.change30 > 0 ? '+' : ''}${displayWeight(trend.change30, unit, 1)}` : '—'}
          />
        </View>

        {/* Chart */}
        <Card className="mt-4 gap-3">
          <SegmentedControl
            segments={[
              { value: '7', label: 'Week' },
              { value: '30', label: 'Month' },
              { value: 'all', label: 'All' },
            ]}
            value={range}
            onChange={(r) => setRange(r as Range)}
          />
          <LineChart data={chartData} />
        </Card>

        {/* History */}
        <Text variant="label" className="mb-2 mt-6">
          History
        </Text>
        <Card>
          {(entries ?? []).length === 0 ? (
            <Text variant="caption">No entries yet. Log your weight above.</Text>
          ) : (
            [...(entries ?? [])]
              .reverse()
              .slice(0, 30)
              .map((e, i, arr) => (
                <View key={e.id}>
                  <Pressable
                    onLongPress={() => deleteEntry.mutate(e.id)}
                    className="flex-row items-center justify-between py-2 active:opacity-60"
                  >
                    <Text variant="caption">{formatShortDate(e.date)}</Text>
                    <Text className="font-semibold text-text">{displayWeight(e.weightKg, unit)}</Text>
                  </Pressable>
                  {i < arr.length - 1 ? <Divider /> : null}
                </View>
              ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
