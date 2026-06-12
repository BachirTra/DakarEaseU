# PROMPT — Génération complète de DakarEaseU (mobile + dashboard admin + backend + infra)

> Ce fichier est **le prompt à donner à Sonnet 4.6** (en agent d'implémentation, ex. Claude Code) pour générer
> l'intégralité du projet DakarEaseU : backend (Supabase), application mobile (Expo/React Native), dashboard
> admin (Next.js), et infrastructure/CI-CD. Il peut être copié tel quel dans une nouvelle session d'agent.

---

## 0. Ton rôle et ta méthode de travail

Tu es l'agent d'implémentation responsable de générer, de bout en bout, le **MVP complet de DakarEaseU** :
backend Supabase, application mobile Expo/React Native, dashboard d'administration Next.js, et pipeline
CI/CD — en suivant scrupuleusement la stack et la philosophie de code définies dans :

- `docs/architecture-cible.md` (stack technique cible, à respecter à la lettre — pas de NestJS/Express/API REST custom)
- `docs/philosophie-developpement.md` (organisation par feature, règles de modularité, simplicité avant tout)

**Lis ces deux documents intégralement avant de commencer.** Ils priment sur tes habitudes par défaut.

### Travaille avec des subagents, en parallèle

Ce projet a trois grandes parties largement indépendantes une fois le schéma de données posé
(mobile, dashboard admin, infra/CI-CD). **Décompose le travail et lance des subagents en parallèle**
plutôt que de tout faire séquentiellement dans un seul fil. Concrètement :

1. **Phase 0 (toi, séquentiel — c'est le socle dont tout dépend)** : modélisation des données, migrations
   SQL, policies RLS, buckets de storage, seed de données de démo, génération des types TypeScript
   Supabase (`supabase gen types typescript`). Rien d'autre ne peut commencer sérieusement avant que ce
   socle existe et soit appliqué sur un projet Supabase réel.
2. **Phase 1 (en parallèle, un subagent par piste)** — une fois le schéma posé et les types générés et
   partagés (`packages/shared` ou `packages/types`) :
   - **Subagent A — Mobile (`apps/mobile`)** : scaffold Expo + toutes les features décrites en §3.
   - **Subagent B — Dashboard admin (`apps/admin`)** : scaffold Next.js + shadcn/ui + toutes les
     entités CRUD décrites en §10.
   - **Subagent C — Infra/CI-CD** : monorepo, GitHub Actions, configuration Vercel, scripts de setup.
   Donne à chaque subagent : le schéma de données final, les conventions de §2/§9/§10, et la portion de
   périmètre fonctionnel qui le concerne. Ils ne doivent pas se marcher dessus (dossiers distincts).
3. **Phase 2 (toi, intégration)** : vérifie la cohérence entre les trois pistes (types partagés, env vars,
   policies RLS testées depuis le mobile ET l'admin), lance lint/typecheck/tests/build, corrige les
   éventuels conflits d'intégration.

Si un point reste ambigu en cours de route : **pose la question avant d'improviser** — c'est moins coûteux
que de devoir défaire un mauvais choix structurant.

---

## 1. Contexte produit

**DakarEaseU** est une super-app mobile pour les étudiants à Dakar (et dans une moindre mesure leurs
parents). Elle centralise tout ce dont un étudiant a besoin pour s'installer et vivre à Dakar :

- trouver un **logement** vérifié près de son école (studio, chambre, appartement, colocation) ;
- découvrir et comparer des **écoles/universités** partenaires (UCAD, ESP, ISM, Sup de Co, etc.) ;
- trouver des **restaurants** étudiants à proximité ;
- commander un **transport/livraison** (taxi, moto-taxi, repas, colis, déménagement, location) ;
- suivre l'actualité **culturelle/événementielle** de Dakar et y participer (RSVP, billets) ;
- gérer ses **favoris**, son **profil**, et faire des **réservations** de bout en bout (recherche guidée
  avec matching → réservation → paiement → évaluation post-séjour).

> ℹ️ **Note sur le nom** : le prototype de design (voir §4) a été conçu sous le nom **"Dakar'ease"**, mais
> le nom retenu pour le produit final est **"DakarEaseU"**. Renomme partout : wordmark in-app, package
> IDs / bundle identifiers, nom du projet Supabase, nom du repo GitHub, app name Expo/EAS, métadonnées
> store. Aucune trace de "Dakar'ease" ne doit subsister dans le code livré (hors historique de design).

---

## 2. Stack technique (résumé — voir `docs/architecture-cible.md` pour le détail)

| Domaine | Choix | À ne PAS faire |
|---|---|---|
| Mobile | Expo + React Native + TypeScript strict | JavaScript classique |
| UI mobile | NativeWind (Tailwind-like) | Gros objets `StyleSheet` |
| État global | Zustand (user connecté, préférences, transverse) | Redux, stocker les données serveur dans Zustand |
| Données serveur | TanStack Query (`useQuery`/`useMutation`) | `useEffect(async () => {})` |
| Formulaires | React Hook Form + Zod (validations centralisées et typées) | Validation ad hoc dispersée |
| Backend | Supabase (Auth + PostgreSQL + Storage + Realtime ciblé + Edge Functions ciblées) | NestJS, Express, Spring, Laravel, VPS, API REST custom |
| Sécurité | RLS activé sur **toutes** les tables, policies SELECT/INSERT/UPDATE/DELETE | Logique de sécurité uniquement côté frontend |
| Dashboard admin | Next.js + TypeScript + Supabase + shadcn/ui + TanStack Table, app séparée (`apps/admin`) | Dupliquer la logique métier mobile/admin |
| Hébergement admin | Vercel | — |
| CI/CD | GitHub Actions : Lint → Type Check → Tests → Build → Deploy | Déploiement manuel |
| Repo | GitHub, branches `main` / `develop` / `feature/*` | — |

**Le mobile et l'admin parlent directement à Supabase.** Pas de couche API intermédiaire.

---

## 3. Référence de design — à RECRÉER, pas à copier

Un bundle de design exporté depuis Claude Design se trouve dans **`design/dakar-ease/`** :

- `design/dakar-ease/README.md` — note d'intention du bundle ;
- `design/dakar-ease/chats/chat1.md`, `chat2.md`, `chat3.md` — **transcripts de conception, à lire en
  premier** : ils racontent l'évolution du produit et toutes les décisions fonctionnelles prises avec
  l'utilisateur (c'est là que vit l'intention produit, pas seulement dans le code) ;
- `design/dakar-ease/project/Dakar-ease App.html` — le prototype HTML/JSX final (interactif, dans un
  cadre iPhone). **Lis-le en entier et suis ses imports** (`data.jsx`, `components.jsx`, `screens.jsx`,
  `screens2.jsx`, `screens3.jsx`, `screens4.jsx`, `ios-frame.jsx`, `tweaks-panel.jsx`).

**Consigne du bundle (à respecter)** : c'est un prototype HTML/CSS/JS, pas du code de prod. **Recrée le
rendu visuel pixel pour pixel** dans la stack cible (React Native + NativeWind), mais **ne copie PAS la
structure interne du prototype** (web React, styles inline, état local naïf) — réécris proprement selon
`docs/philosophie-developpement.md` (organisation par feature, hooks, services, TanStack Query, Zustand,
Zod). Toutes les dimensions, couleurs (`COLORS` dans `data.jsx`), règles de mise en page sont dans le
code source — inutile de lancer un navigateur ou de prendre des captures d'écran.

### ⚠️ Écarts à appliquer entre le prototype et le produit final

Le prototype a évolué au fil des itérations et contient des éléments qui **ne doivent PAS** se retrouver
dans le produit final, ainsi que des décisions prises spécifiquement pour ce projet (voir §4 — Décisions
produit). Avant d'implémenter un écran ou une donnée du prototype, vérifie qu'il n'est pas concerné par
l'un des écarts listés en §4. En particulier :

- **"Bailleurs / Agences"** : entièrement supprimé du prototype final (chat3.md) — ne doit apparaître
  **nulle part** (catégorie, persona, écran, lien, champ "propriétaire" sur une annonce). C'est déjà
  acquis dans le dernier état du design ; assure-toi de ne pas le réintroduire par erreur en lisant
  d'anciennes versions des fichiers.
- **Le panneau "Tweaks" (Mood / Persona / Langue / Densité...)** visible dans `tweaks-panel.jsx` est un
  **outil d'exploration de design**, pas une fonctionnalité produit. Ne construis PAS de "sélecteur
  d'ambiance" ni de bascule de palette dans l'app livrée. Choisis **une seule identité visuelle
  définitive** : la palette "Confiance" (bleu `#1E3A8A` / vert `#10B981` / ambre `#F59E0B`, cf. `COLORS`
  dans `data.jsx`) — c'était le choix par défaut et le visual_ambition demandé était "conservateur,
  cohérent avec l'existant".
- En revanche, le concept de **persona** (Étudiant nouveau / local / Parent) peut devenir une vraie
  fonctionnalité produit légère : déduite des réponses données à l'onboarding (et stockée sur le profil),
  elle peut influencer l'ordre de mise en avant des sections sur l'accueil et le message d'accueil — sans
  bascule manuelle visible, sans complexité ajoutée.
- Le **Espace admin mobile** (écran `AdminDashboard` accessible via Profil, dans `screens4.jsx`) est
  **supprimé de l'app mobile**. Toute la gestion (annonces, demandes, réservations, KPIs, vérification
  étudiante) se fait exclusivement dans le **dashboard Next.js séparé** (voir §10). Aucun lien "Espace
  admin" ne doit apparaître dans l'app mobile.

---

## 4. Décisions produit pour ce MVP (clarifiées avec le porteur de projet)

Ces choix priment sur ce que tu observerais dans le prototype ou déduirais par défaut :

1. **Nom** : `DakarEaseU` partout (voir note §1).
2. **Dashboard admin** : exclusivement l'app Next.js séparée (`apps/admin`) — pas d'écran admin in-app.
3. **Paiement (Wave / Orange Money / Carte bancaire)** : **simulé** pour le MVP. Implémente le flux UI
   complet (sélection du moyen de paiement, confirmation, enregistrement en base avec un statut
   `payment_status` simulé), **sans appel à de vraies API de paiement**. Conçois le code pour qu'un vrai
   provider (Wave, Orange Money, Stripe...) puisse être branché plus tard via une Edge Function unique
   sans réécrire le flux (ex. interface `processPayment(method, amount, ref)` côté Edge Function, dont
   l'implémentation MVP se contente de marquer la transaction comme réussie après un court délai).
4. **Langues / i18n** : **français uniquement** au lancement, mais avec un **scaffolding i18n complet**
   (toutes les chaînes passent par un système de clés de traduction — réutilise la structure `I18N` de
   `data.jsx` comme base — fichiers `fr.json` rempli, `wo.json`/`en.json` présents mais vides ou partiels)
   pour pouvoir ajouter le wolof et l'anglais plus tard sans refactoring. Pas de sélecteur de langue
   visible dans l'UI du MVP si une seule langue est dispo (ou alors désactivé/grisé avec mention "bientôt").
5. **Realtime (Supabase Realtime)** : utilisation **ciblée**, uniquement pour : (a) le statut d'une
   réservation de logement (en attente → confirmée → refusée), (b) la confirmation de RSVP à un
   événement, (c) la notification d'une nouvelle "demande" (recherche guidée) côté dashboard admin. Tout
   le reste (listes, fiches, recherche) passe par TanStack Query classique (fetch + cache + invalidation).
   Pas de chat, pas de présence, pas de collaboration temps réel.
6. **Vérification de la carte étudiante** : **revue manuelle par un admin**, pas d'OCR automatisé.
   L'étudiant uploade une photo de sa carte dans Supabase Storage (bucket privé) lors de l'onboarding ;
   un admin la consulte et l'approuve/rejette depuis le dashboard Next.js (qui met à jour
   `profiles.verification_status`). Pas de service tiers d'OCR/IA, pas d'Edge Function pour ça au MVP.
7. **Médias des annonces (photos, vidéos, visites 3D à 360°)** : **tout est uploadé dans Supabase
   Storage** (pas de liens externes YouTube/Matterport). Prévoir des buckets/dossiers dédiés et des
   policies adaptées (lecture publique pour les médias d'annonces publiées, écriture restreinte au
   propriétaire de l'annonce / à l'admin). Attention à la taille des fichiers vidéo : prévoir une limite
   raisonnable côté upload (ex. quelques dizaines de Mo) et une compression/format recommandé dans la doc
   d'upload, sans sur-ingénierer un pipeline de transcodage pour le MVP.
8. **Comptes & accès externes** :
   - À créer **immédiatement** (gratuits) : organisation/dépôt **GitHub**, projet **Supabase**, projet
     **Vercel**, compte **Expo/EAS**, **Google Cloud Console** (pour OAuth Google — gratuit). Le prompt
     d'exécution doit guider la création de ces comptes/projets et la configuration des clés/`.env`.
   - **Différés** (payants) : **Apple Developer Program** (~99 $/an, nécessaire pour "Sign in with Apple"
     ET la publication iOS). **Ne bloque pas le MVP dessus** : conçois l'authentification pour que
     l'ajout d'Apple Sign-In soit une simple activation côté Supabase Auth + variables d'environnement le
     jour où le compte est actif (le bouton "Continuer avec Apple" peut être présent dans l'UI mais
     désactivé/masqué tant que le provider n'est pas configuré — décide au moment de l'implémentation si
     tu préfères le masquer complètement pour le MVP ou l'afficher en `disabled`). Documente clairement
     dans un `README`/`SETUP.md` les étapes restantes une fois le compte payant disponible.

---

## 5. Périmètre fonctionnel (features) — synthèse pour la génération

Pour chaque feature ci-dessous, base-toi sur les écrans et flux du prototype (en lisant `screens*.jsx`
et `data.jsx` dans `design/dakar-ease/project/`) en appliquant les écarts du §3 et les décisions du §4.
Organise le code mobile en dossiers `features/<nom>/` (cf. `docs/philosophie-developpement.md`).

### `auth` — Authentification & onboarding
Splash animé → Onboarding (3 étapes) → Auth (connexion/inscription email+mot de passe, OAuth Google,
OAuth Apple [cf. §4.8]) → sélection de l'école → upload carte étudiante → app principale. Persona déduite
des réponses d'onboarding (cf. §3) et stockée sur le profil.

### `home` — Accueil
Recherche, accès à la recherche guidée, **logements partenaires** et **écoles partenaires** mis en avant
en haut (carrousels), événements à venir, restaurants à proximité, bons plans étudiants. Catégories :
Logements / Écoles / Restaurants / Transport.

### `housing` — Logements
- Liste + filtres (type, budget, quartier, durée, meublé, colocation).
- **Recherche guidée** (`Demande`) : formulaire multi-étapes (type, école/quartier, budget, meublé,
  colocation, durée) → **algorithme de matching** qui score chaque logement par compatibilité (% +
  raisons) et trie les résultats — réutilise la logique de `computeMatches` dans `screens4.jsx` comme
  référence fonctionnelle, à réimplémenter proprement (idéalement côté base via une fonction SQL/RPC
  Supabase pour rester cohérent avec "la logique métier critique vit dans PostgreSQL", ou côté client si
  le volume reste faible pour le MVP — à toi de juger selon la philosophie "ne pas sur-ingénierer").
- **Fiche logement** : carrousel photos + vidéos + **visite 3D 360°** (médias hébergés Supabase Storage,
  cf. §4.7), description, équipements, **particularités**, **exigences**, **colocation** (proposée ou
  non, places nommées avec prix/disponibilité individuels), **durée minimum de location**, avis/notes.
  **Aucune mention de propriétaire/bailleur** (cf. §3).
- **Réservation** : flux multi-étapes — sélection (logement entier ou place en colocation) → dates +
  **durée** (gestion d'un minimum de 3 mois, calcul du total = durée × prix) → paiement simulé (Wave /
  Orange Money / Carte, cf. §4.3) → confirmation animée.
- **Évaluation post-séjour** : notes + commentaire après une réservation terminée.

### `schools` — Écoles
Annuaire (UCAD, IAM, UGB, ESP, ISM, Sup de Co, UADB, Polytechnique Thiès...) avec fiche détail :
filières, frais, bourses, process d'admission étape par étape, contacts (téléphone, email, WhatsApp,
site web), logements à proximité, et **moyens d'adhésion/contact directs**.

### `restaurants` — Restaurants
Même squelette de workflow que les logements (liste avec filtres par type, fiche détail avec
spécialités, horaires, avis). **Pas de tag "Vérifié"**. Action principale = **voir le menu / commander**
(livraison ou appel téléphonique) — pas de "réserver une table" (cf. décision prise en chat3.md).

### `transport` — Transport / Livraison
Annuaire par catégories (Taxi/VTC, Moto-taxi, Livraison repas, Livraison colis, Déménagement étudiant,
Location voiture) avec contact direct (appel, WhatsApp).

### `news` — News & Événements culturels
Onglets par catégorie (Concert, Festival, Conférence, Sport), événement à la une, fiche détail, **RSVP /
"Je participe"** → ticket avec QR code → check-in, sauvegarde dans "Mes événements", partage WhatsApp.
Partenaires d'exemple : Sorano, Institut Français, Festival Salam, Place du Souvenir.

### `favorites` — Favoris
Logements et restaurants sauvegardés.

### `profile` — Profil
Infos utilisateur, langue (cf. §4.4), mes réservations, mes événements, mes avis, paramètres,
déconnexion. **Pas de lien "Espace admin"** (cf. §3).

### `notifications` — Notifications ciblées (Realtime)
Cf. §4.5 : statut de réservation, confirmation RSVP, (côté admin) nouvelle demande de recherche guidée.

---

## 6. Modèle de données (PostgreSQL / Supabase)

Conçois les migrations SQL dans `supabase/migrations/`. Voici les entités identifiées à partir des
données du prototype (`design/dakar-ease/project/data.jsx`) et des flux décrits — affine les colonnes/
types/contraintes/index selon les besoins réels des écrans, sans sur-modéliser :

- **`profiles`** (1-1 avec `auth.users`) : `role` (student/admin), `full_name`, `avatar_url`, `school_id`,
  `persona`, `language`, `verification_status` (pending/approved/rejected), `verification_doc_url`.
- **`schools`** : nom, sigle, district, nb étudiants, année de fondation, adresse, contacts (site, email,
  téléphone, whatsapp), frais, filières, process d'admission, bourses.
- **`listings`** (logements) : titre, description, prix, devise, période, type, surface, nb chambres/sdb,
  quartier (`district`), distance/proximité, statut de vérification, meublé, durée min, propriétaire
  (= référence interne pour la modération admin uniquement, **jamais exposée côté mobile**).
  - **`listing_media`** : photos / vidéos / visites 3D (URL Storage, type, ordre).
  - **`listing_features`** ou colonnes `text[]` : particularités, équipements, exigences (à toi de choisir
    entre tableaux Postgres et tables de jointure selon ce qui reste simple à interroger/filtrer).
  - **`listing_coliving_rooms`** : places de colocation nommées (label, prix, surface, disponibilité).
- **`restaurants`** : nom, type de cuisine, quartier, distance, note, fourchette de prix, contacts,
  horaires, spécialités, livraison oui/non.
- **`transport_providers`** : nom, catégorie, note, délai, tarif indicatif, téléphone.
- **`events`** : titre, catégorie, date/heure, lieu, partenaire, prix, à la une (oui/non), description.
  - **`event_rsvps`** : utilisateur, événement, statut (intéressé/confirmé), code QR de check-in.
- **`bookings`** (réservations de logement) : utilisateur, logement (et éventuellement
  `coliving_room_id`), dates, durée (mois), montant total, `payment_method`, `payment_status` (simulé),
  `status` (pending/confirmed/cancelled/completed).
- **`guided_search_requests`** ("demandes") : utilisateur, critères (type, école/quartier, budget,
  meublé, colocation, durée), résultats/scores éventuellement recalculés à la volée — visibles côté admin.
- **`reviews`** : auteur, cible (logement / restaurant / séjour), note, commentaire, date.
- **`favorites`** : utilisateur, type d'entité (logement/restaurant), référence.
- **`notifications`** : destinataire, type, contenu, lu/non lu, référence à l'objet concerné.

> Toutes les tables qui contiennent des données personnelles ou propres à un utilisateur doivent avoir
> des policies RLS strictes (un étudiant ne voit que ses propres réservations/favoris/demandes/avis/
> vérification). Les tables de référence publique (logements publiés, écoles, restaurants, transport,
> événements) ont une lecture publique mais une écriture réservée aux admins (et, pour les logements,
> potentiellement aux propriétaires si ce rôle existe — sinon, gestion 100% admin pour le MVP, à
> trancher simplement selon ce qui est suffisant).

---

## 7. Stockage (Supabase Storage)

Buckets recommandés (cf. §4.7 — tout en Storage, pas de liens externes) :

```text
avatars/            (public-read, écriture = propriétaire du profil)
listings-media/     (public-read pour annonces publiées ; écriture = admin/propriétaire)
restaurants-media/  (public-read ; écriture = admin)
schools-media/      (public-read ; écriture = admin)
events-media/       (public-read ; écriture = admin)
student-ids/        (PRIVÉ — lecture/écriture = propriétaire + admin uniquement, jamais public)
```

Définis des policies de bucket cohérentes avec les RLS des tables associées.

---

## 8. Realtime & Edge Functions

- **Realtime** : canaux ciblés uniquement sur `bookings.status`, `event_rsvps.status`, et
  `guided_search_requests` (nouvelles entrées → notification admin). Cf. §4.5.
- **Edge Functions** : à n'utiliser **que** si une clé secrète ou un traitement serveur est strictement
  nécessaire. Pour ce MVP (paiement simulé, pas d'OCR, pas d'intégrations tierces), **il est probable
  qu'aucune Edge Function ne soit indispensable au lancement** — privilégie RLS + fonctions SQL/RPC quand
  c'est suffisant. Documente dans le code/README les points d'extension prévus pour la V2 (vrai paiement
  Wave/Orange Money/Stripe, OCR de carte étudiante, notifications push via webhook) afin qu'ajouter une
  Edge Function plus tard reste trivial.

---

## 9. Application mobile (`apps/mobile`)

Structure conforme à `docs/philosophie-developpement.md` — dossiers par feature (`features/auth`,
`features/home`, `features/housing`, `features/schools`, `features/restaurants`, `features/transport`,
`features/news`, `features/favorites`, `features/profile`), plus `shared/`, `services/`, `providers/`,
`hooks/`, `constants/`, `lib/`, `types/`.

- **Design system** : reconstitue l'identité visuelle à partir de `COLORS` et des règles de mise en page
  du prototype (`design/dakar-ease/project/`), configurée comme thème NativeWind (palette, rayons,
  typographie) — une seule identité, pas de switcher (cf. §3).
- **Navigation** : barre de navigation basse (Accueil, Recherche, News, Favoris, Profil) + écrans modaux/
  empilés pour les détails et flux de réservation, fidèle à la structure du prototype.
- **i18n** : scaffolding complet en FR (cf. §4.4), structure de clés inspirée de `I18N` dans `data.jsx`.
- **Données serveur** : exclusivement via hooks `useXxx` (TanStack Query) qui appellent des services
  Supabase typés (`*.service.ts`). Formulaires : React Hook Form + schémas Zod dans `schemas/`.
- **État global** : Zustand uniquement pour session utilisateur, langue, préférences UI transverses.

---

## 10. Dashboard admin (`apps/admin`)

Application Next.js séparée, structure conforme à `docs/philosophie-developpement.md` (organisation par
feature, layouts imbriqués, colocation). UI : **shadcn/ui** + **TanStack Table** pour les listes/CRUD.
Auth : Supabase Auth, accès réservé aux comptes avec `profiles.role = 'admin'`.

Fonctionnalités à couvrir (en remplacement complet de l'écran `AdminDashboard` du prototype, cf. §3) :

- **Vue d'ensemble** : KPIs (annonces en ligne, réservations du mois, demandes en attente, revenus),
  graphiques simples (réservations par mois, taux d'occupation par quartier).
- **Gestion des annonces (logements/restaurants/écoles/événements/transport)** : CRUD complet, validation/
  publication des annonces soumises, gestion des médias (upload vers Supabase Storage).
- **Gestion des utilisateurs** : liste, rôles, blocage/déblocage.
- **Vérification étudiante** : file d'attente des cartes uploadées, visualisation du document (depuis le
  bucket privé `student-ids/`), approbation/rejet → met à jour `profiles.verification_status` (cf. §4.6).
- **Demandes (recherche guidée)** : liste des `guided_search_requests`, critères, éventuellement les
  meilleurs matchs calculés.
- **Réservations** : suivi des statuts, montants, confirmation/annulation.
- **Modération des avis** : visibilité/suppression si nécessaire.

---

## 11. Packages partagés (`packages/`)

- **`packages/shared`** : schémas Zod réutilisés entre mobile et admin (validations communes), constantes
  métier (catégories, statuts...), utilitaires purs.
- **`packages/types`** : types TypeScript générés depuis Supabase (`supabase gen types typescript`) +
  types métier dérivés. Source de vérité unique pour les deux apps.
- N'introduis **`packages/ui`** que si un besoin réel de composants visuels partagés entre mobile (RN) et
  admin (web) apparaît — ce qui est rare vu les rendus différents (React Native vs DOM). Si ce n'est pas
  le cas, ne le crée pas (cf. "le meilleur code est souvent le code qui n'existe pas").

---

## 12. Infrastructure & CI/CD

- **Monorepo** : structure `apps/{mobile,admin}` + `packages/{shared,types}` + `supabase/` (cf.
  `docs/philosophie-developpement.md`). Utilise des **workspaces** (pnpm ou npm, au choix le plus simple
  à mettre en place pour Expo + Next.js ensemble) — pas de Turborepo/Nx tant que la taille du projet ne
  le justifie pas.
- **Repo GitHub** : branches `main` (prod), `develop` (intégration), `feature/*`. Crée le repo et
  configure les protections de branche de base.
- **Comptes/projets à provisionner immédiatement** (cf. §4.8) : Supabase (projet + clés), Vercel (projet
  lié au repo, déploiement de `apps/admin`), Expo/EAS (projet, builds Android/iOS de dev), Google Cloud
  Console (identifiants OAuth Google pour Supabase Auth), GitHub (repo + secrets d'Actions). Documente
  chaque étape dans un `SETUP.md` avec la liste des variables d'environnement nécessaires (`.env.example`
  pour chaque app).
- **GitHub Actions** : pipeline `Lint → Type Check → Tests → Build → Deploy`.
  - Pour `apps/admin` : déploiement automatique sur Vercel (preview sur PR, prod sur `main`).
  - Pour `apps/mobile` : lint/typecheck/tests + build EAS déclenché manuellement ou sur tag (les builds
    natifs sont longs et coûteux — ne pas les lancer sur chaque push).
  - Pour `supabase/` : lint des migrations + application automatisée sur l'environnement de
    staging/preview si pertinent (`supabase db push` ou équivalent), en restant simple.
- **Secrets** : toutes les clés sensibles (clé service-role Supabase, secrets OAuth, futurs secrets de
  paiement) en GitHub Secrets / Vercel env vars / EAS secrets — jamais commitées.

---

## 13. Définition du "Done" — critères d'acceptation

- [ ] Toutes les migrations SQL s'appliquent proprement sur un projet Supabase neuf ; RLS activé et
      **testé** sur chaque table sensible (un compte étudiant A ne peut ni lire ni modifier les données
      d'un compte étudiant B — à vérifier concrètement, pas supposé).
- [ ] Types TypeScript générés et partagés entre `apps/mobile` et `apps/admin`.
- [ ] App mobile : tous les écrans/flux du §5 sont navigables et fonctionnels ; tous les formulaires
      validés via React Hook Form + Zod ; toutes les données serveur passent par TanStack Query (zéro
      `useEffect` de fetch) ; état global limité à Zustand pour le transverse.
- [ ] Dashboard admin : CRUD complet et opérationnel sur toutes les entités du §10, déployé sur Vercel,
      accès restreint aux comptes admin.
- [ ] Realtime fonctionnel sur les trois cas ciblés du §4.5 (et seulement ceux-là).
- [ ] Paiement simulé bout en bout (sélection → confirmation → enregistrement → écran de succès), avec
      le point d'extension pour un vrai provider clairement identifié dans le code.
- [ ] Médias (photos/vidéos/3D) uploadables et consultables depuis Supabase Storage, avec policies
      vérifiées (un visiteur ne peut pas accéder au bucket privé `student-ids/`).
- [ ] TypeScript strict, zéro erreur de typecheck, lint propre, sur les deux apps.
- [ ] Pipeline GitHub Actions vert (lint, typecheck, tests, build, deploy admin sur Vercel).
- [ ] `SETUP.md` à jour : comptes/projets créés, variables d'environnement documentées, étapes restantes
      pour Apple Sign-In/publication iOS clairement listées comme "à faire une fois le compte Apple
      Developer actif".
- [ ] Aucune trace de "Dakar'ease", "bailleur"/"agence", panneau de tweaks, ou écran admin in-app dans
      le code livré.

---

## 14. À éviter explicitement (rappel)

NestJS, Express, Spring, Laravel, serveur VPS, API REST custom, Redux, `useEffect` pour le fetch de
données serveur, `StyleSheet` massif, organisation du code par type technique (`components/`, `hooks/`,
`services/` à la racine plutôt que par feature), abstractions/couches sans besoin métier réel,
sur-ingénierie du paiement/de l'OCR/du temps réel, microservices, optimisation prématurée.

---

## 15. Références

- Stack & architecture cible : `docs/architecture-cible.md`
- Philosophie de code : `docs/philosophie-developpement.md`
- Bundle de design (lire les chats EN PREMIER, puis le HTML/JSX) : `design/dakar-ease/`
  - Données de référence (entités, palette `COLORS`, i18n) : `design/dakar-ease/project/data.jsx`
  - Algorithme de matching de référence : `design/dakar-ease/project/screens4.jsx` (`computeMatches`)
