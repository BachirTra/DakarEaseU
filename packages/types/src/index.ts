export type { Database, Json } from './database.types';
import type { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Profile = Tables<'profiles'>;
export type School = Tables<'schools'>;
export type Listing = Tables<'listings'>;
export type ListingMedia = Tables<'listing_media'>;
export type ListingColivingRoom = Tables<'listing_coliving_rooms'>;
export type Restaurant = Tables<'restaurants'>;
export type RestaurantMedia = Tables<'restaurant_media'>;
export type MenuItem = Tables<'menu_items'>;
export type TransportProvider = Tables<'transport_providers'>;
export type BonPlanRow = Tables<'bon_plans'>;
export type BonPlanCategory = Tables<'bon_plan_categories'>;
export type BonPlanMedia = Tables<'bon_plan_media'>;
export type BonPlanFavorite = Tables<'bon_plan_favorites'>;
export type BonPlanMediaType = 'image' | 'video_url' | 'video_upload';
export type Booking = Tables<'bookings'>;
export type GuidedSearchRequest = Tables<'guided_search_requests'>;
export type Review = Tables<'reviews'>;
export type Favorite = Tables<'favorites'>;
export type Notification = Tables<'notifications'>;

export type UserRole = Enums<'user_role'>;
export type PersonaType = Enums<'persona_type'>;
export type ListingType = Enums<'listing_type'>;
export type BookingStatus = Enums<'booking_status'>;
export type GuidedSearchStatus = Enums<'guided_search_status'>;
export type PaymentMethod = Enums<'payment_method'>;
export type PaymentStatus = Enums<'payment_status'>;
export type ReviewTargetType = Enums<'review_target_type'>;
export type FavoriteEntityType = Enums<'favorite_entity_type'>;

export type MatchListingsArgs = Database['public']['Functions']['match_listings']['Args'];
export type MatchResult = Database['public']['Functions']['match_listings']['Returns'][number];
