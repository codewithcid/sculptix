import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CalorieRing,
  Card,
  Divider,
  LoadingState,
  MacroBar,
  Text,
} from '@/components';
import { useDeleteNutritionLog, useMacroTargets, useNutritionByDate } from '@/hooks';
import { nutritionService } from '@/services';
import { usePalette } from '@/theme';
import { MEAL_TYPES, type MealType } from '@/types';
import { addDays, formatShortDate, todayIso } from '@/utils';
import type { NutritionStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<NutritionStackParamList, 'NutritionDashboard'>;

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export function NutritionDashboardScreen({ navigation }: Props) {
  const palette = usePalette();
  const [date, setDate] = useState(todayIso());
  const { data: logs, isLoading } = useNutritionByDate(date);
  const targets = useMacroTargets();
  const deleteLog = useDeleteNutritionLog(date);

  const totals = useMemo(() => nutritionService.sumTotals(logs ?? []), [logs]);
  const calorieTarget = targets?.calories ?? 2200;

  const byMeal = useMemo(() => {
    const map: Record<MealType, typeof logs> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    for (const l of logs ?? []) map[l.meal]?.push(l);
    return map;
  }, [logs]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        {/* Date selector */}
        <View className="flex-row items-center justify-between py-4">
          <Pressable onPress={() => setDate(addDays(date, -1))} className="p-2 active:opacity-60">
            <Text className="text-xl text-primary">‹</Text>
          </Pressable>
          <Text variant="subheading">
            {date === todayIso() ? 'Today' : formatShortDate(date)}
          </Text>
          <Pressable
            onPress={() => date < todayIso() && setDate(addDays(date, 1))}
            className="p-2 active:opacity-60"
          >
            <Text className={`text-xl ${date < todayIso() ? 'text-primary' : 'text-border'}`}>›</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <Card elevated className="items-center gap-4">
              <CalorieRing consumed={totals.calories} target={calorieTarget} />
              <View className="w-full gap-3">
                <MacroBar
                  label="Protein"
                  value={totals.proteinG}
                  target={targets?.proteinG}
                  color={palette.protein}
                />
                <MacroBar
                  label="Carbs"
                  value={totals.carbsG}
                  target={targets?.carbsG}
                  color={palette.carbs}
                />
                <MacroBar
                  label="Fat"
                  value={totals.fatG}
                  target={targets?.fatG}
                  color={palette.fat}
                />
              </View>
              {!targets ? (
                <Text variant="caption" className="text-center">
                  Add your stats in onboarding for personalised macro targets.
                </Text>
              ) : null}
            </Card>

            {/* Meals */}
            <View className="mt-5 gap-4">
              {MEAL_TYPES.map((meal) => {
                const items = byMeal[meal] ?? [];
                return (
                  <Card key={meal} className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text variant="subheading">{MEAL_LABELS[meal]}</Text>
                      <Pressable
                        onPress={() => navigation.navigate('FoodSearch', { date, meal })}
                        className="active:opacity-60"
                      >
                        <Text className="font-semibold text-primary">+ Add</Text>
                      </Pressable>
                    </View>
                    {items.length === 0 ? (
                      <Text variant="caption">Nothing logged yet.</Text>
                    ) : (
                      items.map((l, i) => (
                        <View key={l.id}>
                          <Pressable
                            onLongPress={() => deleteLog.mutate(l.id)}
                            className="flex-row items-center justify-between py-1.5 active:opacity-60"
                          >
                            <View className="flex-1">
                              <Text className="text-text" numberOfLines={1}>
                                {l.name}
                              </Text>
                              <Text variant="caption">
                                {l.servings}× · P{Math.round(l.proteinG)} C{Math.round(l.carbsG)} F
                                {Math.round(l.fatG)}
                              </Text>
                            </View>
                            <Text className="font-semibold text-text">
                              {Math.round(l.calories)} kcal
                            </Text>
                          </Pressable>
                          {i < items.length - 1 ? <Divider /> : null}
                        </View>
                      ))
                    )}
                  </Card>
                );
              })}
            </View>
            <Text variant="caption" className="mt-4 text-center">
              Tip: long-press an item to remove it.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
