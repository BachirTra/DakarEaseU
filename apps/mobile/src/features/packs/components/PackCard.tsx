import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from '@/hooks/useTranslation';
import { PackSvgIcon } from '@/features/packs/components/PackSvgIcon';
import type { PackSummary } from '@/features/packs/services/packs.service';

interface PackCardProps {
  pack: PackSummary;
  onPress: () => void;
  fullWidth?: boolean;
}

export function PackCard({ pack, onPress, fullWidth = false }: PackCardProps) {
  const { t } = useTranslation();
  const itemCount = pack.pack_items?.[0]?.count ?? 0;

  return (
    <Pressable
      onPress={onPress}
      className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${fullWidth ? 'w-full' : 'mr-3 w-60'}`}
    >
      <View className="relative h-36 w-full bg-primary/10">
        {pack.cover_image_url ? (
          <Image
            source={{ uri: pack.cover_image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-primary">
            <PackSvgIcon color="#FFFFFF" size={40} />
          </View>
        )}
        <View className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1">
          <Text className="text-xs font-semibold text-primary">
            {t('packs.itemCount', { count: itemCount })}
          </Text>
        </View>
      </View>

      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-semibold text-text">
          {pack.name}
        </Text>
        <Text className="mt-1 text-base font-bold text-accent">
          {pack.price.toLocaleString('fr-FR')} FCFA
        </Text>
      </View>
    </Pressable>
  );
}
