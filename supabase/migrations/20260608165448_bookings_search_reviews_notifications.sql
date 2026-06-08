create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete restrict,
  coliving_room_id uuid references public.listing_coliving_rooms (id) on delete set null,
  start_date date not null,
  duration_months integer not null check (duration_months >= 1),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  payment_method public.payment_method,
  payment_status public.payment_status not null default 'pending',
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_listing_id_idx on public.bookings (listing_id);
create index bookings_status_idx on public.bookings (status);

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create table public.guided_search_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  housing_type text not null default 'any',
  school_id uuid references public.schools (id) on delete set null,
  district text,
  budget numeric(12,2) not null check (budget >= 0),
  furnished_pref text not null default 'any',
  coloc_pref text not null default 'any',
  duration_months integer not null default 3 check (duration_months >= 1),
  status public.guided_search_status not null default 'open',
  created_at timestamptz not null default now()
);

create index guided_search_requests_user_id_idx on public.guided_search_requests (user_id);
create index guided_search_requests_status_idx on public.guided_search_requests (status);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.review_target_type not null,
  target_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index reviews_target_idx on public.reviews (target_type, target_id);
create index reviews_author_id_idx on public.reviews (author_id);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entity_type public.favorite_entity_type not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create index favorites_user_id_idx on public.favorites (user_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_is_read_idx on public.notifications (is_read);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.bookings enable row level security;
alter table public.guided_search_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;

create policy "bookings_select_self_or_admin" on public.bookings
  for select using (auth.uid() = user_id or public.is_admin());
create policy "bookings_insert_self" on public.bookings
  for insert with check (auth.uid() = user_id);
-- Les changements de statut (pending → confirmed/cancelled/completed) sont gérés
-- par l'admin depuis le dashboard — un étudiant suit le statut via Realtime, ne le modifie pas.
create policy "bookings_update_admin" on public.bookings
  for update using (public.is_admin()) with check (public.is_admin());

create policy "guided_search_requests_select_self_or_admin" on public.guided_search_requests
  for select using (auth.uid() = user_id or public.is_admin());
create policy "guided_search_requests_insert_self" on public.guided_search_requests
  for insert with check (auth.uid() = user_id);
create policy "guided_search_requests_update_admin" on public.guided_search_requests
  for update using (public.is_admin()) with check (public.is_admin());

create policy "reviews_select_public" on public.reviews
  for select using (true);
create policy "reviews_insert_self" on public.reviews
  for insert with check (auth.uid() = author_id);
create policy "reviews_update_self" on public.reviews
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "reviews_delete_self_or_admin" on public.reviews
  for delete using (auth.uid() = author_id or public.is_admin());

create policy "favorites_select_self" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_self" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete_self" on public.favorites
  for delete using (auth.uid() = user_id);

create policy "notifications_select_self" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_update_self" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_delete_self" on public.notifications
  for delete using (auth.uid() = user_id);
-- Pas de policy insert pour les utilisateurs : les notifications sont générées
-- exclusivement par les triggers ci-dessous (security definer).

-- ============================================================================
-- TRIGGERS DE NOTIFICATION CIBLÉE (cf. §4.5 et §8 du prompt — Realtime ciblé
-- uniquement sur : statut de réservation, confirmation RSVP, nouvelle demande)
-- ============================================================================

create or replace function public.notify_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, type, title, body, reference_type, reference_id)
    values (
      new.user_id,
      'booking_status_update',
      'Mise à jour de votre réservation',
      case new.status
        when 'confirmed' then 'Votre réservation a été confirmée.'
        when 'cancelled' then 'Votre réservation a été refusée ou annulée.'
        when 'completed' then 'Votre séjour est terminé. Pensez à laisser un avis !'
        else 'Votre réservation est en attente de confirmation.'
      end,
      'booking',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_bookings_notify_status
  after update on public.bookings
  for each row execute function public.notify_booking_status_change();

create or replace function public.notify_rsvp_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed' and old.status is distinct from new.status then
    insert into public.notifications (user_id, type, title, body, reference_type, reference_id)
    values (
      new.user_id,
      'event_rsvp_confirmed',
      'Participation confirmée',
      'Ton billet est prêt : retrouve-le dans "Mes événements".',
      'event_rsvp',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_event_rsvps_notify_confirmed
  after update on public.event_rsvps
  for each row execute function public.notify_rsvp_confirmed();

create or replace function public.notify_admins_new_guided_search()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin record;
begin
  for v_admin in select id from public.profiles where role = 'admin' loop
    insert into public.notifications (user_id, type, title, body, reference_type, reference_id)
    values (
      v_admin.id,
      'new_guided_search_request',
      'Nouvelle demande de recherche guidée',
      'Un·e étudiant·e vient de soumettre une nouvelle demande de logement à traiter.',
      'guided_search_request',
      new.id
    );
  end loop;
  return new;
end;
$$;

create trigger trg_guided_search_requests_notify_admins
  after insert on public.guided_search_requests
  for each row execute function public.notify_admins_new_guided_search();
