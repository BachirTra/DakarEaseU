-- ============================================================================
-- SCHOOLS
-- ============================================================================
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  full_name text,
  district text not null,
  students_count integer,
  founded_year integer,
  address text,
  website text,
  email text,
  phone text,
  whatsapp text,
  fees_text text,
  programs text[] not null default '{}',
  admission_steps text[] not null default '{}',
  scholarships text[] not null default '{}',
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schools_district_idx on public.schools (district);

create trigger trg_schools_updated_at
  before update on public.schools
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PROFILES (1-1 avec auth.users)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text,
  avatar_url text,
  phone text,
  school_id uuid references public.schools (id) on delete set null,
  persona public.persona_type,
  language text not null default 'fr',
  verification_status public.verification_status not null default 'pending',
  verification_doc_url text,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_school_id_idx on public.profiles (school_id);
create index profiles_role_idx on public.profiles (role);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- HELPERS
-- ============================================================================

-- L'utilisateur courant est-il admin ? security definer = casse la récursion RLS
-- (sans cela, lire profiles déclencherait la policy qui appelle is_admin() qui lit profiles...)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Crée automatiquement une ligne profiles à l'inscription d'un utilisateur Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Empêche un étudiant de s'auto-promouvoir admin / s'auto-vérifier / se débloquer
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.verification_status is distinct from old.verification_status
     or new.is_blocked is distinct from old.is_blocked then
    raise exception 'Seul un administrateur peut modifier le rôle, la vérification ou le blocage du profil';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.schools enable row level security;
alter table public.profiles enable row level security;

create policy "schools_select_public" on public.schools
  for select using (true);
create policy "schools_insert_admin" on public.schools
  for insert with check (public.is_admin());
create policy "schools_update_admin" on public.schools
  for update using (public.is_admin()) with check (public.is_admin());
create policy "schools_delete_admin" on public.schools
  for delete using (public.is_admin());

create policy "profiles_select_self_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_self_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());
-- Pas de policy insert/delete : l'insertion passe par le trigger handle_new_user
-- (security definer), la suppression par la cascade depuis auth.users.
