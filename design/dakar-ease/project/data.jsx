// Shared data for Dakar'ease — extended

const COLORS = {
  primary: '#1E3A8A', primaryLight: '#3B5FC7', secondary: '#10B981', accent: '#F59E0B',
  bg: '#F9FAFB', card: '#FFFFFF', text: '#111827', textLight: '#6B7280', border: '#E5E7EB', danger: '#EF4444',
};

const LISTINGS = [
  {
    id: 1, title: 'Studio meublé Almadies', price: 180000, currency: 'CFA', period: '/mois', type: 'Studio', beds: 1, baths: 1, area: 28, verified: true, rating: 4.8, reviews: 24, district: 'Almadies', distance: '1.2 km UCAD', images: 3, videos: 1, tour3d: true, furnished: true, dureeMin: 3,
    description: "Studio entièrement meublé avec cuisine équipée, wifi haut débit et gardien 24h. Idéal pour étudiant.",
    amenities: ['WiFi', 'Cuisine', 'Gardien', 'Parking'],
    particularites: ['Entièrement meublé', 'Climatisation', '3e étage avec ascenseur', 'Eau & électricité incluses'],
    exigences: ['Étudiant(e) uniquement', 'Caution 2 mois', 'Garant requis', 'Durée min. 3 mois'],
    colocation: { available: false, places: [] },
  },
  {
    id: 2, title: 'Chambre colocation Fann', price: 85000, currency: 'CFA', period: '/mois', type: 'Chambre', beds: 1, baths: 1, area: 16, verified: true, rating: 4.5, reviews: 18, district: 'Fann', distance: '0.5 km UCAD', images: 4, videos: 1, tour3d: false, furnished: true, dureeMin: 3,
    description: "Chambre dans une colocation étudiante conviviale. Salon partagé, cuisine commune, à 5 min à pied de l'UCAD.",
    amenities: ['WiFi', 'Cuisine', 'Buanderie'],
    particularites: ['Salon partagé', 'Cuisine commune équipée', 'Ambiance étudiante', 'Charges partagées'],
    exigences: ['Étudiant(e) uniquement', 'Caution 1 mois', 'Non-fumeur', 'Durée min. 3 mois'],
    colocation: { available: true, places: [
      { id: 'A', label: 'Chambre A — vue cour', price: 85000, area: 16, available: true },
      { id: 'B', label: 'Chambre B — balcon', price: 95000, area: 18, available: true },
      { id: 'C', label: 'Chambre C — standard', price: 75000, area: 14, available: false },
    ] },
  },
  {
    id: 3, title: 'Appartement F3 Mermoz', price: 250000, currency: 'CFA', period: '/mois', type: 'Appartement', beds: 2, baths: 1, area: 55, verified: true, rating: 4.9, reviews: 31, district: 'Mermoz', distance: '2.0 km UCAD', images: 5, videos: 2, tour3d: true, furnished: true, dureeMin: 6,
    description: "Bel appartement F3 rénové en 2024 avec balcon. Quartier résidentiel calme, parking privé.",
    amenities: ['WiFi', 'Balcon', 'Cuisine', 'Gardien', 'Parking'],
    particularites: ['Rénové en 2024', 'Balcon plein sud', 'Parking privé', 'Quartier résidentiel calme'],
    exigences: ['Caution 2 mois', 'Garant requis', 'Bail enregistré', 'Durée min. 6 mois'],
    colocation: { available: true, places: [
      { id: 'A', label: 'Chambre principale + SdB', price: 140000, area: 22, available: true },
      { id: 'B', label: 'Chambre secondaire', price: 120000, area: 16, available: true },
    ] },
  },
  {
    id: 4, title: 'Studio Sacré-Cœur', price: 150000, currency: 'CFA', period: '/mois', type: 'Studio', beds: 1, baths: 1, area: 22, verified: false, rating: 4.2, reviews: 9, district: 'Sacré-Cœur', distance: '1.8 km UCAD', images: 2, videos: 0, tour3d: false, furnished: false, dureeMin: 3,
    description: "Petit studio fonctionnel, idéal pour un premier logement étudiant. Proche commerces et transports.",
    amenities: ['WiFi', 'Cuisine'],
    particularites: ['Non meublé', 'Proche commerces', 'Lumineux', 'Rez-de-chaussée'],
    exigences: ['Caution 1 mois', 'Durée min. 3 mois'],
    colocation: { available: false, places: [] },
  },
  {
    id: 5, title: 'Chambre meublée Ouakam', price: 95000, currency: 'CFA', period: '/mois', type: 'Chambre', beds: 1, baths: 1, area: 18, verified: true, rating: 4.6, reviews: 15, district: 'Ouakam', distance: '3.0 km UCAD', images: 3, videos: 1, tour3d: false, furnished: true, dureeMin: 3,
    description: "Chambre meublée dans une villa sécurisée avec jardin partagé et gardien 24h.",
    amenities: ['WiFi', 'Jardin', 'Gardien'],
    particularites: ['Villa sécurisée', 'Jardin partagé', 'Gardien 24h', 'Au calme'],
    exigences: ['Étudiant(e) uniquement', 'Caution 1 mois', 'Durée min. 3 mois'],
    colocation: { available: true, places: [
      { id: 'A', label: 'Chambre meublée — étage', price: 95000, area: 18, available: true },
      { id: 'B', label: 'Chambre meublée — rdc', price: 90000, area: 16, available: true },
    ] },
  },
  {
    id: 6, title: 'F2 moderne Point E', price: 200000, currency: 'CFA', period: '/mois', type: 'Appartement', beds: 1, baths: 1, area: 40, verified: true, rating: 4.7, reviews: 22, district: 'Point E', distance: '0.8 km UCAD', images: 4, videos: 1, tour3d: true, furnished: true, dureeMin: 3,
    description: "Appartement F2 moderne et lumineux au cœur de Point E, à deux pas de l'UCAD.",
    amenities: ['WiFi', 'Cuisine', 'Balcon', 'Gardien'],
    particularites: ['Moderne & lumineux', 'Balcon', 'Proche UCAD', 'Climatisation'],
    exigences: ['Caution 2 mois', 'Garant requis', 'Durée min. 3 mois'],
    colocation: { available: true, places: [
      { id: 'A', label: 'Chambre + coin bureau', price: 110000, area: 20, available: true },
      { id: 'B', label: 'Chambre standard', price: 100000, area: 14, available: false },
    ] },
  },
];

