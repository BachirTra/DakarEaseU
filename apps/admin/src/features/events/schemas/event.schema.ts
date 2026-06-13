import { z } from 'zod';

export const EVENT_CATEGORIES = ['concert', 'festival', 'conference', 'sport'] as const;

export const EVENT_CATEGORY_LABELS: Record<(typeof EVENT_CATEGORIES)[number], string> = {
  concert: 'Concert',
  festival: 'Festival',
  conference: 'Conférence',
  sport: 'Sport',
};

export const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  category: z.enum(EVENT_CATEGORIES),
  event_date: z.string().min(1, 'La date est requise'),
  event_time: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  partner: z.string().optional().nullable(),
  price_label: z.string().optional().nullable(),
  price_value: z.coerce.number().min(0).default(0),
  is_featured: z.boolean().default(false),
  description: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
