import { ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { usePackDetail, useOrderPack } from '@/features/packs/hooks/usePacks';
import { PackItemRow } from '@/features/packs/components/PackItemRow';
import { PackSvgIcon } from '@/features/packs/components/PackSvgIcon';

interface PackDetailScreenProps {
  id: string;
}

export function PackDetailScreen({ id }: PackDetailScreenProps) {
  const { t } = useTranslation();
  const profile = useSessionStore((s) => s.profile);
  const { data: pack, isLoading, isError } = usePackDetail(id);
  const orderPack = useOrderPack();

  if (isLoading) {
    return (
      <Screen>
        <Text className="mt-6 text-center text-sm text-textLight">{t('common.loading')}</Text>
      </Screen>
    );
  }

  if (isError || !pack) {
    return (
      <Screen>
        <EmptyState title={t('common.error')} />
      </Screen>
    );
  }

  const handleOrder = () => {
    if (!profile) return;
    orderPack.mutate({
      packId: pack.id,
      userId: profile.id,
      whatsappSnapshot: profile.phone ?? '',
      packName: pack.name,
      price: pack.price,
    });
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="h-52 w-full overflow-hidden rounded-2xl bg-primary/10">
          {pack.cover_image_url ? (
            <Image
              source={{ uri: pack.cover_image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-primary">
              <PackSvgIcon color="#FFFFFF" size={56} />
            </View>
          )}
        </View>

        <Text className="mt-4 text-2xl font-bold text-text">{pack.name}</Text>
        <Text className="mt-1 text-xl font-bold text-accent">
          {pack.price.toLocaleString('fr-FR')} FCFA
        </Text>

        {pack.description ? (
          <Text className="mt-3 text-sm leading-5 text-textLight">{pack.description}</Text>
        ) : null}

        <Text className="mb-1 mt-6 text-base font-bold text-text">{t('packs.contents')}</Text>
        <View>
          {pack.pack_items.map((item) => (
            <PackItemRow key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      <View className="py-3">
        <Button
          label={t('packs.orderCta')}
          onPress={handleOrder}
          loading={orderPack.isPending}
          disabled={!profile}
        />
      </View>
    </Screen>
  );
}
