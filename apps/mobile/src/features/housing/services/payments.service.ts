import type { PaymentMethod, PaymentStatus } from '@dakareaseu/types';

export interface PaymentResult {
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  reference: string;
}

/**
 * SIMULATED PAYMENT SEAM — documented extension point.
 *
 * Today this resolves locally after a short delay and always returns
 * `status: "success"`. The rest of the app (BookingScreen, useCreateBooking,
 * the payments rows it writes) is shaped exactly like it will be once real
 * payment processing exists.
 *
 * FUTURE MIGRATION PATH:
 *   1. Create Supabase Edge Function `process-payment` accepting
 *      { method, amount, reference } and returning this PaymentResult shape.
 *   2. Replace the body of this function with:
 *        const { data, error } = await supabase.functions.invoke<PaymentResult>(
 *          "process-payment", { body: { method, amount, reference } }
 *        );
 *        if (error) throw error;
 *        return data;
 *   3. No changes needed in BookingScreen, useCreateBooking, or the
 *      bookings/payments write path — they only depend on this signature.
 */
export async function processPayment(
  method: PaymentMethod,
  amount: number,
  reference: string,
): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { status: 'success', method, amount, reference };
}
