-- Type de retour structuré pour le matching (permet de trier après calcul,
-- ce qu'un simple `return next` dans une boucle ne permet pas proprement)
create type public.match_result as (
  listing_id uuid,
  match_pct integer,
  reasons text[]
);

create or replace function public.match_listings(
  p_type text default 'any',
  p_budget numeric default null,
  p_school_id uuid default null,
  p_district text default null,
  p_furnished text default 'any',
  p_coloc text default 'any',
  p_months integer default 3
)
returns setof public.match_result
language plpgsql
stable
as $$
declare
  l record;
  v_score integer;
  v_max integer;
  v_reasons text[];
  v_min_price numeric;
  v_school_district text;
  v_is_near_school boolean;
  v_pct integer;
  v_results public.match_result[] := '{}';
begin
  if p_school_id is not null then
    select s.district into v_school_district from public.schools s where s.id = p_school_id;
  end if;

  for l in
    select * from public.listings where verification_status = 'published'
  loop
    v_score := 0;
    v_max := 0;
    v_reasons := '{}'::text[];

    -- Prix mini : place de coloc la moins chère si dispo, sinon prix du logement entier
    select min(r.price) into v_min_price
      from public.listing_coliving_rooms r
      where r.listing_id = l.id and r.is_available;
    if v_min_price is null then
      v_min_price := l.price;
    end if;

    -- Type
    if p_type is not null and p_type <> 'any' then
      v_max := v_max + 30;
      if p_type = 'coloc' then
        if l.colocation_available then
          v_score := v_score + 30;
          v_reasons := array_append(v_reasons, 'Colocation disponible');
        end if;
      elsif l.type::text = p_type then
        v_score := v_score + 30;
        v_reasons := array_append(v_reasons, 'Type ' || l.type::text);
      end if;
    end if;

    -- Budget (toujours actif si fourni)
    if p_budget is not null then
      v_max := v_max + 25;
      if v_min_price <= p_budget then
        v_score := v_score + 25;
        v_reasons := array_append(v_reasons, 'Dans le budget');
      elsif v_min_price <= p_budget * 1.12 then
        v_score := v_score + 12;
      end if;
    end if;

    -- École de proximité (priorité) ou quartier (repli si pas d'école choisie)
    if p_school_id is not null then
      v_max := v_max + 25;
      select exists (
        select 1 from public.school_nearby_listings snl
        where snl.school_id = p_school_id and snl.listing_id = l.id
      ) into v_is_near_school;
      if v_is_near_school then
        v_score := v_score + 25;
        v_reasons := array_append(v_reasons, 'Proche de l''école sélectionnée');
      elsif v_school_district is not null and v_school_district = l.district then
        v_score := v_score + 12;
        v_reasons := array_append(v_reasons, 'Même quartier que l''école sélectionnée');
      end if;
    elsif p_district is not null and p_district <> 'any' then
      v_max := v_max + 20;
      if l.district = p_district then
        v_score := v_score + 20;
        v_reasons := array_append(v_reasons, l.district);
      end if;
    end if;

    -- Meublé
    if p_furnished is not null and p_furnished <> 'any' then
      v_max := v_max + 10;
      if l.furnished = (p_furnished = 'yes') then
        v_score := v_score + 10;
        v_reasons := array_append(
          v_reasons,
          case when p_furnished = 'yes' then 'Meublé' else 'Non meublé' end
        );
      end if;
    end if;

    -- Colocation (seulement si le type choisi n'est pas déjà "coloc")
    if p_coloc is not null and p_coloc <> 'any' and p_type <> 'coloc' then
      v_max := v_max + 15;
      if l.colocation_available = (p_coloc = 'yes') then
        v_score := v_score + 15;
        v_reasons := array_append(
          v_reasons,
          case when p_coloc = 'yes' then 'Colocation possible' else 'Logement privatif' end
        );
      end if;
    end if;

    -- Durée minimum compatible (toujours actif)
    v_max := v_max + 10;
    if coalesce(l.min_duration_months, 3) <= p_months then
      v_score := v_score + 10;
      v_reasons := array_append(v_reasons, 'Durée compatible');
    end if;

    if v_max > 0 then
      v_pct := round((v_score::numeric / v_max) * 100);
    else
      v_pct := 100;
    end if;

    v_results := v_results || row(l.id, v_pct, v_reasons)::public.match_result;
  end loop;

  return query
    select (r).listing_id, (r).match_pct, (r).reasons
    from unnest(v_results) as r
    order by (r).match_pct desc;
end;
$$;

grant execute on function public.match_listings(text, numeric, uuid, text, text, text, integer) to authenticated;
