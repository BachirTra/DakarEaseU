-- Créer le bucket bon-plans-media (public, écriture admin uniquement)
insert into storage.buckets (id, name, public)
values ('bon-plans-media', 'bon-plans-media', true)
on conflict (id) do nothing;

-- Policies dédiées à bon-plans-media
create policy "bon_plans_media_select_public" on storage.objects
  for select using (bucket_id = 'bon-plans-media');
create policy "bon_plans_media_insert_admin" on storage.objects
  for insert with check (bucket_id = 'bon-plans-media' and public.is_admin());
create policy "bon_plans_media_update_admin" on storage.objects
  for update using (bucket_id = 'bon-plans-media' and public.is_admin());
create policy "bon_plans_media_delete_admin" on storage.objects
  for delete using (bucket_id = 'bon-plans-media' and public.is_admin());

-- Note : supprimer le bucket events-media via le dashboard Supabase Storage
-- (les DELETE directs sur storage.objects/buckets sont interdits en SQL)
