/**
 * Theme bridge. Syncs the user's saved theme preference (system/light/dark)
 * into NativeWind's color scheme and exposes the resolved raw palette for
 * components that need color values (charts, status bar).
 */
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { colorScheme as nwColorScheme, useColorScheme } from 'nativewind';
import { PALETTES, type Palette, type ThemeName } from './colors';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeName;
  palette: Palette;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  preference,
  onChangePreference,
  children,
}: {
  preference: ThemePreference;
  onChangePreference?: (p: ThemePreference) => void;
  children: React.ReactNode;
}) {
  const systemScheme = useRNColorScheme();
  const { colorScheme } = useColorScheme();

  // Apply preference to NativeWind whenever it changes.
  useEffect(() => {
    nwColorScheme.set(preference);
  }, [preference]);

  const theme: ThemeName =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const resolved: ThemeName = (colorScheme as ThemeName) ?? theme;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolved,
      palette: PALETTES[resolved],
      preference,
      setPreference: (p) => {
        nwColorScheme.set(p);
        onChangePreference?.(p);
      },
    }),
    [resolved, preference, onChangePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Shortcut for the resolved color palette. */
export function usePalette(): Palette {
  return useTheme().palette;
}
