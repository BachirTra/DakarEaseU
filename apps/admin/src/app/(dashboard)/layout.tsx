import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { DashboardShell } from '@/shared/components/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <DashboardShell adminName={profile.full_name ?? user.email ?? 'Admin'} currentUserId={user.id}>
      {children}
    </DashboardShell>
  );
}
