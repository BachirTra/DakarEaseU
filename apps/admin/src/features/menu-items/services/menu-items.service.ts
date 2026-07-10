import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { MenuItem, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { MenuItemFormValues } from '../schemas/menu-item.schema';

export async function fetchMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('position');
  if (error) throw error;
  return data ?? [];
}

export async function createMenuItem(
  restaurantId: string,
  values: MenuItemFormValues,
  position: number,
): Promise<MenuItem> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'menu_items'> = {
    ...values,
    restaurant_id: restaurantId,
    position,
  };
  const { data, error } = await supabase.from('menu_items').insert(payload).select().single();
  if (error) throw error;
  return data!;
}

export async function updateMenuItem(id: string, values: MenuItemFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'menu_items'> = { ...values };
  const { error } = await supabase.from('menu_items').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadMenuItemImage(restaurantId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${restaurantId}/menu/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('restaurants-media')
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('restaurants-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMenuItemImage(url: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const marker = '/restaurants-media/';
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = url.slice(index + marker.length);
  const { error } = await supabase.storage.from('restaurants-media').remove([path]);
  if (error) throw error;
}
