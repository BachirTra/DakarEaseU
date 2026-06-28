import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './Icon';
import { COLORS } from '@/constants/colors';

interface ScreenHeaderProps {
  title: string;
  /** Override the default `router.back()` behaviour. */
  onBack?: () => void;
  /** Hide the back affordance (e.g. when used on a tab root). */
  showBack?: boolean;
  /** Optional trailing slot (actions, filter button…). */
  right?: ReactNode;
}

/**
 * Lightweight in-content header with a back affordance.
 *
 * The app's stacks run with `headerShown: false`, so pushed screens have no
 * native back button. Render this at the top of any pushed screen to give the
 * user a reliable way back without relying on the swipe gesture alone.
 */
export function ScreenHeader({ title, onBack, showBack = true, right }: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View className="mb-3 mt-2 flex-row items-center">
      {showBack ? (
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={8}
          className="-ml-2 mr-1 h-9 w-9 items-center justify-center rounded-full active:bg-border/50"
        >
          <Icon name="chevron-left" size={24} color={COLORS.text} />
        </Pressable>
      ) : null}
      <Text numberOfLines={1} className="flex-1 text-xl font-bold text-text">
        {title}
      </Text>
      {right ? <View className="ml-2">{right}</View> : null}
    </View>
  );
}
