import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { usePacks } from '@/features/packs/hooks/usePacks';
import { PackCard } from '@/features/packs/components/PackCard';

export function PacksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: packs, isLoading, isError } = usePacks();

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('packs.title')}</Text>

      {isLoading ? (
        <Text className="mt-6 text-center text-sm text-textLight">{t('common.loading')}</Text>
      ) : isError ? (
        <EmptyState title={t('common.error')} />
      ) : (packs ?? []).length === 0 ? (
        <EmptyState title={t('packs.empty')} />
      ) : (
        <FlatList
          data={packs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <PackCard
              pack={item}
              fullWidth
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search/packs/[id]',
                  params: { id: item.id },
                } as any)
              }
            />
          )}
        />
      )}
    </Screen>
  );
}
