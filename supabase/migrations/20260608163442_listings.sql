create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'XOF',
  period text not null default 'mois',
  type public.listing_type not null,
  surface_m2 numeric(6,2),
  bedrooms integer,
  bathrooms integer,
  district text not null,
  distance_label text,
  furnished boolean not null default false,
  colocation_available boolean not null default false,
  min_duration_months integer not null default 3 check (min_duration_months >= 1),
  amenities text[] not null default '{}',
  particularities text[] not null default '{}',
  requirements text[] not null default '{}',
  verification_status public.listing_verification_status not null default 'pending',
  rating numeric(2,1),
  reviews_count integer not null default 0,
  -- Référence interne pour modération admin uniquement — JAMAIS exposée côté mobile
  -- (aucune mention de "propriétaire/bailleur" dans l'UI ou les services mobile, cf. §3 du prompt)
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_district_idx on public.listings (district);
create index listings_type_idx on public.listings (type);
create index listings_verification_status_idx on public.listings (verification_status);
create index listings_price_idx on public.listings (price);

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  media_type public.media_type not null,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_media_listing_id_idx on public.listing_media (listing_id);

create table public.listing_coliving_rooms (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  label text not null,
  price numeric(12,2) not null check (price >= 0),
  surface_m2 numeric(6,2),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index listing_coliving_rooms_listing_id_idx on public.listing_coliving_rooms (listing_id);

-- Logements "à proximité" curés par école : alimente la fiche école ET le bonus
-- de proximité du matching (cf. computeMatches : sc.logements.includes(l.id))
create table public.school_nearby_listings (
  school_id uuid not null references public.schools (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  primary key (school_id, listing_id)
);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.listings enable row level security;
alter table public.listing_media enable row level security;
alter table public.listing_coliving_rooms enable row level security;
alter table public.school_nearby_listings enable row level security;

create policy "listings_select_published_or_admin" on public.listings
  for select using (verification_status = 'published' or public.is_admin());
create policy "listings_insert_admin" on public.listings
  for insert with check (public.is_admin());
create policy "listings_update_admin" on public.listings
  for update using (public.is_admin()) with check (public.is_admin());
create policy "listings_delete_admin" on public.listings
  for delete using (public.is_admin());

create policy "listing_media_select_visible" on public.listing_media
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_media.listing_id
        and (l.verification_status = 'published' or public.is_admin())
    )
  );
create policy "listing_media_insert_admin" on public.listing_media
  for insert with check (public.is_admin());
create policy "listing_media_update_admin" on public.listing_media
  for update using (public.is_admin()) with check (public.is_admin());
create policy "listing_media_delete_admin" on public.listing_media
  for delete using (public.is_admin());

create policy "listing_coliving_rooms_select_visible" on public.listing_coliving_rooms
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_coliving_rooms.listing_id
        and (l.verification_status = 'published' or public.is_admin())
    )
  );
create policy "listing_coliving_rooms_insert_admin" on public.listing_coliving_rooms
  for insert with check (public.is_admin());
create policy "listing_coliving_rooms_update_admin" on public.listing_coliving_rooms
  for update using (public.is_admin()) with check (public.is_admin());
create policy "listing_coliving_rooms_delete_admin" on public.listing_coliving_rooms
  for delete using (public.is_admin());

create policy "school_nearby_listings_select_public" on public.school_nearby_listings
  for select using (true);
create policy "school_nearby_listings_insert_admin" on public.school_nearby_listings
  for insert with check (public.is_admin());
create policy "school_nearby_listings_update_admin" on public.school_nearby_listings
  for update using (public.is_admin()) with check (public.is_admin());
create policy "school_nearby_listings_delete_admin" on public.school_nearby_listings
  for delete using (public.is_admin());
