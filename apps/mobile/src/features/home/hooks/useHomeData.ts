import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LISTING_PUBLIC_COLUMNS } from '@/features/housing/types/housing.types';

export function useTopListings() {
  return useQuery({
    queryKey: ['home', 'topListings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`${LISTING_PUBLIC_COLUMNS}, listing_media(id, url, media_type, position)`)
        .eq('verification_status', 'published')
        .order('rating', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
}

export function usePartnerSchools() {
  return useQuery({
    queryKey: ['home', 'partnerSchools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, district, cover_image_url')
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['home', 'upcomingEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, category, event_date, cover_image_url')
        .gte('event_date', new Date().toISOString().slice(0, 10))
        .order('event_date', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });
}

export function useNearbyRestaurants() {
  return useQuery({
    queryKey: ['home', 'nearbyRestaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, price_range, district, rating')
        .order('rating', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });
}
