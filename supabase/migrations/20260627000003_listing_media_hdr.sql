-- Ajoute le flag is_hdr à listing_media pour distinguer les panoramas
-- équirectangulaires HDR (.hdr / RGBE) des photos standard (JPG/PNG).
-- Le viewer mobile utilise un pipeline Three.js dédié pour les HDR.
alter table listing_media
  add column if not exists is_hdr boolean not null default false;

comment on column listing_media.is_hdr is
  'true = fichier RGBE/Radiance (.hdr) ; false = image standard (JPG/PNG/WEBP)';
