import { supabase } from '@/lib/supabase';

export async function fetchBonPlans(categoryId: string | null) {
  let query = supabase
    .from('bon_plans')
    .select(
      'id, title, cover_image_url, price_min, address, is_featured, category:bon_plan_categories(id, name, slug)',
    )
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchBonPlanDetail(bonPlanId: string) {
  const { data, error } = await supabase
    .from('bon_plans')
    .select('*, category:bon_plan_categories(id, name, slug), media:bon_plan_media(*)')
    .eq('id', bonPlanId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('bon_plan_categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchUserFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bon_plan_favorites')
    .select('bon_plan_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((f) => f.bon_plan_id);
}

export async function addFavorite(userId: string, bonPlanId: string): Promise<void> {
  const { error } = await supabase
    .from('bon_plan_favorites')
    .insert({ user_id: userId, bon_plan_id: bonPlanId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, bonPlanId: string): Promise<void> {
  const { error } = await supabase
    .from('bon_plan_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('bon_plan_id', bonPlanId);
  if (error) throw error;
}
