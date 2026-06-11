import { Text, View } from "react-native";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "🔍", title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="mb-2 text-4xl">{icon}</Text>
      <Text className="text-center text-base font-semibold text-text">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm text-textLight">{description}</Text>
      ) : null}
    </View>
  );
}
