import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import React from 'react';
import { Text as RNText } from 'react-native';
import { Text } from '@/components';
import { HomeScreen } from '@/screens/home/HomeScreen';
import {
  CreateFoodScreen,
  FoodSearchScreen,
  NutritionDashboardScreen,
} from '@/screens/nutrition';
import { PhotosScreen, ProgressHomeScreen } from '@/screens/progress';
import { AnalyticsScreen, ProfileScreen, SettingsScreen } from '@/screens/profile';
import {
  ActiveWorkoutScreen,
  ExerciseDetailScreen,
  ExerciseLibraryScreen,
  ProgramScreen,
  WorkoutDetailScreen,
  WorkoutHistoryScreen,
  WorkoutSummaryScreen,
} from '@/screens/workout';
import { usePalette } from '@/theme';
import type {
  AppTabsParamList,
  NutritionStackParamList,
  ProfileStackParamList,
  ProgressStackParamList,
  WorkoutStackParamList,
} from './types';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const WorkoutStack = createNativeStackNavigator<WorkoutStackParamList>();
const NutritionStack = createNativeStackNavigator<NutritionStackParamList>();
const ProgressStack = createNativeStackNavigator<ProgressStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function useHeaderOptions(): NativeStackNavigationOptions {
  const palette = usePalette();
  return {
    headerStyle: { backgroundColor: palette.background },
    headerTintColor: palette.text,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: palette.background },
  };
}

function WorkoutNavigator() {
  const header = useHeaderOptions();
  return (
    <WorkoutStack.Navigator screenOptions={header}>
      <WorkoutStack.Screen name="Program" component={ProgramScreen} options={{ headerShown: false }} />
      <WorkoutStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} options={{ headerShown: false }} />
      <WorkoutStack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
      <WorkoutStack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <WorkoutStack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ headerShown: false }} />
      <WorkoutStack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ headerShown: false }} />
      <WorkoutStack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Workout' }} />
    </WorkoutStack.Navigator>
  );
}

function NutritionNavigator() {
  const header = useHeaderOptions();
  return (
    <NutritionStack.Navigator screenOptions={header}>
      <NutritionStack.Screen
        name="NutritionDashboard"
        component={NutritionDashboardScreen}
        options={{ headerShown: false }}
      />
      <NutritionStack.Screen name="FoodSearch" component={FoodSearchScreen} options={{ headerShown: false }} />
      <NutritionStack.Screen name="CreateFood" component={CreateFoodScreen} options={{ title: 'Custom food' }} />
    </NutritionStack.Navigator>
  );
}

function ProgressNavigator() {
  const header = useHeaderOptions();
  return (
    <ProgressStack.Navigator screenOptions={header}>
      <ProgressStack.Screen name="ProgressHome" component={ProgressHomeScreen} options={{ headerShown: false }} />
      <ProgressStack.Screen name="Photos" component={PhotosScreen} options={{ headerShown: false }} />
    </ProgressStack.Navigator>
  );
}

function ProfileNavigator() {
  const header = useHeaderOptions();
  return (
    <ProfileStack.Navigator screenOptions={header}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
}

const ICONS: Record<keyof AppTabsParamList, string> = {
  HomeTab: '🏠',
  WorkoutTab: '🏋️',
  NutritionTab: '🍎',
  ProgressTab: '📈',
  ProfileTab: '👤',
};

function TabIcon({ name, focused }: { name: keyof AppTabsParamList; focused: boolean }) {
  return <RNText style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{ICONS[name]}</RNText>;
}

export function AppTabs() {
  const palette = usePalette();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        tabBarLabel: ({ color }) => (
          <Text style={{ color, fontSize: 11, fontWeight: '600' }}>
            {TAB_LABELS[route.name as keyof AppTabsParamList]}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name as keyof AppTabsParamList} focused={focused} />
        ),
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeScreen} />
      <Tabs.Screen name="WorkoutTab" component={WorkoutNavigator} />
      <Tabs.Screen name="NutritionTab" component={NutritionNavigator} />
      <Tabs.Screen name="ProgressTab" component={ProgressNavigator} />
      <Tabs.Screen name="ProfileTab" component={ProfileNavigator} />
    </Tabs.Navigator>
  );
}

const TAB_LABELS: Record<keyof AppTabsParamList, string> = {
  HomeTab: 'Home',
  WorkoutTab: 'Train',
  NutritionTab: 'Nutrition',
  ProgressTab: 'Progress',
  ProfileTab: 'Profile',
};
