/**
 * Onboarding draft state. Persisted to AsyncStorage so a half-finished
 * onboarding survives an app restart. Cleared once onboarding completes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { OnboardingDraft } from '@/types';

interface OnboardingState {
  step: number;
  draft: OnboardingDraft;
  setStep: (step: number) => void;
  next: () => void;
  back: () => void;
  update: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      draft: {},
      setStep: (step) => set({ step }),
      next: () => set((s) => ({ step: s.step + 1 })),
      back: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      update: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      reset: () => set({ step: 0, draft: {} }),
    }),
    {
      name: 'onboarding-draft',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
