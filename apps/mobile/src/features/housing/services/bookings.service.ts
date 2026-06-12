import { supabase } from "@/lib/supabase";
import type { BookingStatus, PaymentMethod, PaymentStatus } from "@dakareaseu/types";

export interface CreateBookingParams {
  userId: string;
  listingId: string;
  colivingRoomId: string | null;
  startDate: string;
  durationMonths: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
}

export async function createBooking(params: CreateBookingParams) {
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: params.userId,
      listing_id: params.listingId,
      coliving_room_id: params.colivingRoomId,
      start_date: params.startDate,
      duration_months: params.durationMonths,
      total_amount: params.totalAmount,
      status: "pending" satisfies BookingStatus,
      payment_method: params.paymentMethod,
      payment_status: "success" satisfies PaymentStatus,
    })
    .select("*")
    .single();
  if (bookingError) throw bookingError;

  return booking;
}

export async function fetchMyBookings(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, listings(id, title, district, currency)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
