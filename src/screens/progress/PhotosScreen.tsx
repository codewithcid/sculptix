import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  SegmentedControl,
  Text,
} from '@/components';
import { useDeletePhoto, useProgressPhotos, useUploadPhoto } from '@/hooks';
import { PHOTO_POSES, type PhotoPose, type ProgressPhoto } from '@/types';
import { formatShortDate } from '@/utils';
import type { ProgressStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ProgressStackParamList, 'Photos'>;

export function PhotosScreen(_props: Props) {
  const { data: photos, isLoading } = useProgressPhotos();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const [pose, setPose] = useState<PhotoPose>('front');
  const [compare, setCompare] = useState(false);

  const posePhotos = useMemo(
    () => (photos ?? []).filter((p) => p.pose === pose),
    [photos, pose],
  );

  const onAdd = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload progress pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      await uploadPhoto.mutateAsync({
        uri: asset.uri,
        pose,
        mimeType: asset.mimeType,
      });
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Try again.');
    }
  };

  const onDelete = (photo: ProgressPhoto) => {
    Alert.alert('Delete photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePhoto.mutate(photo) },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const oldest = posePhotos[posePhotos.length - 1];
  const newest = posePhotos[0];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <Text variant="title" className="py-4">
          Progress photos
        </Text>

        <SegmentedControl
          segments={PHOTO_POSES.map((p) => ({ value: p, label: p[0]!.toUpperCase() + p.slice(1) }))}
          value={pose}
          onChange={setPose}
        />

        <View className="mt-3 flex-row gap-3">
          <Button
            title="Add photo"
            className="flex-1"
            onPress={onAdd}
            loading={uploadPhoto.isPending}
          />
          <Button
            title={compare ? 'Timeline' : 'Compare'}
            variant="secondary"
            fullWidth={false}
            className="px-6"
            onPress={() => setCompare((c) => !c)}
            disabled={posePhotos.length < 2}
          />
        </View>

        {posePhotos.length === 0 ? (
          <EmptyState
            icon="📸"
            title="No photos yet"
            description={`Add your first ${pose} photo to start your timeline.`}
          />
        ) : compare && oldest && newest ? (
          <View className="mt-5 flex-row gap-3">
            <ComparePane label="Before" photo={oldest} />
            <ComparePane label="After" photo={newest} />
          </View>
        ) : (
          <View className="mt-5 flex-row flex-wrap gap-3">
            {posePhotos.map((p) => (
              <Pressable
                key={p.id}
                onLongPress={() => onDelete(p)}
                className="w-[48%]"
              >
                <Card className="overflow-hidden p-0">
                  {p.signedUrl ? (
                    <Image
                      source={{ uri: p.signedUrl }}
                      style={{ width: '100%', aspectRatio: 3 / 4 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="aspect-[3/4] items-center justify-center bg-surface-elevated">
                      <Text className="text-3xl">🖼️</Text>
                    </View>
                  )}
                  <Text variant="caption" className="p-2">
                    {formatShortDate(p.date)}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        {posePhotos.length > 0 ? (
          <Text variant="caption" className="mt-4 text-center">
            Long-press a photo to delete it.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ComparePane({ label, photo }: { label: string; photo: ProgressPhoto }) {
  return (
    <View className="flex-1 gap-1">
      <Text variant="label">
        {label} · {formatShortDate(photo.date)}
      </Text>
      <Card className="overflow-hidden p-0">
        {photo.signedUrl ? (
          <Image
            source={{ uri: photo.signedUrl }}
            style={{ width: '100%', aspectRatio: 3 / 4 }}
            contentFit="cover"
          />
        ) : (
          <View className="aspect-[3/4] items-center justify-center bg-surface-elevated">
            <Text className="text-3xl">🖼️</Text>
          </View>
        )}
      </Card>
    </View>
  );
}
