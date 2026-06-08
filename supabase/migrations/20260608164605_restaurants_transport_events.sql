create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cuisine_type text not null,
  district text not null,
  distance_label text,
  rating numeric(2,1),
  reviews_count integer not null default 0,
  price_range text,
  phone text,
  whatsapp text,
  opening_hours text,
  specialties text[] not null default '{}',
  description text,
  has_delivery boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index restaurants_district_idx on public.restaurants (district);
create index restaurants_cuisine_type_idx on public.restaurants (cuisine_type);

create trigger trg_restaurants_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

create table public.restaurant_media (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index restaurant_media_restaurant_id_idx on public.restaurant_media (restaurant_id);

create table public.transport_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.transport_category not null,
  rating numeric(2,1),
  eta_label text,
  price_label text,
  phone text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transport_providers_category_idx on public.transport_providers (category);

create trigger trg_transport_providers_updated_at
  before update on public.transport_providers
  for each row execute function public.set_updated_at();

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.event_category not null,
  event_date date not null,
  event_time time,
  venue text,
  partner text,
  price_label text,
  price_value numeric(12,2) not null default 0,
  is_featured boolean not null default false,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_category_idx on public.events (category);
create index events_event_date_idx on public.events (event_date);

create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  status public.rsvp_status not null default 'interested',
  qr_code text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index event_rsvps_user_id_idx on public.event_rsvps (user_id);
create index event_rsvps_event_id_idx on public.event_rsvps (event_id);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.restaurants enable row level security;
alter table public.restaurant_media enable row level security;
alter table public.transport_providers enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

create policy "restaurants_select_public" on public.restaurants for select using (true);
create policy "restaurants_insert_admin" on public.restaurants for insert with check (public.is_admin());
create policy "restaurants_update_admin" on public.restaurants for update using (public.is_admin()) with check (public.is_admin());
create policy "restaurants_delete_admin" on public.restaurants for delete using (public.is_admin());

create policy "restaurant_media_select_public" on public.restaurant_media for select using (true);
create policy "restaurant_media_insert_admin" on public.restaurant_media for insert with check (public.is_admin());
create policy "restaurant_media_update_admin" on public.restaurant_media for update using (public.is_admin()) with check (public.is_admin());
create policy "restaurant_media_delete_admin" on public.restaurant_media for delete using (public.is_admin());

create policy "transport_providers_select_public" on public.transport_providers for select using (true);
create policy "transport_providers_insert_admin" on public.transport_providers for insert with check (public.is_admin());
create policy "transport_providers_update_admin" on public.transport_providers for update using (public.is_admin()) with check (public.is_admin());
create policy "transport_providers_delete_admin" on public.transport_providers for delete using (public.is_admin());

create policy "events_select_public" on public.events for select using (true);
create policy "events_insert_admin" on public.events for insert with check (public.is_admin());
create policy "events_update_admin" on public.events for update using (public.is_admin()) with check (public.is_admin());
create policy "events_delete_admin" on public.events for delete using (public.is_admin());

create policy "event_rsvps_select_self_or_admin" on public.event_rsvps
  for select using (auth.uid() = user_id or public.is_admin());
create policy "event_rsvps_insert_self" on public.event_rsvps
  for insert with check (auth.uid() = user_id);
create policy "event_rsvps_update_self_or_admin" on public.event_rsvps
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy "event_rsvps_delete_self_or_admin" on public.event_rsvps
  for delete using (auth.uid() = user_id or public.is_admin());
