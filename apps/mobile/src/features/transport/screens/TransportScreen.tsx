import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { SingleSelectChips } from '@/shared/ui/FilterChips';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import {
  TRANSPORT_APPS,
  TRANSPORT_CATEGORIES,
  openTransportApp,
  type TransportAppCategory,
} from '@/constants/transportApps';

export function TransportScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<TransportAppCategory | 'all'>('all');

  const categoryOptions = useMemo(
    () => [
      { id: 'all', label: t('common.all') },
      ...TRANSPORT_CATEGORIES.map((cat) => ({ id: cat, label: t(`transport.cat.${cat}`) })),
    ],
    [t],
  );

  const apps =
    category === 'all'
      ? TRANSPORT_APPS
      : TRANSPORT_APPS.filter((a) => a.categories.includes(category));

  return (
    <Screen>
      <ScreenHeader title={t('transport.title')} />
      <Text className="mb-3 text-sm text-textLight">{t('transport.subtitle')}</Text>

      {/* Category filter chips */}
      <View className="mb-3">
        <SingleSelectChips
          options={categoryOptions}
          selectedId={category}
          onSelect={(id) => setCategory(id as TransportAppCategory | 'all')}
        />
      </View>

      {/* App cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {apps.map((app) => (
          <View
            key={app.id}
            style={{
              marginBottom: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
              backgroundColor: COLORS.card,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* Logo */}
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.bg,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <Image
                source={{ uri: app.logoUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </View>

            {/* Info */}
            <View style={{ flex: 1, marginLeft: 12, marginRight: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }}>
                {app.name}
              </Text>
              <Text
                numberOfLines={1}
                style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}
              >
                {app.tagline}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {app.categories.map((c) => (
                  <View
                    key={c}
                    style={{
                      borderRadius: 999,
                      backgroundColor: COLORS.primary + '18',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.primary }}>
                      {t(`transport.cat.${c}`)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA compact */}
            <Pressable
              onPress={() => openTransportApp(app)}
              accessibilityRole="button"
              accessibilityLabel={`${t('transport.openApp')} ${app.name}`}
              style={{
                borderRadius: 10,
                backgroundColor: COLORS.primary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                {t('transport.openApp')}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
