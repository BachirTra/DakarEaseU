import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import * as bonPlansService from '@/features/bon-plans/services/bon-plans.service';

export function useBonPlanCategories() {
  return useQuery({
    queryKey: ['bon-plans', 'categories'],
    queryFn: bonPlansService.fetchCategories,
  });
}

export function useBonPlans(categoryId: string | null) {
  return useQuery({
    queryKey: ['bon-plans', 'list', categoryId],
    queryFn: () => bonPlansService.fetchBonPlans(categoryId),
  });
}

export function useBonPlanDetail(bonPlanId: string | undefined) {
  return useQuery({
    queryKey: ['bon-plans', 'detail', bonPlanId],
    queryFn: () => bonPlansService.fetchBonPlanDetail(bonPlanId!),
    enabled: Boolean(bonPlanId),
  });
}

export function useUserFavoriteIds() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['bon-plans', 'favorites', userId],
    queryFn: () => bonPlansService.fetchUserFavoriteIds(userId!),
    enabled: Boolean(userId),
    initialData: [] as string[],
  });
}

export function useToggleFavorite(bonPlanId: string) {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { data: favoriteIds = [] } = useUserFavoriteIds();
  const isFavorite = favoriteIds.includes(bonPlanId);

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Non authentifié');
      if (isFavorite) {
        await bonPlansService.removeFavorite(userId, bonPlanId);
      } else {
        await bonPlansService.addFavorite(userId, bonPlanId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bon-plans', 'favorites', userId] });
    },
  });
}
