import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/shared/ui/Screen";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTranslation } from "@/hooks/useTranslation";
import { useListings } from "@/features/housing/hooks/useListings";
import { useFavorites, useToggleFavorite } from "@/features/favorites/hooks/useFavorites";
import { ListingCard } from "@/features/housing/components/ListingCard";
import { FilterBar } from "@/features/housing/components/FilterBar";
import type { ListingFilters, ListingSummary } from "@/features/housing/types/housing.types";

export function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ListingFilters>({});

  const { data: listings, isLoading } = useListings(filters);
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = (id: string) => Boolean(favorites?.some((f) => f.entity_type === "listing" && f.entity_id === id));

  const filtered = (listings ?? [])
    .map((row) => {
      const sortedMedia = [...(row.listing_media ?? [])].sort((a, b) => a.position - b.position);
      return { ...row, cover_media: sortedMedia[0] ?? null } as ListingSummary;
    })
    .filter((l) => l.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t("search.title")}</Text>

      <View className="mb-3 flex-row items-center rounded-xl border border-border bg-card px-4 py-3">
        <Text className="mr-2 text-textLight">🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("home.searchPlaceholder")}
          placeholderTextColor="#6B7280"
          className="flex-1 text-sm text-text"
        />
      </View>

      <Pressable onPress={() => router.push("/(tabs)/search/demande")} className="mb-3 overflow-hidden rounded-2xl bg-primaryLight p-4">
        <Text className="text-base font-bold text-white">{t("search.guidedBannerTitle")}</Text>
        <Text className="mt-1 text-sm text-white/85">{t("search.guidedBannerBody")}</Text>
        <Text className="mt-3 text-sm font-semibold text-white">{t("search.guidedBannerCta")} →</Text>
      </Pressable>

      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <Text className="mt-6 text-center text-sm text-textLight">{t("common.loading")}</Text>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏠" title={t("search.noResults")} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite.mutate({ entityType: "listing", entityId: item.id })}
              onPress={() => router.push({ pathname: "/(tabs)/home/listing/[id]", params: { id: item.id } })}
            />
          )}
        />
      )}
    </Screen>
  );
}
