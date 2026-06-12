import { supabase } from "@/lib/supabase";
import type { FavoriteEntityType } from "@dakareaseu/types";

export async function fetchFavorites(userId: string) {
  const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function addFavorite(params: { userId: string; entityType: FavoriteEntityType; entityId: string }) {
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: params.userId, entity_type: params.entityType, entity_id: params.entityId });
  if (error) throw error;
}

export async function removeFavorite(params: { userId: string; entityType: FavoriteEntityType; entityId: string }) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", params.userId)
    .eq("entity_type", params.entityType)
    .eq("entity_id", params.entityId);
  if (error) throw error;
}

export async function fetchFavoriteListings(listingIds: string[]) {
  if (listingIds.length === 0) return [];
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, price, currency, period, type, district, distance_label, rating, reviews_count, verification_status, colocation_available, listing_media(id, url, media_type, position)")
    .in("id", listingIds)
    .eq("verification_status", "published");
  if (error) throw error;
  return data;
}
