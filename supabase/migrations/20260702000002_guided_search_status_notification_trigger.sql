create or replace function public.notify_guided_search_status_change()
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
      'guided_search_status_update',
      'Mise à jour de votre demande de logement',
      case new.status
        when 'matched' then 'Nous avons trouvé des logements qui correspondent à ta demande.'
        when 'closed' then 'Ta demande de recherche guidée a été clôturée.'
        else 'Ta demande est en cours de traitement.'
      end,
      'guided_search_request',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_guided_search_requests_notify_status
  after update on public.guided_search_requests
  for each row execute function public.notify_guided_search_status_change();
