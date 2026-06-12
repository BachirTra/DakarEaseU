import type { Listing, ListingMedia, ListingType } from '@dakareaseu/types';

export const LISTING_PUBLIC_COLUMNS =
  'id, title, description, price, currency, period, type, surface_m2, bedrooms, bathrooms, district, distance_label, furnished, colocation_available, min_duration_months, amenities, particularities, requirements, verification_status, rating, reviews_count, created_at' as const;

export interface ListingFilters {
  type?: ListingType | 'any';
  maxPrice?: number;
  district?: string;
  furnished?: boolean;
  colocationOnly?: boolean;
}

export type ListingSummary = Pick<
  Listing,
  | 'id'
  | 'title'
  | 'price'
  | 'currency'
  | 'period'
  | 'type'
  | 'district'
  | 'distance_label'
  | 'rating'
  | 'reviews_count'
  | 'verification_status'
  | 'colocation_available'
> & { cover_media: Pick<ListingMedia, 'id' | 'url' | 'media_type'> | null };
