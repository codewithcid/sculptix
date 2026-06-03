/** Navigation param lists for type-safe navigation. */
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type WorkoutStackParamList = {
  Program: undefined;
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: string };
  ActiveWorkout: { programDayIndex: number };
  WorkoutSummary: { workoutId: string };
  WorkoutHistory: undefined;
  WorkoutDetail: { workoutId: string };
};

export type NutritionStackParamList = {
  NutritionDashboard: undefined;
  FoodSearch: { date: string; meal: string };
  CreateFood: { date: string; meal: string } | undefined;
};

export type ProgressStackParamList = {
  ProgressHome: undefined;
  Photos: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Analytics: undefined;
};

export type AppTabsParamList = {
  HomeTab: undefined;
  WorkoutTab: NavigatorScreenParams<WorkoutStackParamList>;
  NutritionTab: NavigatorScreenParams<NutritionStackParamList>;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  OnboardingFlow: undefined;
  App: NavigatorScreenParams<AppTabsParamList>;
};
