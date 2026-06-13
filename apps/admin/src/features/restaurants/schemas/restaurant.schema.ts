import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  cuisine_type: z.string().min(1, 'Le type de cuisine est requis'),
  district: z.string().min(1, 'Le quartier est requis'),
  distance_label: z.string().optional().nullable(),
  price_range: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  opening_hours: z.string().optional().nullable(),
  specialties: z.array(z.string()).default([]),
  description: z.string().optional().nullable(),
  has_delivery: z.boolean().default(false),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type RestaurantFormValues = z.infer<typeof restaurantSchema>;
