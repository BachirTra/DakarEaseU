'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createRestaurant,
  deleteRestaurant,
  deleteRestaurantMedia,
  fetchRestaurantDetail,
  fetchRestaurants,
  updateRestaurant,
  uploadRestaurantMedia,
} from '../services/restaurants.service';
import type { Restaurant } from '@dakareaseu/types';
import type { RestaurantFormValues } from '../schemas/restaurant.schema';

export function useRestaurants() {
  return useQuery({ queryKey: ['restaurants'], queryFn: fetchRestaurants });
}

export function useRestaurantDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', 'detail', id],
    queryFn: () => fetchRestaurantDetail(id!),
    enabled: !!id,
  });
}

function useInvalidateRestaurant(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['restaurants', 'detail', id] });
  };
}

export function useSaveRestaurant(id?: string) {
  const invalidate = useInvalidateRestaurant(id);
  return useMutation<Restaurant | undefined, Error, RestaurantFormValues>({
    mutationFn: async (values) => {
      if (id) {
        await updateRestaurant(id, values);
        return undefined;
      }
      return createRestaurant(values);
    },
    onSuccess: () => {
      toast.success(id ? 'Restaurant mis à jour.' : 'Restaurant créé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      toast.success('Restaurant supprimé.');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadRestaurantMedia(restaurantId: string, currentCount: number) {
  const invalidate = useInvalidateRestaurant(restaurantId);
  return useMutation({
    mutationFn: (file: File) => uploadRestaurantMedia(restaurantId, file, currentCount),
    onSuccess: () => {
      toast.success('Média ajouté.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRestaurantMedia(restaurantId: string) {
  const invalidate = useInvalidateRestaurant(restaurantId);
  return useMutation({
    mutationFn: deleteRestaurantMedia,
    onSuccess: () => {
      toast.success('Média supprimé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
