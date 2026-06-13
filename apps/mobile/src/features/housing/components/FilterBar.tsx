import { Pressable, ScrollView, Text, View } from 'react-native';
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

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 0, alignItems: 'center' }}
      style={{ flexGrow: 0, marginBottom: 8 }}
    >
      {TYPES.map((opt) => {
        const active = (filters.type ?? 'any') === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange({ ...filters, type: opt.id === 'any' ? undefined : opt.id })}
            style={{ marginRight: 8 }}
            className={`rounded-full border px-3.5 py-2 ${active ? 'border-primary bg-primary' : 'border-border bg-card'}`}
          >
            <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-text'}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => onChange({ ...filters, colocationOnly: !filters.colocationOnly })}
        style={{ marginRight: 8 }}
        className={`rounded-full border px-3.5 py-2 ${filters.colocationOnly ? 'border-primary bg-primary' : 'border-border bg-card'}`}
      >
        <Text
          className={`text-xs font-semibold ${filters.colocationOnly ? 'text-white' : 'text-text'}`}
        >
          Colocation
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange({ ...filters, furnished: filters.furnished ? undefined : true })}
        className={`rounded-full border px-3.5 py-2 ${filters.furnished ? 'border-primary bg-primary' : 'border-border bg-card'}`}
      >
        <Text className={`text-xs font-semibold ${filters.furnished ? 'text-white' : 'text-text'}`}>
          Meublé
        </Text>
      </Pressable>
    </ScrollView>
  );
}
