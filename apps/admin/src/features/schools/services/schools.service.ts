import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { School, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { SchoolFormValues } from '../schemas/school.schema';

export async function fetchSchools(): Promise<School[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('schools').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchSchoolById(id: string): Promise<School> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('schools').select('*').eq('id', id).single();
  if (error) throw error;
  return data!;
}

export async function createSchool(values: SchoolFormValues): Promise<School> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'schools'> = { ...values, email: values.email || null };
  const { data, error } = await supabase.from('schools').insert(payload).select().single();
  if (error) throw error;
  return data!;
}

export async function updateSchool(id: string, values: SchoolFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'schools'> = { ...values, email: values.email || null };
  const { error } = await supabase.from('schools').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteSchool(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadSchoolCoverImage(schoolId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${schoolId}/cover-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('schools-media')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('schools-media').getPublicUrl(path);
  const { error: updateError } = await supabase
    .from('schools')
    .update({ cover_image_url: data.publicUrl })
    .eq('id', schoolId);
  if (updateError) throw updateError;
  return data.publicUrl;
}
