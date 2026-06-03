/**
 * Centralised, validated environment access.
 *
 * IMPORTANT: Expo only inlines `EXPO_PUBLIC_*` vars that are accessed
 * *statically* (e.g. `process.env.EXPO_PUBLIC_SUPABASE_URL`). Dynamic access
 * like `process.env[key]` is NOT inlined and resolves to undefined on-device,
 * so every variable must be referenced by its literal name below. We fall back
 * to app.json `extra` for convenience.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const ENV = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '',
  exerciseMediaBase: process.env.EXPO_PUBLIC_EXERCISE_MEDIA_BASE ?? '',
};

/** True when Supabase credentials are present. Screens can degrade gracefully. */
export const IS_SUPABASE_CONFIGURED = Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);

if (__DEV__ && !IS_SUPABASE_CONFIGURED) {
  // eslint-disable-next-line no-console
  console.warn(
    '[env] Supabase is not configured. Copy .env.example to .env and set ' +
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}
