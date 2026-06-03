/**
 * Progress photos: upload to the private `progress-photos` bucket and track a
 * row per photo. Display uses short-lived signed URLs (the bucket is private).
 */
import { supabase } from '@/lib/supabase';
import type { PhotoPose, ProgressPhoto } from '@/types';
import { todayIso } from '@/utils/date';
import { mapProgressPhoto } from './mappers';

const BUCKET = 'progress-photos';
const SIGNED_URL_TTL = 60 * 60; // 1 hour

export interface UploadPhotoInput {
  uri: string;
  pose: PhotoPose;
  mimeType?: string;
  date?: string;
  weightKg?: number | null;
}

export async function uploadProgressPhoto(
  userId: string,
  input: UploadPhotoInput,
): Promise<ProgressPhoto> {
  const date = input.date ?? todayIso();
  const ext = input.mimeType?.includes('png') ? 'png' : 'jpg';
  const path = `${userId}/${date}/${input.pose}-${Date.now()}.${ext}`;

  // RN-friendly upload: read the local file into an ArrayBuffer.
  const arraybuffer = await fetch(input.uri).then((r) => r.arrayBuffer());
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, arraybuffer, {
      contentType: input.mimeType ?? 'image/jpeg',
      upsert: true,
    });
  if (uploadErr) throw new Error(uploadErr.message);

  const { data, error } = await supabase
    .from('progress_photos')
    .insert({
      user_id: userId,
      date,
      pose: input.pose,
      storage_path: path,
      weight_kg: input.weightKg ?? null,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  const photo = mapProgressPhoto(data);
  photo.signedUrl = await signPhoto(path);
  return photo;
}

async function signPhoto(path: string): Promise<string | undefined> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl;
}

export async function listProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);

  const photos = (data ?? []).map(mapProgressPhoto);
  // Sign all paths in one batch where possible.
  await Promise.all(
    photos.map(async (p) => {
      p.signedUrl = await signPhoto(p.storagePath);
    }),
  );
  return photos;
}

export async function deleteProgressPhoto(userId: string, photo: ProgressPhoto): Promise<void> {
  await supabase.storage.from(BUCKET).remove([photo.storagePath]);
  const { error } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', photo.id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
