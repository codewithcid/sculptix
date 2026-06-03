import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/queryClient';
import { useAuth, useUserId } from '@/providers/AuthProvider';
import { photoService } from '@/services';
import type { UploadPhotoInput } from '@/services/photos';
import type { ProgressPhoto } from '@/types';

export function useProgressPhotos() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.progressPhotos,
    queryFn: () => photoService.listProgressPhotos(user!.id),
    enabled: !!user,
  });
}

export function useUploadPhoto() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadPhotoInput) => photoService.uploadProgressPhoto(userId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.progressPhotos }),
  });
}

export function useDeletePhoto() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photo: ProgressPhoto) => photoService.deleteProgressPhoto(userId, photo),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.progressPhotos }),
  });
}
