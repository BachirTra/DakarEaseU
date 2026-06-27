-- ============================================================
-- Migration: Replace events system with bon_plans system
-- ============================================================

-- ── 1. Drop old RLS policies ──────────────────────────────
drop policy if exists "event_rsvps_select_self_or_admin" on public.event_rsvps;
drop policy if exists "event_rsvps_insert_self" on public.event_rsvps;
drop policy if exists "event_rsvps_update_self_or_admin" on public.event_rsvps;
drop policy if exists "event_rsvps_delete_self_or_admin" on public.event_rsvps;
drop policy if exists "events_select_public" on public.events;
drop policy if exists "events_insert_admin" on public.events;
drop policy if exists "events_update_admin" on public.events;
drop policy if exists "events_delete_admin" on public.events;

-- ── 2. Drop old tables (child before parent) ─────────────
drop table if exists public.event_rsvps;
drop table if exists public.events;

-- ── 3. Drop old enums ────────────────────────────────────
drop type if exists public.event_category;
drop type if exists public.rsvp_status;

-- ── 4. Create new tables ─────────────────────────────────

-- Catégories dynamiques (gérées par l'admin)
create table public.bon_plan_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Table principale bon_plans
create table public.bon_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.bon_plan_categories(id) on delete set null,
  cover_image_url text,
  address text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  price_min numeric(12,2) not null default 0,
  description text,
  astuce text,
  website_url text,
  phone text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bon_plans_category_id_idx on public.bon_plans(category_id);
create index bon_plans_is_featured_idx on public.bon_plans(is_featured);

create trigger trg_bon_plans_updated_at
  before update on public.bon_plans
  for each row execute function public.set_updated_at();

-- Médias secondaires (images + vidéos)
create table public.bon_plan_media (
  id uuid primary key default gen_random_uuid(),
  bon_plan_id uuid not null references public.bon_plans(id) on delete cascade,
  type text not null check (type in ('image', 'video_url', 'video_upload')),
  url text not null,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

create index bon_plan_media_bon_plan_id_idx on public.bon_plan_media(bon_plan_id);

-- Favoris utilisateurs
create table public.bon_plan_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bon_plan_id uuid not null references public.bon_plans(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, bon_plan_id)
);

create index bon_plan_favorites_user_id_idx on public.bon_plan_favorites(user_id);
create index bon_plan_favorites_bon_plan_id_idx on public.bon_plan_favorites(bon_plan_id);

-- ── 5. Enable RLS ─────────────────────────────────────────
alter table public.bon_plan_categories enable row level security;
alter table public.bon_plans enable row level security;
alter table public.bon_plan_media enable row level security;
alter table public.bon_plan_favorites enable row level security;

-- ── 6. RLS policies ───────────────────────────────────────

-- bon_plan_categories : lecture publique, écriture admin
create policy "bon_plan_categories_select_public" on public.bon_plan_categories for select using (true);
create policy "bon_plan_categories_insert_admin" on public.bon_plan_categories for insert with check (public.is_admin());
create policy "bon_plan_categories_update_admin" on public.bon_plan_categories for update using (public.is_admin()) with check (public.is_admin());
create policy "bon_plan_categories_delete_admin" on public.bon_plan_categories for delete using (public.is_admin());

-- bon_plans : lecture publique, écriture admin
create policy "bon_plans_select_public" on public.bon_plans for select using (true);
create policy "bon_plans_insert_admin" on public.bon_plans for insert with check (public.is_admin());
create policy "bon_plans_update_admin" on public.bon_plans for update using (public.is_admin()) with check (public.is_admin());
create policy "bon_plans_delete_admin" on public.bon_plans for delete using (public.is_admin());

-- bon_plan_media : lecture publique, écriture admin
create policy "bon_plan_media_select_public" on public.bon_plan_media for select using (true);
create policy "bon_plan_media_insert_admin" on public.bon_plan_media for insert with check (public.is_admin());
create policy "bon_plan_media_update_admin" on public.bon_plan_media for update using (public.is_admin()) with check (public.is_admin());
create policy "bon_plan_media_delete_admin" on public.bon_plan_media for delete using (public.is_admin());

-- bon_plan_favorites : utilisateurs gèrent leurs propres favoris
create policy "bon_plan_favorites_select_self" on public.bon_plan_favorites for select using (auth.uid() = user_id);
create policy "bon_plan_favorites_insert_self" on public.bon_plan_favorites for insert with check (auth.uid() = user_id);
create policy "bon_plan_favorites_delete_self" on public.bon_plan_favorites for delete using (auth.uid() = user_id);

-- ── 7. Seed default categories ────────────────────────────
insert into public.bon_plan_categories (name, slug) values
  ('Sport & Loisirs', 'sport-loisirs'),
  ('Nature & Aventure', 'nature-aventure'),
  ('Famille', 'famille'),
  ('Gastronomie & Sortie', 'gastronomie-sortie'),
  ('Culture & Arts', 'culture-arts');
