import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Input, Screen, Text } from '@/components';
import { IS_SUPABASE_CONFIGURED } from '@/config/env';
import { authService } from '@/services';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);
    if (!IS_SUPABASE_CONFIGURED) {
      setError('Supabase is not configured. Add your keys to .env (see README).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.signUpWithEmail(email.trim(), password, name.trim());
      if (!res.session) {
        setInfo('Check your email to confirm your account, then sign in.');
      }
      // If email confirmation is disabled, the session arrives and navigation follows.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentClassName="gap-5 pt-8">
      <View className="gap-1">
        <Text variant="title">Create your account</Text>
        <Text variant="caption">Start building your physique today.</Text>
      </View>

      <Input label="Name" value={name} onChangeText={setName} placeholder="Alex" />
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
        placeholder="At least 6 characters"
      />

      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      {info ? <Text className="text-sm text-success">{info}</Text> : null}

      <Button title="Create Account" onPress={onSubmit} loading={loading} size="lg" />
      <Button
        title="Already have an account? Sign in"
        variant="ghost"
        onPress={() => navigation.navigate('SignIn')}
      />
    </Screen>
  );
}
