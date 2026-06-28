import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SkeletonList } from '@/shared/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { usePacks } from '@/features/packs/hooks/usePacks';
import { PackCard } from '@/features/packs/components/PackCard';

export function PacksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: packs, isLoading, isError } = usePacks();

  return (
    <Screen>
      <ScreenHeader title={t('packs.title')} />

      {isLoading ? (
        <SkeletonList count={4} />
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
