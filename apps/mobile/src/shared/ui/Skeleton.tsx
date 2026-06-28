import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { COLORS } from '@/constants/colors';

/**
 * Shimmering placeholder block. Use to build loading skeletons that mirror the
 * shape of the content being fetched, instead of a blank screen or a bare
 * "Chargement…" line.
 *
 * Uses React Native's built-in Animated API (not reanimated) so it has no
 * native worklets dependency and runs in any client.
 */
export function Skeleton({
  width,
  height = 16,
  radius = 8,
  className = '',
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  className?: string;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={[
        { width, height, borderRadius: radius, backgroundColor: COLORS.border, opacity },
        style,
      ]}
    />
  );
}

/** A card-shaped skeleton matching the list/grid cards used across the app. */
export function SkeletonCard({ fullWidth = true }: { fullWidth?: boolean }) {
  return (
    <View
      className={`overflow-hidden rounded-2xl border border-border bg-card ${fullWidth ? 'w-full' : 'mr-3 w-60'}`}
    >
      <Skeleton width="100%" height={144} radius={0} />
      <View className="gap-2 p-3">
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="55%" height={16} />
      </View>
    </View>
  );
}

/** Vertical list of card skeletons. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
