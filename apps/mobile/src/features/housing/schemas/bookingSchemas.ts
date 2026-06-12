import { z } from 'zod';

export const bookingFormSchema = z.object({
  startDate: z.string().min(1, 'Choisis une date de début'),
  durationMonths: z.number().int().min(1),
  paymentMethod: z.enum(['wave', 'orange_money', 'card'], {
    required_error: 'Choisis un moyen de paiement',
  }),
});
export type BookingFormInput = z.infer<typeof bookingFormSchema>;
