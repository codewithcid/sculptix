/**
 * Typed Supabase client configured for React Native.
 *
 * - Sessions persist in AsyncStorage (robust across the JWT size limits that
 *   bite SecureStore on Android).
 * - autoRefreshToken keeps the session alive; we toggle it with AppState in
 *   the AuthProvider so refresh pauses in the background.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';
import type { Database } from '@/types';

export const supabase = createClient<Database>(
  ENV.supabaseUrl || 'http://localhost',
  ENV.supabaseAnonKey || 'public-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // not applicable on native
    },
  },
);

/** Convenience: throw a readable error from a Supabase response. */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null) throw new Error('No data returned');
  return res.data;
}
