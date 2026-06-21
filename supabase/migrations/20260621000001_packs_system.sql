-- ============================================================================
-- Système de packs alimentaires étudiants (« packs »)
-- Tables : packs, pack_items, pack_orders, app_settings
-- + bucket de stockage pack-images + données de seed (2 packs)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table public.packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null, -- FCFA, ex. 28000
  is_active boolean not null default true,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs (id) on delete cascade,
  label text not null,          -- ex. « Sardines »
  quantity text not null,       -- ex. « 4 pots », « 1 L »
  image_url text,               -- nullable, URL Supabase Storage
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index pack_items_pack_id_idx on public.pack_items (pack_id);

create table public.pack_orders (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs (id),
  user_id uuid not null references auth.users (id),
  whatsapp_snapshot text not null, -- copie du téléphone de l'utilisateur au moment de la commande
  status text not null default 'pending' check (status in ('pending', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pack_orders_user_id_idx on public.pack_orders (user_id);
create index pack_orders_pack_id_idx on public.pack_orders (pack_id);
create index pack_orders_status_idx on public.pack_orders (status);

create table public.app_settings (
  key text primary key, -- ex. « whatsapp_number »
  value text not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Trigger updated_at (réutilise public.set_updated_at() déjà défini)
-- ----------------------------------------------------------------------------
create trigger trg_packs_updated_at
  before update on public.packs
  for each row execute function public.set_updated_at();

create trigger trg_pack_orders_updated_at
  before update on public.pack_orders
  for each row execute function public.set_updated_at();

create trigger trg_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.packs enable row level security;
alter table public.pack_items enable row level security;
alter table public.pack_orders enable row level security;
alter table public.app_settings enable row level security;

-- packs : lecture publique (anon inclus), écriture admin uniquement
create policy "packs_select_public" on public.packs
  for select using (true);
create policy "packs_insert_admin" on public.packs
  for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "packs_update_admin" on public.packs
  for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "packs_delete_admin" on public.packs
  for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- pack_items : lecture publique (anon inclus), écriture admin uniquement
create policy "pack_items_select_public" on public.pack_items
  for select using (true);
create policy "pack_items_insert_admin" on public.pack_items
  for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "pack_items_update_admin" on public.pack_items
  for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "pack_items_delete_admin" on public.pack_items
  for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- pack_orders : l'utilisateur crée/voit ses commandes ; l'admin voit tout et change le statut
create policy "pack_orders_insert_self" on public.pack_orders
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "pack_orders_select_self_or_admin" on public.pack_orders
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "pack_orders_update_admin" on public.pack_orders
  for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- app_settings : lecture publique (l'app mobile lit whatsapp_number sans auth), écriture admin
create policy "app_settings_select_public" on public.app_settings
  for select using (true);
create policy "app_settings_all_admin" on public.app_settings
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ----------------------------------------------------------------------------
-- Bucket de stockage : pack-images (public)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('pack-images', 'pack-images', true)
on conflict (id) do nothing;

create policy "pack_images_select_public" on storage.objects
  for select using (bucket_id = 'pack-images');
create policy "pack_images_insert_admin" on storage.objects
  for insert with check (
    bucket_id = 'pack-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "pack_images_update_admin" on storage.objects
  for update using (
    bucket_id = 'pack-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "pack_images_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'pack-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- Seed : 2 packs (idempotent via UUID fixes + on conflict do nothing)
-- ----------------------------------------------------------------------------
insert into public.packs (id, name, description, price)
values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Pack Premium Elite', 'Notre pack premium pour bien démarrer ton année étudiante à Dakar', 28000),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Pack Confort+', 'Le pack essentiel pour les étudiants à Dakar', 23500)
on conflict (id) do nothing;

insert into public.pack_items (pack_id, label, quantity, position)
values
  -- Pack Premium Elite
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Jus', '1 paquet', 1),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Bonbons', '1 paquet', 2),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Café', '1 boîte', 3),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Corn beef GM', '2 pots', 4),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Huile', '1 L', 5),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Mayonnaise', '1 pot', 6),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Pain thon', '2 pots', 7),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Sardines', '4 pots', 8),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Chocolat', '1 pot', 9),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Lait en poudre', '2 paquets', 10),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Sucre 1kg', '2 paquets', 11),
  -- Pack Confort+
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Spaghettis', '4 paquets', 1),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Beurre 500g', '1 pot', 2),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Chocolat 500g', '1 pot', 3),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Café', '1 pot', 4),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Lait grand modèle', '2 pots', 5),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Lait en poudre', '2 paquets', 6),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Jus', '2 briques', 7),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Pain thon', '2 pots', 8),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Sucre 1kg', '2 paquets', 9)
on conflict do nothing;

insert into public.app_settings (key, value)
values ('whatsapp_number', '221700000000')
on conflict (key) do nothing;
