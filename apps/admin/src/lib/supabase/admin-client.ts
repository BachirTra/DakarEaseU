import { createClient } from '@supabase/supabase-js';
import type { Database } from '@dakareaseu/types';

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY est manquante. Ce client ne doit être instancié ' +
        'que côté serveur (Route Handler / Server Action) — jamais côté client.',
    );
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
