import { z } from 'zod';

export const schoolSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  full_name: z.string().optional().nullable(),
  district: z.string().min(1, 'Le quartier est requis'),
  students_count: z.coerce.number().int().min(0).optional().nullable(),
  founded_year: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  fees_text: z.string().optional().nullable(),
  programs: z.array(z.string()).default([]),
  admission_steps: z.array(z.string()).default([]),
  scholarships: z.array(z.string()).default([]),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;
