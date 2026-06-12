import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as bookingsService from "@/features/housing/services/bookings.service";
import { processPayment } from "@/features/housing/services/payments.service";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { PaymentMethod } from "@dakareaseu/types";

export interface SubmitBookingParams {
  listingId: string;
  colivingRoomId: string | null;
  startDate: string;
  durationMonths: number;
  unitPrice: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

export function useCreateBooking() {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitBookingParams) => {
      if (!userId) throw new Error("Utilisateur non authentifié");

      const totalAmount = params.unitPrice * params.durationMonths;
      const reference = `bk-${params.listingId.slice(0, 8)}-${Date.now()}`;

      const payment = await processPayment(params.paymentMethod, totalAmount, reference);

      return bookingsService.createBooking({
        userId,
        listingId: params.listingId,
        colivingRoomId: params.colivingRoomId,
        startDate: params.startDate,
        durationMonths: params.durationMonths,
        totalAmount,
        paymentMethod: payment.method,
        paymentReference: payment.reference,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "list", userId] });
    },
  });
}
