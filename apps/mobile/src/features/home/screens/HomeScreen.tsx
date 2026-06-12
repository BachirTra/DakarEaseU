import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { CATEGORIES } from '@/constants/categories';
import { PersonaGreeting, PERSONA_COPY } from '@/features/home/components/PersonaGreeting';
import { SectionHeader } from '@/features/home/components/SectionHeader';
import {
  useTopListings,
  usePartnerSchools,
  useUpcomingEvents,
  useNearbyRestaurants,
} from '@/features/home/hooks/useHomeData';
import { ListingCard } from '@/features/housing/components/ListingCard';
import { useFavorites, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import type { Favorite } from '@dakareaseu/types';
import type { ListingSummary } from '@/features/housing/types/housing.types';

function toListingSummary(
  row: NonNullable<ReturnType<typeof useTopListings>['data']>[number],
): ListingSummary {
  const sortedMedia = [...(row.listing_media ?? [])].sort((a, b) => a.position - b.position);
  return { ...row, cover_media: sortedMedia[0] ?? null };
}

export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);
  const persona = profile?.persona ?? 'local';
  const order = PERSONA_COPY[persona].priority;

  const { data: listings } = useTopListings();
  const { data: schools } = usePartnerSchools();
  const { data: events } = useUpcomingEvents();
  const { data: restaurants } = useNearbyRestaurants();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isListingFavorite = (id: string) =>
    Boolean(favorites?.some((f: Favorite) => f.entity_type === 'listing' && f.entity_id === id));

  const sectionsById: Record<string, React.ReactElement> = {
    logements: (
      <View key="logements">
        <SectionHeader
          title={t('home.topListings')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(listings ?? []).map((row: NonNullable<typeof listings>[number]) => {
            const summary = toListingSummary(row);
            return (
              <ListingCard
                key={summary.id}
                listing={summary}
                isFavorite={isListingFavorite(summary.id)}
                onToggleFavorite={() =>
                  toggleFavorite.mutate({ entityType: 'listing', entityId: summary.id })
                }
                onPress={() =>
                  router.push({ pathname: '/(tabs)/home/listing/[id]', params: { id: summary.id } })
                }
              />
            );
          })}
        </ScrollView>
      </View>
    ),
    ecoles: (
      <View key="ecoles">
        <SectionHeader
          title={t('home.topSchools')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search/schools')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(schools ?? []).map((school: NonNullable<typeof schools>[number]) => (
            <Pressable
              key={school.id}
              onPress={() =>
                router.push({ pathname: '/(tabs)/search/schools/[id]', params: { id: school.id } })
              }
              className="mr-3 w-40 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <View className="h-24 w-full bg-border">
                {school.cover_image_url ? (
                  <Image
                    source={{ uri: school.cover_image_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="p-2.5">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {school.name}
                </Text>
                <Text className="text-xs text-textLight">{school.district}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    ),
    restaurants: (
      <View key="restaurants">
        <SectionHeader
          title={t('home.restaurantsNearby')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search/restaurants')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(restaurants ?? []).map((r: NonNullable<typeof restaurants>[number]) => (
            <Pressable
              key={r.id}
              onPress={() =>
                router.push({ pathname: '/(tabs)/search/restaurants/[id]', params: { id: r.id } })
              }
              className="mr-3 w-44 overflow-hidden rounded-2xl border border-border bg-card p-3"
            >
              <Text numberOfLines={1} className="text-sm font-semibold text-text">
                {r.name}
              </Text>
              <Text className="mt-0.5 text-xs text-textLight">
                {r.cuisine_type} · {r.price_range}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    ),
    transport: (
      <View key="transport">
        <SectionHeader
          title={t('categories.transport')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search/transport')}
        />
        <Text className="text-xs text-textLight">{t('transport.subtitle')}</Text>
      </View>
    ),
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        <PersonaGreeting persona={persona} fullName={profile?.full_name ?? null} />

        <Pressable onPress={() => router.push('/(tabs)/search')}>
          <View className="flex-row items-center rounded-xl border border-border bg-card px-4 py-3">
            <Text className="mr-2 text-textLight">🔍</Text>
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#6B7280"
              className="flex-1 text-sm text-text"
            />
          </View>
        </Pressable>

        <View className="mt-5 flex-row justify-between">
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => router.push('/(tabs)/search')}
              className="items-center"
            >
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Text className="text-2xl">{cat.icon}</Text>
              </View>
              <Text className="mt-1.5 text-xs text-text">{t(cat.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/search/demande')}
          className="mt-6 overflow-hidden rounded-2xl bg-primary p-4"
        >
          <Text className="text-base font-bold text-white">{t('home.demandeBannerTitle')}</Text>
          <Text className="mt-1 text-sm text-white/80">{t('home.demandeBannerBody')}</Text>
          <Text className="mt-3 text-sm font-semibold text-white">
            {t('home.demandeBannerCta')} →
          </Text>
        </Pressable>

        {order.map((id) => sectionsById[id]).filter(Boolean)}

        <View key="news">
          <SectionHeader
            title={t('home.upcomingEvents')}
            actionLabel={t('common.seeAll')}
            onAction={() => router.push('/(tabs)/news')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(events ?? []).map((event: NonNullable<typeof events>[number]) => (
              <Pressable
                key={event.id}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/news/event/[id]', params: { id: event.id } })
                }
                className="mr-3 w-48 overflow-hidden rounded-2xl border border-border bg-card"
              >
                <View className="h-28 w-full bg-border">
                  {event.cover_image_url ? (
                    <Image
                      source={{ uri: event.cover_image_url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  ) : null}
                </View>
                <View className="p-2.5">
                  <Text numberOfLines={1} className="text-sm font-semibold text-text">
                    {event.title}
                  </Text>
                  <Text className="text-xs text-textLight">
                    {new Date(event.event_date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </Screen>
  );
}
