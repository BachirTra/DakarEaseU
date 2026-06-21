import { View, Text } from 'react-native';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'search', title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Icon name={icon} size={48} color="#6B7280" />
      <Text className="mt-3 text-center text-base font-semibold text-text">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm text-textLight">{description}</Text>
      ) : null}
    </View>
  );
}
