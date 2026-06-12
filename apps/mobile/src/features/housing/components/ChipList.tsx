import { Text, View } from "react-native";

interface ChipListProps {
  title: string;
  items: string[];
  emptyLabel?: string;
}

export function ChipList({ title, items, emptyLabel }: ChipListProps) {
  if (items.length === 0 && !emptyLabel) return null;

  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm font-semibold text-text">{title}</Text>
      {items.length === 0 ? (
        <Text className="text-sm text-textLight">{emptyLabel}</Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {items.map((item) => (
            <View key={item} className="rounded-full border border-border bg-bg px-3 py-1.5">
              <Text className="text-xs text-text">{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
