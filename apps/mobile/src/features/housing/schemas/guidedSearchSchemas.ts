import { z } from 'zod';

export const guidedSearchSchema = z.object({
  type: z.enum(['any', 'studio', 'chambre', 'appartement', 'maison']),
  schoolId: z.string().uuid().nullable(),
  district: z.string().nullable(),
  budget: z.number().int().min(10000).max(500000),
  months: z.number().int().min(1).max(24),
  furnished: z.enum(['any', 'yes', 'no']),
  coloc: z.enum(['any', 'yes', 'no']),
});
export type GuidedSearchInput = z.infer<typeof guidedSearchSchema>;