// ── Écoles / Universités ──
const SCHOOLS = [
  {
    id: 1, name: 'UCAD', full: 'Université Cheikh Anta Diop', district: 'Fann', students: '95 000', founded: 1957, hue: 220,
    address: 'Avenue Cheikh Anta Diop, Dakar-Fann',
    website: 'ucad.edu.sn', email: 'admission@ucad.edu.sn',
    whatsapp: '+221771000101', phone: '+221338249000',
    frais: '50 000 – 150 000 CFA/an',
    filieres: ['Médecine', 'Droit', 'Sciences', 'Lettres', 'Économie', 'Informatique', 'Pharmacie'],
    admission: ['Bac + dossier scolaire', 'Concours spécifiques par faculté', 'Inscription sur plateforme UCAD en ligne', 'Dossier : relevé de notes, attestation bac, photos'],
    bourses: ['Bourse nationale MESRI', 'Bourse EIFFEL (France)', 'Bourse AUF'],
    logements: [1, 2, 6],
  },
  {
    id: 2, name: 'IAM', full: 'Institut Africain de Management', district: 'Sacré-Cœur', students: '4 500', founded: 1996, hue: 30,
    address: 'Rue 5 × Rue 6, Sacré-Cœur 3, Dakar',
    website: 'iam.edu.sn', email: 'admissions@iam.sn',
    whatsapp: '+221771000202', phone: '+221338696969',
    frais: '1 500 000 – 3 500 000 CFA/an',
    filieres: ['MBA Management', 'Commerce International', 'Finance', 'Marketing Digital', 'Ressources Humaines'],
    admission: ['Bac ou équivalent', 'Test d\'aptitude IAM', 'Entretien de motivation', 'Dossier en ligne sur iam.edu.sn'],
    bourses: ['Bourse Excellence IAM', 'Partenariats entreprises'],
    logements: [4],
  },
  {
    id: 3, name: 'UGB', full: 'Université Gaston Berger', district: 'Saint-Louis', students: '12 000', founded: 1990, hue: 160,
    address: 'BP 234, Saint-Louis du Sénégal',
    website: 'ugb.edu.sn', email: 'scolarite@ugb.edu.sn',
    whatsapp: '+221771000303', phone: '+221961211840',
    frais: '50 000 – 120 000 CFA/an',
    filieres: ['Droit', 'Sciences Économiques', 'Mathématiques', 'Informatique', 'Sciences Humaines'],
    admission: ['Bac + inscription en ligne UGB', 'Concours d\'entrée pour certaines filières', 'Dossier : bac, relevés, CV'],
    bourses: ['Bourse nationale', 'Aide sociale UGB'],
    logements: [],
  },
  {
    id: 4, name: 'ESP', full: 'École Supérieure Polytechnique', district: 'Fann', students: '3 200', founded: 1964, hue: 280,
    address: 'Campus UCAD II, Route de l\'Aéroport, Dakar',
    website: 'esp.sn', email: 'contact@esp.sn',
    whatsapp: '+221771000404', phone: '+221338591077',
    frais: '150 000 – 400 000 CFA/an',
    filieres: ['Génie Civil', 'Génie Électrique', 'Informatique Industrielle', 'Architecture', 'Génie Mécanique'],
    admission: ['Bac S ou équivalent', 'Concours national ESP', 'Classement sur notes'],
    bourses: ['Bourse MESRI', 'Bourse IFE (Ingénieur Franco-Sénégalais)'],
    logements: [1, 6],
  },
  {
    id: 5, name: 'ISM', full: 'Institut Supérieur de Management', district: 'Mermoz', students: '6 800', founded: 1992, hue: 340,
    address: 'Rue 10 bis, Mermoz Pyrotechnie, Dakar',
    website: 'ism.edu.sn', email: 'info@ism.edu.sn',
    whatsapp: '+221771000505', phone: '+221338603636',
    frais: '1 200 000 – 2 800 000 CFA/an',
    filieres: ['BTS', 'Licence Management', 'Master Finance', 'MBA', 'Tourisme & Hôtellerie'],
    admission: ['Bac toutes séries', 'Entretien + test de niveau', 'Dossier : relevés, lettre motivation'],
    bourses: ['Bourse mérite ISM', 'Facilités de paiement'],
    logements: [3, 5],
  },
  {
    id: 6, name: 'Sup de Co', full: 'Sup de Co Dakar', district: 'Mermoz', students: '2 400', founded: 1992, hue: 200,
    address: 'Rue 10, Mermoz, Dakar',
    website: 'supcodakar.com', email: 'contact@supcodakar.com',
    whatsapp: '+221771000606', phone: '+221338641200',
    frais: '1 000 000 – 2 500 000 CFA/an',
    filieres: ['Bachelor Commerce', 'Marketing', 'Finance d\'entreprise', 'Entrepreneuriat'],
    admission: ['Bac ou équivalent', 'Dossier + entretien', 'Test d\'admission en ligne'],
    bourses: ['Bourse mérite', 'Tarif étudiant boursier national'],
    logements: [3, 5],
  },
  {
    id: 7, name: 'UADB', full: 'Université Alioune Diop de Bambey', district: 'Bambey', students: '8 500', founded: 2007, hue: 50,
    address: 'BP 30, Bambey, Sénégal',
    website: 'uadb.edu.sn', email: 'scolarite@uadb.edu.sn',
    whatsapp: '+221771000707', phone: '+221339731800',
    frais: '50 000 – 100 000 CFA/an',
    filieres: ['Agro-alimentaire', 'Sciences de l\'Éducation', 'Droit', 'Économie', 'Santé Communautaire'],
    admission: ['Bac + dossier UADB en ligne', 'Concours pour certaines filières'],
    bourses: ['Bourse nationale', 'Aide régionale'],
    logements: [],
  },
  {
    id: 8, name: 'Polytechnique Thiès', full: 'École Polytechnique de Thiès', district: 'Thiès', students: '2 100', founded: 1974, hue: 120,
    address: 'Route de Mbour, Thiès, Sénégal',
    website: 'ept.sn', email: 'scolarite@ept.sn',
    whatsapp: '+221771000808', phone: '+221339510004',
    frais: '200 000 – 500 000 CFA/an',
    filieres: ['Génie Civil', 'Génie Électrique', 'Génie Mécanique', 'Génie Informatique', 'Génie Industriel'],
    admission: ['Concours national d\'entrée (Maths, Physique)', 'Bac S avec mention recommandée'],
    bourses: ['Bourse MESRI', 'Bourse Gouvernement du Sénégal'],
    logements: [],
  },
];

