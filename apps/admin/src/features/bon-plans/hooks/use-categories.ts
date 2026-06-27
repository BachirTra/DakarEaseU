'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCategory, deleteCategory, fetchCategories } from '../services/categories.service';

export function useCategories() {
  return useQuery({ queryKey: ['bon-plan-categories'], queryFn: fetchCategories });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      toast.success('Catégorie créée.');
      queryClient.invalidateQueries({ queryKey: ['bon-plan-categories'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Catégorie supprimée.');
      queryClient.invalidateQueries({ queryKey: ['bon-plan-categories'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
