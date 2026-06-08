-- ============================================================================
-- DONNÉES DE DÉMO — DakarEaseU
-- Adapté des échantillons du prototype (design/dakar-ease/project/data.jsx)
-- Ne peuple QUE les tables de référence (sans dépendance à auth.users).
-- Pour les comptes (admin/étudiants) et données liées, voir le commentaire en bas.
-- ============================================================================

-- ============ SCHOOLS ============
insert into public.schools (id, name, full_name, district, students_count, founded_year, address, website, email, phone, whatsapp, fees_text, programs, admission_steps, scholarships) values
('a0000000-0000-0000-0000-000000000001', 'UCAD', 'Université Cheikh Anta Diop', 'Fann', 95000, 1957, 'Avenue Cheikh Anta Diop, Dakar-Fann', 'ucad.edu.sn', 'admission@ucad.edu.sn', '+221338249000', '+221771000101',
 '50 000 – 150 000 CFA/an',
 array['Médecine','Droit','Sciences','Lettres','Économie','Informatique','Pharmacie'],
 array['Bac + dossier scolaire','Concours spécifiques par faculté','Inscription sur la plateforme UCAD en ligne','Dossier : relevé de notes, attestation de bac, photos'],
 array['Bourse nationale MESRI','Bourse Eiffel (France)','Bourse AUF']),
('a0000000-0000-0000-0000-000000000002', 'ESP', 'École Supérieure Polytechnique', 'Fann', 4000, 1973, 'Route des Pères Maristes, Dakar-Fann', 'esp.sn', 'contact@esp.sn', '+221338259000', '+221771000102',
 '75 000 – 250 000 CFA/an',
 array['Génie informatique','Génie civil','Génie électrique','Maintenance industrielle'],
 array['Concours d''entrée post-bac scientifique','Dossier de candidature en ligne','Entretien de motivation'],
 array['Bourse d''excellence ESP','Bourse nationale MESRI']),
('a0000000-0000-0000-0000-000000000003', 'ISM', 'Institut Supérieur de Management', 'Sacré-Cœur', 6000, 1990, 'Sacré-Cœur 3, Dakar', 'ism.sn', 'contact@ism.sn', '+221338690000', '+221771000103',
 '450 000 – 900 000 CFA/an',
 array['Gestion','Finance','Marketing','Commerce international'],
 array['Dossier de candidature','Test de niveau','Entretien individuel'],
 array['Bourse mérite ISM']),
('a0000000-0000-0000-0000-000000000004', 'Sup de Co', 'Groupe Sup de Co Dakar', 'Mermoz', 3000, 1999, 'Mermoz Pyrotechnie, Dakar', 'supdeco.sn', 'contact@supdeco.sn', '+221338600000', '+221771000104',
 '500 000 – 1 100 000 CFA/an',
 array['Commerce','Management','Communication','Logistique'],
 array['Dossier en ligne','Concours commun','Entretien de motivation'],
 array['Bourse Excellence Sup de Co']);

-- ============ LISTINGS ============
insert into public.listings (id, title, description, price, currency, period, type, surface_m2, bedrooms, bathrooms, district, distance_label, furnished, colocation_available, min_duration_months, amenities, particularities, requirements, verification_status, rating, reviews_count) values
('b0000000-0000-0000-0000-000000000001', 'Studio meublé Almadies', 'Studio entièrement meublé avec cuisine équipée, wifi haut débit et gardien 24h. Idéal pour étudiant.', 180000, 'XOF', 'mois', 'studio', 28, 1, 1, 'Almadies', '1.2 km de l''UCAD', true, false, 3,
 array['WiFi','Cuisine équipée','Gardien','Parking'],
 array['Entièrement meublé','Climatisation','3e étage avec ascenseur','Eau et électricité incluses'],
 array['Étudiant·e uniquement','Caution de 2 mois','Garant requis','Durée minimum 3 mois'],
 'published', 4.8, 24),
('b0000000-0000-0000-0000-000000000002', 'Chambre en colocation Fann', 'Belle maison partagée à deux pas de l''UCAD, ambiance conviviale entre étudiants.', 75000, 'XOF', 'mois', 'chambre', 95, 4, 2, 'Fann', '0.5 km de l''UCAD', true, true, 3,
 array['WiFi','Cuisine commune','Buanderie'],
 array['Salon commun spacieux','Jardin partagé'],
 array['Étudiant·e uniquement','Caution de 1 mois'],
 'published', 4.5, 18),