// ── Événements culturels ──
const EVENTS = [
  { id: 1, title: 'Festival Salam', cat: 'Festival', date: '15 mai 2026', time: '19:00', venue: 'Place du Souvenir', partner: 'Place du Souvenir', price: 'Gratuit', priceVal: 0, hue: 30, attendees: 2400, description: "Festival annuel de musique sénégalaise. Concerts en plein air, gastronomie locale.", featured: true },
  { id: 2, title: 'Youssou N\'Dour Live', cat: 'Concert', date: '22 mai 2026', time: '21:00', venue: 'Théâtre Sorano', partner: 'Théâtre Sorano', price: '15 000 CFA', priceVal: 15000, hue: 220, attendees: 1200, description: "Concert exceptionnel avec le Super Étoile de Dakar.", featured: true },
  { id: 3, title: 'Conférence Tech Africa', cat: 'Conférence', date: '28 mai 2026', time: '09:00', venue: 'Institut Français', partner: 'Institut Français', price: '5 000 CFA', priceVal: 5000, hue: 280, attendees: 450, description: "Tech entrepreneurs et investisseurs ouest-africains." },
  { id: 4, title: 'Match ASC Jaraaf', cat: 'Sport', date: '02 juin 2026', time: '17:00', venue: 'Stade Léopold Senghor', partner: 'Ligue Pro Sénégal', price: '3 000 CFA', priceVal: 3000, hue: 160, attendees: 5800, description: "Derby de Dakar contre Casa Sports." },
  { id: 5, title: 'Théâtre - Sotigui', cat: 'Concert', date: '08 juin 2026', time: '20:00', venue: 'Théâtre Sorano', partner: 'Théâtre Sorano', price: '8 000 CFA', priceVal: 8000, hue: 340, attendees: 380, description: "Pièce de théâtre primée par le festival d'Avignon." },
  { id: 6, title: 'Festival Dakar Mode', cat: 'Festival', date: '14 juin 2026', time: '18:00', venue: 'Place du Souvenir', partner: 'Institut Français', price: '10 000 CFA', priceVal: 10000, hue: 200, attendees: 1800, description: "Défilés, créateurs africains, music live." },
  { id: 7, title: 'Conf. Climat Sahel', cat: 'Conférence', date: '20 juin 2026', time: '14:00', venue: 'UCAD', partner: 'Institut Français', price: 'Gratuit', priceVal: 0, hue: 50, attendees: 320, description: "Conférence académique sur le changement climatique au Sahel." },
  { id: 8, title: 'Lutte traditionnelle', cat: 'Sport', date: '28 juin 2026', time: '16:00', venue: 'Arène Nationale', partner: 'CNG Lutte', price: '5 000 CFA', priceVal: 5000, hue: 35, attendees: 12000, description: "Combat de Modou Lô vs Balla Gaye 2." },
];

