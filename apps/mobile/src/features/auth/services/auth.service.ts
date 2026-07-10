import * as AuthSession from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
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

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  // PKCE flow returns a `code`; implicit flow returns the tokens directly.
  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) {
    throw new Error('No tokens found in OAuth redirect');
  }

  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
  return data.session;
}

export async function signInWithGoogle() {
  const redirectTo = AuthSession.makeRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned by Supabase');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    throw new Error('cancelled');
  }

  return createSessionFromUrl(result.url);
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
