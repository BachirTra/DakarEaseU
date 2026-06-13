import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useUploadStudentId } from '@/features/auth/hooks/useAuth';

const STATUS_TONE = { pending: 'warning', approved: 'success', rejected: 'danger' } as const;
const STATUS_LABEL_KEY = {
  pending: 'auth.verificationPending',
  approved: 'auth.verificationApproved',
  rejected: 'auth.verificationRejected',
} as const;

export function StudentIdUploadScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useSessionStore((s) => s.user?.id);
  const profile = useSessionStore((s) => s.profile);
  const uploadStudentId = useUploadStudentId();

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [pendingAsset, setPendingAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const status = profile?.verification_status ?? 'pending';
  const hasUploaded = Boolean(profile?.verification_doc_url);

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setPreviewUri(result.assets[0].uri);
    setPendingAsset(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', "L'accès à l'appareil photo est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setPreviewUri(result.assets[0].uri);
    setPendingAsset(result.assets[0]);
  };

  const confirmUpload = async () => {
    if (!userId || !pendingAsset) return;
    const fileName = pendingAsset.fileName ?? `student-id-${Date.now()}.jpg`;
    await uploadStudentId.mutateAsync({
      userId,
      fileUri: pendingAsset.uri,
      fileName,
      contentType: pendingAsset.mimeType ?? 'image/jpeg',
    });
    setPreviewUri(null);
    setPendingAsset(null);
  };

  return (
    <Screen className="justify-center">
      <Text className="mb-2 text-xl font-bold text-text">{t('auth.uploadIdTitle')}</Text>
      <Text className="mb-6 text-sm text-textLight">{t('auth.uploadIdBody')}</Text>

      {hasUploaded && !previewUri ? (
        <View className="mb-6">
          <Badge label={t(STATUS_LABEL_KEY[status])} tone={STATUS_TONE[status]} />
        </View>
      ) : null}

      {previewUri ? (
        <View className="mb-5">
          <View className="overflow-hidden rounded-2xl border border-border" style={{ height: 200 }}>
            <Image
              source={{ uri: previewUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
          <Pressable
            onPress={() => { setPreviewUri(null); setPendingAsset(null); }}
            className="mt-2 items-center"
          >
            <Text className="text-xs font-semibold text-danger">Changer de photo</Text>
          </Pressable>
        </View>
      ) : (
        <View className="mb-5 gap-3">
          <Button
            label="Importer depuis la galerie"
            variant="outline"
            onPress={pickFromGallery}
          />
          <Button
            label="Prendre une photo"
            variant="outline"
            onPress={takePhoto}
          />
        </View>
      )}

      {pendingAsset ? (
        <Button
          label="Téléverser ma carte étudiante"
          onPress={confirmUpload}
          loading={uploadStudentId.isPending}
        />
      ) : null}

      {hasUploaded && !pendingAsset ? (
        <View className="mt-3">
          <Button
            label={t('auth.uploadIdAction')}
            variant="outline"
            onPress={pickFromGallery}
            loading={uploadStudentId.isPending}
          />
        </View>
      ) : null}

      <View className="mt-4 items-center">
        <Text className="text-sm text-textLight" onPress={() => router.replace('/(tabs)/home')}>
          {t('auth.uploadIdLater')}
        </Text>
      </View>
    </Screen>
  );
}
