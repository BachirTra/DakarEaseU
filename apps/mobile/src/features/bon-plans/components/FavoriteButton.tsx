import { Pressable } from 'react-native';
import { Icon } from '@/shared/ui/Icon';
import { COLORS } from '@/constants/colors';
import { useToggleFavorite, useUserFavoriteIds } from '@/features/bon-plans/hooks/useBonPlans';

interface FavoriteButtonProps {
  bonPlanId: string;
}

export function FavoriteButton({ bonPlanId }: FavoriteButtonProps) {
  const { data: favoriteIds = [] } = useUserFavoriteIds();
  const toggle = useToggleFavorite(bonPlanId);
  const isFavorite = favoriteIds.includes(bonPlanId);

  return (
    <Pressable
      onPress={() => toggle.mutate()}
      disabled={toggle.isPending}
      className="rounded-full bg-white/80 p-2"
    >
      <Icon
        name={isFavorite ? 'heart-filled' : 'heart'}
        size={22}
        color={isFavorite ? COLORS.danger : COLORS.textLight}
      />
    </Pressable>
  );
}
