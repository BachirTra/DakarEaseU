import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import type { ListingSummary } from '@/features/housing/types/housing.types';

interface ListingCardProps {
  listing: ListingSummary;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
  fullWidth?: boolean;
}

export function ListingCard({
  listing,
  isFavorite,
  onToggleFavorite,
  onPress,
  fullWidth = false,
}: ListingCardProps) {
  const { t } = useTranslation();
  const isVerified = listing.verification_status === 'published';

  return (
    <Pressable
      onPress={onPress}
      className={`overflow-hidden rounded-2xl border border-border bg-card ${fullWidth ? 'w-full' : 'mr-3 w-60'}`}
    >
      <View className="relative h-36 w-full bg-border">
        {listing.cover_media ? (
          <Image
            source={{ uri: listing.cover_media.url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : null}
        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel="favorite-toggle"
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/90"
        >
          <Text className={isFavorite ? 'text-danger' : 'text-textLight'}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </Pressable>
        {isVerified ? (
          <View className="absolute left-2 top-2">
            <Badge label={t('listing.verified')} tone="success" />
          </View>
        ) : null}
      </View>

      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-semibold text-text">
          {listing.title}
        </Text>
        <View className="mt-0.5 flex-row">
          <Text className="text-xs text-textLight">{listing.district}</Text>
          <Text className="text-xs text-textLight"> · </Text>
          <Text className="text-xs text-textLight">{listing.distance_label}</Text>
        </View>
        <View className="mt-2 flex-row items-baseline justify-between">
          <Text className="text-base font-bold text-primary">
            {listing.price.toLocaleString('fr-FR')} {listing.currency}
            <Text className="text-xs font-normal text-textLight"> {t('common.perMonth')}</Text>
          </Text>
          <Text className="text-xs text-textLight">★ {(listing.rating ?? 0).toFixed(1)}</Text>
        </View>
        {listing.colocation_available ? (
          <View className="mt-2">
            <Badge label={t('listing.colocationAvailable')} tone="primary" />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
