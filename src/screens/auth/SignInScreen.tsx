import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Input, Screen, Text } from '@/components';
import { IS_SUPABASE_CONFIGURED } from '@/config/env';
import { authService } from '@/services';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!IS_SUPABASE_CONFIGURED) {
      setError('Supabase is not configured. Add your keys to .env (see README).');
      return;
    }
    setLoading(true);
    try {
      await authService.signInWithEmail(email.trim(), password);
      // Auth state change navigates automatically.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentClassName="gap-5 pt-8">
      <View className="gap-1">
        <Text variant="title">Welcome back</Text>
        <Text variant="caption">Sign in to continue your progress.</Text>
      </View>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      {error ? <Text className="text-sm text-danger">{error}</Text> : null}

      <Button title="Sign In" onPress={onSubmit} loading={loading} size="lg" />

      <View className="flex-row items-center justify-between">
        <Button
          title="Forgot password?"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.navigate('ForgotPassword')}
        />
        <Button
          title="Create account"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>
    </Screen>
  );
}
