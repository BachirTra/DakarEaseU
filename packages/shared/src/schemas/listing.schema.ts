import { z } from 'zod';

export const LISTING_TYPES = ['studio', 'chambre', 'appartement', 'maison'] as const;
export const MEDIA_TYPES = ['photo', 'video', 'tour_3d'] as const;
export const LISTING_VERIFICATION_STATUSES = ['pending', 'published', 'rejected'] as const;

export const listingSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z.coerce.number().min(0, 'Le prix doit être positif'),
  currency: z.string().default('XOF'),
  period: z.string().default('mois'),
  type: z.enum(LISTING_TYPES),
  surface_m2: z.coerce.number().min(0).optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).optional().nullable(),
  district: z.string().min(1, 'Le quartier est requis'),
  distance_label: z.string().optional().nullable(),
  furnished: z.boolean().default(false),
  colocation_available: z.boolean().default(false),
  min_duration_months: z.coerce.number().int().min(1).default(3),
  amenities: z.array(z.string()).default([]),
  particularities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  verification_status: z.enum(LISTING_VERIFICATION_STATUSES).default('pending'),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

export const colivingRoomSchema = z.object({
  label: z.string().min(1, 'Le nom de la chambre est requis'),
  price: z.coerce.number().min(0),
  surface_m2: z.coerce.number().min(0).optional().nullable(),
  is_available: z.boolean().default(true),
});

export type ColivingRoomFormValues = z.infer<typeof colivingRoomSchema>;
