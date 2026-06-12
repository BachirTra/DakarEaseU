import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as favoritesService from '@/features/favorites/services/favorites.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { Favorite, FavoriteEntityType } from '@dakareaseu/types';

export function useFavorites() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['favorites', 'list', userId],
    queryFn: () => favoritesService.fetchFavorites(userId as string),
    enabled: Boolean(userId),
  });
}

export function useToggleFavorite() {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();

  return useMutation({
    mutationFn: async (params: { entityType: FavoriteEntityType; entityId: string }) => {
      if (!userId) throw new Error('Utilisateur non authentifié');
      const exists = favorites?.some(
        (f: Favorite) => f.entity_type === params.entityType && f.entity_id === params.entityId,
      );
      if (exists) {
        await favoritesService.removeFavorite({ userId, ...params });
      } else {
        await favoritesService.addFavorite({ userId, ...params });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'list', userId] });
    },
  });
}

export function useFavoriteListings() {
  const { data: favorites } = useFavorites();
  const listingIds = (favorites ?? [])
    .filter((f: Favorite) => f.entity_type === 'listing')
    .map((f: Favorite) => f.entity_id);

  return useQuery({
    queryKey: ['favorites', 'listings', listingIds],
    queryFn: () => favoritesService.fetchFavoriteListings(listingIds),
    enabled: listingIds.length > 0,
  });
}
