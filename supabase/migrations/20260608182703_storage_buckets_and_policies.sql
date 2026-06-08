-- Convention de chemin pour le contenu appartenant à un utilisateur :
-- "<bucket>/<user_id>/<fichier>" — permet de vérifier la propriété via
-- (storage.foldername(name))[1] = auth.uid()::text

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('listings-media', 'listings-media', true),
  ('restaurants-media', 'restaurants-media', true),
  ('schools-media', 'schools-media', true),
  ('events-media', 'events-media', true),
  ('student-ids', 'student-ids', false)
on conflict (id) do nothing;

-- avatars : lecture publique, écriture réservée au propriétaire du dossier
create policy "avatars_select_public" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_insert_owner" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_update_owner" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_delete_owner" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Médias publics d'annonces/restaurants/écoles/événements : lecture publique, écriture admin
create policy "public_media_select" on storage.objects
  for select using (bucket_id in ('listings-media', 'restaurants-media', 'schools-media', 'events-media'));
create policy "public_media_insert_admin" on storage.objects
  for insert with check (
    bucket_id in ('listings-media', 'restaurants-media', 'schools-media', 'events-media')
    and public.is_admin()
  );
create policy "public_media_update_admin" on storage.objects
  for update using (
    bucket_id in ('listings-media', 'restaurants-media', 'schools-media', 'events-media')
    and public.is_admin()
  );
create policy "public_media_delete_admin" on storage.objects
  for delete using (
    bucket_id in ('listings-media', 'restaurants-media', 'schools-media', 'events-media')
    and public.is_admin()
  );

-- student-ids : PRIVÉ — lecture/écriture = propriétaire du dossier + admin en lecture
-- (vérification manuelle de la carte étudiante, cf. §4.6 du prompt — jamais public)
create policy "student_ids_select_owner_or_admin" on storage.objects
  for select using (
    bucket_id = 'student-ids'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
create policy "student_ids_insert_owner" on storage.objects
  for insert with check (bucket_id = 'student-ids' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "student_ids_update_owner_or_admin" on storage.objects
  for update using (
    bucket_id = 'student-ids'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
create policy "student_ids_delete_owner_or_admin" on storage.objects
  for delete using (
    bucket_id = 'student-ids'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
