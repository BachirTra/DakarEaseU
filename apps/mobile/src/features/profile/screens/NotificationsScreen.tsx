import { FlatList, Pressable, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from '@/features/profile/hooks/useNotifications';

const TYPE_ICON: Record<string, string> = {
  booking_status_update: '🏠',
  event_rsvp_confirmed: '🎉',
  new_guided_search_request: '🔍',
  verification_status_update: '✅',
};

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  if (!notifications || notifications.length === 0) {
    return (
      <Screen>
        <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('notifications.title')}</Text>
        <EmptyState icon="🔔" title={t('notifications.empty')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="mb-3 mt-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text">{t('notifications.title')}</Text>
        <Pressable onPress={() => markAllRead.mutate()}>
          <Text className="text-xs font-semibold text-primary">
            {t('notifications.markAllRead')}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-2" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View
            className={`flex-row items-start rounded-xl border border-border p-3 ${item.is_read ? 'bg-card' : 'bg-primary/5'}`}
          >
            <Text className="mr-3 text-xl">{TYPE_ICON[item.type] ?? '🔔'}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text">{item.title}</Text>
              <Text className="mt-0.5 text-xs text-textLight">{item.body}</Text>
              <Text className="mt-1 text-[10px] text-textLight">
                {new Date(item.created_at).toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
