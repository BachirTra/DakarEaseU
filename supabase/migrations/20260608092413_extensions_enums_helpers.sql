-- Extensions
create extension if not exists pgcrypto;

-- Types enum métier
create type public.user_role as enum ('student', 'admin');
create type public.persona_type as enum ('nouveau', 'local', 'parent');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.listing_type as enum ('studio', 'chambre', 'appartement', 'maison');
create type public.listing_verification_status as enum ('pending', 'published', 'rejected');
create type public.media_type as enum ('photo', 'video', 'tour_3d');
create type public.payment_method as enum ('wave', 'orange_money', 'card');
create type public.payment_status as enum ('pending', 'success', 'failed');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.rsvp_status as enum ('interested', 'confirmed');
create type public.review_target_type as enum ('listing', 'restaurant', 'stay');
create type public.favorite_entity_type as enum ('listing', 'restaurant');
create type public.notification_type as enum (
  'booking_status_update',
  'event_rsvp_confirmed',
  'new_guided_search_request',
  'verification_status_update'
);
create type public.transport_category as enum ('taxi', 'moto', 'repas', 'colis', 'demenagement', 'location');
create type public.event_category as enum ('concert', 'festival', 'conference', 'sport');
create type public.guided_search_status as enum ('open', 'matched', 'closed');

-- Trigger générique : maintient `updated_at` à jour
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
