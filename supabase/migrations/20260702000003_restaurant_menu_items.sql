create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_restaurant_id_idx on public.menu_items (restaurant_id);

create trigger trg_menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.menu_items enable row level security;

create policy "menu_items_select_public" on public.menu_items for select using (true);
create policy "menu_items_insert_admin" on public.menu_items for insert with check (public.is_admin());
create policy "menu_items_update_admin" on public.menu_items for update using (public.is_admin()) with check (public.is_admin());
create policy "menu_items_delete_admin" on public.menu_items for delete using (public.is_admin());

-- Dish images reuse the existing public `restaurants-media` bucket at path
-- `${restaurantId}/menu/...`; that bucket's public-read / admin-write policies
-- already cover this path, so no new bucket or storage policy is required.
