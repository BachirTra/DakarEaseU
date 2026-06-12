import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Profile, Enums } from '@dakareaseu/types';

export type VerificationStatus = Enums<'verification_status'>;

export async function fetchPendingVerifications(): Promise<Profile[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('verification_status', 'pending')
    .not('verification_doc_url', 'is', null)
    .order('updated_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function setVerificationStatus(
  profileId: string,
  status: VerificationStatus,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: status })
    .eq('id', profileId);
  if (error) throw error;
}

export async function setProfileBlocked(profileId: string, isBlocked: boolean): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: isBlocked })
    .eq('id', profileId);
  if (error) throw error;
}

export async function fetchSignedDocumentUrl(path: string): Promise<string> {
  const response = await fetch('/api/student-id-signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  const body = (await response.json()) as { signedUrl?: string; error?: string };
  if (!response.ok || !body.signedUrl) {
    throw new Error(body.error ?? 'Impossible de récupérer le document.');
  }
  return body.signedUrl;
}
