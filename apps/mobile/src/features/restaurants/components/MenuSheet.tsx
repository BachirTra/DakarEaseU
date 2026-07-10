import { Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image_url?: string | null;
}

interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  whatsapp: string | null;
  phone: string | null;
}

export function MenuSheet({ visible, onClose, items, whatsapp, phone }: MenuSheetProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="max-h-[70%] rounded-t-3xl bg-card p-4">
        <View className="mb-3 self-center h-1.5 w-12 rounded-full bg-border" />
        <Text className="mb-3 text-lg font-bold text-text">{t('restaurants.menu')}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <Text className="py-6 text-center text-sm text-textLight">{t('restaurants.noMenu')}</Text>
          ) : (
            items.map((item) => (
              <View
                key={item.id}
                className="mb-2 flex-row items-center gap-3 rounded-xl border border-border bg-bg p-3"
              >
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={{ width: 48, height: 48, borderRadius: 8 }}
                    contentFit="cover"
                  />
                ) : null}
                <Text className="flex-1 text-sm text-text">{item.name}</Text>
                <Text className="text-sm font-semibold text-primary">
                  {item.price.toLocaleString('fr-FR')} {item.currency}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
        <View className="mt-3 flex-row gap-2">
          {whatsapp ? (
            <Button
              label={t('restaurants.orderCta')}
              onPress={() => Linking.openURL(`https://wa.me/${whatsapp}`)}
            />
          ) : null}
          {phone ? (
            <Button
              label={t('common.call')}
              variant="outline"
              onPress={() => Linking.openURL(`tel:${phone}`)}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
