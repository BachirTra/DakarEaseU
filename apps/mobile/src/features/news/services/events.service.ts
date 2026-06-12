import { supabase } from "@/lib/supabase";
import type { EventCategory, RsvpStatus } from "@dakareaseu/types";

export async function fetchEvents(category: EventCategory | "all") {
  let query = supabase
    .from("events")
    .select("id, title, category, event_date, event_time, venue, cover_image_url, description")
    .order("event_date", { ascending: true });
  if (category !== "all") query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchEventDetail(eventId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, category, event_date, event_time, venue, cover_image_url, description, partner, price_label, price_value")
    .eq("id", eventId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyRsvp(eventId: string, userId: string) {
  const { data, error } = await supabase
    .from("event_rsvps")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertRsvp(params: { eventId: string; userId: string; status: RsvpStatus }) {
  const { data, error } = await supabase
    .from("event_rsvps")
    .upsert({ event_id: params.eventId, user_id: params.userId, status: params.status }, { onConflict: "event_id,user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
