/**
 * Auth context: tracks the Supabase session/user and pauses token auto-refresh
 * while the app is backgrounded. Wrap the app in <AuthProvider>.
 */
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getSession, onAuthStateChange } from '@/services/auth';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True until the initial session check resolves. */
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((s) => {
        if (mounted) setSession(s);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setInitializing(false);
      });

    const subscription = onAuthStateChange((s) => {
      if (mounted) setSession(s);
    });

    // Pause/resume token auto-refresh with app foreground state.
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      appStateSub.remove();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Throws if used outside an authenticated tree — convenient inside the app. */
export function useUserId(): string {
  const { user } = useAuth();
  if (!user) throw new Error('useUserId called without an authenticated user');
  return user.id;
}
