import { ScrollView, Text, View } from "react-native";
import type { ListingFilters } from "@/features/housing/types/housing.types";
import type { ListingType } from "@dakareaseu/types";

const TYPES: { id: ListingType | "any"; label: string }[] = [
  { id: "any", label: "Tous" },
  { id: "studio", label: "Studio" },
  { id: "chambre", label: "Chambre" },
  { id: "appartement", label: "Appartement" },
  { id: "maison", label: "Maison" },
];

interface FilterBarProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
      <View className="flex-row gap-2">
        {TYPES.map((opt) => {
          const active = (filters.type ?? "any") === opt.id;
          return (
            <View
              key={opt.id}
              className={`rounded-full border px-3.5 py-2 ${active ? "border-primary bg-primary" : "border-border bg-card"}`}
              onTouchEnd={() => onChange({ ...filters, type: opt.id === "any" ? undefined : opt.id })}
            >
              <Text className={`text-xs font-semibold ${active ? "text-white" : "text-text"}`}>{opt.label}</Text>
            </View>
          );
        })}
        <View
          className={`rounded-full border px-3.5 py-2 ${filters.colocationOnly ? "border-primary bg-primary" : "border-border bg-card"}`}
          onTouchEnd={() => onChange({ ...filters, colocationOnly: !filters.colocationOnly })}
        >
          <Text className={`text-xs font-semibold ${filters.colocationOnly ? "text-white" : "text-text"}`}>Colocation</Text>
        </View>
        <View
          className={`rounded-full border px-3.5 py-2 ${filters.furnished ? "border-primary bg-primary" : "border-border bg-card"}`}
          onTouchEnd={() => onChange({ ...filters, furnished: filters.furnished ? undefined : true })}
        >
          <Text className={`text-xs font-semibold ${filters.furnished ? "text-white" : "text-text"}`}>Meublé</Text>
        </View>
      </View>
    </ScrollView>
  );
}
