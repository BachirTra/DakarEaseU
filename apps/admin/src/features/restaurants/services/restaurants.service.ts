import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Restaurant, RestaurantMedia, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { RestaurantFormValues } from '../schemas/restaurant.schema';

export interface RestaurantWithMedia {
  restaurant: Restaurant;
  media: RestaurantMedia[];
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('restaurants').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchRestaurantDetail(id: string): Promise<RestaurantWithMedia> {
  const supabase = createSupabaseBrowserClient();
  const [{ data: restaurant, error: restaurantError }, { data: media, error: mediaError }] =
    await Promise.all([
      supabase.from('restaurants').select('*').eq('id', id).single(),
      supabase.from('restaurant_media').select('*').eq('restaurant_id', id).order('position'),
    ]);
  if (restaurantError) throw restaurantError;
  if (mediaError) throw mediaError;
  return { restaurant: restaurant!, media: media ?? [] };
}

export async function createRestaurant(values: RestaurantFormValues): Promise<Restaurant> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'restaurants'> = { ...values };
  const { data, error } = await supabase.from('restaurants').insert(payload).select().single();
  if (error) throw error;
  return data!;
}

export async function updateRestaurant(id: string, values: RestaurantFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'restaurants'> = { ...values };
  const { error } = await supabase.from('restaurants').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteRestaurant(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadRestaurantMedia(
  restaurantId: string,
  file: File,
  position: number,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const path = `${restaurantId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('restaurants-media')
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('restaurants-media').getPublicUrl(path);
  const { error: insertError } = await supabase
    .from('restaurant_media')
    .insert({ restaurant_id: restaurantId, url: data.publicUrl, position });
  if (insertError) throw insertError;
}

export async function deleteRestaurantMedia(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('restaurant_media').delete().eq('id', id);
  if (error) throw error;
}