// ── Transport / Livraison ──
const TRANSPORT = [
  { id: 1, name: 'Yango', cat: 'taxi', rating: 4.6, time: '5 min', price: 'à partir de 1 500 CFA', phone: '+221780000001', hue: 220 },
  { id: 2, name: 'Heetch Dakar', cat: 'taxi', rating: 4.4, time: '8 min', price: 'à partir de 2 000 CFA', phone: '+221780000002', hue: 340 },
  { id: 3, name: 'Jakarta Express', cat: 'moto', rating: 4.5, time: '3 min', price: 'à partir de 500 CFA', phone: '+221780000003', hue: 30 },
  { id: 4, name: 'Moto Sapeur', cat: 'moto', rating: 4.2, time: '4 min', price: 'à partir de 700 CFA', phone: '+221780000004', hue: 160 },
  { id: 5, name: 'Yassir Food', cat: 'repas', rating: 4.7, time: '25 min', price: 'livraison 1 000 CFA', phone: '+221780000005', hue: 30 },
  { id: 6, name: 'Dakar Eats', cat: 'repas', rating: 4.3, time: '30 min', price: 'livraison 800 CFA', phone: '+221780000006', hue: 280 },
  { id: 7, name: 'Sendoo Colis', cat: 'colis', rating: 4.5, time: '1h', price: 'à partir de 2 500 CFA', phone: '+221780000007', hue: 200 },
  { id: 8, name: 'Express Livraison', cat: 'colis', rating: 4.4, time: '45 min', price: 'à partir de 3 000 CFA', phone: '+221780000008', hue: 50 },
  { id: 9, name: 'Move Étudiant', cat: 'demenagement', rating: 4.8, time: 'sur RDV', price: 'à partir de 25 000 CFA', phone: '+221780000009', hue: 160 },
  { id: 10, name: 'Avis Sénégal', cat: 'location', rating: 4.6, time: 'sur RDV', price: 'à partir de 35 000 CFA/jour', phone: '+221780000010', hue: 215 },
];

