import { supabase } from '@/lib/supabase';
import type { LoginInput, SignupInput } from '@/features/auth/schemas/authSchemas';
import type { OnboardingAnswers } from '@/features/auth/lib/derivePersona';
import { derivePersona } from '@/features/auth/lib/derivePersona';
import type { Profile } from '@dakareaseu/types';

export async function signInWithPassword({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword({ fullName, email, password }: SignupInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function completeOnboarding(params: {
  userId: string;
  fullName: string;
  schoolId: string | null;
  answers: OnboardingAnswers;
}): Promise<Profile> {
  const persona = derivePersona(params.answers);
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: params.fullName, school_id: params.schoolId, persona })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function uploadStudentId(params: {
  userId: string;
  fileUri: string;
  fileName: string;
  contentType: string;
}) {
  const path = `${params.userId}/${params.fileName}`;
  const response = await fetch(params.fileUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('student-ids')
    .upload(path, arrayBuffer, { contentType: params.contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('profiles')
    .update({ verification_doc_url: path, verification_status: 'pending' })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
