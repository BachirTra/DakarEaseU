import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Icon } from '@/shared/ui/Icon';
import { SingleSelectChips } from '@/shared/ui/FilterChips';
import { SkeletonList } from '@/shared/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';

const ALL_CUISINE_ID = 'all';

export function RestaurantsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(ALL_CUISINE_ID);
  const { data: restaurants, isLoading } = useRestaurants();

  // Derive distinct cuisine options from loaded data.
  // The list query doesn't include cover_image_url, so cuisine_type is the
  // only image-adjacent field we can filter on here.
  const cuisineOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(
        (restaurants ?? [])
          .map((r) => r.cuisine_type)
          .filter((c): c is string => c !== null && c !== undefined),
      ),
    ).map((c) => ({ id: c, label: c }));
    return [{ id: ALL_CUISINE_ID, label: t('restaurants.allCuisines') }, ...distinct];
  }, [restaurants, t]);

  const filtered = (restaurants ?? []).filter((r) => {
    const matchesQuery = r.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCuisine =
      selectedCuisine === ALL_CUISINE_ID || r.cuisine_type === selectedCuisine;
    return matchesQuery && matchesCuisine;
  });

  return (
    <Screen>
      <ScreenHeader title={t('restaurants.title')} />

      <View className="mb-3 flex-row items-center rounded-xl border border-border bg-card px-4 py-3">
        <View className="mr-2">
          <Icon name="search" size={18} color={COLORS.textLight} />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('restaurants.searchPlaceholder')}
          placeholderTextColor="#6B7280"
          className="flex-1 text-sm text-text"
        />
      </View>

      {/* Cuisine filter — only shown once data is loaded */}
      {!isLoading && restaurants && restaurants.length > 0 ? (
        <View className="mb-3">
          <SingleSelectChips
            options={cuisineOptions}
            selectedId={selectedCuisine}
            onSelect={setSelectedCuisine}
          />
        </View>
      ) : null}

      {isLoading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="utensils" title={t('search.noResults')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search/restaurants/[id]',
                  params: { id: item.id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={item.name}
              className="flex-row items-center overflow-hidden rounded-2xl border border-border bg-card p-3"
            >
              {/* Placeholder thumbnail — list query only fetches id/name/cuisine_type/
                  price_range/district/rating; cover_image_url is not available here. */}
              <View className="mr-3 h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon name="utensils" size={22} color={COLORS.primary} />
              </View>

              <View className="flex-1">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {item.name}
                </Text>
                <Text className="text-xs text-textLight">
                  {item.cuisine_type} · {item.price_range} · {item.district}
                </Text>
              </View>

              {item.rating != null ? (
                <View className="flex-row items-center gap-1">
                  <Icon name="star-filled" size={12} color={COLORS.accent} />
                  <Text className="text-xs text-textLight">{item.rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
