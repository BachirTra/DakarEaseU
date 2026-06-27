import { z } from 'zod';

export const bonPlanSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  category_id: z.string().uuid().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  price_min: z.coerce.number().min(0).default(0),
  description: z.string().optional().nullable(),
  astuce: z.string().optional().nullable(),
  website_url: z
    .string()
    .url('URL invalide')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  phone: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
});

export type BonPlanFormValues = z.infer<typeof bonPlanSchema>;
