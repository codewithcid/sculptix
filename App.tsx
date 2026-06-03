import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components';
import { useOTAUpdates, useSettings } from '@/hooks';
import { queryClient } from '@/lib/queryClient';
import { RootNavigator } from '@/navigation';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider, usePalette, useTheme } from '@/theme';

/** Reads the persisted theme preference and drives ThemeProvider. */
function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSettings();
  return <ThemeProvider preference={settings?.theme ?? 'system'}>{children}</ThemeProvider>;
}

/** Builds the React Navigation theme from the resolved palette. */
function AppShell() {
  const palette = usePalette();
  const { theme } = useTheme();
  const base = theme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
      notification: palette.danger,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useOTAUpdates();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeBridge>
                <AppShell />
              </ThemeBridge>
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
