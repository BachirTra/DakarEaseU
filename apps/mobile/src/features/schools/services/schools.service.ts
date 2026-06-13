import { supabase } from '@/lib/supabase';

export async function fetchSchools() {
  const { data, error } = await supabase
    .from('schools')
    .select('id, name, district, cover_image_url, programs')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchSchoolDetail(schoolId: string) {
  const { data, error } = await supabase
    .from('schools')
    .select(
      'id, name, district, address, cover_image_url, programs, admission_steps, phone, whatsapp, email, latitude, longitude, school_nearby_listings(listing_id, listings(id, title, price, currency, district, distance_label))',
    )
    .eq('id', schoolId)
    .single();
  if (error) throw error;
  return data;
}
