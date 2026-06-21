import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { PackFormValues, PackItemFormValues } from '../schemas/pack.schema';

export interface Pack {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackItem {
  id: string;
  pack_id: string;
  label: string;
  quantity: string;
  image_url: string | null;
  position: number;
}

export type PackOrderStatus = 'pending' | 'delivered' | 'cancelled';

export interface PackOrder {
  id: string;
  pack_id: string;
  user_id: string;
  whatsapp_snapshot: string;
  status: PackOrderStatus;
  created_at: string;
  updated_at: string;
  pack: { name: string } | null;
  profile: { full_name: string | null; phone: string | null } | null;
}

export interface PackWithItemCount extends Pack {
  itemCount: number;
}

export interface PackWithItems {
  pack: Pack;
  items: PackItem[];
}

export interface PackStats {
  totalOrders: number;
  totalRevenue: number;
  topPack: string;
  ordersThisWeek: number;
}

export type PackCreateInput = PackFormValues;
export type PackUpdateInput = PackFormValues;
export type PackItemInput = PackItemFormValues;

// The packs tables are not yet in the generated Supabase types, so we use an
// untyped client for these queries.
type UntypedClient = {
  from: (table: string) => ReturnType<ReturnType<typeof createSupabaseBrowserClient>['from']>;
};

function db(): UntypedClient {
  return createSupabaseBrowserClient() as unknown as UntypedClient;
}

export async function fetchPacks(): Promise<PackWithItemCount[]> {
  const supabase = db();
  const { data, error } = await supabase
    .from('packs')
    .select('*, pack_items(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as (Pack & { pack_items?: { count: number }[] })[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    is_active: row.is_active,
    cover_image_url: row.cover_image_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    itemCount: row.pack_items?.[0]?.count ?? 0,
  }));
}

export async function fetchPackById(id: string): Promise<PackWithItems> {
  const supabase = db();
  const [{ data: pack, error: packError }, { data: items, error: itemsError }] = await Promise.all([
    supabase.from('packs').select('*').eq('id', id).single(),
    supabase.from('pack_items').select('*').eq('pack_id', id).order('position'),
  ]);
  if (packError) throw packError;
  if (itemsError) throw itemsError;
  return { pack: pack as Pack, items: (items ?? []) as PackItem[] };
}

export async function createPack(data: PackCreateInput): Promise<Pack> {
  const supabase = db();
  const { data: created, error } = await supabase.from('packs').insert(data).select().single();
  if (error) throw error;
  return created as Pack;
}

export async function updatePack(id: string, data: PackUpdateInput): Promise<void> {
  const supabase = db();
  const { error } = await supabase.from('packs').update(data).eq('id', id);
  if (error) throw error;
}

export async function deletePack(id: string): Promise<void> {
  const supabase = db();
  const { error } = await supabase.from('packs').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadPackImage(file: File, path: string): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from('pack-images').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('pack-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function savePackItems(packId: string, items: PackItemInput[]): Promise<void> {
  const supabase = db();
  const { error: deleteError } = await supabase.from('pack_items').delete().eq('pack_id', packId);
  if (deleteError) throw deleteError;
  if (items.length === 0) return;
  const payload = items.map((item, index) => ({
    pack_id: packId,
    label: item.label,
    quantity: item.quantity,
    image_url: item.image_url ?? null,
    position: index,
  }));
  const { error: insertError } = await supabase.from('pack_items').insert(payload);
  if (insertError) throw insertError;
}

export async function fetchPackOrders(): Promise<PackOrder[]> {
  const supabase = db();
  const { data, error } = await supabase
    .from('pack_orders')
    .select('*, pack:packs(name), profile:profiles(full_name, phone)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PackOrder[];
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const supabase = db();
  const { error } = await supabase.from('pack_orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function fetchPackStats(): Promise<PackStats> {
  const supabase = db();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalOrders, error: totalError },
    { data: deliveredOrders, error: deliveredError },
    { data: allOrders, error: allError },
    { count: ordersThisWeek, error: weekError },
  ] = await Promise.all([
    supabase.from('pack_orders').select('id', { count: 'exact', head: true }),
    supabase.from('pack_orders').select('pack:packs(price)').eq('status', 'delivered'),
    supabase.from('pack_orders').select('pack:packs(name)'),
    supabase
      .from('pack_orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo),
  ]);

  if (totalError) throw totalError;
  if (deliveredError) throw deliveredError;
  if (allError) throw allError;
  if (weekError) throw weekError;

  const deliveredRows = (deliveredOrders ?? []) as { pack: { price: number } | null }[];
  const totalRevenue = deliveredRows.reduce((sum, row) => sum + (row.pack?.price ?? 0), 0);

  const counts = new Map<string, number>();
  const allRows = (allOrders ?? []) as { pack: { name: string } | null }[];
  for (const row of allRows) {
    const name = row.pack?.name;
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  let topPack = '—';
  let topCount = 0;
  for (const [name, count] of counts) {
    if (count > topCount) {
      topCount = count;
      topPack = name;
    }
  }

  return {
    totalOrders: totalOrders ?? 0,
    totalRevenue,
    topPack,
    ordersThisWeek: ordersThisWeek ?? 0,
  };
}

export async function fetchWhatsAppSetting(): Promise<string> {
  const supabase = db();
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'whatsapp_number')
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? '';
}

export async function upsertWhatsAppSetting(number: string): Promise<void> {
  const supabase = db();
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'whatsapp_number', value: number }, { onConflict: 'key' });
  if (error) throw error;
}
