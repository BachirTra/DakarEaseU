import { z } from 'zod';

export const TRANSPORT_CATEGORIES = [
  'taxi',
  'moto',
  'repas',
  'colis',
  'demenagement',
  'location',
] as const;

export const TRANSPORT_CATEGORY_LABELS: Record<(typeof TRANSPORT_CATEGORIES)[number], string> = {
  taxi: 'Taxi / VTC',
  moto: 'Moto-taxi',
  repas: 'Livraison repas',
  colis: 'Livraison colis',
  demenagement: 'Déménagement étudiant',
  location: 'Location voiture',
};

export const transportProviderSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  category: z.enum(TRANSPORT_CATEGORIES),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  eta_label: z.string().optional().nullable(),
  price_label: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
});

export type TransportProviderFormValues = z.infer<typeof transportProviderSchema>;
