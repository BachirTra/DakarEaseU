import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useUiStore } from '@/shared/store/uiStore';
import type { ListingMedia } from '@dakareaseu/types';

const KIND_LABEL: Partial<Record<ListingMedia['media_type'], string>> = {
  video: '▶ Vidéo',
  tour_3d: '360° Visite 3D',
};

type GalleryMedia = Pick<ListingMedia, 'id' | 'url' | 'media_type'>;

interface MediaGalleryProps {
  media: GalleryMedia[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const openMediaViewer = useUiStore((s) => s.openMediaViewer);

  // Les photo-sphères 360° sont affichées par la section "Visite virtuelle".
  const flatMedia = media.filter((m) => m.media_type !== 'pano_360');

  if (flatMedia.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
      {flatMedia.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => openMediaViewer(item.url, item.media_type)}
          className="relative mr-2 h-40 w-56 overflow-hidden rounded-xl bg-border"
        >
          <Image
            source={{ uri: item.url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          {KIND_LABEL[item.media_type] ? (
            <View className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1">
              <Text className="text-xs font-semibold text-white">
                {KIND_LABEL[item.media_type]}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}
