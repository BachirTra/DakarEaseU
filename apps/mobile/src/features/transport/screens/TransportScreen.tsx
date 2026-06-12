import { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { Screen } from "@/shared/ui/Screen";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTranslation } from "@/hooks/useTranslation";
import { TRANSPORT_CATEGORIES } from "@/constants/categories";
import { useTransportProviders } from "@/features/transport/hooks/useTransportProviders";
import type { TransportCategoryId } from "@/constants/categories";

export function TransportScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<TransportCategoryId | "all">("all");
  const { data: providers, isLoading } = useTransportProviders(category);

  return (
    <Screen>
      <Text className="mb-1 mt-2 text-xl font-bold text-text">{t("transport.title")}</Text>
      <Text className="mb-3 text-sm text-textLight">{t("transport.subtitle")}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          <View
            className={`rounded-full border px-3.5 py-2 ${category === "all" ? "border-primary bg-primary" : "border-border bg-card"}`}
            onTouchEnd={() => setCategory("all")}
          >
            <Text className={`text-xs font-semibold ${category === "all" ? "text-white" : "text-text"}`}>Tous</Text>
          </View>
          {TRANSPORT_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <View
                key={cat.id}
                className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${active ? "border-primary bg-primary" : "border-border bg-card"}`}
                onTouchEnd={() => setCategory(cat.id as TransportCategoryId)}
              >
                <Text>{cat.icon}</Text>
                <Text className={`text-xs font-semibold ${active ? "text-white" : "text-text"}`}>{t(cat.labelKey)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {isLoading ? null : !providers || providers.length === 0 ? (
        <EmptyState icon="🚖" title={t("search.noResults")} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {providers.map((p: NonNullable<typeof providers>[number]) => (
            <View key={p.id} className="mb-3 rounded-2xl border border-border bg-card p-3">
              <Text className="text-sm font-semibold text-text">{p.name}</Text>
              {(p.eta_label ?? p.price_label) ? (
                <Text className="mt-0.5 text-xs text-textLight">
                  {[p.eta_label, p.price_label].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
              <View className="mt-3 flex-row gap-2">
                {p.whatsapp ? (
                  <Button label={t("common.whatsapp")} fullWidth={false} onPress={() => Linking.openURL(`https://wa.me/${p.whatsapp}`)} />
                ) : null}
                {p.phone ? (
                  <Button label={t("common.call")} variant="outline" fullWidth={false} onPress={() => Linking.openURL(`tel:${p.phone}`)} />
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
