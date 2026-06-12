import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Screen } from "@/shared/ui/Screen";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { LanguageSelector } from "@/features/profile/components/LanguageSelector";

const VERIFICATION_TONE = { pending: "warning", approved: "success", rejected: "danger" } as const;
const VERIFICATION_LABEL_KEY = {
  pending: "auth.verificationPending",
  approved: "auth.verificationApproved",
  rejected: "auth.verificationRejected",
} as const;

export function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);
  const logout = useLogout();

  if (!profile) return null;

  const confirmLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.logout"), style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
        <View className="items-center">
          <View className="h-20 w-20 overflow-hidden rounded-full bg-border">
            {profile.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
          </View>
          <Text className="mt-3 text-lg font-bold text-text">{profile.full_name}</Text>
          <Text className="text-sm text-textLight">{profile.phone ?? ""}</Text>
          <View className="mt-2">
            <Badge label={t(VERIFICATION_LABEL_KEY[profile.verification_status])} tone={VERIFICATION_TONE[profile.verification_status]} />
          </View>
        </View>

        <View className="mt-6 gap-2">
          <Pressable onPress={() => router.push("/(tabs)/profile/edit")} className="rounded-xl border border-border bg-card px-4 py-3">
            <Text className="text-sm text-text">{t("profile.editProfile")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/profile/bookings")} className="rounded-xl border border-border bg-card px-4 py-3">
            <Text className="text-sm text-text">{t("profile.myBookings")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/profile/notifications")} className="rounded-xl border border-border bg-card px-4 py-3">
            <Text className="text-sm text-text">{t("profile.notifications")}</Text>
          </Pressable>
          {profile.verification_status !== "approved" ? (
            <Pressable onPress={() => router.push("/(auth)/verify-id")} className="rounded-xl border border-border bg-card px-4 py-3">
              <Text className="text-sm text-text">{t("profile.verification")}</Text>
            </Pressable>
          ) : null}
        </View>

        <Text className="mb-2 mt-6 text-sm font-semibold text-text">{t("profile.language")}</Text>
        <LanguageSelector />

        <View className="mt-8">
          <Button label={t("profile.logout")} variant="outline" onPress={confirmLogout} loading={logout.isPending} />
        </View>
      </ScrollView>
    </Screen>
  );
}
