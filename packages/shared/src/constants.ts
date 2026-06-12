/**
 * Constantes métier transverses, partagées entre `apps/mobile` et `apps/admin`.
 * Source : design/dakar-ease/project/data.jsx (DISTRICTS, CATEGORIES, TRANSPORT_CATS),
 * recopiées telles quelles — c'est la référence produit pour le MVP.
 *
 * Règle YAGNI : n'ajoute une constante ici que si DEUX apps en ont réellement besoin.
 * Les listes spécifiques à une app restent dans cette app.
 */

/** Quartiers de Dakar couverts par le moteur de recherche (logements/restaurants). */
export const DISTRICTS = ['Almadies', 'Fann', 'Mermoz', 'Sacré-Cœur', 'Ouakam', 'Point E'] as const;

export type District = (typeof DISTRICTS)[number];

/** Catégories de la page d'accueil / navigation principale. */
export const CATEGORIES = [
  { id: 'logements', label: 'Logements', icon: '🏠' },
  { id: 'ecoles', label: 'Écoles', icon: '🎓' },
  { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { id: 'transport', label: 'Transport', icon: '🚖' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

/** Catégories de prestataires de transport/livraison (annuaire `transport_providers`). */
export const TRANSPORT_CATS = [
  { id: 'taxi', label: 'Taxi / VTC', icon: '🚖' },
  { id: 'moto', label: 'Moto Jakarta', icon: '🏍️' },
  { id: 'repas', label: 'Livraison repas', icon: '🍱' },
  { id: 'colis', label: 'Livraison colis', icon: '📦' },
  { id: 'demenagement', label: 'Déménagement', icon: '🚚' },
  { id: 'location', label: 'Location voiture', icon: '🚗' },
] as const;

export type TransportCategoryId = (typeof TRANSPORT_CATS)[number]['id'];

/**
 * Types de logement — DOIT rester synchronisé avec l'enum SQL `listing_type`
 * défini dans `supabase/migrations/<timestamp>_extensions_enums_helpers.sql`
 * (cf. plan socle : 'studio' | 'chambre' | 'appartement' | 'maison').
 */
export const LISTING_TYPES = ['studio', 'chambre', 'appartement', 'maison'] as const;
export type ListingTypeValue = (typeof LISTING_TYPES)[number];

/** Palette "Confiance" — identité visuelle unique du produit (cf. prompt.md §3, COLORS dans data.jsx). */
export const COLORS = {
  primary: '#1E3A8A',
  primaryLight: '#3B5FC7',
  secondary: '#10B981',
  accent: '#F59E0B',
  bg: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textLight: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
} as const;
