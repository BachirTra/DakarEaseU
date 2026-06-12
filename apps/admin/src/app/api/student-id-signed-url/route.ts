import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

const SIGNED_URL_TTL_SECONDS = 120;

export async function POST(request: Request) {
  const { path } = (await request.json()) as { path?: string };
  if (!path) {
    return NextResponse.json({ error: 'Le champ "path" est requis.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  }

  const { data, error } = await supabase.storage
    .from('student-ids')
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Impossible de générer une URL signée.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ signedUrl: data.signedUrl, expiresInSeconds: SIGNED_URL_TTL_SECONDS });
}
