import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FilterChip, FilterChipsRow } from '@/shared/ui/FilterChips';
import { useTranslation } from '@/hooks/useTranslation';
import { useBonPlanCategories, useBonPlans } from '@/features/bon-plans/hooks/useBonPlans';
import { BonPlanCard } from '@/features/bon-plans/components/BonPlanCard';

export function BonPlansScreen() {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: categories = [] } = useBonPlanCategories();
  const { data: bonPlans = [], isLoading } = useBonPlans(selectedCategoryId);

  const featured = bonPlans.find((bp) => bp.is_featured) ?? bonPlans[0];
  const rest = featured ? bonPlans.filter((bp) => bp.id !== featured.id) : bonPlans;

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('bonPlans.title')}</Text>

      <View className="mb-3">
        <FilterChipsRow>
          <FilterChip
            label={t('bonPlans.tabAll')}
            active={selectedCategoryId === null}
            onPress={() => setSelectedCategoryId(null)}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              active={selectedCategoryId === cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
            />
          ))}
        </FilterChipsRow>
      </View>

      {isLoading ? null : !bonPlans || bonPlans.length === 0 ? (
        <EmptyState icon="search" title={t('search.noResults')} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {featured ? (
            <BonPlanCard
              id={featured.id}
              title={featured.title}
              coverImageUrl={featured.cover_image_url}
              categoryName={(featured as any).category?.name ?? null}
              priceMin={featured.price_min}
              featured
            />
          ) : null}
          {rest.map((bp) => (
            <BonPlanCard
              key={bp.id}
              id={bp.id}
              title={bp.title}
              coverImageUrl={bp.cover_image_url}
              categoryName={(bp as any).category?.name ?? null}
              priceMin={bp.price_min}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
