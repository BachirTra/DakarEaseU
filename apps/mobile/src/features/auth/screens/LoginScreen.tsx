import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLogin, useGoogleLogin } from '@/features/auth/hooks/useAuth';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/authSchemas';

// eslint-disable-next-line @typescript-eslint/no-var-requires -- static asset require (no png module typings)
const LOGO = require('../../../../assets/icon.png');

export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    await login.mutateAsync(values);
    router.replace('/(tabs)/home');
  };

  const onGoogle = async () => {
    try {
      await googleLogin.mutateAsync();
      router.replace('/(tabs)/home');
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      Alert.alert(t('common.appName'), t('auth.googleError'));
    }
  };

  return (
    <Screen className="justify-center">
      <View className="mb-5 items-center">
        <Image source={LOGO} style={{ width: 96, height: 96 }} contentFit="contain" />
      </View>

      <Text className="mb-1 text-2xl font-bold text-text">{t('common.appName')}</Text>
      <Text className="mb-6 text-base text-textLight">{t('auth.loginSubtitle')}</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.email')}
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.email ? (
        <Text className="mb-2 text-xs text-danger">{errors.email.message}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.password')}
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.password ? (
        <Text className="mb-2 text-xs text-danger">{errors.password.message}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert(t('auth.forgotPassword'), t('auth.forgotPasswordSoon'))}
        className="mb-4 self-start"
      >
        <Text className="text-sm text-primary">{t('auth.forgotPassword')}</Text>
      </Pressable>

      <View className="mt-2">
        <Button
          label={t('auth.login')}
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
        />
      </View>

      <View className="my-6 h-px bg-border" />

      <View className="gap-3">
        <Button
          label={t('auth.continueWithGoogle')}
          variant="outline"
          onPress={onGoogle}
          loading={googleLogin.isPending}
        />
        <Button label={t('auth.continueWithApple')} variant="outline" disabled onPress={() => {}} />
        <Text className="mt-1 self-center text-xs text-textLight">{t('common.comingSoon')}</Text>
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-textLight">{t('auth.noAccount')} </Text>
        <Text
          className="text-sm font-semibold text-primary"
          onPress={() => router.push('/(auth)/signup')}
        >
          {t('auth.signup')}
        </Text>
      </View>
    </Screen>
  );
}
