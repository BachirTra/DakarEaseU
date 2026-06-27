import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { BonPlanRow, BonPlanMedia, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { BonPlanFormValues } from '../schemas/bon-plan.schema';

export type BonPlanWithCategory = BonPlanRow & {
  category: { id: string; name: string; slug: string } | null;
};

export type BonPlanDetail = BonPlanWithCategory & {
  media: BonPlanMedia[];
};

export async function fetchBonPlans(): Promise<BonPlanWithCategory[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bon_plans')
    .select('*, category:bon_plan_categories(id, name, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BonPlanWithCategory[];
}

export async function fetchBonPlanDetail(id: string): Promise<BonPlanDetail> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bon_plans')
    .select('*, category:bon_plan_categories(id, name, slug), media:bon_plan_media(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as BonPlanDetail;
}

export async function createBonPlan(values: BonPlanFormValues): Promise<BonPlanRow> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'bon_plans'> = {
    title: values.title,
    category_id: values.category_id ?? null,
    address: values.address ?? null,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    price_min: values.price_min,
    description: values.description ?? null,
    astuce: values.astuce ?? null,
    website_url: values.website_url ?? null,
    phone: values.phone ?? null,
    is_featured: values.is_featured,
  };
  const { data, error } = await supabase.from('bon_plans').insert(payload).select().single();
  if (error) throw error;
  return data!;
}

export async function updateBonPlan(id: string, values: BonPlanFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'bon_plans'> = {
    title: values.title,
    category_id: values.category_id ?? null,
    address: values.address ?? null,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    price_min: values.price_min,
    description: values.description ?? null,
    astuce: values.astuce ?? null,
    website_url: values.website_url ?? null,
    phone: values.phone ?? null,
    is_featured: values.is_featured,
  };
  const { error } = await supabase.from('bon_plans').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteBonPlan(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('bon_plans').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadBonPlanCoverImage(bonPlanId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${bonPlanId}/cover-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('bon-plans-media')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('bon-plans-media').getPublicUrl(path);
  const { error: updateError } = await supabase
    .from('bon_plans')
    .update({ cover_image_url: data.publicUrl })
    .eq('id', bonPlanId);
  if (updateError) throw updateError;
  return data.publicUrl;
}

export async function fetchBonPlanMedia(bonPlanId: string): Promise<BonPlanMedia[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bon_plan_media')
    .select('*')
    .eq('bon_plan_id', bonPlanId)
    .order('order');
  if (error) throw error;
  return data ?? [];
}

export async function addBonPlanVideoUrl(bonPlanId: string, url: string): Promise<BonPlanMedia> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bon_plan_media')
    .insert({ bon_plan_id: bonPlanId, url, type: 'video_url', order: 0 })
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function uploadBonPlanMediaFile(
  bonPlanId: string,
  file: File,
  type: 'image' | 'video_upload',
): Promise<BonPlanMedia> {
  const supabase = createSupabaseBrowserClient();
  const path = `${bonPlanId}/media-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('bon-plans-media')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from('bon-plans-media').getPublicUrl(path);
  const { data, error } = await supabase
    .from('bon_plan_media')
    .insert({ bon_plan_id: bonPlanId, url: urlData.publicUrl, type, order: 0 })
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteBonPlanMedia(mediaId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('bon_plan_media').delete().eq('id', mediaId);
  if (error) throw error;
}
