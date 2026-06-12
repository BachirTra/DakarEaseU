import { useMutation } from '@tanstack/react-query';
import * as reviewsService from '@/features/housing/services/reviews.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { ReviewTargetType } from '@dakareaseu/types';

export function useSubmitReview() {
  const userId = useSessionStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (params: {
      targetType: ReviewTargetType;
      targetId: string;
      rating: number;
      comment: string;
    }) => {
      if (!userId) throw new Error('Utilisateur non authentifié');
      return reviewsService.submitReview({ authorId: userId, ...params });
    },
  });
}
