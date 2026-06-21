import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useSchools } from '@/features/schools/hooks/useSchools';

export function SchoolsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: schools, isLoading } = useSchools();

  if (isLoading) return null;
  if (!schools || schools.length === 0) {
    return (
      <Screen>
        <EmptyState icon="graduation-cap" title={t('schools.title')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('schools.title')}</Text>
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
    </Screen>
  );
}
