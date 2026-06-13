-- Add latitude / longitude to entities that need geolocation
alter table public.listings
  add column latitude double precision,
  add column longitude double precision;

alter table public.schools
  add column latitude double precision,
  add column longitude double precision;

alter table public.restaurants
  add column latitude double precision,
  add column longitude double precision;

alter table public.events
  add column latitude double precision,
  add column longitude double precision;

-- Partial indexes for proximity look-ups (only rows with coordinates)
create index listings_coordinates_idx on public.listings (latitude, longitude)
  where latitude is not null and longitude is not null;
create index schools_coordinates_idx on public.schools (latitude, longitude)
  where latitude is not null and longitude is not null;
create index restaurants_coordinates_idx on public.restaurants (latitude, longitude)
  where latitude is not null and longitude is not null;
create index events_coordinates_idx on public.events (latitude, longitude)
  where latitude is not null and longitude is not null;

-- ============================================================================
-- RPC: nearby_listings(user_lat, user_lng, radius_km)
-- Returns listing ids sorted by Haversine distance within radius.
-- Used for "logements proches de moi" feature.
-- ============================================================================
create or replace function public.nearby_listings(
  user_lat  double precision,
  user_lng  double precision,
  radius_km double precision default 5
)
returns table (
  id          uuid,
  distance_km double precision
)
language sql
stable
security definer
as $$
  select
    id,
    6371 * acos(
      least(1.0,
        cos(radians(user_lat)) * cos(radians(latitude))
        * cos(radians(longitude) - radians(user_lng))
        + sin(radians(user_lat)) * sin(radians(latitude))
      )
    ) as distance_km
  from public.listings
  where latitude  is not null
    and longitude is not null
    and verification_status = 'published'
    and 6371 * acos(
      least(1.0,
        cos(radians(user_lat)) * cos(radians(latitude))
        * cos(radians(longitude) - radians(user_lng))
        + sin(radians(user_lat)) * sin(radians(latitude))
      )
    ) < radius_km
  order by distance_km;
$$;

-- ============================================================================
-- RPC: nearby_schools(user_lat, user_lng, radius_km)
-- ============================================================================
create or replace function public.nearby_schools(
  user_lat  double precision,
  user_lng  double precision,
  radius_km double precision default 10
)
returns table (
  id          uuid,
  distance_km double precision
)
language sql
stable
security definer
as $$
  select
    id,
    6371 * acos(
      least(1.0,
        cos(radians(user_lat)) * cos(radians(latitude))
        * cos(radians(longitude) - radians(user_lng))
        + sin(radians(user_lat)) * sin(radians(latitude))
      )
    ) as distance_km
  from public.schools
  where latitude  is not null
    and longitude is not null
    and 6371 * acos(
      least(1.0,
        cos(radians(user_lat)) * cos(radians(latitude))
        * cos(radians(longitude) - radians(user_lng))
        + sin(radians(user_lat)) * sin(radians(latitude))
      )
    ) < radius_km
  order by distance_km;
$$;