('b0000000-0000-0000-0000-000000000003', 'Appartement 2 pièces Mermoz', 'Appartement lumineux proche des grandes écoles de commerce, quartier calme et sécurisé.', 220000, 'XOF', 'mois', 'appartement', 45, 1, 1, 'Mermoz', '0.8 km de Sup de Co', true, false, 6,
 array['WiFi','Climatisation','Parking','Ascenseur'],
 array['Vue dégagée','Cuisine séparée'],
 array['Garant requis','Caution de 2 mois'],
 'published', 4.6, 12),
('b0000000-0000-0000-0000-000000000004', 'Studio Sacré-Cœur proche ISM', 'Studio fonctionnel à quelques minutes à pied de l''ISM, parfait pour étudiant en gestion.', 150000, 'XOF', 'mois', 'studio', 24, 1, 1, 'Sacré-Cœur', '0.4 km de l''ISM', false, false, 3,
 array['WiFi','Eau chaude'],
 array['Quartier calme','Proche transports'],
 array['Étudiant·e uniquement','Caution de 1 mois'],
 'published', 4.3, 9),
('b0000000-0000-0000-0000-000000000005', 'Colocation Ouakam vue mer', 'Grande villa en colocation avec vue sur l''océan, places nommées disponibles individuellement.', 95000, 'XOF', 'mois', 'maison', 160, 5, 3, 'Ouakam', '3.5 km de l''UCAD', true, true, 4,
 array['WiFi','Climatisation','Terrasse','Parking','Gardien'],
 array['Vue mer','Grand salon commun','Cuisine équipée'],
 array['Étudiant·e ou jeune actif·ve','Caution de 2 mois','Garant requis'],
 'published', 4.7, 31),
('b0000000-0000-0000-0000-000000000006', 'Chambre meublée Point E', 'Chambre indépendante dans une résidence calme, idéale pour préparer ses examens en toute sérénité.', 90000, 'XOF', 'mois', 'chambre', 18, 1, 1, 'Point E', '2.1 km de l''UCAD', true, false, 3,
 array['WiFi','Bureau','Eau chaude'],
 array['Calme','Lumineux'],
 array['Étudiant·e uniquement','Caution de 1 mois'],
 'pending', null, 0);

insert into public.listing_media (listing_id, media_type, url, position) values
('b0000000-0000-0000-0000-000000000001', 'photo', 'https://picsum.photos/seed/dakar-listing-1a/800/600', 0),
('b0000000-0000-0000-0000-000000000001', 'photo', 'https://picsum.photos/seed/dakar-listing-1b/800/600', 1),
('b0000000-0000-0000-0000-000000000001', 'video', 'https://storage.example.com/listings-media/b1/video-1.mp4', 2),
('b0000000-0000-0000-0000-000000000001', 'tour_3d', 'https://storage.example.com/listings-media/b1/tour-360.glb', 3),
('b0000000-0000-0000-0000-000000000002', 'photo', 'https://picsum.photos/seed/dakar-listing-2a/800/600', 0),
('b0000000-0000-0000-0000-000000000002', 'photo', 'https://picsum.photos/seed/dakar-listing-2b/800/600', 1),
('b0000000-0000-0000-0000-000000000003', 'photo', 'https://picsum.photos/seed/dakar-listing-3a/800/600', 0),
('b0000000-0000-0000-0000-000000000004', 'photo', 'https://picsum.photos/seed/dakar-listing-4a/800/600', 0),
('b0000000-0000-0000-0000-000000000005', 'photo', 'https://picsum.photos/seed/dakar-listing-5a/800/600', 0),
('b0000000-0000-0000-0000-000000000005', 'photo', 'https://picsum.photos/seed/dakar-listing-5b/800/600', 1),
('b0000000-0000-0000-0000-000000000005', 'video', 'https://storage.example.com/listings-media/b5/video-1.mp4', 2),
('b0000000-0000-0000-0000-000000000006', 'photo', 'https://picsum.photos/seed/dakar-listing-6a/800/600', 0);

