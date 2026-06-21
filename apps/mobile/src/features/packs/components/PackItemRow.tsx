import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { PackSvgIcon } from '@/features/packs/components/PackSvgIcon';
import type { PackItem } from '@/features/packs/services/packs.service';

interface PackItemRowProps {
  item: PackItem;
}

export function PackItemRow({ item }: PackItemRowProps) {
  return (
    <View className="flex-row items-center py-2">
      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <PackSvgIcon color="#1E3A8A" size={22} />
        )}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-text">{item.label}</Text>
        <Text className="text-xs text-textLight">{item.quantity}</Text>
      </View>
    </View>
  );
}
