import { Pressable, ScrollView, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

export interface FilterChipOption {
  id: string;
  label: string;
}

/** A single pill. Use directly when you need mixed selection logic in a row. */
export function FilterChip({
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
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
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
          fontSize: 13,
          fontWeight: '600',
          color: active ? '#FFFFFF' : COLORS.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface FilterChipsRowProps {
  /** Render arbitrary chips (mix of single-select + toggles). */
  children: React.ReactNode;
}

/**
 * Horizontally scrollable chip rail.
 *
 * Adds a deliberate right "peek" so a partial chip is always visible when the
 * row overflows — signalling there is more to scroll. Fixes the previous bars
 * where off-screen chips (e.g. "Colocation", "Meublé") were silently hidden.
 */
export function FilterChipsRow({ children }: FilterChipsRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 4, paddingRight: 28, alignItems: 'center' }}
      style={{ flexGrow: 0 }}
    >
      {children}
    </ScrollView>
  );
}

interface SingleSelectChipsProps {
  options: FilterChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Convenience wrapper for a mutually-exclusive single-select chip rail. */
export function SingleSelectChips({ options, selectedId, onSelect }: SingleSelectChipsProps) {
  return (
    <FilterChipsRow>
      {options.map((opt) => (
        <FilterChip
          key={opt.id}
          label={opt.label}
          active={selectedId === opt.id}
          onPress={() => onSelect(opt.id)}
        />
      ))}
    </FilterChipsRow>
  );
}

/** Small section label shown above a chip rail (e.g. "Type de bien"). */
export function FilterGroupLabel({ children }: { children: React.ReactNode }) {
  return <Text className="mb-1.5 text-xs font-semibold uppercase text-textLight">{children}</Text>;
}
