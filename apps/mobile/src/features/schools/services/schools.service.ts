import { supabase } from "@/lib/supabase";

export async function fetchSchools() {
  const { data, error } = await supabase.from("schools").select("id, name, district, logo_url, programs").order("name");
  if (error) throw error;
  return data;
}

export async function fetchSchoolDetail(schoolId: string) {
  const { data, error } = await supabase
    .from("schools")
    .select(
      "id, name, district, address, logo_url, description, programs, admission_info, contact_phone, contact_whatsapp, contact_email, school_nearby_listings(listing_id, listings(id, title, price, currency, district, distance_label))"
    )
    .eq("id", schoolId)
    .single();
  if (error) throw error;
  return data;
}