const TRANSPORT_CATS = [
  { id: 'taxi', label: 'Taxi / VTC', icon: '🚖' },
  { id: 'moto', label: 'Moto Jakarta', icon: '🏍️' },
  { id: 'repas', label: 'Livraison repas', icon: '🍱' },
  { id: 'colis', label: 'Livraison colis', icon: '📦' },
  { id: 'demenagement', label: 'Déménagement', icon: '🚚' },
  { id: 'location', label: 'Location voiture', icon: '🚗' },
];

// ── Restaurants ──
const RESTAURANTS = [
  { id: 1, name: 'Chez Lamine', type: 'Sénégalais', district: 'Fann', distance: '0.3 km UCAD', rating: 4.8, reviews: 142, price: '1 500 – 4 000 CFA', phone: '+221771100001', whatsapp: '+221771100001', openHours: '07:00 – 22:00', images: 3, hue: 30, specialites: ['Thiéboudienne', 'Yassa poulet', 'Mafé', 'Ceeb u jën'], description: "La cantine préférée des étudiants de l'UCAD. Cuisine familiale authentique, portions généreuses et prix étudiant.", verified: true, hasDelivery: true, tableRes: true },
  { id: 2, name: 'Le Baobab Café', type: 'Café & Snack', district: 'Point E', distance: '0.8 km UCAD', rating: 4.6, reviews: 89, price: '500 – 2 500 CFA', phone: '+221771100002', whatsapp: '+221771100002', openHours: '06:30 – 21:00', images: 4, hue: 200, specialites: ['Café Touba', 'Sandwichs', 'Jus bissap', 'Croissants'], description: "Café étudiant avec WiFi gratuit. Idéal pour réviser en journée.", verified: true, hasDelivery: false, tableRes: false },
  { id: 3, name: 'Dakar Grill House', type: 'Grillades', district: 'Mermoz', distance: '2.0 km ISM', rating: 4.5, reviews: 63, price: '3 000 – 8 000 CFA', phone: '+221771100003', whatsapp: '+221771100003', openHours: '12:00 – 23:00', images: 3, hue: 15, specialites: ['Brochettes', 'Poulet DG', 'Thiof grillé', 'Côtes d\'agneau'], description: "Le meilleur grill de Mermoz. Ambiance conviviale, terrasse extérieure.", verified: true, hasDelivery: true, tableRes: true },
  { id: 4, name: 'Niangal Fast Food', type: 'Fast Food', district: 'Sacré-Cœur', distance: '0.5 km IAM', rating: 4.3, reviews: 211, price: '800 – 2 000 CFA', phone: '+221771100004', whatsapp: '+221771100004', openHours: '08:00 – 23:30', images: 2, hue: 340, specialites: ['Chawarma', 'Burger sénégalais', 'Frites', 'Boissons'], description: "Fast food rapide et pas cher. Très populaire le soir après les cours.", verified: false, hasDelivery: true, tableRes: false },
  { id: 5, name: 'Restaurant Teranga', type: 'Sénégalais', district: 'Almadies', distance: '1.5 km', rating: 4.9, reviews: 187, price: '2 000 – 6 000 CFA', phone: '+221771100005', whatsapp: '+221771100005', openHours: '11:00 – 22:30', images: 5, hue: 160, specialites: ['Thiéboudienne royale', 'Domoda', 'Bissap glacé', 'Pastels'], description: "Restaurant gastronomique sénégalais. Déjeuner buffet le week-end.", verified: true, hasDelivery: false, tableRes: true },
  { id: 6, name: 'Pizza da Moussa', type: 'Pizza & Pâtes', district: 'Ouakam', distance: '3.0 km', rating: 4.4, reviews: 54, price: '2 500 – 5 000 CFA', phone: '+221771100006', whatsapp: '+221771100006', openHours: '11:00 – 23:00', images: 3, hue: 280, specialites: ['Pizza berbère', 'Pizza sénégalaise', 'Pasta', 'Tiramisu'], description: "Pizzeria artisanale avec four à bois. Fusion afro-italienne originale.", verified: true, hasDelivery: true, tableRes: true },
];

