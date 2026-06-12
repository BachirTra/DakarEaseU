import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useEvents } from '@/features/news/hooks/useEvents';
import type { EventCategory } from '@dakareaseu/types';

const TABS: { id: EventCategory | 'all'; labelKey: string }[] = [
  { id: 'all', labelKey: 'news.tabAll' },
  { id: 'concert', labelKey: 'news.tabConcert' },
  { id: 'festival', labelKey: 'news.tabFestival' },
  { id: 'conference', labelKey: 'news.tabConference' },
  { id: 'sport', labelKey: 'news.tabSport' },
];

export function NewsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<EventCategory | 'all'>('all');
  const { data: events, isLoading } = useEvents(tab);

  const featured = events?.[0];
  const rest = events?.slice(1) ?? [];

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('news.title')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {TABS.map((opt) => {
            const active = tab === opt.id;
            return (
              <View
                key={opt.id}
                className={`rounded-full border px-3.5 py-2 ${active ? 'border-primary bg-primary' : 'border-border bg-card'}`}
                onTouchEnd={() => setTab(opt.id)}
              >
                <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-text'}`}>
                  {t(opt.labelKey)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {isLoading ? null : !events || events.length === 0 ? (
        <EmptyState icon="📰" title={t('search.noResults')} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {featured ? (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/(tabs)/news/event/[id]', params: { id: featured.id } })
              }
              className="mb-4 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <View className="h-44 w-full bg-border">
                {featured.cover_image_url ? (
                  <Image
                    source={{ uri: featured.cover_image_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="p-3">
                <Text className="text-base font-bold text-text">{featured.title}</Text>
                <Text className="mt-1 text-xs text-textLight">
                  {new Date(featured.event_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  {featured.venue ? ` · ${featured.venue}` : ''}
                </Text>
              </View>
            </Pressable>
          ) : null}

          {rest.map((event: NonNullable<typeof events>[number]) => (
            <Pressable
              key={event.id}
              onPress={() =>
                router.push({ pathname: '/(tabs)/news/event/[id]', params: { id: event.id } })
              }
              className="mb-3 flex-row items-center overflow-hidden rounded-2xl border border-border bg-card p-2"
            >
              <View className="h-16 w-16 overflow-hidden rounded-xl bg-border">
                {event.cover_image_url ? (
                  <Image
                    source={{ uri: event.cover_image_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="ml-3 flex-1">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {event.title}
                </Text>
                <Text className="text-xs text-textLight">
                  {new Date(event.event_date).toLocaleDateString('fr-FR')}
                  {event.venue ? ` · ${event.venue}` : ''}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
