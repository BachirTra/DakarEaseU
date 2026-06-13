-- ============================================================================
-- Visite virtuelle 360° (Niveau 2 : une photo-sphère par pièce)
-- ============================================================================

-- Nouveau type de média : photo-sphère équirectangulaire 360°
-- (produite gratuitement par une app de capture type Google Street View).
-- NB : ADD VALUE est autorisé dans une transaction (PG12+) tant que la
-- valeur n'est pas UTILISÉE dans la même migration — ce qui est le cas ici.
alter type public.media_type add value if not exists 'pano_360';

-- Libellé de la pièce pour les photo-sphères 360° (« Salon », « Chambre 1 »…)
-- et, accessoirement, pour ordonner/nommer n'importe quel média.
alter table public.listing_media
  add column room_label text;
