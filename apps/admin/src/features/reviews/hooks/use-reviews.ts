'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteReview, fetchReviews, type ReviewsFilters } from '../services/reviews.service';

export function useReviews(filters: ReviewsFilters) {
  return useQuery({ queryKey: ['reviews', filters], queryFn: () => fetchReviews(filters) });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success('Avis supprimé.');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
