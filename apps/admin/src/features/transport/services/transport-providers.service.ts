import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { TransportProvider, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { TransportProviderFormValues } from '../schemas/transport-provider.schema';

export async function fetchTransportProviders(): Promise<TransportProvider[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('transport_providers').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createTransportProvider(values: TransportProviderFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'transport_providers'> = { ...values };
  const { error } = await supabase.from('transport_providers').insert(payload);
  if (error) throw error;
}

export async function updateTransportProvider(
  id: string,
  values: TransportProviderFormValues,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'transport_providers'> = { ...values };
  const { error } = await supabase.from('transport_providers').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTransportProvider(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('transport_providers').delete().eq('id', id);
  if (error) throw error;
}