insert into public.listing_coliving_rooms (listing_id, label, price, surface_m2, is_available) values
('b0000000-0000-0000-0000-000000000002', 'Chambre 1 — vue jardin', 75000, 14, true),
('b0000000-0000-0000-0000-000000000002', 'Chambre 2 — vue rue', 70000, 12, true),
('b0000000-0000-0000-0000-000000000002', 'Chambre 3 — avec balcon', 80000, 16, false),
('b0000000-0000-0000-0000-000000000005', 'Chambre vue mer A', 110000, 18, true),
('b0000000-0000-0000-0000-000000000005', 'Chambre vue mer B', 110000, 18, true),
('b0000000-0000-0000-0000-000000000005', 'Chambre cour intérieure', 85000, 14, true),
('b0000000-0000-0000-0000-000000000005', 'Chambre rez-de-jardin', 80000, 13, false);

insert into public.school_nearby_listings (school_id, listing_id) values
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004'),
('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003');

-- ============ RESTAURANTS ============
insert into public.restaurants (id, name, cuisine_type, district, distance_label, rating, reviews_count, price_range, phone, whatsapp, opening_hours, specialties, description, has_delivery) values
('c0000000-0000-0000-0000-000000000001', 'Chez Lamine', 'Sénégalais', 'Fann', '0.3 km de l''UCAD', 4.8, 142, '1 500 – 4 000 CFA', '+221771100001', '+221771100001', '07:00 – 22:00',
 array['Thiéboudienne','Yassa poulet','Mafé','Ceeb u jën'],
 'La cantine préférée des étudiants de l''UCAD. Cuisine familiale authentique, portions généreuses et prix étudiant.', true),
('c0000000-0000-0000-0000-000000000002', 'Le Mermoz Grill', 'Grillades', 'Mermoz', '0.6 km de Sup de Co', 4.5, 87, '2 000 – 6 000 CFA', '+221771100002', '+221771100002', '11:00 – 23:00',
 array['Brochettes','Poulet braisé','Frites maison'],
 'Ambiance décontractée, idéal pour un repas entre amis après les cours.', true),
('c0000000-0000-0000-0000-000000000003', 'Saveurs d''Almadies', 'Fusion', 'Almadies', '0.9 km du studio Almadies', 4.6, 64, '3 000 – 8 000 CFA', '+221771100003', '+221771100003', '12:00 – 22:30',
 array['Burgers gourmets','Salades fraîches','Jus naturels'],
 'Cuisine fusion soignée avec options végétariennes, terrasse agréable.', false),
('c0000000-0000-0000-0000-000000000004', 'Dibiterie Sacré-Cœur', 'Grillades', 'Sacré-Cœur', '0.2 km de l''ISM', 4.4, 51, '1 000 – 3 000 CFA', '+221771100004', '+221771100004', '17:00 – 01:00',
 array['Dibi','Moutarde maison','Oignons confits'],
 'Le rendez-vous du soir pour une dibiterie conviviale et abordable.', true),
('c0000000-0000-0000-0000-000000000005', 'Le Point E Café', 'Café / Brunch', 'Point E', '1.8 km de l''UCAD', 4.7, 39, '2 500 – 5 000 CFA', '+221771100005', '+221771100005', '08:00 – 20:00',
 array['Petit-déjeuner complet','Pâtisseries','Café touba revisité'],
 'Cadre calme et wifi gratuit, parfait pour réviser entre deux cours.', false);

insert into public.restaurant_media (restaurant_id, url, position) values
('c0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/dakar-resto-1a/800/600', 0),
('c0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/dakar-resto-1b/800/600', 1),
('c0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/dakar-resto-2a/800/600', 0),
('c0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/dakar-resto-3a/800/600', 0),
('c0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/dakar-resto-4a/800/600', 0),
('c0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/dakar-resto-5a/800/600', 0);

