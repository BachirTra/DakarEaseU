import { FlatList, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Badge, type BadgeTone } from '@/shared/ui/Badge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyGuidedSearchRequests } from '@/features/housing/hooks/useGuidedSearch';
import type { GuidedSearchStatus } from '@dakareaseu/types';

const STATUS_TONE: Record<GuidedSearchStatus, BadgeTone> = {
  open: 'warning',
  matched: 'success',
  closed: 'neutral',
};
const STATUS_LABEL_KEY: Record<GuidedSearchStatus, string> = {
  open: 'demande.statusOpen',
  matched: 'demande.statusMatched',
  closed: 'demande.statusClosed',
};

export function MyGuidedRequestsScreen() {
  const { t } = useTranslation();
  const { data: requests } = useMyGuidedSearchRequests();

  if (!requests || requests.length === 0) {
    return (
      <Screen>
        <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('demande.historyTitle')}</Text>
        <EmptyState icon="search" title={t('demande.historyEmpty')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('demande.historyTitle')}</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          const status = item.status as GuidedSearchStatus;
          const location =
            (item as { schools?: { name?: string } }).schools?.name ?? item.district ?? '—';
          return (
            <View className="rounded-xl border border-border bg-card p-3">
              <View className="flex-row items-center justify-between">
                <Text numberOfLines={1} className="flex-1 pr-2 text-sm font-semibold text-text">
                  {item.housing_type}
                </Text>
                <Badge label={t(STATUS_LABEL_KEY[status])} tone={STATUS_TONE[status]} />
              </View>
              <Text className="mt-1 text-xs text-textLight">
                {location} · {Number(item.budget).toLocaleString('fr-FR')} XOF
              </Text>
            </View>
          );
        }}
      />
    </Screen>
  );
}
