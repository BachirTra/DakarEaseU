import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useListingDetail } from '@/features/housing/hooks/useListingDetail';
import type { BadgeTone } from '@/shared/ui/Badge';

function matchTone(pct: number): BadgeTone {
  if (pct >= 75) return 'success';
  if (pct >= 50) return 'warning';
  return 'neutral';
}

interface MatchCardProps {
  listingId: string;
  matchPct: number;
  reasons: string[];
}

export function MatchCard({ listingId, matchPct, reasons }: MatchCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: listing } = useListingDetail(listingId);

  const cover = listing
    ? ([...(listing.listing_media ?? [])].sort((a, b) => a.position - b.position)[0] ?? null)
    : null;

  return (
    <View className="mb-3 overflow-hidden rounded-xl border border-border bg-card">
      {cover ? (
        <Image
          source={{ uri: cover.url }}
          style={{ width: '100%', height: 140 }}
          resizeMode="cover"
        />
      ) : null}
      <View className="p-4">
        <Badge
          label={t('demande.matchScore', { pct: matchPct })}
          tone={matchTone(matchPct)}
        />

        {listing ? (
          <>
            <Text className="mt-2 text-base font-semibold text-text" numberOfLines={1}>
              {listing.title}
            </Text>
            <Text className="mt-0.5 text-xs text-textLight">
              {listing.district}
              {listing.distance_label ? ` · ${listing.distance_label}` : ''}
            </Text>
            <Text className="mt-1 text-sm font-bold text-primary">
              {listing.price.toLocaleString('fr-FR')} {listing.currency}{' '}
              {t('common.perMonth')}
            </Text>
          </>
        ) : null}

        {reasons.length > 0 ? (
          <View className="mt-2 flex-row flex-wrap gap-2">
            {reasons.map((reason) => (
              <View key={reason} className="rounded-full bg-bg px-2.5 py-1">
                <Text className="text-xs text-text">✓ {reason}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-3">
          <Button
            label={t('demande.viewListing')}
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/(tabs)/home/listing/[id]',
                params: { id: listingId },
              })
            }
          />
        </View>
      </View>
    </View>
  );
}
