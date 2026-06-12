import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type {
  Listing,
  ListingMedia,
  ListingColivingRoom,
  TablesInsert,
  TablesUpdate,
  School,
} from '@dakareaseu/types';
import type { ListingFormValues, ColivingRoomFormValues } from '@dakareaseu/shared';

export interface ListingWithRelations {
  listing: Listing;
  media: ListingMedia[];
  colivingRooms: ListingColivingRoom[];
  nearbySchoolIds: string[];
}

export async function fetchListingDetail(id: string): Promise<ListingWithRelations> {
  const supabase = createSupabaseBrowserClient();

  const [
    { data: listing, error: listingError },
    { data: media, error: mediaError },
    { data: rooms, error: roomsError },
    { data: nearby, error: nearbyError },
  ] = await Promise.all([
    supabase.from('listings').select('*').eq('id', id).single(),
    supabase.from('listing_media').select('*').eq('listing_id', id).order('position'),
    supabase.from('listing_coliving_rooms').select('*').eq('listing_id', id).order('label'),
    supabase.from('school_nearby_listings').select('school_id').eq('listing_id', id),
  ]);

  if (listingError) throw listingError;
  if (mediaError) throw mediaError;
  if (roomsError) throw roomsError;
  if (nearbyError) throw nearbyError;

  return {
    listing: listing!,
    media: media ?? [],
    colivingRooms: rooms ?? [],
    nearbySchoolIds: (nearby ?? []).map((row) => row.school_id),
  };
}

export async function fetchAllSchools(): Promise<Pick<School, 'id' | 'name' | 'district'>[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('schools').select('id, name, district').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createListing(values: ListingFormValues): Promise<Listing> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'listings'> = { ...values };
  const { data, error } = await supabase.from('listings').insert(payload).select().single();
  if (error) throw error;
  return data!;
}

export async function updateListing(id: string, values: ListingFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'listings'> = { ...values };
  const { error } = await supabase.from('listings').update(payload).eq('id', id);
  if (error) throw error;
}

export async function addListingMedia(
  listingId: string,
  mediaType: ListingMedia['media_type'],
  url: string,
  position: number,
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('listing_media')
    .insert({ listing_id: listingId, media_type: mediaType, url, position });
  if (error) throw error;
}

export async function deleteListingMedia(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('listing_media').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertColivingRoom(
  listingId: string,
  room: ColivingRoomFormValues,
  id?: string,
) {
  const supabase = createSupabaseBrowserClient();
  if (id) {
    const { error } = await supabase.from('listing_coliving_rooms').update(room).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('listing_coliving_rooms')
      .insert({ ...room, listing_id: listingId });
    if (error) throw error;
  }
}

export async function deleteColivingRoom(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('listing_coliving_rooms').delete().eq('id', id);
  if (error) throw error;
}

export async function setNearbySchools(listingId: string, schoolIds: string[]) {
  const supabase = createSupabaseBrowserClient();
  const { error: deleteError } = await supabase
    .from('school_nearby_listings')
    .delete()
    .eq('listing_id', listingId);
  if (deleteError) throw deleteError;

  if (schoolIds.length > 0) {
    const { error: insertError } = await supabase
      .from('school_nearby_listings')
      .insert(schoolIds.map((schoolId) => ({ school_id: schoolId, listing_id: listingId })));
    if (insertError) throw insertError;
  }
}

export async function uploadListingMediaFile(listingId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${listingId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('listings-media')
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('listings-media').getPublicUrl(path);
  return data.publicUrl;
}
