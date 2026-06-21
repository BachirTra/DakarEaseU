import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import { useSchoolDetail } from '@/features/schools/hooks/useSchools';
import { openMapsDirections } from '@/lib/geo';

type Tab = 'info' | 'admission' | 'housing';

export function SchoolDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: school, isLoading } = useSchoolDetail(id);
  const [tab, setTab] = useState<Tab>('info');

  if (isLoading || !school) return null;

  type NearbyRow = NonNullable<typeof school>['school_nearby_listings'][number];
  type NearbyListing = NearbyRow['listings'];
  const nearbyListings = (school.school_nearby_listings ?? [])
    .map((row: NearbyRow) => row.listings)
    .filter((listing: NearbyListing): listing is NonNullable<NearbyListing> => Boolean(listing));

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="h-44 w-full overflow-hidden rounded-2xl bg-border">
          {school.cover_image_url ? (
            <Image
              source={{ uri: school.cover_image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>
        <Text className="mt-3 text-xl font-bold text-text">{school.name}</Text>
        <Text className="mt-1 text-sm text-textLight">{school.address ?? school.district}</Text>

        <View className="mt-4 flex-row gap-2">
          {(['info', 'admission', 'housing'] as Tab[]).map((id2) => (
            <View
              key={id2}
              className={`rounded-full border px-3.5 py-2 ${tab === id2 ? 'border-primary bg-primary' : 'border-border bg-card'}`}
              onTouchEnd={() => setTab(id2)}
            >
              <Text className={`text-xs font-semibold ${tab === id2 ? 'text-white' : 'text-text'}`}>
                {id2 === 'info'
                  ? t('schools.tabInfo')
                  : id2 === 'admission'
                    ? t('schools.tabAdmission')
                    : t('schools.tabHousing')}
              </Text>
            </View>
          ))}
        </View>

        {tab === 'info' ? (
          <View className="mt-4">
            <View className="gap-2">
              {school.latitude != null && school.longitude != null ? (
                <Button
                  label="Y aller"
                  leftIcon={<Icon name="map-pin" size={16} color="#FFFFFF" />}
                  onPress={() =>
                    openMapsDirections(school.latitude!, school.longitude!, school.name)
                  }
                />
              ) : null}
              {school.whatsapp ? (
                <Button
                  label={t('schools.contactWhatsapp')}
                  variant="outline"
                  onPress={() => Linking.openURL(`https://wa.me/${school.whatsapp}`)}
                />
              ) : null}
              {school.phone ? (
                <Button
                  label={t('common.call')}
                  variant="outline"
                  onPress={() => Linking.openURL(`tel:${school.phone}`)}
                />
              ) : null}
              {school.email ? (
                <Button
                  label={t('schools.contactEmail')}
                  variant="outline"
                  onPress={() => Linking.openURL(`mailto:${school.email}`)}
                />
              ) : null}
            </View>
          </View>
        ) : null}

        {tab === 'admission' ? (
          <View className="mt-4">
            <View className="gap-1 mb-3">
              {(school.admission_steps ?? []).map((step: string, i: number) => (
                <Text key={i} className="text-sm leading-5 text-text">
                  {i + 1}. {step}
                </Text>
              ))}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {(school.programs ?? []).map((program: string) => (
                <View key={program} className="rounded-full border border-border bg-bg px-3 py-1.5">
                  <Text className="text-xs text-text">{program}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {tab === 'housing' ? (
          <View className="mt-4">
            {nearbyListings.length === 0 ? (
              <EmptyState icon="home" title={t('schools.noNearbyHousing')} />
            ) : (
              nearbyListings.map((listing: NonNullable<NearbyRow['listings']>) => (
                <View
                  key={listing.id}
                  className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-card p-3"
                  onTouchEnd={() =>
                    router.push({
                      pathname: '/(tabs)/home/listing/[id]',
                      params: { id: listing.id },
                    })
                  }
                >
                  <View className="flex-1 pr-2">
                    <Text numberOfLines={1} className="text-sm font-semibold text-text">
                      {listing.title}
                    </Text>
                    <Text className="text-xs text-textLight">
                      {listing.district} · {listing.distance_label}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-primary">
                    {listing.price.toLocaleString('fr-FR')} {listing.currency}
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
