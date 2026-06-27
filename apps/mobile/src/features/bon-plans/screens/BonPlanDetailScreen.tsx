import { Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import { useBonPlanDetail } from '@/features/bon-plans/hooks/useBonPlans';
import { FavoriteButton } from '@/features/bon-plans/components/FavoriteButton';
import { openMapsDirections } from '@/lib/geo';
import { fetchWhatsAppNumber } from '@/features/packs/services/packs.service';

export function BonPlanDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bonPlan, isLoading } = useBonPlanDetail(id);

  if (isLoading || !bonPlan) return null;

  const images = ((bonPlan as any).media ?? []).filter((m: any) => m.type === 'image');
  const videos = ((bonPlan as any).media ?? []).filter(
    (m: any) => m.type === 'video_url' || m.type === 'video_upload',
  );

  async function handleContact() {
    try {
      const whatsappNumber = await fetchWhatsAppNumber();
      const message = `Bonjour ! Je souhaite avoir plus d'informations sur "${bonPlan!.title}" (DakarEaseU).`;
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    } catch {
      // fallback silencieux
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Image principale */}
        <View className="relative">
          <View className="h-52 w-full overflow-hidden rounded-2xl bg-border">
            {bonPlan.cover_image_url ? (
              <Image
                source={{ uri: bonPlan.cover_image_url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : null}
          </View>
          <View className="absolute right-3 top-3">
            <FavoriteButton bonPlanId={bonPlan.id} />
          </View>
        </View>

        {/* Images secondaires */}
        {images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {images.map((img: any) => (
                <View key={img.id} className="h-20 w-28 overflow-hidden rounded-xl bg-border">
                  <Image
                    source={{ uri: img.url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : null}

        {/* Infos principales */}
        <View className="mt-4">
          {(bonPlan as any).category?.name ? (
            <Text className="mb-1 text-xs font-semibold uppercase text-primary">
              {(bonPlan as any).category.name}
            </Text>
          ) : null}
          <Text className="text-2xl font-bold text-text">{bonPlan.title}</Text>
          <Text className="mt-1 text-lg font-semibold text-secondary">
            {bonPlan.price_min > 0
              ? `Dès ${bonPlan.price_min.toLocaleString('fr-FR')} FCFA`
              : 'Gratuit'}
          </Text>
          {bonPlan.address ? (
            <View className="mt-2 flex-row items-center gap-1">
              <Icon name="map-pin" size={14} color={COLORS.textLight} />
              <Text className="text-sm text-textLight">{bonPlan.address}</Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {bonPlan.description ? (
          <Text className="mt-4 text-sm leading-6 text-text">{bonPlan.description}</Text>
        ) : null}

        {/* Astuce */}
        {bonPlan.astuce ? (
          <View className="mt-4 rounded-xl bg-accent/10 p-3">
            <Text className="mb-1 text-xs font-bold uppercase text-accent">
              {t('bonPlans.astuce')}
            </Text>
            <Text className="text-sm leading-5 text-text">{bonPlan.astuce}</Text>
          </View>
        ) : null}

        {/* Vidéos (liens) */}
        {videos.length > 0 ? (
          <View className="mt-4 gap-2">
            {videos.map((vid: any) => (
              <Button
                key={vid.id}
                label={t('bonPlans.watchVideo')}
                variant="outline"
                leftIcon={<Icon name="play-circle" size={16} color={COLORS.primary} />}
                onPress={() => Linking.openURL(vid.url)}
              />
            ))}
          </View>
        ) : null}

        {/* Actions */}
        <View className="mt-6 gap-2">
          {bonPlan.latitude != null && bonPlan.longitude != null ? (
            <Button
              label={t('bonPlans.goThere')}
              leftIcon={<Icon name="map-pin" size={16} color="white" />}
              onPress={() =>
                openMapsDirections(bonPlan.latitude!, bonPlan.longitude!, bonPlan.title)
              }
            />
          ) : null}
          <Button
            label={t('bonPlans.contact')}
            variant="outline"
            leftIcon={<Icon name="message-circle" size={16} color={COLORS.primary} />}
            onPress={handleContact}
          />
          {bonPlan.website_url ? (
            <Button
              label={t('bonPlans.website')}
              variant="outline"
              leftIcon={<Icon name="globe" size={16} color={COLORS.primary} />}
              onPress={() => Linking.openURL(bonPlan.website_url!)}
            />
          ) : null}
          {bonPlan.phone ? (
            <Button
              label={bonPlan.phone}
              variant="outline"
              leftIcon={<Icon name="phone" size={16} color={COLORS.primary} />}
              onPress={() => Linking.openURL(`tel:${bonPlan.phone}`)}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
