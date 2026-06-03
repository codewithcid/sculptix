import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { LoadingState } from '@/components';
import { useProfile } from '@/hooks';
import { useAuth } from '@/providers/AuthProvider';
import { OnboardingScreen } from '@/screens/onboarding';
import { AppTabs } from './AppTabs';
import { AuthNavigator } from './AuthNavigator';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, initializing } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Initial auth check.
  if (initializing) return <Splash />;

  const onboarded = profile?.onboardingCompleted ?? false;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : profileLoading ? (
        // Brief profile fetch after sign-in.
        <RootStack.Screen name="OnboardingFlow" component={Splash} />
      ) : !onboarded ? (
        <RootStack.Screen name="OnboardingFlow" component={OnboardingScreen} />
      ) : (
        <RootStack.Screen name="App" component={AppTabs} />
      )}
    </RootStack.Navigator>
  );
}

function Splash() {
  return (
    <View className="flex-1 bg-background">
      <LoadingState label="Loading…" />
    </View>
  );
}
