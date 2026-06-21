import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import {
  TRANSPORT_APPS,
  TRANSPORT_CATEGORIES,
  openTransportApp,
  type TransportAppCategory,
} from '@/constants/transportApps';

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? COLORS.primary : COLORS.border,
        backgroundColor: active ? COLORS.primary : COLORS.card,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: active ? '#FFFFFF' : COLORS.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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

      {/* Catégorie filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4, alignItems: 'center' }}
        style={{ flexGrow: 0, marginBottom: 12 }}
      >
        <Chip label="Tous" active={category === 'all'} onPress={() => setCategory('all')} />
        {TRANSPORT_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={t(`transport.cat.${cat}`)}
            active={category === cat}
            onPress={() => setCategory(cat)}
          />
        ))}
      </ScrollView>

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
                    <Text
                      style={{ fontSize: 10, fontWeight: '600', color: COLORS.primary }}
                    >
                      {t(`transport.cat.${c}`)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA compact */}
            <Pressable
              onPress={() => openTransportApp(app)}
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
