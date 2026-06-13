import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useUiStore } from '@/shared/store/uiStore';
import type { ListingMedia } from '@dakareaseu/types';

type Panorama = Pick<ListingMedia, 'id' | 'url' | 'room_label'>;

interface PanoramaTourSectionProps {
  panoramas: Panorama[];
  title: string;
}

/**
 * Visite virtuelle 360° — Niveau 2 : une photo-sphère par pièce, présentée
 * comme une galerie. Le client choisit une pièce et la balaye à 360° en plein
 * écran (MediaViewerOverlay → PanoramaViewer).
 */
export function PanoramaTourSection({ panoramas, title }: PanoramaTourSectionProps) {
  const openMediaViewer = useUiStore((s) => s.openMediaViewer);

  if (panoramas.length === 0) return null;

  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-center">
        <Text className="text-base font-bold text-text">{title}</Text>
        <View className="ml-2 rounded-full bg-primary/10 px-2 py-0.5">
          <Text className="text-xs font-semibold text-primary">360°</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {panoramas.map((pano, index) => {
          const label = pano.room_label ?? `Pièce ${index + 1}`;
          return (
            <Pressable
              key={pano.id}
              onPress={() => openMediaViewer(pano.url, 'pano_360', label)}
              className="relative mr-3 h-40 w-60 overflow-hidden rounded-2xl bg-border"
            >
              <Image
                source={{ uri: pano.url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              {/* Voile sombre pour la lisibilité du label */}
              <View className="absolute inset-0 bg-black/15" />
              <View className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">↻ 360°</Text>
              </View>
              <View className="absolute bottom-0 left-0 right-0 bg-black/55 px-3 py-2">
                <Text numberOfLines={1} className="text-sm font-semibold text-white">
                  {label}
                </Text>
                <Text className="text-[11px] text-white/80">Toucher pour explorer</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
