import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Input, Screen, Text } from '@/components';
import { authService } from '@/services';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.sendPasswordReset(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentClassName="gap-5 pt-8">
      <View className="gap-1">
        <Text variant="title">Reset password</Text>
        <Text variant="caption">We'll email you a link to reset your password.</Text>
      </View>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />

      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      {sent ? <Text className="text-sm text-success">Reset email sent. Check your inbox.</Text> : null}

      <Button title="Send reset link" onPress={onSubmit} loading={loading} size="lg" />
      <Button title="Back to sign in" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
