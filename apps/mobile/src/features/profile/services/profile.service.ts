import { supabase } from '@/lib/supabase';

export async function updateProfile(params: {
  userId: string;
  fullName: string;
  phone: string | null;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: params.fullName, phone: params.phone })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(params: {
  userId: string;
  fileUri: string;
  fileName: string;
  contentType: string;
}) {
  const path = `${params.userId}/${params.fileName}`;
  const response = await fetch(params.fileUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: params.contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
