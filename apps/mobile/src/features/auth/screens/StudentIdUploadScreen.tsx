import { Text, View } from 'react-native';
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

  const status = profile?.verification_status ?? 'pending';
  const hasUploaded = Boolean(profile?.verification_doc_url);

  const pickAndUpload = async () => {
    if (!userId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `student-id-${Date.now()}.jpg`;
    await uploadStudentId.mutateAsync({
      userId,
      fileUri: asset.uri,
      fileName,
      contentType: asset.mimeType ?? 'image/jpeg',
    });
  };

  return (
    <Screen className="justify-center">
      <Text className="mb-2 text-xl font-bold text-text">{t('auth.uploadIdTitle')}</Text>
      <Text className="mb-6 text-sm text-textLight">{t('auth.uploadIdBody')}</Text>

      {hasUploaded ? (
        <View className="mb-6">
          <Badge label={t(STATUS_LABEL_KEY[status])} tone={STATUS_TONE[status]} />
        </View>
      ) : null}

      <Button
        label={t('auth.uploadIdAction')}
        onPress={pickAndUpload}
        loading={uploadStudentId.isPending}
        variant={hasUploaded ? 'outline' : 'primary'}
      />

      <View className="mt-4 items-center">
        <Text className="text-sm text-textLight" onPress={() => router.replace('/(tabs)/home')}>
          {t('auth.uploadIdLater')}
        </Text>
      </View>
    </Screen>
  );
}
