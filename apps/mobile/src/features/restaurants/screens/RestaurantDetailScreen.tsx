import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import { useRestaurantDetail } from '@/features/restaurants/hooks/useRestaurants';
import { MenuSheet } from '@/features/restaurants/components/MenuSheet';
import { openMapsDirections } from '@/lib/geo';

export function RestaurantDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading } = useRestaurantDetail(id);
  const [menuVisible, setMenuVisible] = useState(false);

  // Keep the back affordance available even while loading so the user is never
  // trapped on a blank screen.
  if (isLoading || !restaurant) {
    return (
      <Screen>
        <ScreenHeader title={t('restaurants.title')} />
      </Screen>
    );
  }

  const media = [...(restaurant.restaurant_media ?? [])].sort((a, b) => a.position - b.position);

  return (
    <Screen>
      <ScreenHeader title={restaurant.name} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {media.map((item) => (
            <View key={item.id} className="mr-2 h-44 w-64 overflow-hidden rounded-2xl bg-border">
              <Image
                source={{ uri: item.url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
          ))}
        </ScrollView>

        <Text className="mt-3 text-xl font-bold text-text">{restaurant.name}</Text>
        <Text className="mt-1 text-sm text-textLight">
          {restaurant.cuisine_type} · {restaurant.price_range} · {restaurant.district}
        </Text>

        <Text className="mt-3 text-sm leading-5 text-text">{restaurant.description}</Text>

        <Text className="mb-2 mt-4 text-sm font-semibold text-text">
          {t('restaurants.specialties')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {(restaurant.specialties ?? []).map((s: string) => (
            <View key={s} className="rounded-full border border-border bg-bg px-3 py-1.5">
              <Text className="text-xs text-text">{s}</Text>
            </View>
          ))}
        </View>

        <View className="mt-6 gap-2">
          <Button label={t('restaurants.viewMenu')} onPress={() => setMenuVisible(true)} />
          {restaurant.latitude != null && restaurant.longitude != null ? (
            <Button
              label="Y aller"
              variant="outline"
              leftIcon={<Icon name="map-pin" size={16} color={COLORS.primary} />}
              onPress={() =>
                openMapsDirections(restaurant.latitude!, restaurant.longitude!, restaurant.name)
              }
            />
          ) : null}
          <View className="flex-row gap-2">
            {restaurant.whatsapp ? (
              <Button
                label={t('common.whatsapp')}
                variant="outline"
                onPress={() => Linking.openURL(`https://wa.me/${restaurant.whatsapp}`)}
              />
            ) : null}
            {restaurant.phone ? (
              <Button
                label={t('common.call')}
                variant="outline"
                onPress={() => Linking.openURL(`tel:${restaurant.phone}`)}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <MenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[]}
        whatsapp={restaurant.whatsapp}
        phone={restaurant.phone}
      />
    </Screen>
  );
}
