import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';

export function RestaurantsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: restaurants, isLoading } = useRestaurants();

  const filtered = (restaurants ?? []).filter((r: NonNullable<typeof restaurants>[number]) =>
    r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('restaurants.title')}</Text>
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

      {isLoading ? null : filtered.length === 0 ? (
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
              className="flex-row items-center overflow-hidden rounded-2xl border border-border bg-card p-3"
            >
              <View className="ml-1 flex-1">
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
