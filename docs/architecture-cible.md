# Architecture cible MVP / POC Mobile App

## Contexte

Nous développons une application mobile moderne en mode **vibe coding**, avec un objectif principal :

* sortir un MVP rapidement ;
* minimiser la maintenance infrastructure ;
* éviter de développer un backend complexe ;
* disposer immédiatement de l'authentification ;
* disposer immédiatement du stockage de fichiers ;
* disposer immédiatement d'un dashboard d'administration ;
* disposer immédiatement d'un système CRUD ;
* conserver une architecture suffisamment propre pour évoluer vers une V1/V2 plus ambitieuse.

Nous privilégions la simplicité, la rapidité de développement et le coût réduit plutôt que l'optimisation prématurée.

---

## Vision Architecture

```text
Mobile App
    │
    ▼
Supabase
    │
    ├── Auth
    ├── PostgreSQL
    ├── Storage
    ├── Realtime
    └── Edge Functions

Admin Dashboard
    │
    ▼
Next.js + Supabase

CI/CD
    │
    ▼
GitHub Actions

Hosting
    │
    ▼
Vercel
```

Nous voulons supprimer autant que possible les couches intermédiaires inutiles.

Pas de :

* NestJS
* Express
* Spring
* Laravel
* Serveur VPS
* API REST custom pour le MVP

L'application mobile doit communiquer directement avec Supabase.

---

## Stack retenue

### Mobile

**Expo** est la fondation du projet (builds Android/iOS, OTA updates, moins de friction native).
**React Native** est le framework principal — une seule base de code pour Android et iOS.
**TypeScript strict** partout. Pas de JavaScript classique.

### Interface Utilisateur

**NativeWind** comme système de styling principal (syntaxe Tailwind, ex: `<View className="flex-1 items-center justify-center">`). Éviter les gros objets `StyleSheet`.

### Gestion d'état

**Zustand** pour : utilisateur connecté, préférences, données globales, états transverses. Pas de Redux.

### Cache serveur

**TanStack Query** pour tous les appels Supabase (cache, invalidation, synchronisation). Éviter `useEffect` + fetch manuel.

### Formulaires & validation

**React Hook Form** pour tous les formulaires. **Zod** pour toutes les validations, centralisées et réutilisables (et typées TypeScript).

```ts
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
})
```

---

## Backend — Supabase

Supabase est utilisé comme : base de données, authentification, stockage, backend, realtime, API. Exploiter Supabase au maximum avant de créer des services custom.

### Authentification — Supabase Auth

Exclusivement Supabase Auth : email/password, OAuth Google, OAuth Apple, gestion session/refresh token/utilisateur. Pas de BetterAuth.

### Base de données — PostgreSQL

Source de vérité pour toutes les données métier (`users`, `organizations`, `projects`, `documents`, `media`, `comments`, `settings`, etc. — adaptées au domaine du produit).

### Sécurité — RLS

Row Level Security activée **partout**. Un utilisateur ne doit jamais accéder aux données d'un autre. Chaque table doit avoir des policies SELECT, INSERT, UPDATE, DELETE. La sécurité se pense dès le MVP.

### Stockage — Supabase Storage

Pour avatars, images, vidéos, documents, pièces jointes. Structure recommandée :

```text
avatars/
images/
videos/
documents/
attachments/
```

Sécurisé via policies Supabase.

### Temps réel — Supabase Realtime

Uniquement quand cela apporte une réelle valeur (chat, collaboration, notifications live, présence). Ne pas surutiliser.

### Logique avancée — Edge Functions

Uniquement quand : la logique ne peut pas tourner côté mobile, une clé secrète est nécessaire, ou un traitement serveur est obligatoire (paiement, intégration IA, webhooks, synchro externe).

---

## Dashboard Administrateur

Application séparée. Doit permettre : gestion utilisateurs, gestion contenus, gestion médias, CRUD complet, supervision fonctionnelle.

Stack : **Next.js + TypeScript + Supabase + shadcn/ui + TanStack Table**.

---

## Déploiement & CI/CD

* **Vercel** pour le dashboard (simplicité, preview deployments, intégration GitHub, coût réduit).
* **GitHub** comme référentiel unique (`main`, `develop`, `feature/*`).
* **GitHub Actions** : `Lint → Type Check → Tests → Build → Deploy`, automatisé, sans intervention manuelle.

---

## Philosophie de développement

Toujours privilégier, dans l'ordre : simplicité, rapidité, maintenabilité, coût faible, DX excellente, compatibilité IA.

Éviter : architecture microservices, sur-ingénierie, abstraction excessive, backend complexe, optimisation prématurée.

Pour chaque décision technique, choisir la solution la plus simple permettant d'atteindre l'objectif métier. Le MVP doit pouvoir être développé rapidement par une petite équipe assistée par des outils IA (Claude Code, Codex, Cursor, Gemini).
