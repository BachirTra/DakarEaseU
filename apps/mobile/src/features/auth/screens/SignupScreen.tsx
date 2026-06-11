import { Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "@/shared/ui/Screen";
import { Button } from "@/shared/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useSignup } from "@/features/auth/hooks/useAuth";
import { signupSchema, type SignupInput } from "@/features/auth/schemas/authSchemas";

export function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signup = useSignup();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupInput) => {
    await signup.mutateAsync(values);
    router.replace("/(auth)/onboarding");
  };

  return (
    <Screen className="justify-center">
      <Text className="mb-6 text-2xl font-bold text-text">{t("auth.signup")}</Text>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t("auth.fullName")}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.fullName ? <Text className="mb-2 text-xs text-danger">{errors.fullName.message}</Text> : <View className="mb-2" />}

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t("auth.email")}
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.email ? <Text className="mb-2 text-xs text-danger">{errors.email.message}</Text> : <View className="mb-2" />}

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t("auth.password")}
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.password ? <Text className="mb-2 text-xs text-danger">{errors.password.message}</Text> : <View className="mb-2" />}

      <View className="mt-2">
        <Button label={t("auth.signup")} onPress={handleSubmit(onSubmit)} loading={signup.isPending} />
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-textLight">{t("auth.hasAccount")} </Text>
        <Text className="text-sm font-semibold text-primary" onPress={() => router.push("/(auth)/login")}>
          {t("auth.login")}
        </Text>
      </View>
    </Screen>
  );
}
