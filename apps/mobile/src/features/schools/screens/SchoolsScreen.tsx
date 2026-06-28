import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SkeletonList } from '@/shared/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useSchools } from '@/features/schools/hooks/useSchools';

export function SchoolsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: schools, isLoading } = useSchools();

  return (
    <Screen>
      <ScreenHeader title={t('schools.title')} />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : !schools || schools.length === 0 ? (
        <EmptyState icon="graduation-cap" title={t('search.noResults')} />
      ) : (
        <FlatList
          data={schools}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/(tabs)/search/schools/[id]', params: { id: item.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={item.name}
              className="flex-1 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <View className="h-28 w-full bg-border">
                {item.cover_image_url ? (
                  <Image
                    source={{ uri: item.cover_image_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="p-3">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {item.name}
                </Text>
                <Text className="text-xs text-textLight">{item.district}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
