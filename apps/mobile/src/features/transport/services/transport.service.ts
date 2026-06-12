import { supabase } from "@/lib/supabase";
import type { TransportCategoryId } from "@/constants/categories";

export async function fetchTransportProviders(category: TransportCategoryId | "all") {
  let query = supabase.from("transport_providers").select("id, name, category, phone, whatsapp, eta_label, price_label").order("name");
  if (category !== "all") query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
