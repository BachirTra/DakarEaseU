import { View } from 'react-native';
import {
  FilterChip,
  FilterChipsRow,
  FilterGroupLabel,
  SingleSelectChips,
} from '@/shared/ui/FilterChips';
import { useTranslation } from '@/hooks/useTranslation';
import type { ListingFilters } from '@/features/housing/types/housing.types';
import type { ListingType } from '@dakareaseu/types';

const TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: 'any', label: 'Tous' },
  { id: 'studio', label: 'Studio' },
  { id: 'chambre', label: 'Chambre' },
  { id: 'appartement', label: 'Appartement' },
  { id: 'maison', label: 'Maison' },
];

interface FilterBarProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const { t } = useTranslation();
  const selectedType = filters.type ?? 'any';

  return (
    <View className="mb-2 gap-1">
      <FilterGroupLabel>{t('search.filterTypeLabel')}</FilterGroupLabel>
      <SingleSelectChips
        options={TYPE_OPTIONS}
        selectedId={selectedType}
        onSelect={(id) =>
          onChange({ ...filters, type: id === 'any' ? undefined : (id as ListingType) })
        }
      />
      <FilterGroupLabel>{t('search.filterOptionsLabel')}</FilterGroupLabel>
      <FilterChipsRow>
        <FilterChip
          label={t('demande.colocationLabel')}
          active={Boolean(filters.colocationOnly)}
          onPress={() => onChange({ ...filters, colocationOnly: !filters.colocationOnly })}
        />
        <FilterChip
          label={t('demande.furnishedLabel')}
          active={Boolean(filters.furnished)}
          onPress={() => onChange({ ...filters, furnished: filters.furnished ? undefined : true })}
        />
      </FilterChipsRow>
    </View>
  );
}