-- ============ TRANSPORT PROVIDERS ============
insert into public.transport_providers (id, name, category, rating, eta_label, price_label, phone, whatsapp) values
('d0000000-0000-0000-0000-000000000001', 'Yango', 'taxi', 4.6, '5 min', 'à partir de 1 500 CFA', '+221780000001', '+221780000001'),
('d0000000-0000-0000-0000-000000000002', 'Heetch Dakar', 'taxi', 4.4, '7 min', 'à partir de 1 800 CFA', '+221780000002', '+221780000002'),
('d0000000-0000-0000-0000-000000000003', 'Jakarta Express', 'moto', 4.3, '3 min', 'à partir de 800 CFA', '+221780000003', '+221780000003'),
('d0000000-0000-0000-0000-000000000004', 'YumDelivery', 'repas', 4.5, '25 min', 'frais de livraison dès 500 CFA', '+221780000004', '+221780000004'),
('d0000000-0000-0000-0000-000000000005', 'ColisRapide', 'colis', 4.2, '1 h', 'à partir de 2 000 CFA', '+221780000005', '+221780000005'),
('d0000000-0000-0000-0000-000000000006', 'DéménagePro Étudiant', 'demenagement', 4.7, 'sur rendez-vous', 'devis gratuit', '+221780000006', '+221780000006'),
('d0000000-0000-0000-0000-000000000007', 'LocAuto Dakar', 'location', 4.1, 'sur rendez-vous', 'à partir de 25 000 CFA/jour', '+221780000007', '+221780000007');

-- ============ EVENTS ============
insert into public.events (id, title, category, event_date, event_time, venue, partner, price_label, price_value, is_featured, description) values
('e0000000-0000-0000-0000-000000000001', 'Festival Salam', 'festival', '2026-07-15', '19:00', 'Place du Souvenir', 'Place du Souvenir', 'Gratuit', 0, true,
 'Festival annuel de musique sénégalaise. Concerts en plein air, gastronomie locale et exposants artisanaux.'),
('e0000000-0000-0000-0000-000000000002', 'Soirée jazz au Sorano', 'concert', '2026-06-20', '20:30', 'Théâtre Sorano', 'Sorano', '5 000 CFA', 5000, false,
 'Une soirée intimiste autour du jazz sénégalais contemporain, avec des artistes émergents de Dakar.'),
('e0000000-0000-0000-0000-000000000003', 'Conférence orientation post-bac', 'conference', '2026-06-28', '14:00', 'Institut Français', 'Institut Français', 'Gratuit', 0, false,
 'Rencontre avec des responsables d''admission de plusieurs écoles partenaires pour préparer sa rentrée.'),
('e0000000-0000-0000-0000-000000000004', 'Tournoi inter-facs de basket', 'sport', '2026-07-02', '09:00', 'Stade Iba Mar Diop', 'UCAD Sport', '1 000 CFA', 1000, false,
 'Tournoi amical entre les facultés de Dakar, ambiance garantie et stands de restauration sur place.'),
('e0000000-0000-0000-0000-000000000005', 'Nuit de la culture wolof', 'concert', '2026-07-10', '19:30', 'Place du Souvenir', 'Festival Salam', '2 000 CFA', 2000, true,
 'Concert et lectures de poésie en wolof, pour célébrer la richesse culturelle locale.'),
('e0000000-0000-0000-0000-000000000006', 'Forum des associations étudiantes', 'conference', '2026-09-05', '10:00', 'Institut Français', 'Institut Français', 'Gratuit', 0, false,
 'Découvre les associations étudiantes actives à Dakar et trouve la tienne pour la nouvelle année.');

-- ============================================================================
-- COMPTES DE DÉMO (à créer manuellement, hors seed)
--
-- Les comptes (admin et étudiants) dépendent de auth.users, que ce script ne
-- peut pas peupler directement (les mots de passe sont gérés par Supabase Auth,
-- pas par de simples INSERT SQL). Étapes :
--
-- 1. Crée un compte via l'app mobile, OU Supabase Dashboard → Authentication →
--    Users → "Add user" (avec un e-mail + mot de passe), OU `supabase auth signup`.
-- 2. Promeus-le en admin :
--      update public.profiles set role = 'admin'
--      where id = (select id from auth.users where email = 'admin@dakareaseu.test');
-- 3. (Optionnel) Associe-le à une école et un persona pour tester l'accueil :
--      update public.profiles set school_id = 'a0000000-0000-0000-0000-000000000001',
--        persona = 'nouveau' where id = (select id from auth.users where email = '...');
-- ============================================================================
