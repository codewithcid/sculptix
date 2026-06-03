/**
 * Resolved color palettes. These mirror the CSS variables in global.css and
 * are used where we need raw color values (charts, status bar, gradients) that
 * can't read Tailwind classes.
 */
export type ThemeName = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  text: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  /** Macro colors for nutrition rings. */
  protein: string;
  carbs: string;
  fat: string;
}

export const PALETTES: Record<ThemeName, Palette> = {
  light: {
    background: 'rgb(248 249 252)',
    surface: 'rgb(255 255 255)',
    surfaceElevated: 'rgb(255 255 255)',
    border: 'rgb(228 230 237)',
    primary: 'rgb(99 102 241)',
    primaryForeground: 'rgb(255 255 255)',
    accent: 'rgb(16 185 129)',
    text: 'rgb(17 19 28)',
    textMuted: 'rgb(110 116 134)',
    success: 'rgb(22 163 74)',
    warning: 'rgb(217 119 6)',
    danger: 'rgb(220 38 38)',
    protein: 'rgb(239 68 68)',
    carbs: 'rgb(59 130 246)',
    fat: 'rgb(234 179 8)',
  },
  dark: {
    background: 'rgb(11 11 15)',
    surface: 'rgb(22 23 31)',
    surfaceElevated: 'rgb(30 32 42)',
    border: 'rgb(42 44 56)',
    primary: 'rgb(129 140 248)',
    primaryForeground: 'rgb(12 12 16)',
    accent: 'rgb(52 211 153)',
    text: 'rgb(244 245 250)',
    textMuted: 'rgb(148 154 172)',
    success: 'rgb(74 222 128)',
    warning: 'rgb(251 191 36)',
    danger: 'rgb(248 113 113)',
    protein: 'rgb(248 113 113)',
    carbs: 'rgb(96 165 250)',
    fat: 'rgb(250 204 21)',
  },
};
