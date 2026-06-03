/**
 * Centralised, validated environment access. Expo inlines any variable
 * prefixed with EXPO_PUBLIC_ at build time, so these are available on-device.
 */
import Constants from 'expo-constants';

function read(key: string): string | undefined {
  // Prefer process.env (EXPO_PUBLIC_*), fall back to app.json `extra`.
  const fromProcess = process.env[key];
  if (fromProcess) return fromProcess;
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  return extra[key];
}

export const ENV = {
  supabaseUrl: read('EXPO_PUBLIC_SUPABASE_URL') ?? read('supabaseUrl') ?? '',
  supabaseAnonKey: read('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? read('supabaseAnonKey') ?? '',
  exerciseMediaBase: read('EXPO_PUBLIC_EXERCISE_MEDIA_BASE') ?? '',
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
