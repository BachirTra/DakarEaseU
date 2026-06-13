import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useUpdateProfile, useUploadAvatar } from '@/features/profile/hooks/useProfile';

const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Nom trop court'),
  phone: z.string().nullable(),
});
type EditProfileInput = z.infer<typeof editProfileSchema>;

export function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);
  const userId = useSessionStore((s) => s.user?.id);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const { control, handleSubmit } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: profile?.full_name ?? '', phone: profile?.phone ?? null },
  });

  if (!profile || !userId) return null;

  const onSubmit = async (values: EditProfileInput) => {
    await updateProfile.mutateAsync({ userId, fullName: values.fullName, phone: values.phone });
    router.back();
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await uploadAvatar.mutateAsync({
      userId,
      fileUri: asset.uri,
      fileName: asset.fileName ?? `avatar-${Date.now()}.jpg`,
      contentType: asset.mimeType ?? 'image/jpeg',
    });
  };

  return (
    <Screen className="justify-center">
      <Pressable onPress={pickAvatar} className="mb-6 items-center">
        <View className="h-24 w-24 overflow-hidden rounded-full bg-border">
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>
        <Text className="mt-2 text-xs font-semibold text-primary">{t('profile.changePhoto')}</Text>
      </Pressable>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.fullName')}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChange}
            className="mb-3 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />

      <View className="mb-4">
        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange } }) => (
            <PhoneInput value={value} onChange={onChange} />
          )}
        />
      </View>

      <Button
        label={t('common.save')}
        onPress={handleSubmit(onSubmit)}
        loading={updateProfile.isPending}
      />
    </Screen>
  );
}
