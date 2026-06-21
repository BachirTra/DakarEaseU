import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'bg-transparent border border-primary',
  ghost: 'bg-transparent',
};

const VARIANT_TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary',
  ghost: 'text-primary',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  leftIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      className={`${fullWidth ? 'w-full' : 'self-start'} ${VARIANT_CLASSES[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } items-center justify-center rounded-xl px-5 py-3.5`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#FFFFFF'}
        />
      ) : leftIcon ? (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={`text-base font-semibold ${VARIANT_TEXT_CLASSES[variant]}`}>
            {label}
          </Text>
        </View>
      ) : (
        <Text className={`text-base font-semibold ${VARIANT_TEXT_CLASSES[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
