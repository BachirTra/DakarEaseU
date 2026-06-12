import { Pressable, Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="mb-3 mt-6 flex-row items-end justify-between">
      <View className="flex-1 pr-3">
        <Text numberOfLines={1} className="text-base font-bold text-text">{title}</Text>
        {subtitle ? (
          <Text numberOfLines={1} className="mt-0.5 text-xs text-textLight">{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text className="text-xs font-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
