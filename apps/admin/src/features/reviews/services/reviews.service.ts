import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Review, Profile, ReviewTargetType } from '@dakareaseu/types';

export interface ReviewWithAuthor extends Review {
  author: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface ReviewsFilters {
  targetType?: ReviewTargetType | 'all';
}

export async function fetchReviews(filters: ReviewsFilters): Promise<ReviewWithAuthor[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from('reviews')
    .select('*, author:profiles(id, full_name)')
    .order('created_at', { ascending: false });

  if (filters.targetType && filters.targetType !== 'all')
    query = query.eq('target_type', filters.targetType);

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as ReviewWithAuthor[];
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
