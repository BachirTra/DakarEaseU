import { Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ResizeMode, Video } from 'expo-av';
import { useUiStore } from '@/shared/store/uiStore';
import { PanoramaViewer } from '@/shared/ui/PanoramaViewer';

export type MediaKind = 'photo' | 'video' | 'tour_3d' | 'pano_360';

/**
 * Visualiseur média plein écran. Monté une fois à la racine de l'app, il lit
 * `activeMediaViewer` du uiStore et rend le bon visualiseur selon le type :
 * photo, vidéo (expo-av), ou photo-sphère 360° (PanoramaViewer).
 */
export function MediaViewerOverlay() {
  const active = useUiStore((s) => s.activeMediaViewer);
  const close = useUiStore((s) => s.closeMediaViewer);

  const visible = active != null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {active?.kind === 'photo' ? (
          <Image
            source={{ uri: active.uri }}
            style={{ flex: 1 }}
            contentFit="contain"
          />
        ) : null}

        {active?.kind === 'video' ? (
          <Video
            source={{ uri: active.uri }}
            style={{ flex: 1 }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
        ) : null}

        {active?.kind === 'pano_360' ? <PanoramaViewer url={active.uri} /> : null}

        {active?.kind === 'tour_3d' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
              Ce format de visite n&apos;est pas encore pris en charge dans l&apos;application.
            </Text>
          </View>
        ) : null}

        {/* En-tête : titre (nom de pièce) + bouton fermer */}
        <View
          style={{
            position: 'absolute',
            top: 48,
            left: 16,
            right: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          pointerEvents="box-none"
        >
          {active?.title ? (
            <View style={{ backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13 }}>
                {active.title}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.55)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 20, lineHeight: 22 }}>✕</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
