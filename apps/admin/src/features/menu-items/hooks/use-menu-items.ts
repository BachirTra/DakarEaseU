'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createMenuItem,
  deleteMenuItem,
  fetchMenuItems,
  updateMenuItem,
} from '../services/menu-items.service';
import type { MenuItem } from '@dakareaseu/types';
import type { MenuItemFormValues } from '../schemas/menu-item.schema';

export function useMenuItems(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: () => fetchMenuItems(restaurantId!),
    enabled: !!restaurantId,
  });
}

function useInvalidateMenuItems(restaurantId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['menu-items', restaurantId] });
}

export function useSaveMenuItem(restaurantId: string, currentCount: number, id?: string) {
  const invalidate = useInvalidateMenuItems(restaurantId);
  return useMutation<MenuItem | undefined, Error, MenuItemFormValues>({
    mutationFn: async (values) => {
      if (id) {
        await updateMenuItem(id, values);
        return undefined;
      }
      return createMenuItem(restaurantId, values, currentCount);
    },
    onSuccess: () => {
      toast.success(id ? 'Plat mis à jour.' : 'Plat ajouté.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteMenuItem(restaurantId: string) {
  const invalidate = useInvalidateMenuItems(restaurantId);
  return useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      toast.success('Plat supprimé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
