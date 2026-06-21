import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// The packs/* and app_settings tables are not yet present in the auto-generated
// `packages/types` Database schema, so query them through an untyped client.
const db = supabase as unknown as SupabaseClient;

export interface PackItem {
  id: string;
  pack_id: string;
  label: string;
  quantity: string;
  image_url: string | null;
  position: number;
}

export interface PackSummary {
  id: string;
  name: string;
  description: string;
  price: number;
  cover_image_url: string | null;
  pack_items: { count: number }[];
}

export interface PackWithItems {
  id: string;
  name: string;
  description: string;
  price: number;
  cover_image_url: string | null;
  pack_items: PackItem[];
}

export interface PackOrder {
  id: string;
  pack_id: string;
  user_id: string;
  whatsapp_snapshot: string;
  status: 'pending' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export async function fetchActivePacks() {
  const { data, error } = await db
    .from('packs')
    .select('id, name, description, price, cover_image_url, pack_items(count)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as PackSummary[];
}

export async function fetchPackById(id: string) {
  const { data, error } = await db
    .from('packs')
    .select(
      'id, name, description, price, cover_image_url, pack_items(id, pack_id, label, quantity, image_url, position)',
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  const pack = data as unknown as PackWithItems;
  pack.pack_items = [...(pack.pack_items ?? [])].sort((a, b) => a.position - b.position);
  return pack;
}

export async function fetchWhatsAppNumber() {
  const { data, error } = await db
    .from('app_settings')
    .select('value')
    .eq('key', 'whatsapp_number')
    .single();
  if (error) throw error;
  return data.value as string;
}

export async function createPackOrder(params: {
  packId: string;
  userId: string;
  whatsappSnapshot: string;
}) {
  const { data, error } = await db
    .from('pack_orders')
    .insert({
      pack_id: params.packId,
      user_id: params.userId,
      whatsapp_snapshot: params.whatsappSnapshot,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as PackOrder;
}
