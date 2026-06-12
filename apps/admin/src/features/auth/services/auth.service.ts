import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { LoginFormValues } from '../schemas/login.schema';

export async function signInWithPassword({ email, password }: LoginFormValues) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function fetchCurrentProfileRole(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error) throw error;
  return data.role;
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
