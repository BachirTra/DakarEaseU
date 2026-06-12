import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { EventRow, EventRsvp, Profile, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { EventFormValues } from '../schemas/event.schema';

export interface RsvpWithAttendee extends EventRsvp {
  attendee: Pick<Profile, 'id' | 'full_name' | 'phone'> | null;
}

export async function fetchEvents(): Promise<EventRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchEventDetail(id: string): Promise<EventRow> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  return data!;
}

export async function fetchEventRsvps(eventId: string): Promise<RsvpWithAttendee[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*, attendee:profiles(id, full_name, phone)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as RsvpWithAttendee[];
}

export async function createEvent(values: EventFormValues): Promise<EventRow> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'events'> = { ...values };
  const { data, error } = await supabase.from('events').insert(payload).select().single();
  if (error) throw error;
  return data!;
}

export async function updateEvent(id: string, values: EventFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'events'> = { ...values };
  const { error } = await supabase.from('events').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadEventCoverImage(eventId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${eventId}/cover-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('events-media')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('events-media').getPublicUrl(path);
  const { error: updateError } = await supabase
    .from('events')
    .update({ cover_image_url: data.publicUrl })
    .eq('id', eventId);
  if (updateError) throw updateError;
  return data.publicUrl;
}
