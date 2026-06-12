import { supabase } from "@/lib/supabase";

export async function fetchRestaurants() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, cuisine_type, price_range, district, rating, cover_url")
    .order("rating", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRestaurantDetail(restaurantId: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, name, cuisine_type, price_range, district, phone, whatsapp, description, specialties, menu_items, restaurant_media(id, url, media_type, position)"
    )
    .eq("id", restaurantId)
    .single();
  if (error) throw error;
  return data;
}
