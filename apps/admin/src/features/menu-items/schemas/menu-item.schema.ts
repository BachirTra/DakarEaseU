import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Le prix doit être positif'),
  image_url: z.string().optional().nullable(),
  is_available: z.boolean().default(true),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
