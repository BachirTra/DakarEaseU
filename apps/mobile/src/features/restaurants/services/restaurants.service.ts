import { supabase } from '@/lib/supabase';

export async function fetchRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine_type, price_range, district, rating')
    .order('rating', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRestaurantMenu(restaurantId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, price, image_url')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('position');
  if (error) throw error;
  return data;
}

export async function fetchRestaurantDetail(restaurantId: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select(
      'id, name, cuisine_type, price_range, district, phone, whatsapp, description, specialties, latitude, longitude, restaurant_media(id, url, position)',
    )
    .eq('id', restaurantId)
    .single();
  if (error) throw error;
  return data;
}
