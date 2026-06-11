import { ReactNode } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSessionStore } from "@/features/auth/store/sessionStore";

export function AuthGate({ children }: { children: ReactNode }) {
  const isInitializing = useSessionStore((s) => s.isInitializing);
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#1E3A8A" size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (profile && !profile.persona) return <Redirect href="/(auth)/onboarding" />;

  return <>{children}</>;
}
