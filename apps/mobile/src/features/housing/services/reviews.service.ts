import { supabase } from '@/lib/supabase';
import type { ReviewTargetType } from '@dakareaseu/types';

export async function submitReview(params: {
  authorId: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      author_id: params.authorId,
      target_type: params.targetType,
      target_id: params.targetId,
      rating: params.rating,
      comment: params.comment,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
