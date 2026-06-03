import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/queryClient';
import { useAuth, useUserId } from '@/providers/AuthProvider';
import { profileService } from '@/services';
import type { OnboardingDraft, Profile, UserSettings } from '@/types';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.profile,
    queryFn: () => profileService.getProfile(user!.id),
    enabled: !!user,
  });
}

export function useSettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.settings,
    queryFn: () => profileService.getSettings(user!.id),
    enabled: !!user,
  });
}

export function useCompleteOnboarding() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: OnboardingDraft) =>
      profileService.completeOnboarding(user!.id, draft, user!.email ?? null),
    onSuccess: (profile) => {
      qc.setQueryData(qk.profile, profile);
    },
  });
}

export function useUpdateProfile() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => profileService.updateProfile(userId, patch),
    onSuccess: (profile) => qc.setQueryData(qk.profile, profile),
  });
}

export function useUpdateSettings() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserSettings>) => profileService.updateSettings(userId, patch),
    onSuccess: (settings) => qc.setQueryData(qk.settings, settings),
  });
}
