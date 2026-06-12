import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { AdminUserRow } from '@/app/api/users/route';

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const response = await fetch('/api/users');
  const body = (await response.json()) as { users?: AdminUserRow[]; error?: string };
  if (!response.ok || !body.users) {
    throw new Error(body.error ?? 'Impossible de charger la liste des utilisateurs.');
  }
  return body.users;
}

export async function setUserBlocked(userId: string, isBlocked: boolean): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: isBlocked })
    .eq('id', userId);
  if (error) throw error;
}