const CATEGORIES = [
  { id: 'logements', label: 'Logements', icon: '🏠' },
  { id: 'ecoles', label: 'Écoles', icon: '🎓' },
  { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { id: 'transport', label: 'Transport', icon: '🚖' },
];

// ── i18n ──
const I18N = {
  fr: {
    welcome: 'Bienvenue', searchPlaceholder: 'Rechercher un logement...', topVerified: 'Top vérifiés',
    deals: 'Bons plans étudiants', upcoming: 'Événements à venir', viewAll: 'Voir tout',
    home: 'Accueil', search: 'Rechercher', news: 'News', favorites: 'Favoris', profile: 'Profil',
    book: 'Réserver', verified: 'Vérifié', perMonth: 'CFA/mois', rsvp: 'Je participe', share: 'Partager', save: 'Sauvegarder',
  },
  wo: {
    welcome: 'Dalal ak diam', searchPlaceholder: 'Wuti ab kër...', topVerified: 'Yu wóor',
    deals: 'Yu nooy ci jàngalekat', upcoming: 'Yi di ñëw', viewAll: 'Gis yépp',
    home: 'Kër', search: 'Wuti', news: 'Xibaar', favorites: 'Sopal', profile: 'Sama',
    book: 'Reserwe', verified: 'Wóor', perMonth: 'CFA/weer', rsvp: 'Maa ngi fa', share: 'Séddoo', save: 'Denc',
  },
  en: {
    welcome: 'Welcome', searchPlaceholder: 'Search a home...', topVerified: 'Top verified',
    deals: 'Student deals', upcoming: 'Upcoming events', viewAll: 'See all',
    home: 'Home', search: 'Search', news: 'News', favorites: 'Saved', profile: 'Profile',
    book: 'Book', verified: 'Verified', perMonth: 'CFA/month', rsvp: 'Going', share: 'Share', save: 'Save',
  },
};

// ── Personas ──
const PERSONAS = {
  nouveau: { name: 'Étudiant nouveau', greeting: 'Bienvenue à Dakar 👋', priority: ['ecoles', 'logements', 'transport'], hint: 'Découvre les écoles et logements près de toi' },
  local: { name: 'Étudiant local', greeting: 'Bonjour 👋', priority: ['logements', 'news', 'transport'], hint: 'Bons plans et événements de la semaine' },
  parent: { name: 'Parent', greeting: 'Bonsoir 👋', priority: ['logements', 'ecoles', 'news'], hint: 'Logements vérifiés et écoles partenaires' },
};

// ── Quartiers de Dakar (pour le moteur de recherche) ──
const DISTRICTS = ['Almadies', 'Fann', 'Mermoz', 'Sacré-Cœur', 'Ouakam', 'Point E'];

Object.assign(window, { COLORS, LISTINGS, SCHOOLS, RESTAURANTS, EVENTS, TRANSPORT, TRANSPORT_CATS, CATEGORIES, DISTRICTS, I18N, PERSONAS });
