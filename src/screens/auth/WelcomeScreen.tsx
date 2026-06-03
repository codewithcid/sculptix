import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { Button, Screen, Text } from '@/components';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen contentClassName="justify-between py-6">
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-7xl">💪</Text>
        <Text variant="display" className="text-center">
          Sculptix
        </Text>
        <Text variant="body" className="max-w-xs text-center text-text-muted">
          Sculpt your dream physique with smart, personalised training, nutrition and progress
          tracking — no guesswork.
        </Text>
      </View>

      <View className="gap-3">
        <Button title="Get Started" onPress={() => navigation.navigate('SignUp')} size="lg" />
        <Button
          title="I already have an account"
          variant="ghost"
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    </Screen>
  );
}
