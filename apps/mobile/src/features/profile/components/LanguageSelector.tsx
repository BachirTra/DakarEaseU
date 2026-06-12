import { Pressable, Text, View } from "react-native";
import { usePreferencesStore } from "@/features/profile/store/preferencesStore";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/lib/i18n";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "fr", label: "Français" },
  { id: "wo", label: "Wolof" },
  { id: "en", label: "English" },
];

export function LanguageSelector() {
  const { t } = useTranslation();
  const locale = usePreferencesStore((s) => s.locale);
  const setLocale = usePreferencesStore((s) => s.setLocale);

  return (
    <View className="gap-2">
      {OPTIONS.map((opt) => {
        const disabled = opt.id !== "fr";
        const active = locale === opt.id;
        return (
          <Pressable
            key={opt.id}
            disabled={disabled}
            onPress={() => setLocale(opt.id)}
            className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
              active ? "border-primary bg-primary/5" : "border-border bg-card"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <Text className="text-sm text-text">{opt.label}</Text>
            {disabled ? (
              <Text className="text-xs text-textLight">{t("common.comingSoon")}</Text>
            ) : active ? (
              <Text className="text-xs font-semibold text-primary">✓</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
