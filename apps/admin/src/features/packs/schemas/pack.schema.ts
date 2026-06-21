import { z } from 'zod';

export const packSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().positive('Le prix doit être un entier positif'),
  is_active: z.boolean().default(true),
  cover_image_url: z.string().optional().nullable(),
});

export type PackFormValues = z.infer<typeof packSchema>;

export const packItemSchema = z.object({
  label: z.string().min(1, "Le libellé est requis"),
  quantity: z.string().min(1, 'La quantité est requise'),
  image_url: z.string().optional().nullable(),
  position: z.number().int(),
});

export type PackItemFormValues = z.infer<typeof packItemSchema>;
