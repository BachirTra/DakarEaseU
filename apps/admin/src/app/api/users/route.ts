import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string;
  isBlocked: boolean;
  verificationStatus: string;
  lastSignInAt: string | null;
  createdAt: string;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (requesterProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  }

  const adminClient = createSupabaseAdminClient();

  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('id, full_name, role, is_blocked, verification_status, created_at')
    .order('created_at', { ascending: false });
  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const authUsersById = new Map(authUsers.users.map((authUser) => [authUser.id, authUser]));

  const rows: AdminUserRow[] = profiles.map((profile) => {
    const authUser = authUsersById.get(profile.id);
    return {
      id: profile.id,
      email: authUser?.email ?? null,
      fullName: profile.full_name,
      role: profile.role,
      isBlocked: profile.is_blocked,
      verificationStatus: profile.verification_status,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      createdAt: profile.created_at,
    };
  });

  return NextResponse.json({ users: rows });
}
