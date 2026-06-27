import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

interface BonPlanCardProps {
  id: string;
  title: string;
  coverImageUrl: string | null;
  categoryName: string | null;
  priceMin: number;
  featured?: boolean;
}

export function BonPlanCard({
  id,
  title,
  coverImageUrl,
  categoryName,
  priceMin,
  featured = false,
}: BonPlanCardProps) {
  const router = useRouter();

  if (featured) {
    return (
      <Pressable
        onPress={() => router.push({ pathname: '/(tabs)/bon-plans/[id]', params: { id } })}
        className="mb-4 overflow-hidden rounded-2xl border border-border bg-card"
      >
        <View className="h-44 w-full bg-border">
          {coverImageUrl ? (
            <Image
              source={{ uri: coverImageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>
        <View className="p-3">
          {categoryName ? (
            <Text className="mb-1 text-xs font-semibold uppercase text-primary">{categoryName}</Text>
          ) : null}
          <Text className="text-base font-bold text-text">{title}</Text>
          <Text className="mt-1 text-sm text-textLight">
            {priceMin > 0 ? `Dès ${priceMin.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/(tabs)/bon-plans/[id]', params: { id } })}
      className="mb-3 flex-row items-center overflow-hidden rounded-2xl border border-border bg-card p-2"
    >
      <View className="h-16 w-16 overflow-hidden rounded-xl bg-border">
        {coverImageUrl ? (
          <Image
            source={{ uri: coverImageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : null}
      </View>
      <View className="ml-3 flex-1">
        {categoryName ? (
          <Text className="text-xs font-semibold uppercase text-primary">{categoryName}</Text>
        ) : null}
        <Text numberOfLines={1} className="text-sm font-semibold text-text">
          {title}
        </Text>
        <Text className="text-xs text-textLight">
          {priceMin > 0 ? `Dès ${priceMin.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}
        </Text>
      </View>
    </Pressable>
  );
}
