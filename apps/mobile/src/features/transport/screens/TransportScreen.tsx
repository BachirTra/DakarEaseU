import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import {
  TRANSPORT_APPS,
  TRANSPORT_CATEGORIES,
  openTransportApp,
  type TransportAppCategory,
} from '@/constants/transportApps';

export function TransportScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<TransportAppCategory | 'all'>('all');

  const apps =
    category === 'all'
      ? TRANSPORT_APPS
      : TRANSPORT_APPS.filter((a) => a.categories.includes(category));

  return (
    <Screen>
      <Text className="mb-1 mt-2 text-xl font-bold text-text">{t('transport.title')}</Text>
      <Text className="mb-3 text-sm text-textLight">{t('transport.subtitle')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setCategory('all')}
            className={`rounded-full border px-3.5 py-2 ${category === 'all' ? 'border-primary bg-primary' : 'border-border bg-card'}`}
          >
            <Text
              className={`text-xs font-semibold ${category === 'all' ? 'text-white' : 'text-text'}`}
            >
              Tous
            </Text>
          </Pressable>
          {TRANSPORT_CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`rounded-full border px-3.5 py-2 ${active ? 'border-primary bg-primary' : 'border-border bg-card'}`}
              >
                <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-text'}`}>
                  {t(`transport.cat.${cat}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {apps.map((app) => (
          <View
            key={app.id}
            className="mb-3 flex-row items-center rounded-2xl border border-border bg-card p-3"
          >
            <View className="h-14 w-14 overflow-hidden rounded-2xl border border-border bg-bg">
              <Image
                source={{ uri: app.logoUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-text">{app.name}</Text>
              <Text numberOfLines={1} className="text-xs text-textLight">
                {app.tagline}
              </Text>
              <View className="mt-1 flex-row flex-wrap gap-1">
                {app.categories.map((c) => (
                  <View key={c} className="rounded-full bg-primary/10 px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-primary">
                      {t(`transport.cat.${c}`)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Button
              label={t('transport.openApp')}
              fullWidth={false}
              onPress={() => openTransportApp(app)}
            />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
