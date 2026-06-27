import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { BonPlanCategory, TablesInsert } from '@dakareaseu/types';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function fetchCategories(): Promise<BonPlanCategory[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bon_plan_categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(name: string): Promise<BonPlanCategory> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'bon_plan_categories'> = { name, slug: toSlug(name) };
  const { data, error } = await supabase
    .from('bon_plan_categories')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('bon_plan_categories').delete().eq('id', id);
  if (error) throw error;
}
