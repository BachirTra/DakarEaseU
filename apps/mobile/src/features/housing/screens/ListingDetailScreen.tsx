import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useListingDetail } from '@/features/housing/hooks/useListingDetail';
import type { ListingColivingRoom } from '@dakareaseu/types';
import { MediaGallery } from '@/features/housing/components/MediaGallery';
import { ChipList } from '@/features/housing/components/ChipList';

export function ListingDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, isError } = useListingDetail(id);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#1E3A8A" size="large" />
      </Screen>
    );
  }

  if (isError || !listing) {
    return (
      <Screen>
        <EmptyState icon="🏠" title={t('common.error')} description={t('common.retry')} />
      </Screen>
    );
  }

  const isVerified = listing.verification_status === 'published';
  const media = listing.listing_media ?? [];
  const rooms = listing.listing_coliving_rooms ?? [];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MediaGallery media={media} />

        <View className="mt-4 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-bold text-text">{listing.title}</Text>
            <Text className="mt-1 text-sm text-textLight">
              {listing.district} · {listing.distance_label}
            </Text>
          </View>
          {isVerified ? <Badge label={t('listing.verified')} tone="success" /> : null}
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <Badge label={`${listing.surface_m2} m²`} tone="neutral" />
          <Badge label={`${listing.bedrooms} ${t('listing.bedrooms')}`} tone="neutral" />
          <Badge label={`${listing.bathrooms} ${t('listing.bathrooms')}`} tone="neutral" />
          <Badge
            label={listing.furnished ? t('listing.furnished') : t('listing.notFurnished')}
            tone="neutral"
          />
          <Badge
            label={`${t('listing.minDuration')}: ${listing.min_duration_months} ${t('listing.months')}`}
            tone="primary"
          />
        </View>

        <Text className="mt-4 text-sm leading-5 text-text">{listing.description}</Text>

        <ChipList title={t('listing.amenities')} items={listing.amenities ?? []} />
        <ChipList title={t('listing.particularities')} items={listing.particularities ?? []} />
        <ChipList title={t('listing.requirements')} items={listing.requirements ?? []} />

        {listing.colocation_available && rooms.length > 0 ? (
          <View className="mt-5">
            <Text className="mb-2 text-sm font-semibold text-text">{t('listing.colocation')}</Text>
            <Text className="mb-3 text-xs text-textLight">
              {t('listing.colocationPlaces', { count: rooms.length })}
            </Text>
            {rooms.map(
              (
                room: Pick<
                  ListingColivingRoom,
                  'id' | 'label' | 'price' | 'surface_m2' | 'is_available'
                >,
              ) => (
                <View
                  key={room.id}
                  className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-card p-3"
                >
                  <View>
                    <Text className="text-sm font-semibold text-text">{room.label}</Text>
                    <Text className="text-xs text-textLight">{room.surface_m2} m²</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-primary">
                      {room.price.toLocaleString('fr-FR')} {listing.currency}
                    </Text>
                    <Button
                      label={t('listing.reservePlace')}
                      variant="outline"
                      fullWidth={false}
                      disabled={!room.is_available}
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/home/booking/[listingId]',
                          params: { listingId: listing.id, roomId: room.id },
                        })
                      }
                    />
                  </View>
                </View>
              ),
            )}
          </View>
        ) : null}
      </ScrollView>

      <View className="flex-row items-center justify-between border-t border-border bg-card px-4 py-3">
        <View>
          <Text className="text-lg font-bold text-primary">
            {listing.price.toLocaleString('fr-FR')} {listing.currency}
          </Text>
          <Text className="text-xs text-textLight">{t('common.perMonth')}</Text>
        </View>
        <Button
          label={t('listing.reserve')}
          fullWidth={false}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/home/booking/[listingId]',
              params: { listingId: listing.id },
            })
          }
        />
      </View>
    </Screen>
  );
}
