import { ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useEventDetail, useMyRsvp, useSetRsvp } from '@/features/news/hooks/useEvents';
import { openMapsDirections } from '@/lib/geo';

export function EventDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEventDetail(id);
  const { data: rsvp } = useMyRsvp(id);
  const setRsvp = useSetRsvp(id ?? '');

  if (isLoading || !event) return null;

  const isConfirmed = rsvp?.status === 'confirmed';
  const isInterested = rsvp?.status === 'interested';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="h-48 w-full overflow-hidden rounded-2xl bg-border">
          {event.cover_image_url ? (
            <Image
              source={{ uri: event.cover_image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>

        <Text className="mt-3 text-xl font-bold text-text">{event.title}</Text>
        <Text className="mt-1 text-sm text-textLight">
          {new Date(event.event_date).toLocaleDateString('fr-FR', { dateStyle: 'full' })}
          {event.event_time ? ` à ${event.event_time}` : ''}
        </Text>
        {event.venue ? <Text className="mt-0.5 text-sm text-textLight">{event.venue}</Text> : null}

        {isConfirmed ? (
          <View className="mt-3">
            <Badge label={t('news.rsvpConfirmedBadge')} tone="success" />
          </View>
        ) : null}

        <Text className="mt-4 text-sm leading-5 text-text">{event.description}</Text>

        {event.partner ? (
          <Text className="mt-3 text-xs text-textLight">
            {t('news.organizer')}: {event.partner}
          </Text>
        ) : null}

        <View className="mt-6 gap-2">
          <Button
            label={isConfirmed ? t('news.rsvpConfirmedBadge') : t('news.rsvpConfirmed')}
            disabled={isConfirmed || setRsvp.isPending}
            onPress={() => setRsvp.mutate('going')}
          />
          <Button
            label={t('news.rsvpInterested')}
            variant="outline"
            disabled={isInterested || isConfirmed || setRsvp.isPending}
            onPress={() => setRsvp.mutate('interested')}
          />
          {event.latitude != null && event.longitude != null ? (
            <Button
              label="🗺️  Y aller"
              variant="outline"
              onPress={() =>
                openMapsDirections(event.latitude!, event.longitude!, event.venue ?? event.title)
              }
            />
          ) : null}
          <Button
            label={t('news.shareEvent')}
            variant="ghost"
            onPress={() =>
              Share.share({
                message: `${event.title} — ${new Date(event.event_date).toLocaleDateString('fr-FR')}${event.venue ? ` — ${event.venue}` : ''}`,
              })
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
