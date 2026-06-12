import { z } from 'zod';

import { DISTRICTS, LISTING_TYPES } from './constants';

/**
 * Schémas Zod transverses — base commune réutilisée et étendue par
 * `apps/mobile` (React Hook Form + Zod) et `apps/admin` (formulaires CRUD).
 *
 * Règle : un schéma ne vit ici QUE s'il est validé à l'identique des deux côtés.
 */

/** Quartier — doit appartenir à la liste DISTRICTS connue du produit. */
export const districtSchema = z.enum(DISTRICTS);

/** Type de logement — doit correspondre à l'enum SQL `listing_type`. */
export const listingTypeSchema = z.enum(LISTING_TYPES);

/**
 * Critères de recherche guidée (`guided_search_requests`).
 */
export const guidedSearchCriteriaSchema = z.object({
  housingType: z.union([listingTypeSchema, z.literal('any'), z.literal('coloc')]).default('any'),
  schoolId: z.string().uuid().nullable().optional(),
  district: districtSchema.optional(),
  budget: z.number().int().positive('Le budget doit être un nombre positif'),
  furnishedPref: z.enum(['any', 'yes', 'no']).default('any'),
  colocPref: z.enum(['any', 'yes', 'no']).default('any'),
  durationMonths: z.number().int().min(1, 'La durée minimale est de 1 mois').default(3),
});

export type GuidedSearchCriteria = z.infer<typeof guidedSearchCriteriaSchema>;

/**
 * Avis (review) — note 1 à 5 + commentaire optionnel.
 */
export const reviewInputSchema = z.object({
  rating: z.number().int().min(1, 'Note minimale : 1').max(5, 'Note maximale : 5'),
  comment: z.string().trim().max(2000, 'Commentaire trop long (2000 caractères max)').optional(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

/**
 * Méthode de paiement simulée (cf. prompt.md §4.3).
 */
export const paymentMethodSchema = z.enum(['wave', 'orange_money', 'card']);
export type PaymentMethodValue = z.infer<typeof paymentMethodSchema>;
