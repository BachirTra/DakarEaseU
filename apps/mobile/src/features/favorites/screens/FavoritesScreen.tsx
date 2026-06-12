import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/shared/ui/Screen";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTranslation } from "@/hooks/useTranslation";
import { useFavoriteListings, useToggleFavorite } from "@/features/favorites/hooks/useFavorites";
import { ListingCard } from "@/features/housing/components/ListingCard";
import type { ListingSummary } from "@/features/housing/types/housing.types";

export function FavoritesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: listings } = useFavoriteListings();
  const toggleFavorite = useToggleFavorite();

  const summaries: ListingSummary[] = (listings ?? []).map((row: NonNullable<typeof listings>[number]) => {
    const sortedMedia = [...(row.listing_media ?? [])].sort((a, b) => a.position - b.position);
    return { ...row, cover_media: sortedMedia[0] ?? null };
  });

  if (summaries.length === 0) {
    return (
      <Screen>
        <Text className="mb-3 mt-2 text-xl font-bold text-text">{t("favorites.title")}</Text>
        <EmptyState icon="🤍" title={t("favorites.empty")} description={t("favorites.emptyBody")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t("favorites.title")}</Text>
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            isFavorite
            onToggleFavorite={() => toggleFavorite.mutate({ entityType: "listing", entityId: item.id })}
            onPress={() => router.push({ pathname: "/(tabs)/home/listing/[id]", params: { id: item.id } })}
          />
        )}
      />
    </Screen>
  );
}
