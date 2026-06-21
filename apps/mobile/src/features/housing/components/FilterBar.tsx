import { Pressable, ScrollView, Text } from 'react-native';
import { COLORS } from '@/constants/colors';
import type { ListingFilters } from '@/features/housing/types/housing.types';
import type { ListingType } from '@dakareaseu/types';

const TYPES: { id: ListingType | 'any'; label: string }[] = [
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

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginRight: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? COLORS.primary : COLORS.border,
        backgroundColor: active ? COLORS.primary : COLORS.card,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: active ? '#FFFFFF' : COLORS.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 4, alignItems: 'center' }}
      style={{ flexGrow: 0, marginBottom: 8 }}
    >
      {TYPES.map((opt) => (
        <Chip
          key={opt.id}
          label={opt.label}
          active={(filters.type ?? 'any') === opt.id}
          onPress={() => onChange({ ...filters, type: opt.id === 'any' ? undefined : opt.id })}
        />
      ))}
      <Chip
        label="Colocation"
        active={Boolean(filters.colocationOnly)}
        onPress={() => onChange({ ...filters, colocationOnly: !filters.colocationOnly })}
      />
      <Chip
        label="Meublé"
        active={Boolean(filters.furnished)}
        onPress={() => onChange({ ...filters, furnished: filters.furnished ? undefined : true })}
      />
    </ScrollView>
  );
}
