# Dashboard Admin DakarEaseU (`apps/admin`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire `apps/admin`, l'unique surface d'administration de DakarEaseU — une application Next.js (App Router, TypeScript strict) avec shadcn/ui + TanStack Table + TanStack Query, qui permet au staff (comptes `profiles.role = 'admin'`) de gérer entièrement les annonces (logements), écoles, restaurants, transport, événements, la vérification des cartes étudiantes, les réservations, les demandes de recherche guidée et la modération des avis — en remplacement complet de l'écran `AdminDashboard` du prototype mobile (cf. prompt.md §3, supprimé de l'app mobile).

**Architecture:** Next.js App Router parle **directement** à Supabase (pas de backend intermédiaire). Deux clients Supabase : un client navigateur (clé anon, respecte RLS, `@supabase/ssr` `createBrowserClient`) utilisé par défaut dans les composants client, et un client serveur basé sur les cookies de session (Route Handlers/Server Components) — également avec la clé anon, donc RLS s'applique selon le rôle de l'utilisateur connecté. Comme la quasi-totalité des opérations d'écriture admin sont déjà autorisées par les policies RLS via `public.is_admin()`, une session admin authentifiée suffit pour l'essentiel des CRUD. Un client **service-role** dédié (clé secrète serveur uniquement, jamais `NEXT_PUBLIC_*`) n'est utilisé que pour les opérations que RLS ne peut pas exprimer : lister les emails / dates de dernière connexion depuis `auth.users` pour la gestion des utilisateurs. Les données serveur passent exclusivement par TanStack Query ; Zustand (s'il est utilisé) ne contient que de l'état UI/session, jamais de données serveur — cf. `docs/philosophie-developpement.md`. Tous les formulaires utilisent React Hook Form + Zod, en réutilisant `packages/shared` et `packages/types` comme source de vérité partagée avec le mobile.

**Tech Stack:** Next.js 14 (App Router) + TypeScript strict, Tailwind CSS, shadcn/ui, TanStack Table v8, TanStack Query v5, React Hook Form + Zod, `@supabase/ssr` + `@supabase/supabase-js`, `sonner` (toasts), Vitest + React Testing Library, déploiement Vercel.

---

## Avant de commencer

- **Prérequis : le plan `2026-06-07-supabase-foundation.md` doit être exécuté et vert.** Ce plan est la référence absolue pour les noms exacts de tables/colonnes/enums/RPC/buckets — ne dévie d'aucun nom sans le vérifier dans ce fichier. Rappel des éléments utilisés ici :
  - Tables : `profiles, schools, listings, listing_media, listing_coliving_rooms, school_nearby_listings, restaurants, restaurant_media, transport_providers, events, event_rsvps, bookings, guided_search_requests, reviews, favorites, notifications`.
  - Enums clés : `verification_status (pending|approved|rejected)` sur `profiles`, `listing_verification_status (pending|published|rejected)` sur `listings`, `booking_status (pending|confirmed|cancelled|completed)`, `payment_status (pending|success|failed)`, `guided_search_status (open|matched|closed)`, `user_role (student|admin)`, `listing_type (studio|chambre|appartement|maison)`, `media_type (photo|video|tour_3d)`, `notification_type (booking_status_update|event_rsvp_confirmed|new_guided_search_request|verification_status_update)`.
  - Colonnes `profiles` : `id, role, full_name, avatar_url, phone, school_id, persona, language, verification_status, verification_doc_url, is_blocked`.
  - `listings.created_by` : référence interne admin uniquement (jamais exposée côté mobile, mais affichable/gérable ici).
  - Buckets Storage : `avatars` (public), `listings-media` (public), `restaurants-media` (public), `schools-media` (public), `events-media` (public), `student-ids` (**privé** — policy `student_ids_select_owner_or_admin` autorise les admins en lecture).
  - RPC `match_listings(p_type, p_budget, p_school_id, p_district, p_furnished, p_coloc, p_months)` retournant `setof match_result (listing_id, match_pct, reasons)`.
  - `packages/types` exporte `Database`, `Tables<T>/TablesInsert<T>/TablesUpdate<T>/Enums<T>`, et des alias directs : `Profile, School, Listing, ListingMedia, ListingColivingRoom, Restaurant, TransportProvider, EventRow, EventRsvp, Booking, GuidedSearchRequest, Review, Favorite, Notification, UserRole, PersonaType, ListingType, BookingStatus, PaymentMethod, PaymentStatus`.
- Tu as besoin des variables d'environnement suivantes (valeurs dans Supabase Dashboard → Project Settings → API, déjà présentes dans `.env` racine si le plan foundation est passé) :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ jamais préfixé `NEXT_PUBLIC_`, jamais committé, jamais envoyé au navigateur)
- Toutes les commandes ci-dessous supposent que tu es à la racine du repo (`C:\Users\BachirTraore\Desktop\Freelance\DakarEaseU`), sous PowerShell. Le repo est un monorepo pnpm (`apps/{mobile,admin}`, `packages/{shared,types}`) — la structure racine (`pnpm-workspace.yaml`, `package.json` racine) est posée par le plan infra ; si elle n'existe pas encore au moment où tu commences, Task 0 ci-dessous la crée a minima pour ne pas bloquer.
- Crée un compte admin de test avant de commencer les tâches d'authentification (Task 4) : suis la procédure documentée en bas de `supabase/seed/seed.sql` (créer un utilisateur via Supabase Dashboard → Authentication → Users → "Add user", puis `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'admin@dakareaseu.test');`).

---

## Structure de dossiers cible (`apps/admin/src/`)

```text
apps/admin/
├── src/
│   ├── app/                          # App Router : routes, layouts, pages
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # garde d'accès admin + nav latérale
│   │   │   ├── page.tsx              # vue d'ensemble / KPIs
│   │   │   ├── listings/
│   │   │   ├── schools/
│   │   │   ├── restaurants/
│   │   │   ├── transport/
│   │   │   ├── events/
│   │   │   ├── verifications/
│   │   │   ├── bookings/
│   │   │   ├── guided-search/
│   │   │   ├── reviews/
│   │   │   └── users/
│   │   └── api/                      # Route Handlers (service-role only when needed)
│   ├── features/                     # organisation par feature (philosophie)
│   │   ├── listings/{components,hooks,services,schemas,types}
│   │   ├── schools/...
│   │   ├── restaurants/...
│   │   ├── transport/...
│   │   ├── events/...
│   │   ├── verifications/...
│   │   ├── bookings/...
│   │   ├── guided-search/...
│   │   ├── reviews/...
│   │   ├── users/...
│   │   └── overview/...
│   ├── components/ui/                # shadcn/ui generated components
│   ├── shared/                       # composants/hooks/utils transverses
│   ├── providers/                    # QueryClientProvider, ToasterProvider
│   ├── lib/                          # supabase clients, utils
│   └── types/
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

### Task 0: Scaffolding du projet `apps/admin`

**Files:**

- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/next.config.mjs`
- Create: `apps/admin/postcss.config.mjs`
- Create: `apps/admin/tailwind.config.ts`
- Create: `apps/admin/src/app/globals.css`
- Create: `apps/admin/src/app/layout.tsx`
- Create: `apps/admin/src/app/page.tsx`
- Create: `apps/admin/.env.local.example`
- Modify (créer si absent) : `pnpm-workspace.yaml` (racine)

- [ ] **Step 1: Vérifier/poser le workspace pnpm racine**

Run: `Get-Content "C:\Users\BachirTraore\Desktop\Freelance\DakarEaseU\pnpm-workspace.yaml" -ErrorAction SilentlyContinue`
Expected: si le fichier existe déjà (posé par le plan infra), il contient `apps/*` et `packages/*` — passe au Step 2. Sinon (sortie vide), crée-le :

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

(Écris ce contenu dans `C:\Users\BachirTraore\Desktop\Freelance\DakarEaseU\pnpm-workspace.yaml` — n'écrase pas un fichier existant qui contient déjà ces entrées.)

- [ ] **Step 2: Scaffolder le projet Next.js**

Run (depuis la racine du repo) :

```bash
cd apps
npx create-next-app@latest admin --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-pnpm
```

Expected: crée `apps/admin/` avec App Router, TypeScript, Tailwind, ESLint configurés. Réponds "No" à toute question sur Turbopack si elle apparaît (on garde le bundler par défaut pour la stabilité avec shadcn).

- [ ] **Step 3: Activer le mode strict TypeScript**

Lis `apps/admin/tsconfig.json`, puis assure-toi que `compilerOptions.strict` vaut `true` (c'est la valeur par défaut de `create-next-app`, vérifie-le). Si elle est absente ou à `false`, ajoute/modifie la ligne :

```json
    "strict": true,
```

- [ ] **Step 4: Nettoyer la page d'accueil par défaut**

Remplace le contenu de `apps/admin/src/app/page.tsx` par une redirection simple vers le dashboard (la page réelle de connexion/dashboard sera posée dans les tâches suivantes) :

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
}
```

- [ ] **Step 5: Créer le fichier d'exemple de variables d'environnement**

Crée `apps/admin/.env.local.example` :

```bash
# Client (exposées au navigateur — préfixe NEXT_PUBLIC_ obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Serveur uniquement — NE JAMAIS préfixer NEXT_PUBLIC_, ne jamais committer de vraie valeur,
# ne jamais référencer dans un composant client. Utilisé uniquement par les Route Handlers
# qui doivent contourner RLS (cf. lib/supabase/admin-client.ts et la section "Gestion des
# utilisateurs" — lecture de auth.users que RLS ne peut pas exposer).
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 6: Vérifier que le projet démarre**

Run: `cd apps/admin && pnpm install && pnpm dev`
Expected: le serveur Next.js démarre sur `http://localhost:3000`, et la console n'affiche aucune erreur de compilation. Arrête le serveur (`Ctrl+C`) une fois vérifié.

- [ ] **Step 7: Commit**

```bash
git add apps/admin pnpm-workspace.yaml
git commit -m "chore(admin): scaffolder le projet Next.js apps/admin (App Router, TypeScript strict, Tailwind)"
```

---

### Task 1: Installer et configurer shadcn/ui + TanStack Table/Query + dépendances de formulaires

**Files:**

- Create: `apps/admin/components.json` (généré par `shadcn`)
- Create: `apps/admin/src/components/ui/*` (générés par `shadcn add`)
- Create: `apps/admin/src/lib/utils.ts` (généré par `shadcn init`)
- Create: `apps/admin/src/providers/query-provider.tsx`
- Create: `apps/admin/src/providers/toast-provider.tsx`
- Modify: `apps/admin/src/app/layout.tsx`

- [ ] **Step 1: Initialiser shadcn/ui**

Run (depuis `apps/admin`) :

```bash
cd apps/admin
npx shadcn@latest init -d
```

Expected: crée `components.json`, `src/lib/utils.ts`, met à jour `tailwind.config.ts` et `globals.css` avec les tokens de thème shadcn (`-d` accepte les valeurs par défaut : style "new-york", couleur de base "neutral", CSS variables activées).

- [ ] **Step 2: Ajouter les composants shadcn/ui nécessaires**

Run (un seul appel groupé, depuis `apps/admin`) :

```bash
npx shadcn@latest add button table dialog form input select badge tabs sonner sheet card label textarea checkbox switch dropdown-menu separator skeleton avatar tooltip
```

Expected: crée les fichiers correspondants sous `src/components/ui/` (ex. `button.tsx`, `table.tsx`, `dialog.tsx`, `form.tsx`, `input.tsx`, `select.tsx`, `badge.tsx`, `tabs.tsx`, `sonner.tsx`, `sheet.tsx`, `card.tsx`, `label.tsx`, `textarea.tsx`, `checkbox.tsx`, `switch.tsx`, `dropdown-menu.tsx`, `separator.tsx`, `skeleton.tsx`, `avatar.tsx`, `tooltip.tsx`), sans erreur.

- [ ] **Step 3: Installer TanStack Table, TanStack Query, React Hook Form, Zod et utilitaires**

Run (depuis `apps/admin`) :

```bash
pnpm add @tanstack/react-table @tanstack/react-query @tanstack/react-query-devtools react-hook-form @hookform/resolvers zod @supabase/ssr @supabase/supabase-js date-fns
pnpm add -D @tanstack/eslint-plugin-query
```

Expected: les paquets apparaissent dans `apps/admin/package.json` sous `dependencies`/`devDependencies`, `pnpm-lock.yaml` est mis à jour.

- [ ] **Step 4: Créer le provider TanStack Query**

Crée `apps/admin/src/providers/query-provider.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 5: Créer le provider de toasts**

Crée `apps/admin/src/providers/toast-provider.tsx` :

```tsx
'use client';

import { Toaster } from '@/components/ui/sonner';

export function ToastProvider() {
  return <Toaster richColors position="top-right" />;
}
```

- [ ] **Step 6: Brancher les providers dans le layout racine**

Lis `apps/admin/src/app/layout.tsx`, puis remplace son contenu par :

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DakarEaseU — Admin',
  description: "Dashboard d'administration DakarEaseU",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Vérifier que le build passe**

Run: `cd apps/admin && pnpm build`
Expected: le build Next.js se termine avec `Compiled successfully`, sans erreur TypeScript ni ESLint bloquante.

- [ ] **Step 8: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): installer et configurer shadcn/ui, TanStack Table/Query, React Hook Form et Zod"
```

---

### Task 2: Clients Supabase (navigateur, serveur, service-role) et types partagés

**Files:**

- Create: `apps/admin/src/lib/supabase/browser-client.ts`
- Create: `apps/admin/src/lib/supabase/server-client.ts`
- Create: `apps/admin/src/lib/supabase/admin-client.ts`
- Create: `apps/admin/src/lib/supabase/README.md`

- [ ] **Step 1: Vérifier que `packages/types` est accessible comme dépendance workspace**

Lis `apps/admin/package.json`. Ajoute la dépendance vers le package de types partagé (édite le fichier pour inclure, dans `dependencies`) :

```json
    "@dakareaseu/types": "workspace:*"
```

Run: `cd apps/admin && pnpm install`
Expected: `pnpm` résout `@dakareaseu/types` vers `../../packages/types` sans erreur (le package doit déjà exister suite au plan foundation, Task 11).

- [ ] **Step 2: Créer le client navigateur (clé anon, respecte RLS)**

Crée `apps/admin/src/lib/supabase/browser-client.ts` :

```ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@dakareaseu/types';

/**
 * Client Supabase pour les Client Components.
 * Utilise la clé anonyme : toutes les requêtes passent par RLS, scopées à la
 * session de l'utilisateur connecté (cf. policies `public.is_admin()` du plan
 * foundation — un compte admin authentifié peut lire/écrire la quasi-totalité
 * des tables grâce à ces policies, sans contournement de sécurité).
 *
 * C'est le client À UTILISER PAR DÉFAUT. Ne crée un client service-role que
 * pour les exceptions documentées dans `admin-client.ts`.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: Créer le client serveur basé sur les cookies (Server Components / Route Handlers / Server Actions)**

Crée `apps/admin/src/lib/supabase/server-client.ts` :

```ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@dakareaseu/types';

/**
 * Client Supabase pour Server Components, Route Handlers et Server Actions.
 * Reconstitue la session de l'utilisateur connecté à partir des cookies —
 * toutes les requêtes respectent donc RLS exactement comme le client
 * navigateur, mais côté serveur (utile pour le rendu initial et les gardes
 * de route). Clé anonyme : AUCUN contournement de RLS ici.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Appelé depuis un Server Component : ignoré, le middleware rafraîchit la session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Idem : ignoré en dehors d'un Server Action / Route Handler.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 4: Créer le client service-role (exceptions documentées uniquement)**

Crée `apps/admin/src/lib/supabase/admin-client.ts` :

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@dakareaseu/types';

/**
 * Client Supabase avec la clé SERVICE ROLE — contourne complètement RLS.
 *
 * ⚠️ N'IMPORTE JAMAIS ce module depuis un Client Component ('use client') ni
 * depuis du code exécuté dans le navigateur : `SUPABASE_SERVICE_ROLE_KEY`
 * n'est pas préfixée `NEXT_PUBLIC_`, donc Next.js refusera de l'embarquer côté
 * client — mais importer ce module depuis un fichier client provoquerait une
 * erreur au runtime ("supabaseKey is required"). Réserve-le aux Route Handlers
 * et Server Actions.
 *
 * QUAND L'UTILISER (liste exhaustive — si ton besoin n'y figure pas, utilise
 * `createSupabaseServerClient()` à la place) :
 *   1. Lire `auth.users` (email, `last_sign_in_at`, `created_at`, `banned_until`)
 *      pour la liste des utilisateurs — RLS ne peut pas exposer le schéma `auth`
 *      aux clients PostgREST, et ces colonnes ne sont pas dupliquées dans
 *      `profiles`. Voir `features/users/services/users.service.ts`.
 *   2. Bloquer/débloquer un compte au niveau Auth (`auth.admin.updateUserById`
 *      avec `ban_duration`) en complément de la mise à jour de `profiles.is_blocked`
 *      (qui, elle, passe par le client RLS standard).
 *
 * NE PAS l'utiliser pour : CRUD sur `listings`, `schools`, `restaurants`,
 * `transport_providers`, `events`, mises à jour de `profiles.verification_status`,
 * `bookings.status`, `guided_search_requests.status`, suppression de `reviews`
 * — toutes ces opérations sont déjà couvertes par les policies RLS
 * `public.is_admin()` du plan foundation : une session admin authentifiée via
 * le client RLS standard suffit, et c'est STRICTEMENT préférable (defense in
 * depth — cf. "le frontend est toujours considéré compromis",
 * `docs/philosophie-developpement.md`).
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY est manquante. Ce client ne doit être instancié ' +
        'que côté serveur (Route Handler / Server Action) avec la variable définie ' +
        "dans les variables d'environnement Vercel / .env.local — jamais côté client.",
    );
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 5: Documenter la convention dans un README de dossier**

Crée `apps/admin/src/lib/supabase/README.md` :

```markdown
# Clients Supabase — `apps/admin`

| Client            | Fichier             | Clé          | Respecte RLS ?         | Utilisable dans                                                                               |
| ----------------- | ------------------- | ------------ | ---------------------- | --------------------------------------------------------------------------------------------- |
| Navigateur        | `browser-client.ts` | anon         | Oui                    | Client Components (`'use client'`)                                                            |
| Serveur (cookies) | `server-client.ts`  | anon         | Oui                    | Server Components, Route Handlers, Server Actions                                             |
| Service-role      | `admin-client.ts`   | service role | **Non — la contourne** | UNIQUEMENT Route Handlers / Server Actions, pour les 2 exceptions documentées dans le fichier |

**Règle par défaut : utilise `browser-client.ts` ou `server-client.ts`.** Comme la
quasi-totalité des écritures admin sont déjà autorisées par les policies RLS
`public.is_admin()` (cf. `2026-06-07-supabase-foundation.md`), une session admin
authentifiée suffit. Le client service-role est réservé aux opérations que RLS ne
peut techniquement pas exprimer (lecture de `auth.users`, ban au niveau Auth).
```

- [ ] **Step 6: Vérifier que le typecheck passe**

Run: `cd apps/admin && pnpm exec tsc --noEmit`
Expected: aucune erreur (sortie vide, code de sortie 0).

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/lib/supabase apps/admin/package.json apps/admin/pnpm-lock.yaml
git commit -m "feat(admin): ajouter les clients Supabase navigateur/serveur/service-role et leur documentation d'usage"
```

---

### Task 3: Authentification admin — page de connexion, middleware, garde de layout

**Files:**

- Create: `apps/admin/middleware.ts`
- Create: `apps/admin/src/features/auth/schemas/login.schema.ts`
- Create: `apps/admin/src/features/auth/components/login-form.tsx`
- Create: `apps/admin/src/app/(auth)/login/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/layout.tsx`
- Create: `apps/admin/src/features/auth/services/auth.service.ts`
- Create: `apps/admin/src/features/auth/hooks/use-sign-out.ts`

- [ ] **Step 1: Créer le middleware de session/protection (`@supabase/ssr` cookies pattern)**

Crée `apps/admin/middleware.ts` :

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@dakareaseu/types';

const PUBLIC_PATHS = ['/login'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Rafraîchit la session si besoin (écrit les cookies mis à jour dans `response`)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

- [ ] **Step 2: Créer le schéma Zod du formulaire de connexion**

Crée `apps/admin/src/features/auth/schemas/login.schema.ts` :

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

- [ ] **Step 3: Créer le service d'authentification**

Crée `apps/admin/src/features/auth/services/auth.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { LoginFormValues } from '../schemas/login.schema';

export async function signInWithPassword({ email, password }: LoginFormValues) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function fetchCurrentProfileRole(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error) throw error;
  return data.role;
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

- [ ] **Step 4: Créer le formulaire de connexion**

Crée `apps/admin/src/features/auth/components/login-form.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { signInWithPassword, fetchCurrentProfileRole } from '../services/auth.service';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      const { user } = await signInWithPassword(values);
      if (!user) throw new Error('Connexion impossible.');

      const role = await fetchCurrentProfileRole(user.id);
      if (role !== 'admin') {
        await import('@/lib/supabase/browser-client').then(({ createSupabaseBrowserClient }) =>
          createSupabaseBrowserClient().auth.signOut(),
        );
        toast.error('Ce compte ne dispose pas des droits administrateur.');
        return;
      }

      const redirectedFrom = searchParams.get('redirectedFrom') ?? '/dashboard';
      toast.success('Connexion réussie.');
      router.replace(redirectedFrom);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>DakarEaseU — Espace admin</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@dakareaseu.test" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Créer la page de connexion**

Crée `apps/admin/src/app/(auth)/login/page.tsx` :

```tsx
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
```

- [ ] **Step 6: Créer le hook de déconnexion**

Crée `apps/admin/src/features/auth/hooks/use-sign-out.ts` :

```ts
'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { signOut } from '../services/auth.service';

export function useSignOut() {
  const router = useRouter();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      router.replace('/login');
      router.refresh();
    },
  });
}
```

- [ ] **Step 7: Créer le layout protégé du dashboard (garde `role = 'admin'` côté serveur)**

Crée `apps/admin/src/app/(dashboard)/layout.tsx` :

```tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { DashboardShell } from '@/shared/components/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <DashboardShell adminName={profile.full_name ?? user.email ?? 'Admin'}>
      {children}
    </DashboardShell>
  );
}
```

- [ ] **Step 8: Créer le shell de navigation du dashboard**

Crée `apps/admin/src/shared/components/dashboard-shell.tsx` :

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';

const NAV_ITEMS = [
  { href: '/dashboard', label: "Vue d'ensemble" },
  { href: '/dashboard/listings', label: 'Annonces' },
  { href: '/dashboard/schools', label: 'Écoles' },
  { href: '/dashboard/restaurants', label: 'Restaurants' },
  { href: '/dashboard/transport', label: 'Transport' },
  { href: '/dashboard/events', label: 'Événements' },
  { href: '/dashboard/verifications', label: 'Vérification étudiante' },
  { href: '/dashboard/bookings', label: 'Réservations' },
  { href: '/dashboard/guided-search', label: 'Demandes' },
  { href: '/dashboard/reviews', label: 'Avis' },
  { href: '/dashboard/users', label: 'Utilisateurs' },
];

export function DashboardShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-card p-4">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold">DakarEaseU</p>
          <p className="text-sm text-muted-foreground">Espace admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <p className="text-sm text-muted-foreground">Connecté en tant que {adminName}</p>
          <Button variant="outline" size="sm" onClick={() => signOut.mutate()}>
            Déconnexion
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Vérifier le flux de connexion manuellement**

Run: `cd apps/admin && pnpm dev`
Expected: ouvrir `http://localhost:3000` redirige vers `/login` (pas de session). Connecte-toi avec le compte admin de test (`admin@dakareaseu.test` / le mot de passe choisi à la création) → redirection vers `/dashboard` (page pas encore créée, 404 attendu temporairement — sera créée Task 5). Tente de te connecter avec un compte `role = 'student'` → message d'erreur "Ce compte ne dispose pas des droits administrateur." et pas de redirection. Arrête le serveur.

- [ ] **Step 10: Commit**

```bash
git add apps/admin/middleware.ts apps/admin/src/features/auth apps/admin/src/app/\(auth\) apps/admin/src/app/\(dashboard\)/layout.tsx apps/admin/src/shared
git commit -m "feat(admin): ajouter authentification, middleware de session et garde de layout (role=admin)"
```

---

### Task 4: Packages partagés — schémas Zod et constantes communes (`packages/shared`)

**Files:**

- Create: `packages/shared/package.json` (si absent)
- Create: `packages/shared/src/schemas/listing.schema.ts`
- Create: `packages/shared/src/constants/enums-labels.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Vérifier si `packages/shared` existe déjà**

Run: `Get-ChildItem "C:\Users\BachirTraore\Desktop\Freelance\DakarEaseU\packages\shared" -ErrorAction SilentlyContinue`
Expected: si le dossier existe (posé par un autre plan en parallèle), passe directement au Step 3 et adapte les imports d'`index.ts` existant plutôt que de l'écraser. Sinon, continue au Step 2.

- [ ] **Step 2: Poser le package `packages/shared` (squelette minimal)**

Crée `packages/shared/package.json` :

```json
{
  "name": "@dakareaseu/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

Crée `packages/shared/tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Créer le schéma Zod partagé pour les annonces (réutilisé mobile + admin)**

Crée `packages/shared/src/schemas/listing.schema.ts` :

```ts
import { z } from 'zod';

export const LISTING_TYPES = ['studio', 'chambre', 'appartement', 'maison'] as const;
export const MEDIA_TYPES = ['photo', 'video', 'tour_3d'] as const;
export const LISTING_VERIFICATION_STATUSES = ['pending', 'published', 'rejected'] as const;

/**
 * Schéma de base d'une annonce — partagé entre la création/édition admin
 * (`apps/admin`) et l'affichage/validation éventuelle côté mobile. Les champs
 * correspondent 1:1 aux colonnes de `public.listings` (cf. plan foundation).
 */
export const listingSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z.coerce.number().min(0, 'Le prix doit être positif'),
  currency: z.string().default('XOF'),
  period: z.string().default('mois'),
  type: z.enum(LISTING_TYPES),
  surface_m2: z.coerce.number().min(0).optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).optional().nullable(),
  district: z.string().min(1, 'Le quartier est requis'),
  distance_label: z.string().optional().nullable(),
  furnished: z.boolean().default(false),
  colocation_available: z.boolean().default(false),
  min_duration_months: z.coerce.number().int().min(1).default(3),
  amenities: z.array(z.string()).default([]),
  particularities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  verification_status: z.enum(LISTING_VERIFICATION_STATUSES).default('pending'),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

export const colivingRoomSchema = z.object({
  label: z.string().min(1, 'Le nom de la chambre est requis'),
  price: z.coerce.number().min(0),
  surface_m2: z.coerce.number().min(0).optional().nullable(),
  is_available: z.boolean().default(true),
});

export type ColivingRoomFormValues = z.infer<typeof colivingRoomSchema>;
```

- [ ] **Step 4: Créer les constantes de libellés d'enums (FR — réutilisées dans les filtres et badges admin)**

Crée `packages/shared/src/constants/enums-labels.ts` :

```ts
/**
 * Libellés FR pour les enums métier — source de vérité unique pour l'affichage
 * (badges, filtres, sélecteurs) côté mobile ET admin. Garde ces clés strictement
 * synchronisées avec les enums Postgres définis dans le plan foundation.
 */
export const LISTING_TYPE_LABELS: Record<string, string> = {
  studio: 'Studio',
  chambre: 'Chambre',
  appartement: 'Appartement',
  maison: 'Maison',
};

export const LISTING_VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  published: 'Publiée',
  rejected: 'Rejetée',
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  success: 'Réussi',
  failed: 'Échoué',
};

export const GUIDED_SEARCH_STATUS_LABELS: Record<string, string> = {
  open: 'Ouverte',
  matched: 'Matchée',
  closed: 'Fermée',
};
```

- [ ] **Step 5: Exporter depuis l'index du package**

Crée ou modifie `packages/shared/src/index.ts` (si le fichier existe déjà avec d'autres exports, ajoute ces lignes sans supprimer les existantes) :

```ts
export * from './schemas/listing.schema';
export * from './constants/enums-labels';
```

- [ ] **Step 6: Ajouter la dépendance dans `apps/admin` et vérifier le typecheck**

Édite `apps/admin/package.json`, ajoute dans `dependencies` :

```json
    "@dakareaseu/shared": "workspace:*"
```

Run: `cd apps/admin && pnpm install && pnpm exec tsc --noEmit`
Expected: aucune erreur de type ; `@dakareaseu/shared` se résout vers `../../packages/shared`.

- [ ] **Step 7: Commit**

```bash
git add packages/shared apps/admin/package.json apps/admin/pnpm-lock.yaml
git commit -m "feat(shared): ajouter schémas Zod et libellés d'enums partagés (listings, statuts)"
```

---

### Task 5: Vue d'ensemble — KPIs et page d'accueil du dashboard

**Files:**

- Create: `apps/admin/src/features/overview/services/overview.service.ts`
- Create: `apps/admin/src/features/overview/hooks/use-overview-stats.ts`
- Create: `apps/admin/src/features/overview/components/kpi-card.tsx`
- Create: `apps/admin/src/app/(dashboard)/page.tsx`
- Test: `apps/admin/src/features/overview/services/overview.service.test.ts`

- [ ] **Step 1: Créer le service de récupération des KPIs**

Crée `apps/admin/src/features/overview/services/overview.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export interface OverviewStats {
  pendingListings: number;
  pendingVerifications: number;
  openGuidedSearchRequests: number;
  recentBookingsCount: number;
}

/**
 * Compte les éléments nécessitant l'attention de l'admin. Utilise `head: true`
 * + `count: 'exact'` pour ne récupérer que le total (pas les lignes), ce qui
 * reste performant même quand les tables grossissent.
 */
export async function fetchOverviewStats(): Promise<OverviewStats> {
  const supabase = createSupabaseBrowserClient();

  const [pendingListings, pendingVerifications, openRequests, recentBookings] = await Promise.all([
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase
      .from('guided_search_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  for (const result of [pendingListings, pendingVerifications, openRequests, recentBookings]) {
    if (result.error) throw result.error;
  }

  return {
    pendingListings: pendingListings.count ?? 0,
    pendingVerifications: pendingVerifications.count ?? 0,
    openGuidedSearchRequests: openRequests.count ?? 0,
    recentBookingsCount: recentBookings.count ?? 0,
  };
}
```

- [ ] **Step 2: Écrire le test du service (mappe correctement les compteurs)**

Crée `apps/admin/src/features/overview/services/overview.service.test.ts` :

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchOverviewStats } from './overview.service';

const countResult = (count: number) => ({ count, error: null });

const selectChain = (count: number) => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => Promise.resolve(countResult(count)));
  chain.gte = vi.fn(() => Promise.resolve(countResult(count)));
  return chain;
};

vi.mock('@/lib/supabase/browser-client', () => ({
  createSupabaseBrowserClient: () => ({
    from: vi.fn((table: string) => {
      const counts: Record<string, number> = {
        listings: 3,
        profiles: 5,
        guided_search_requests: 2,
        bookings: 11,
      };
      return selectChain(counts[table] ?? 0);
    }),
  }),
}));

describe('fetchOverviewStats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps each count query to the correct stat field', async () => {
    const stats = await fetchOverviewStats();

    expect(stats).toEqual({
      pendingListings: 3,
      pendingVerifications: 5,
      openGuidedSearchRequests: 2,
      recentBookingsCount: 11,
    });
  });
});
```

- [ ] **Step 3: Lancer le test pour vérifier qu'il passe (la doublure simule directement le service)**

Run: `cd apps/admin && pnpm vitest run src/features/overview/services/overview.service.test.ts`
Expected: `1 passed` — si Vitest n'est pas encore configuré, ce test échoue avec "command not found" ou "no test files found" ; reviens-y une fois la Task 14 (configuration des tests) effectuée, puis relance cette commande pour confirmer le passage au vert avant de committer cette tâche.

- [ ] **Step 4: Créer le hook TanStack Query**

Crée `apps/admin/src/features/overview/hooks/use-overview-stats.ts` :

```ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOverviewStats } from '../services/overview.service';

export function useOverviewStats() {
  return useQuery({
    queryKey: ['overview', 'stats'],
    queryFn: fetchOverviewStats,
    staleTime: 60_000,
  });
}
```

- [ ] **Step 5: Créer le composant de carte KPI**

Crée `apps/admin/src/features/overview/components/kpi-card.tsx` :

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function KpiCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: number | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Créer la page de vue d'ensemble**

Crée `apps/admin/src/app/(dashboard)/page.tsx` :

```tsx
'use client';

import { useOverviewStats } from '@/features/overview/hooks/use-overview-stats';
import { KpiCard } from '@/features/overview/components/kpi-card';

export default function OverviewPage() {
  const { data, isLoading } = useOverviewStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground">Indicateurs nécessitant votre attention.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Annonces en attente de validation"
          value={data?.pendingListings}
          isLoading={isLoading}
        />
        <KpiCard
          label="Vérifications étudiantes en attente"
          value={data?.pendingVerifications}
          isLoading={isLoading}
        />
        <KpiCard
          label="Demandes de recherche guidée ouvertes"
          value={data?.openGuidedSearchRequests}
          isLoading={isLoading}
        />
        <KpiCard
          label="Réservations (30 derniers jours)"
          value={data?.recentBookingsCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: connecté en tant qu'admin, `/dashboard` affiche 4 cartes KPI avec les compteurs réels (les valeurs dépendent des données de seed — au moins 1 annonce `pending` d'après le seed du plan foundation, donc "Annonces en attente de validation" doit afficher au moins `1`). Arrête le serveur.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/features/overview apps/admin/src/app/\(dashboard\)/page.tsx
git commit -m "feat(admin): ajouter la vue d'ensemble avec KPIs (annonces/vérifications/demandes/réservations en attente)"
```

---

### Task 6: Gestion des annonces (logements) — liste TanStack Table avec filtres

**Files:**

- Create: `apps/admin/src/features/listings/services/listings.service.ts`
- Create: `apps/admin/src/features/listings/hooks/use-listings.ts`
- Create: `apps/admin/src/features/listings/components/listings-columns.tsx`
- Create: `apps/admin/src/features/listings/components/listings-table.tsx`
- Create: `apps/admin/src/features/listings/components/listings-filters.tsx`
- Create: `apps/admin/src/app/(dashboard)/listings/page.tsx`
- Test: `apps/admin/src/features/listings/components/listings-columns.test.tsx`

- [ ] **Step 1: Créer le service de liste filtrée**

Crée `apps/admin/src/features/listings/services/listings.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Listing, ListingType, Enums } from '@dakareaseu/types';

export type ListingVerificationStatus = Enums<'listing_verification_status'>;

export interface ListingsFilters {
  verificationStatus?: ListingVerificationStatus | 'all';
  district?: string | 'all';
  type?: ListingType | 'all';
}

export async function fetchListings(filters: ListingsFilters): Promise<Listing[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase.from('listings').select('*').order('created_at', { ascending: false });

  if (filters.verificationStatus && filters.verificationStatus !== 'all') {
    query = query.eq('verification_status', filters.verificationStatus);
  }
  if (filters.district && filters.district !== 'all') {
    query = query.eq('district', filters.district);
  }
  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchListingDistricts(): Promise<string[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('listings').select('district');
  if (error) throw error;
  return Array.from(new Set(data.map((row) => row.district))).sort();
}

export async function updateListingVerificationStatus(
  id: string,
  status: ListingVerificationStatus,
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('listings')
    .update({ verification_status: status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteListing(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 2: Créer le hook TanStack Query (liste + mutation de statut)**

Crée `apps/admin/src/features/listings/hooks/use-listings.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchListingDistricts,
  fetchListings,
  updateListingVerificationStatus,
  deleteListing,
  type ListingsFilters,
  type ListingVerificationStatus,
} from '../services/listings.service';

export function useListings(filters: ListingsFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
  });
}

export function useListingDistricts() {
  return useQuery({
    queryKey: ['listings', 'districts'],
    queryFn: fetchListingDistricts,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateListingVerificationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingVerificationStatus }) =>
      updateListingVerificationStatus(id, status),
    onSuccess: () => {
      toast.success('Statut de vérification mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      toast.success('Annonce supprimée.');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 3: Définir les colonnes TanStack Table**

Crée `apps/admin/src/features/listings/components/listings-columns.tsx` :

```tsx
'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { Listing } from '@dakareaseu/types';
import { LISTING_TYPE_LABELS, LISTING_VERIFICATION_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  published: 'default',
  rejected: 'destructive',
};

export const listingsColumns: ColumnDef<Listing>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <Link href={`/dashboard/listings/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => LISTING_TYPE_LABELS[row.original.type] ?? row.original.type,
  },
  {
    accessorKey: 'district',
    header: 'Quartier',
  },
  {
    accessorKey: 'price',
    header: 'Prix',
    cell: ({ row }) => `${row.original.price.toLocaleString('fr-FR')} ${row.original.currency}`,
  },
  {
    accessorKey: 'verification_status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.verification_status;
      return (
        <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>
          {LISTING_VERIFICATION_STATUS_LABELS[status] ?? status}
        </Badge>
      );
    },
  },
];
```

- [ ] **Step 4: Écrire le test des colonnes (le statut "pending" affiche le bon libellé et badge)**

Crée `apps/admin/src/features/listings/components/listings-columns.test.tsx` :

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { listingsColumns } from './listings-columns';
import type { Listing } from '@dakareaseu/types';

const sampleListing = {
  id: 'b0000000-0000-0000-0000-000000000006',
  title: 'Chambre meublée Point E',
  description: null,
  price: 90000,
  currency: 'XOF',
  period: 'mois',
  type: 'chambre',
  surface_m2: null,
  bedrooms: null,
  bathrooms: null,
  district: 'Point E',
  distance_label: null,
  furnished: true,
  colocation_available: false,
  min_duration_months: 3,
  amenities: [],
  particularities: [],
  requirements: [],
  verification_status: 'pending',
  rating: null,
  reviews_count: 0,
  created_by: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
} satisfies Listing;

function TableHarness({ data }: { data: Listing[] }) {
  const table = useReactTable({
    data,
    columns: listingsColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <table>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

describe('listingsColumns', () => {
  it('renders the French label and badge for a pending listing', () => {
    render(<TableHarness data={[sampleListing]} />);

    expect(screen.getByText('Chambre meublée Point E')).toBeInTheDocument();
    expect(screen.getByText('Chambre')).toBeInTheDocument();
    expect(screen.getByText('Point E')).toBeInTheDocument();
    expect(screen.getByText('90 000 XOF')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Lancer le test**

Run: `cd apps/admin && pnpm vitest run src/features/listings/components/listings-columns.test.tsx`
Expected: `1 passed`.

- [ ] **Step 6: Créer le composant de filtres**

Crée `apps/admin/src/features/listings/components/listings-filters.tsx` :

```tsx
'use client';

import { LISTING_TYPE_LABELS, LISTING_VERIFICATION_STATUS_LABELS } from '@dakareaseu/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListingDistricts } from '../hooks/use-listings';
import type { ListingsFilters } from '../services/listings.service';

export function ListingsFiltersBar({
  filters,
  onChange,
}: {
  filters: ListingsFilters;
  onChange: (filters: ListingsFilters) => void;
}) {
  const { data: districts = [] } = useListingDistricts();

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={filters.verificationStatus ?? 'all'}
        onValueChange={(value) =>
          onChange({
            ...filters,
            verificationStatus: value as ListingsFilters['verificationStatus'],
          })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut de vérification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {Object.entries(LISTING_VERIFICATION_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.district ?? 'all'}
        onValueChange={(value) => onChange({ ...filters, district: value })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Quartier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les quartiers</SelectItem>
          {districts.map((district) => (
            <SelectItem key={district} value={district}>
              {district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? 'all'}
        onValueChange={(value) => onChange({ ...filters, type: value as ListingsFilters['type'] })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Type de logement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {Object.entries(LISTING_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 7: Créer le composant de table générique réutilisable**

Crée `apps/admin/src/shared/components/data-table.tsx` :

```tsx
'use client';

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  emptyMessage = 'Aucun résultat.',
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Chargement…
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 8: Créer le composant de table des annonces (orchestration filtres + données)**

Crée `apps/admin/src/features/listings/components/listings-table.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DataTable } from '@/shared/components/data-table';
import { useListings } from '../hooks/use-listings';
import { listingsColumns } from './listings-columns';
import { ListingsFiltersBar } from './listings-filters';
import type { ListingsFilters } from '../services/listings.service';

export function ListingsTable() {
  const [filters, setFilters] = useState<ListingsFilters>({
    verificationStatus: 'all',
    district: 'all',
    type: 'all',
  });
  const { data = [], isLoading } = useListings(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ListingsFiltersBar filters={filters} onChange={setFilters} />
        <Button asChild>
          <Link href="/dashboard/listings/new">Nouvelle annonce</Link>
        </Button>
      </div>
      <DataTable
        columns={listingsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune annonce ne correspond à ces filtres."
      />
    </div>
  );
}
```

- [ ] **Step 9: Créer la page de liste des annonces**

Crée `apps/admin/src/app/(dashboard)/listings/page.tsx` :

```tsx
import { ListingsTable } from '@/features/listings/components/listings-table';

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Annonces</h1>
        <p className="text-muted-foreground">
          Gérez les logements, leur statut de publication et leurs médias.
        </p>
      </div>
      <ListingsTable />
    </div>
  );
}
```

- [ ] **Step 10: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/listings` affiche la table des 6 annonces de seed avec leurs badges de statut (`Publiée` ×5, `En attente` ×1), les filtres se peuplent dynamiquement avec les quartiers réels (`Almadies`, `Fann`, `Mermoz`, `Sacré-Cœur`, `Ouakam`, `Point E`), et changer un filtre recharge la table sans rechargement de page complet. Arrête le serveur.

- [ ] **Step 11: Commit**

```bash
git add apps/admin/src/features/listings apps/admin/src/shared/components/data-table.tsx apps/admin/src/app/\(dashboard\)/listings/page.tsx
git commit -m "feat(admin): ajouter la liste filtrable des annonces avec TanStack Table"
```

---

### Task 7: Détail/édition d'une annonce — formulaire complet, médias, colocation, validation/publication

**Files:**

- Create: `apps/admin/src/features/listings/services/listing-detail.service.ts`
- Create: `apps/admin/src/features/listings/hooks/use-listing-detail.ts`
- Create: `apps/admin/src/features/listings/components/listing-form.tsx`
- Create: `apps/admin/src/features/listings/components/listing-media-manager.tsx`
- Create: `apps/admin/src/features/listings/components/listing-coliving-rooms-manager.tsx`
- Create: `apps/admin/src/features/listings/components/listing-verification-actions.tsx`
- Create: `apps/admin/src/app/(dashboard)/listings/[id]/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/listings/new/page.tsx`

- [ ] **Step 1: Créer le service de détail (lecture, écriture, médias, colocation, écoles proches)**

Crée `apps/admin/src/features/listings/services/listing-detail.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type {
  Listing,
  ListingMedia,
  ListingColivingRoom,
  TablesInsert,
  TablesUpdate,
  School,
} from '@dakareaseu/types';
import type { ListingFormValues, ColivingRoomFormValues } from '@dakareaseu/shared';

export interface ListingWithRelations {
  listing: Listing;
  media: ListingMedia[];
  colivingRooms: ListingColivingRoom[];
  nearbySchoolIds: string[];
}

export async function fetchListingDetail(id: string): Promise<ListingWithRelations> {
  const supabase = createSupabaseBrowserClient();

  const [
    { data: listing, error: listingError },
    { data: media, error: mediaError },
    { data: rooms, error: roomsError },
    { data: nearby, error: nearbyError },
  ] = await Promise.all([
    supabase.from('listings').select('*').eq('id', id).single(),
    supabase.from('listing_media').select('*').eq('listing_id', id).order('position'),
    supabase.from('listing_coliving_rooms').select('*').eq('listing_id', id).order('label'),
    supabase.from('school_nearby_listings').select('school_id').eq('listing_id', id),
  ]);

  if (listingError) throw listingError;
  if (mediaError) throw mediaError;
  if (roomsError) throw roomsError;
  if (nearbyError) throw nearbyError;

  return {
    listing,
    media,
    colivingRooms: rooms,
    nearbySchoolIds: nearby.map((row) => row.school_id),
  };
}

export async function fetchAllSchools(): Promise<Pick<School, 'id' | 'name' | 'district'>[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('schools').select('id, name, district').order('name');
  if (error) throw error;
  return data;
}

export async function createListing(values: ListingFormValues): Promise<Listing> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'listings'> = { ...values };
  const { data, error } = await supabase.from('listings').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, values: ListingFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'listings'> = { ...values };
  const { error } = await supabase.from('listings').update(payload).eq('id', id);
  if (error) throw error;
}

export async function addListingMedia(
  listingId: string,
  mediaType: ListingMedia['media_type'],
  url: string,
  position: number,
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('listing_media')
    .insert({ listing_id: listingId, media_type: mediaType, url, position });
  if (error) throw error;
}

export async function deleteListingMedia(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('listing_media').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertColivingRoom(
  listingId: string,
  room: ColivingRoomFormValues,
  id?: string,
) {
  const supabase = createSupabaseBrowserClient();
  if (id) {
    const { error } = await supabase.from('listing_coliving_rooms').update(room).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('listing_coliving_rooms')
      .insert({ ...room, listing_id: listingId });
    if (error) throw error;
  }
}

export async function deleteColivingRoom(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('listing_coliving_rooms').delete().eq('id', id);
  if (error) throw error;
}

export async function setNearbySchools(listingId: string, schoolIds: string[]) {
  const supabase = createSupabaseBrowserClient();
  const { error: deleteError } = await supabase
    .from('school_nearby_listings')
    .delete()
    .eq('listing_id', listingId);
  if (deleteError) throw deleteError;

  if (schoolIds.length > 0) {
    const { error: insertError } = await supabase
      .from('school_nearby_listings')
      .insert(schoolIds.map((schoolId) => ({ school_id: schoolId, listing_id: listingId })));
    if (insertError) throw insertError;
  }
}

/**
 * Upload un fichier média vers le bucket public `listings-media`, sous
 * `<listing_id>/<timestamp>-<nom>`. Retourne l'URL publique exploitable
 * directement par le mobile (le bucket est public-read pour les annonces
 * publiées, cf. policy `public_media_select` du plan foundation).
 */
export async function uploadListingMediaFile(listingId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${listingId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('listings-media')
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('listings-media').getPublicUrl(path);
  return data.publicUrl;
}
```

- [ ] **Step 2: Créer le hook de détail (query + mutations)**

Crée `apps/admin/src/features/listings/hooks/use-listing-detail.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchListingDetail,
  fetchAllSchools,
  createListing,
  updateListing,
  addListingMedia,
  deleteListingMedia,
  upsertColivingRoom,
  deleteColivingRoom,
  setNearbySchools,
  uploadListingMediaFile,
} from '../services/listing-detail.service';
import type { ListingFormValues, ColivingRoomFormValues } from '@dakareaseu/shared';
import type { ListingMedia } from '@dakareaseu/types';

export function useListingDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['listings', 'detail', id],
    queryFn: () => fetchListingDetail(id!),
    enabled: !!id,
  });
}

export function useSchoolsForSelection() {
  return useQuery({
    queryKey: ['schools', 'selection'],
    queryFn: fetchAllSchools,
    staleTime: 5 * 60_000,
  });
}

function useInvalidateListing(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['listings', 'detail', id] });
  };
}

export function useSaveListing(id?: string) {
  const invalidate = useInvalidateListing(id);

  return useMutation({
    mutationFn: (values: ListingFormValues) =>
      id ? updateListing(id, values) : createListing(values),
    onSuccess: () => {
      toast.success(id ? 'Annonce mise à jour.' : 'Annonce créée.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadAndAttachMedia(listingId: string) {
  const invalidate = useInvalidateListing(listingId);

  return useMutation({
    mutationFn: async ({
      file,
      mediaType,
      position,
    }: {
      file: File;
      mediaType: ListingMedia['media_type'];
      position: number;
    }) => {
      const url = await uploadListingMediaFile(listingId, file);
      await addListingMedia(listingId, mediaType, url, position);
    },
    onSuccess: () => {
      toast.success('Média ajouté.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteListingMedia(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: deleteListingMedia,
    onSuccess: () => {
      toast.success('Média supprimé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpsertColivingRoom(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: ({ room, id }: { room: ColivingRoomFormValues; id?: string }) =>
      upsertColivingRoom(listingId, room, id),
    onSuccess: () => {
      toast.success('Chambre enregistrée.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteColivingRoom(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: deleteColivingRoom,
    onSuccess: () => {
      toast.success('Chambre supprimée.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSetNearbySchools(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: (schoolIds: string[]) => setNearbySchools(listingId, schoolIds),
    onSuccess: () => {
      toast.success('Écoles à proximité mises à jour.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 3: Créer le formulaire principal de l'annonce (champs scalaires + tableaux via textarea ligne-par-ligne)**

Crée `apps/admin/src/features/listings/components/listing-form.tsx` :

```tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  listingSchema,
  type ListingFormValues,
  LISTING_TYPE_LABELS,
  LISTING_VERIFICATION_STATUS_LABELS,
} from '@dakareaseu/shared';
import type { Listing } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveListing } from '../hooks/use-listing-detail';

/** Convertit un `text[]` Postgres en texte multi-lignes pour l'édition, et inversement. */
function arrayToLines(values: string[]): string {
  return values.join('\n');
}
function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const DEFAULT_VALUES: ListingFormValues = {
  title: '',
  description: '',
  price: 0,
  currency: 'XOF',
  period: 'mois',
  type: 'studio',
  surface_m2: null,
  bedrooms: null,
  bathrooms: null,
  district: '',
  distance_label: '',
  furnished: false,
  colocation_available: false,
  min_duration_months: 3,
  amenities: [],
  particularities: [],
  requirements: [],
  verification_status: 'pending',
};

export function ListingForm({
  listing,
  onSaved,
}: {
  listing?: Listing;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveListing(listing?.id);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing
      ? {
          title: listing.title,
          description: listing.description ?? '',
          price: listing.price,
          currency: listing.currency,
          period: listing.period,
          type: listing.type,
          surface_m2: listing.surface_m2,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          district: listing.district,
          distance_label: listing.distance_label ?? '',
          furnished: listing.furnished,
          colocation_available: listing.colocation_available,
          min_duration_months: listing.min_duration_months,
          amenities: listing.amenities,
          particularities: listing.particularities,
          requirements: listing.requirements,
          verification_status: listing.verification_status,
        }
      : DEFAULT_VALUES,
  });

  useEffect(() => {
    if (listing) form.reset(form.getValues());
  }, [listing, form]);

  async function onSubmit(values: ListingFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!listing && result && 'id' in result) onSaved?.(result.id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LISTING_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quartier</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (XOF / mois)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_duration_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée minimum (mois)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={field.value ?? 3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surface_m2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface (m²)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="distance_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repère de distance (ex. "0.5 km de l&apos;UCAD")</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="furnished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                <FormLabel className="!mt-0">Meublé</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colocation_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                <FormLabel className="!mt-0">Colocation disponible</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verification_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut de vérification</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LISTING_VERIFICATION_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  "Publiée" rend l&apos;annonce visible côté mobile (RLS : `verification_status =
                  'published'`).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {(['amenities', 'particularities', 'requirements'] as const).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    {fieldName === 'amenities' && 'Équipements (un par ligne)'}
                    {fieldName === 'particularities' && 'Particularités (une par ligne)'}
                    {fieldName === 'requirements' && 'Exigences (une par ligne)'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      value={arrayToLines(field.value)}
                      onChange={(event) => field.onChange(linesToArray(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending
            ? 'Enregistrement…'
            : listing
              ? 'Enregistrer les modifications'
              : "Créer l'annonce"}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Créer le gestionnaire de médias**

Crée `apps/admin/src/features/listings/components/listing-media-manager.tsx` :

```tsx
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { ListingMedia } from '@dakareaseu/types';
import { MEDIA_TYPES } from '@dakareaseu/shared';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeleteListingMedia, useUploadAndAttachMedia } from '../hooks/use-listing-detail';

const MEDIA_TYPE_LABELS: Record<string, string> = {
  photo: 'Photo',
  video: 'Vidéo',
  tour_3d: 'Visite 3D / 360°',
};

export function ListingMediaManager({
  listingId,
  media,
}: {
  listingId: string;
  media: ListingMedia[];
}) {
  const [mediaType, setMediaType] = useState<(typeof MEDIA_TYPES)[number]>('photo');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAndAttachMedia(listingId);
  const deleteMutation = useDeleteListingMedia(listingId);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, mediaType, position: media.length });
    event.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={mediaType}
          onValueChange={(value) => setMediaType(value as (typeof MEDIA_TYPES)[number])}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEDIA_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {MEDIA_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.glb,.gltf"
          className="hidden"
          onChange={handleFileSelected}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Envoi…' : 'Téléverser un fichier'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Limite recommandée : photos &lt; 10 Mo, vidéos &lt; 50 Mo (compresser en H.264/MP4 avant
          envoi).
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((item) => (
          <li key={item.id} className="space-y-2 rounded-md border p-2">
            {item.media_type === 'photo' ? (
              <Image
                src={item.url}
                alt=""
                width={200}
                height={140}
                className="h-28 w-full rounded object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-28 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                {MEDIA_TYPE_LABELS[item.media_type]}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {MEDIA_TYPE_LABELS[item.media_type]} · #{item.position}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(item.id)}
              >
                Supprimer
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Créer le gestionnaire de chambres en colocation**

Crée `apps/admin/src/features/listings/components/listing-coliving-rooms-manager.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colivingRoomSchema, type ColivingRoomFormValues } from '@dakareaseu/shared';
import type { ListingColivingRoom } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useDeleteColivingRoom, useUpsertColivingRoom } from '../hooks/use-listing-detail';

export function ListingColivingRoomsManager({
  listingId,
  rooms,
}: {
  listingId: string;
  rooms: ListingColivingRoom[];
}) {
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const upsertMutation = useUpsertColivingRoom(listingId);
  const deleteMutation = useDeleteColivingRoom(listingId);

  const form = useForm<ColivingRoomFormValues>({
    resolver: zodResolver(colivingRoomSchema),
    defaultValues: { label: '', price: 0, surface_m2: null, is_available: true },
  });

  function startEdit(room: ListingColivingRoom) {
    setEditingId(room.id);
    form.reset({
      label: room.label,
      price: room.price,
      surface_m2: room.surface_m2,
      is_available: room.is_available,
    });
  }

  function startCreate() {
    setEditingId(undefined);
    form.reset({ label: '', price: 0, surface_m2: null, is_available: true });
  }

  async function onSubmit(values: ColivingRoomFormValues) {
    await upsertMutation.mutateAsync({ room: values, id: editingId });
    startCreate();
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="flex items-center justify-between rounded-md border p-3 text-sm"
          >
            <div>
              <p className="font-medium">{room.label}</p>
              <p className="text-muted-foreground">
                {room.price.toLocaleString('fr-FR')} XOF · {room.surface_m2 ?? '?'} m² ·{' '}
                {room.is_available ? 'disponible' : 'indisponible'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => startEdit(room)}>
                Modifier
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(room.id)}
              >
                Supprimer
              </Button>
            </div>
          </li>
        ))}
        {rooms.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune chambre nommée pour cette annonce.</p>
        )}
      </ul>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-3 rounded-md border p-3 md:grid-cols-4"
        >
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nom de la chambre</FormLabel>
                <FormControl>
                  <Input placeholder="Chambre 1 — vue jardin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surface_m2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface (m²)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-2 md:col-span-2">
                <FormLabel className="!mt-0">Disponible</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex items-end gap-2 md:col-span-2">
            <Button type="submit" disabled={upsertMutation.isPending}>
              {editingId ? 'Mettre à jour' : 'Ajouter la chambre'}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={startCreate}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
```

- [ ] **Step 6: Créer les actions de workflow de vérification (boutons rapides)**

Crée `apps/admin/src/features/listings/components/listing-verification-actions.tsx` :

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { useUpdateListingVerificationStatus } from '../hooks/use-listings';
import type { Listing } from '@dakareaseu/types';

export function ListingVerificationActions({ listing }: { listing: Listing }) {
  const mutation = useUpdateListingVerificationStatus();

  if (listing.verification_status === 'published') {
    return (
      <Button
        variant="outline"
        onClick={() => mutation.mutate({ id: listing.id, status: 'pending' })}
        disabled={mutation.isPending}
      >
        Repasser en attente
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => mutation.mutate({ id: listing.id, status: 'published' })}
        disabled={mutation.isPending}
      >
        Publier
      </Button>
      <Button
        variant="destructive"
        onClick={() => mutation.mutate({ id: listing.id, status: 'rejected' })}
        disabled={mutation.isPending}
      >
        Rejeter
      </Button>
    </div>
  );
}
```

- [ ] **Step 7: Créer la page de détail/édition**

Crée `apps/admin/src/app/(dashboard)/listings/[id]/page.tsx` :

```tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useListingDetail } from '@/features/listings/hooks/use-listing-detail';
import { ListingForm } from '@/features/listings/components/listing-form';
import { ListingMediaManager } from '@/features/listings/components/listing-media-manager';
import { ListingColivingRoomsManager } from '@/features/listings/components/listing-coliving-rooms-manager';
import { ListingVerificationActions } from '@/features/listings/components/listing-verification-actions';

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useListingDetail(params.id);

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full" />;
  }

  const { listing, media, colivingRooms } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-muted-foreground">Quartier : {listing.district}</p>
        </div>
        <ListingVerificationActions listing={listing} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm listing={listing} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Médias (photos, vidéos, visites 3D)</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingMediaManager listingId={listing.id} media={media} />
        </CardContent>
      </Card>

      {listing.colocation_available && (
        <Card>
          <CardHeader>
            <CardTitle>Chambres en colocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ListingColivingRoomsManager listingId={listing.id} rooms={colivingRooms} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Créer la page de création**

Crée `apps/admin/src/app/(dashboard)/listings/new/page.tsx` :

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListingForm } from '@/features/listings/components/listing-form';

export default function NewListingPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle annonce</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm onSaved={(id) => router.push(`/dashboard/listings/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9: Vérifier visuellement le workflow complet**

Run: `cd apps/admin && pnpm dev`
Expected: depuis `/dashboard/listings`, ouvrir l'annonce "Chambre meublée Point E" (statut `pending`) affiche le formulaire pré-rempli, le bouton "Publier" passe son statut à `published` (badge mis à jour dans la liste après retour), l'upload d'une image dans "Médias" l'ajoute à la grille, et — comme `colocation_available = false` pour cette annonce — la section "Chambres en colocation" n'apparaît PAS. Ouvrir "Chambre en colocation Fann" (`colocation_available = true`) affiche la section avec ses 3 chambres nommées du seed. Arrête le serveur.

- [ ] **Step 10: Commit**

```bash
git add apps/admin/src/features/listings apps/admin/src/app/\(dashboard\)/listings
git commit -m "feat(admin): ajouter le détail/édition des annonces (CRUD, médias, colocation, workflow de validation)"
```

---

### Task 8: Curation des logements proches d'une école (`school_nearby_listings`)

**Files:**

- Modify: `apps/admin/src/app/(dashboard)/listings/[id]/page.tsx`
- Create: `apps/admin/src/features/listings/components/listing-nearby-schools-manager.tsx`

- [ ] **Step 1: Créer le composant de sélection multi-écoles**

Crée `apps/admin/src/features/listings/components/listing-nearby-schools-manager.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useSchoolsForSelection, useSetNearbySchools } from '../hooks/use-listing-detail';

export function ListingNearbySchoolsManager({
  listingId,
  initialSchoolIds,
}: {
  listingId: string;
  initialSchoolIds: string[];
}) {
  const { data: schools = [], isLoading } = useSchoolsForSelection();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSchoolIds));
  const mutation = useSetNearbySchools(listingId);

  function toggle(schoolId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(schoolId)) next.delete(schoolId);
      else next.add(schoolId);
      return next;
    });
  }

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Sélectionne les écoles pour lesquelles cette annonce doit apparaître dans "Logements à
        proximité" et bénéficier du bonus de proximité dans l&apos;algorithme de matching
        (`match_listings`).
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {schools.map((school) => (
          <li key={school.id} className="flex items-center gap-2 rounded-md border p-2">
            <Checkbox
              checked={selected.has(school.id)}
              onCheckedChange={() => toggle(school.id)}
              id={`school-${school.id}`}
            />
            <label htmlFor={`school-${school.id}`} className="text-sm">
              {school.name} <span className="text-muted-foreground">({school.district})</span>
            </label>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        onClick={() => mutation.mutate(Array.from(selected))}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Enregistrement…' : 'Enregistrer les écoles à proximité'}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Brancher le composant dans la page de détail**

Édite `apps/admin/src/app/(dashboard)/listings/[id]/page.tsx` :

1. Ajoute l'import en haut du fichier :

```tsx
import { ListingNearbySchoolsManager } from '@/features/listings/components/listing-nearby-schools-manager';
```

2. Ajoute, dans `useListingDetail`'s destructuring, `nearbySchoolIds` :

```tsx
const { listing, media, colivingRooms, nearbySchoolIds } = data;
```

3. Ajoute une nouvelle `Card` juste avant la fermeture du `</div>` final (après le bloc `{listing.colocation_available && (...)}`) :

```tsx
<Card>
  <CardHeader>
    <CardTitle>Écoles à proximité</CardTitle>
  </CardHeader>
  <CardContent>
    <ListingNearbySchoolsManager listingId={listing.id} initialSchoolIds={nearbySchoolIds} />
  </CardContent>
</Card>
```

- [ ] **Step 3: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: la page de détail d'une annonce affiche maintenant une carte "Écoles à proximité" avec les 4 écoles du seed sous forme de cases à cocher, les écoles déjà associées (via `school_nearby_listings` du seed) sont précochées (ex. "Studio meublé Almadies" est précoché pour UCAD et ESP), cocher/décocher puis cliquer "Enregistrer" persiste le changement (rafraîchir la page confirme la persistance). Arrête le serveur.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/features/listings apps/admin/src/app/\(dashboard\)/listings/\[id\]/page.tsx
git commit -m "feat(admin): permettre la curation des logements proches d'une école (school_nearby_listings)"
```

---

### Task 9: Gestion des écoles (CRUD + champs tableaux + image de couverture)

**Files:**

- Create: `apps/admin/src/features/schools/schemas/school.schema.ts`
- Create: `apps/admin/src/features/schools/services/schools.service.ts`
- Create: `apps/admin/src/features/schools/hooks/use-schools.ts`
- Create: `apps/admin/src/features/schools/components/schools-columns.tsx`
- Create: `apps/admin/src/features/schools/components/school-form.tsx`
- Create: `apps/admin/src/app/(dashboard)/schools/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/schools/[id]/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/schools/new/page.tsx`

- [ ] **Step 1: Créer le schéma Zod (avec champs tableaux gérés en texte multi-lignes)**

Crée `apps/admin/src/features/schools/schemas/school.schema.ts` :

```ts
import { z } from 'zod';

/**
 * Les colonnes `programs`, `admission_steps`, `scholarships` sont des `text[]`
 * Postgres (cf. plan foundation). Le formulaire les édite comme du texte
 * multi-lignes (un élément par ligne) et `linesToArray`/`arrayToLines`
 * (cf. `school-form.tsx`) font la conversion vers/depuis `string[]`.
 */
export const schoolSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  full_name: z.string().optional().nullable(),
  district: z.string().min(1, 'Le quartier est requis'),
  students_count: z.coerce.number().int().min(0).optional().nullable(),
  founded_year: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  address: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  fees_text: z.string().optional().nullable(),
  programs: z.array(z.string()).default([]),
  admission_steps: z.array(z.string()).default([]),
  scholarships: z.array(z.string()).default([]),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;
```

- [ ] **Step 2: Créer le service**

Crée `apps/admin/src/features/schools/services/schools.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { School, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { SchoolFormValues } from '../schemas/school.schema';

export async function fetchSchools(): Promise<School[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('schools').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function fetchSchoolById(id: string): Promise<School> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('schools').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createSchool(values: SchoolFormValues): Promise<School> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'schools'> = { ...values, email: values.email || null };
  const { data, error } = await supabase.from('schools').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateSchool(id: string, values: SchoolFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'schools'> = { ...values, email: values.email || null };
  const { error } = await supabase.from('schools').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteSchool(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadSchoolCoverImage(schoolId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${schoolId}/cover-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('schools-media')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('schools-media').getPublicUrl(path);
  const { error: updateError } = await supabase
    .from('schools')
    .update({ cover_image_url: data.publicUrl })
    .eq('id', schoolId);
  if (updateError) throw updateError;
  return data.publicUrl;
}
```

- [ ] **Step 3: Créer les hooks TanStack Query**

Crée `apps/admin/src/features/schools/hooks/use-schools.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createSchool,
  deleteSchool,
  fetchSchoolById,
  fetchSchools,
  updateSchool,
  uploadSchoolCoverImage,
} from '../services/schools.service';
import type { SchoolFormValues } from '../schemas/school.schema';

export function useSchools() {
  return useQuery({ queryKey: ['schools'], queryFn: fetchSchools });
}

export function useSchool(id: string | undefined) {
  return useQuery({
    queryKey: ['schools', 'detail', id],
    queryFn: () => fetchSchoolById(id!),
    enabled: !!id,
  });
}

export function useSaveSchool(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: SchoolFormValues) =>
      id ? updateSchool(id, values) : createSchool(values),
    onSuccess: () => {
      toast.success(id ? 'École mise à jour.' : 'École créée.');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      toast.success('École supprimée.');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadSchoolCoverImage(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadSchoolCoverImage(schoolId, file),
    onSuccess: () => {
      toast.success('Image de couverture mise à jour.');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools', 'detail', schoolId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 4: Définir les colonnes de la table**

Crée `apps/admin/src/features/schools/components/schools-columns.tsx` :

```tsx
'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { School } from '@dakareaseu/types';

export const schoolsColumns: ColumnDef<School>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <Link href={`/dashboard/schools/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'full_name', header: 'Nom complet' },
  { accessorKey: 'district', header: 'Quartier' },
  {
    accessorKey: 'students_count',
    header: 'Effectif',
    cell: ({ row }) => row.original.students_count?.toLocaleString('fr-FR') ?? '—',
  },
  { accessorKey: 'founded_year', header: 'Fondation' },
];
```

- [ ] **Step 5: Créer le formulaire (champs tableaux via textarea ligne-par-ligne, comme pour les annonces)**

Crée `apps/admin/src/features/schools/components/school-form.tsx` :

```tsx
'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { schoolSchema, type SchoolFormValues } from '../schemas/school.schema';
import type { School } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveSchool, useUploadSchoolCoverImage } from '../hooks/use-schools';

function arrayToLines(values: string[]): string {
  return values.join('\n');
}
function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const DEFAULT_VALUES: SchoolFormValues = {
  name: '',
  full_name: '',
  district: '',
  students_count: null,
  founded_year: null,
  address: '',
  website: '',
  email: '',
  phone: '',
  whatsapp: '',
  fees_text: '',
  programs: [],
  admission_steps: [],
  scholarships: [],
};

export function SchoolForm({
  school,
  onSaved,
}: {
  school?: School;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveSchool(school?.id);
  const uploadMutation = useUploadSchoolCoverImage(school?.id ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: school
      ? {
          name: school.name,
          full_name: school.full_name ?? '',
          district: school.district,
          students_count: school.students_count,
          founded_year: school.founded_year,
          address: school.address ?? '',
          website: school.website ?? '',
          email: school.email ?? '',
          phone: school.phone ?? '',
          whatsapp: school.whatsapp ?? '',
          fees_text: school.fees_text ?? '',
          programs: school.programs,
          admission_steps: school.admission_steps,
          scholarships: school.scholarships,
        }
      : DEFAULT_VALUES,
  });

  async function onSubmit(values: SchoolFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!school && result && 'id' in result) onSaved?.(result.id);
  }

  function handleCoverFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && school) uploadMutation.mutate(file);
    event.target.value = '';
  }

  return (
    <div className="space-y-6">
      {school && (
        <div className="flex items-center gap-4">
          {school.cover_image_url && (
            <Image
              src={school.cover_image_url}
              alt=""
              width={160}
              height={100}
              className="h-24 w-40 rounded object-cover"
              unoptimized
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Envoi…' : "Changer l'image de couverture"}
          </Button>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom (sigle)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quartier</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="founded_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année de fondation</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="students_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre d&apos;étudiants</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fees_text"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Frais (texte libre)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {(['programs', 'admission_steps', 'scholarships'] as const).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    {fieldName === 'programs' && 'Filières (une par ligne)'}
                    {fieldName === 'admission_steps' && "Étapes d'admission (une par ligne)"}
                    {fieldName === 'scholarships' && 'Bourses (une par ligne)'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      value={arrayToLines(field.value)}
                      onChange={(event) => field.onChange(linesToArray(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" disabled={saveMutation.isPending} className="md:col-span-2">
            {saveMutation.isPending
              ? 'Enregistrement…'
              : school
                ? 'Enregistrer les modifications'
                : "Créer l'école"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

- [ ] **Step 6: Créer les pages liste / détail / création**

Crée `apps/admin/src/app/(dashboard)/schools/page.tsx` :

```tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useSchools } from '@/features/schools/hooks/use-schools';
import { schoolsColumns } from '@/features/schools/components/schools-columns';

export default function SchoolsPage() {
  const { data = [], isLoading } = useSchools();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Écoles</h1>
          <p className="text-muted-foreground">Annuaire des écoles partenaires.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schools/new">Nouvelle école</Link>
        </Button>
      </div>
      <DataTable
        columns={schoolsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune école enregistrée."
      />
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/schools/[id]/page.tsx` :

```tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSchool } from '@/features/schools/hooks/use-schools';
import { SchoolForm } from '@/features/schools/components/school-form';

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: school, isLoading } = useSchool(params.id);

  if (isLoading || !school) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{school.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolForm school={school} />
        </CardContent>
      </Card>
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/schools/new/page.tsx` :

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolForm } from '@/features/schools/components/school-form';

export default function NewSchoolPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle école</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolForm onSaved={(id) => router.push(`/dashboard/schools/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/schools` liste les 4 écoles du seed (UCAD, ESP, ISM, Sup de Co), ouvrir "UCAD" affiche le formulaire pré-rempli avec ses filières/étapes d'admission/bourses (chacune sur une ligne dans le textarea correspondant), modifier et enregistrer persiste le changement, créer une nouvelle école redirige vers sa page de détail. Arrête le serveur.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/features/schools apps/admin/src/app/\(dashboard\)/schools
git commit -m "feat(admin): ajouter le CRUD complet des écoles (champs tableaux, image de couverture)"
```

---

### Task 10: Gestion des restaurants (CRUD + médias)

**Files:**

- Create: `apps/admin/src/features/restaurants/schemas/restaurant.schema.ts`
- Create: `apps/admin/src/features/restaurants/services/restaurants.service.ts`
- Create: `apps/admin/src/features/restaurants/hooks/use-restaurants.ts`
- Create: `apps/admin/src/features/restaurants/components/restaurants-columns.tsx`
- Create: `apps/admin/src/features/restaurants/components/restaurant-form.tsx`
- Create: `apps/admin/src/features/restaurants/components/restaurant-media-manager.tsx`
- Create: `apps/admin/src/app/(dashboard)/restaurants/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/restaurants/[id]/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/restaurants/new/page.tsx`

- [ ] **Step 1: Créer le schéma Zod**

Crée `apps/admin/src/features/restaurants/schemas/restaurant.schema.ts` :

```ts
import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  cuisine_type: z.string().min(1, 'Le type de cuisine est requis'),
  district: z.string().min(1, 'Le quartier est requis'),
  distance_label: z.string().optional().nullable(),
  price_range: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  opening_hours: z.string().optional().nullable(),
  specialties: z.array(z.string()).default([]),
  description: z.string().optional().nullable(),
  has_delivery: z.boolean().default(false),
});

export type RestaurantFormValues = z.infer<typeof restaurantSchema>;
```

- [ ] **Step 2: Créer le service**

Crée `apps/admin/src/features/restaurants/services/restaurants.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Restaurant, RestaurantMedia, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { RestaurantFormValues } from '../schemas/restaurant.schema';

export interface RestaurantWithMedia {
  restaurant: Restaurant;
  media: RestaurantMedia[];
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('restaurants').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function fetchRestaurantDetail(id: string): Promise<RestaurantWithMedia> {
  const supabase = createSupabaseBrowserClient();
  const [{ data: restaurant, error: restaurantError }, { data: media, error: mediaError }] =
    await Promise.all([
      supabase.from('restaurants').select('*').eq('id', id).single(),
      supabase.from('restaurant_media').select('*').eq('restaurant_id', id).order('position'),
    ]);
  if (restaurantError) throw restaurantError;
  if (mediaError) throw mediaError;
  return { restaurant, media };
}

export async function createRestaurant(values: RestaurantFormValues): Promise<Restaurant> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'restaurants'> = { ...values };
  const { data, error } = await supabase.from('restaurants').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateRestaurant(id: string, values: RestaurantFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'restaurants'> = { ...values };
  const { error } = await supabase.from('restaurants').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteRestaurant(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadRestaurantMedia(
  restaurantId: string,
  file: File,
  position: number,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const path = `${restaurantId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('restaurants-media')
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('restaurants-media').getPublicUrl(path);
  const { error: insertError } = await supabase
    .from('restaurant_media')
    .insert({ restaurant_id: restaurantId, url: data.publicUrl, position });
  if (insertError) throw insertError;
}

export async function deleteRestaurantMedia(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('restaurant_media').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 3: Créer les hooks**

Crée `apps/admin/src/features/restaurants/hooks/use-restaurants.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createRestaurant,
  deleteRestaurant,
  deleteRestaurantMedia,
  fetchRestaurantDetail,
  fetchRestaurants,
  updateRestaurant,
  uploadRestaurantMedia,
} from '../services/restaurants.service';
import type { RestaurantFormValues } from '../schemas/restaurant.schema';

export function useRestaurants() {
  return useQuery({ queryKey: ['restaurants'], queryFn: fetchRestaurants });
}

export function useRestaurantDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', 'detail', id],
    queryFn: () => fetchRestaurantDetail(id!),
    enabled: !!id,
  });
}

function useInvalidateRestaurant(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['restaurants', 'detail', id] });
  };
}

export function useSaveRestaurant(id?: string) {
  const invalidate = useInvalidateRestaurant(id);
  return useMutation({
    mutationFn: (values: RestaurantFormValues) =>
      id ? updateRestaurant(id, values) : createRestaurant(values),
    onSuccess: () => {
      toast.success(id ? 'Restaurant mis à jour.' : 'Restaurant créé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      toast.success('Restaurant supprimé.');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadRestaurantMedia(restaurantId: string, currentCount: number) {
  const invalidate = useInvalidateRestaurant(restaurantId);
  return useMutation({
    mutationFn: (file: File) => uploadRestaurantMedia(restaurantId, file, currentCount),
    onSuccess: () => {
      toast.success('Média ajouté.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRestaurantMedia(restaurantId: string) {
  const invalidate = useInvalidateRestaurant(restaurantId);
  return useMutation({
    mutationFn: deleteRestaurantMedia,
    onSuccess: () => {
      toast.success('Média supprimé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 4: Définir les colonnes**

Crée `apps/admin/src/features/restaurants/components/restaurants-columns.tsx` :

```tsx
'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { Restaurant } from '@dakareaseu/types';
import { Badge } from '@/components/ui/badge';

export const restaurantsColumns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <Link
        href={`/dashboard/restaurants/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'cuisine_type', header: 'Cuisine' },
  { accessorKey: 'district', header: 'Quartier' },
  {
    accessorKey: 'rating',
    header: 'Note',
    cell: ({ row }) => (row.original.rating ? `★ ${row.original.rating}` : '—'),
  },
  {
    accessorKey: 'has_delivery',
    header: 'Livraison',
    cell: ({ row }) => (
      <Badge variant={row.original.has_delivery ? 'default' : 'secondary'}>
        {row.original.has_delivery ? 'Oui' : 'Non'}
      </Badge>
    ),
  },
];
```

- [ ] **Step 5: Créer le formulaire**

Crée `apps/admin/src/features/restaurants/components/restaurant-form.tsx` :

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { restaurantSchema, type RestaurantFormValues } from '../schemas/restaurant.schema';
import type { Restaurant } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveRestaurant } from '../hooks/use-restaurants';

function arrayToLines(values: string[]): string {
  return values.join('\n');
}
function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const DEFAULT_VALUES: RestaurantFormValues = {
  name: '',
  cuisine_type: '',
  district: '',
  distance_label: '',
  price_range: '',
  phone: '',
  whatsapp: '',
  opening_hours: '',
  specialties: [],
  description: '',
  has_delivery: false,
};

export function RestaurantForm({
  restaurant,
  onSaved,
}: {
  restaurant?: Restaurant;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveRestaurant(restaurant?.id);

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: restaurant
      ? {
          name: restaurant.name,
          cuisine_type: restaurant.cuisine_type,
          district: restaurant.district,
          distance_label: restaurant.distance_label ?? '',
          price_range: restaurant.price_range ?? '',
          phone: restaurant.phone ?? '',
          whatsapp: restaurant.whatsapp ?? '',
          opening_hours: restaurant.opening_hours ?? '',
          specialties: restaurant.specialties,
          description: restaurant.description ?? '',
          has_delivery: restaurant.has_delivery,
        }
      : DEFAULT_VALUES,
  });

  async function onSubmit(values: RestaurantFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!restaurant && result && 'id' in result) onSaved?.(result.id);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cuisine_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de cuisine</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quartier</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="distance_label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repère de distance</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fourchette de prix</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="opening_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horaires</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="has_delivery"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
              <FormLabel className="!mt-0">Livraison disponible</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Spécialités (une par ligne)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  value={arrayToLines(field.value)}
                  onChange={(event) => field.onChange(linesToArray(event.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={saveMutation.isPending} className="md:col-span-2">
          {saveMutation.isPending
            ? 'Enregistrement…'
            : restaurant
              ? 'Enregistrer les modifications'
              : 'Créer le restaurant'}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 6: Créer le gestionnaire de médias (variation du gestionnaire des annonces, sans le sélecteur de type — `restaurant_media` n'a pas de colonne `media_type`)**

Crée `apps/admin/src/features/restaurants/components/restaurant-media-manager.tsx` :

```tsx
'use client';

import { useRef } from 'react';
import Image from 'next/image';
import type { RestaurantMedia } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { useDeleteRestaurantMedia, useUploadRestaurantMedia } from '../hooks/use-restaurants';

export function RestaurantMediaManager({
  restaurantId,
  media,
}: {
  restaurantId: string;
  media: RestaurantMedia[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadRestaurantMedia(restaurantId, media.length);
  const deleteMutation = useDeleteRestaurantMedia(restaurantId);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    event.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Envoi…' : 'Téléverser une photo'}
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((item) => (
          <li key={item.id} className="space-y-2 rounded-md border p-2">
            <Image
              src={item.url}
              alt=""
              width={200}
              height={140}
              className="h-28 w-full rounded object-cover"
              unoptimized
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>#{item.position}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(item.id)}
              >
                Supprimer
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Créer les pages**

Crée `apps/admin/src/app/(dashboard)/restaurants/page.tsx` :

```tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useRestaurants } from '@/features/restaurants/hooks/use-restaurants';
import { restaurantsColumns } from '@/features/restaurants/components/restaurants-columns';

export default function RestaurantsPage() {
  const { data = [], isLoading } = useRestaurants();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Annuaire des restaurants étudiants.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/restaurants/new">Nouveau restaurant</Link>
        </Button>
      </div>
      <DataTable
        columns={restaurantsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun restaurant enregistré."
      />
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/restaurants/[id]/page.tsx` :

```tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRestaurantDetail } from '@/features/restaurants/hooks/use-restaurants';
import { RestaurantForm } from '@/features/restaurants/components/restaurant-form';
import { RestaurantMediaManager } from '@/features/restaurants/components/restaurant-media-manager';

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useRestaurantDetail(params.id);

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;
  const { restaurant, media } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{restaurant.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantForm restaurant={restaurant} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantMediaManager restaurantId={restaurant.id} media={media} />
        </CardContent>
      </Card>
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/restaurants/new/page.tsx` :

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RestaurantForm } from '@/features/restaurants/components/restaurant-form';

export default function NewRestaurantPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouveau restaurant</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantForm onSaved={(id) => router.push(`/dashboard/restaurants/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 8: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/restaurants` liste les 5 restaurants du seed avec badges "Livraison Oui/Non" cohérents (ex. "Saveurs d'Almadies" → Non), ouvrir "Chez Lamine" affiche son formulaire pré-rempli avec ses spécialités sur des lignes séparées et ses 2 photos de seed, l'upload ajoute une nouvelle photo. Arrête le serveur.

- [ ] **Step 9: Commit**

```bash
git add apps/admin/src/features/restaurants apps/admin/src/app/\(dashboard\)/restaurants
git commit -m "feat(admin): ajouter le CRUD complet des restaurants avec gestion des médias"
```

---

### Task 11: Gestion des transporteurs (CRUD simple, une seule table)

**Files:**

- Create: `apps/admin/src/features/transport/schemas/transport-provider.schema.ts`
- Create: `apps/admin/src/features/transport/services/transport-providers.service.ts`
- Create: `apps/admin/src/features/transport/hooks/use-transport-providers.ts`
- Create: `apps/admin/src/features/transport/components/transport-providers-columns.tsx`
- Create: `apps/admin/src/features/transport/components/transport-provider-dialog.tsx`
- Create: `apps/admin/src/app/(dashboard)/transport/page.tsx`

- [ ] **Step 1: Créer le schéma Zod**

Crée `apps/admin/src/features/transport/schemas/transport-provider.schema.ts` :

```ts
import { z } from 'zod';

export const TRANSPORT_CATEGORIES = [
  'taxi',
  'moto',
  'repas',
  'colis',
  'demenagement',
  'location',
] as const;

export const TRANSPORT_CATEGORY_LABELS: Record<(typeof TRANSPORT_CATEGORIES)[number], string> = {
  taxi: 'Taxi / VTC',
  moto: 'Moto-taxi',
  repas: 'Livraison repas',
  colis: 'Livraison colis',
  demenagement: 'Déménagement étudiant',
  location: 'Location voiture',
};

export const transportProviderSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  category: z.enum(TRANSPORT_CATEGORIES),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  eta_label: z.string().optional().nullable(),
  price_label: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
});

export type TransportProviderFormValues = z.infer<typeof transportProviderSchema>;
```

- [ ] **Step 2: Créer le service**

Crée `apps/admin/src/features/transport/services/transport-providers.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { TransportProvider, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { TransportProviderFormValues } from '../schemas/transport-provider.schema';

export async function fetchTransportProviders(): Promise<TransportProvider[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('transport_providers').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createTransportProvider(values: TransportProviderFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'transport_providers'> = { ...values };
  const { error } = await supabase.from('transport_providers').insert(payload);
  if (error) throw error;
}

export async function updateTransportProvider(
  id: string,
  values: TransportProviderFormValues,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'transport_providers'> = { ...values };
  const { error } = await supabase.from('transport_providers').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTransportProvider(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('transport_providers').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 3: Créer les hooks**

Crée `apps/admin/src/features/transport/hooks/use-transport-providers.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTransportProvider,
  deleteTransportProvider,
  fetchTransportProviders,
  updateTransportProvider,
} from '../services/transport-providers.service';
import type { TransportProviderFormValues } from '../schemas/transport-provider.schema';

export function useTransportProviders() {
  return useQuery({ queryKey: ['transport-providers'], queryFn: fetchTransportProviders });
}

export function useSaveTransportProvider(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: TransportProviderFormValues) =>
      id ? updateTransportProvider(id, values) : createTransportProvider(values),
    onSuccess: () => {
      toast.success(id ? 'Prestataire mis à jour.' : 'Prestataire ajouté.');
      queryClient.invalidateQueries({ queryKey: ['transport-providers'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteTransportProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransportProvider,
    onSuccess: () => {
      toast.success('Prestataire supprimé.');
      queryClient.invalidateQueries({ queryKey: ['transport-providers'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 4: Définir les colonnes (avec actions intégrées)**

Crée `apps/admin/src/features/transport/components/transport-providers-columns.tsx` :

```tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TransportProvider } from '@dakareaseu/types';
import { TRANSPORT_CATEGORY_LABELS } from '../schemas/transport-provider.schema';
import { Button } from '@/components/ui/button';
import { useDeleteTransportProvider } from '../hooks/use-transport-providers';

export function buildTransportProvidersColumns(
  onEdit: (provider: TransportProvider) => void,
): ColumnDef<TransportProvider>[] {
  return [
    { accessorKey: 'name', header: 'Nom' },
    {
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => TRANSPORT_CATEGORY_LABELS[row.original.category] ?? row.original.category,
    },
    {
      accessorKey: 'rating',
      header: 'Note',
      cell: ({ row }) => (row.original.rating ? `★ ${row.original.rating}` : '—'),
    },
    { accessorKey: 'eta_label', header: 'Délai' },
    { accessorKey: 'price_label', header: 'Tarif indicatif' },
    { accessorKey: 'phone', header: 'Téléphone' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <RowActions provider={row.original} onEdit={onEdit} />,
    },
  ];
}

function RowActions({
  provider,
  onEdit,
}: {
  provider: TransportProvider;
  onEdit: (provider: TransportProvider) => void;
}) {
  const deleteMutation = useDeleteTransportProvider();
  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onEdit(provider)}>
        Modifier
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => deleteMutation.mutate(provider.id)}
      >
        Supprimer
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Créer le dialogue de création/édition**

Crée `apps/admin/src/features/transport/components/transport-provider-dialog.tsx` :

```tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  transportProviderSchema,
  type TransportProviderFormValues,
  TRANSPORT_CATEGORIES,
  TRANSPORT_CATEGORY_LABELS,
} from '../schemas/transport-provider.schema';
import type { TransportProvider } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveTransportProvider } from '../hooks/use-transport-providers';

const DEFAULT_VALUES: TransportProviderFormValues = {
  name: '',
  category: 'taxi',
  rating: null,
  eta_label: '',
  price_label: '',
  phone: '',
  whatsapp: '',
};

export function TransportProviderDialog({
  open,
  onOpenChange,
  provider,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: TransportProvider;
}) {
  const saveMutation = useSaveTransportProvider(provider?.id);

  const form = useForm<TransportProviderFormValues>({
    resolver: zodResolver(transportProviderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        provider
          ? {
              name: provider.name,
              category: provider.category,
              rating: provider.rating,
              eta_label: provider.eta_label ?? '',
              price_label: provider.price_label ?? '',
              phone: provider.phone ?? '',
              whatsapp: provider.whatsapp ?? '',
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, provider, form]);

  async function onSubmit(values: TransportProviderFormValues) {
    await saveMutation.mutateAsync(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider ? 'Modifier le prestataire' : 'Nouveau prestataire'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSPORT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {TRANSPORT_CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eta_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Délai indicatif</FormLabel>
                  <FormControl>
                    <Input placeholder="5 min" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarif indicatif</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="à partir de 1 500 CFA"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 6: Créer la page (liste + dialogue d'édition/création)**

Crée `apps/admin/src/app/(dashboard)/transport/page.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useTransportProviders } from '@/features/transport/hooks/use-transport-providers';
import { buildTransportProvidersColumns } from '@/features/transport/components/transport-providers-columns';
import { TransportProviderDialog } from '@/features/transport/components/transport-provider-dialog';
import type { TransportProvider } from '@dakareaseu/types';

export default function TransportPage() {
  const { data = [], isLoading } = useTransportProviders();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<TransportProvider | undefined>(undefined);

  function openCreateDialog() {
    setEditingProvider(undefined);
    setDialogOpen(true);
  }
  function openEditDialog(provider: TransportProvider) {
    setEditingProvider(provider);
    setDialogOpen(true);
  }

  const columns = buildTransportProvidersColumns(openEditDialog);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transport / Livraison</h1>
          <p className="text-muted-foreground">Annuaire des prestataires par catégorie.</p>
        </div>
        <Button onClick={openCreateDialog}>Nouveau prestataire</Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun prestataire enregistré."
      />
      <TransportProviderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        provider={editingProvider}
      />
    </div>
  );
}
```

- [ ] **Step 7: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/transport` liste les 7 prestataires du seed avec leurs catégories traduites en FR (ex. "Yango" → "Taxi / VTC"), cliquer "Nouveau prestataire" ouvre un dialogue, le créer l'ajoute à la table, "Modifier" pré-remplit le dialogue, "Supprimer" retire la ligne. Arrête le serveur.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/features/transport apps/admin/src/app/\(dashboard\)/transport
git commit -m "feat(admin): ajouter le CRUD des prestataires de transport (dialogue de création/édition)"
```

---

### Task 12: Gestion des événements (CRUD + image de couverture + RSVP)

**Files:**

- Create: `apps/admin/src/features/events/schemas/event.schema.ts`
- Create: `apps/admin/src/features/events/services/events.service.ts`
- Create: `apps/admin/src/features/events/hooks/use-events.ts`
- Create: `apps/admin/src/features/events/components/events-columns.tsx`
- Create: `apps/admin/src/features/events/components/event-form.tsx`
- Create: `apps/admin/src/features/events/components/event-rsvps-list.tsx`
- Create: `apps/admin/src/app/(dashboard)/events/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/events/[id]/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/events/new/page.tsx`

- [ ] **Step 1: Créer le schéma Zod**

Crée `apps/admin/src/features/events/schemas/event.schema.ts` :

```ts
import { z } from 'zod';

export const EVENT_CATEGORIES = ['concert', 'festival', 'conference', 'sport'] as const;
export const EVENT_CATEGORY_LABELS: Record<(typeof EVENT_CATEGORIES)[number], string> = {
  concert: 'Concert',
  festival: 'Festival',
  conference: 'Conférence',
  sport: 'Sport',
};

export const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  category: z.enum(EVENT_CATEGORIES),
  event_date: z.string().min(1, 'La date est requise'),
  event_time: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  partner: z.string().optional().nullable(),
  price_label: z.string().optional().nullable(),
  price_value: z.coerce.number().min(0).default(0),
  is_featured: z.boolean().default(false),
  description: z.string().optional().nullable(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
```

- [ ] **Step 2: Créer le service**

Crée `apps/admin/src/features/events/services/events.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { EventRow, EventRsvp, Profile, TablesInsert, TablesUpdate } from '@dakareaseu/types';
import type { EventFormValues } from '../schemas/event.schema';

export interface RsvpWithAttendee extends EventRsvp {
  attendee: Pick<Profile, 'id' | 'full_name' | 'phone'> | null;
}

export async function fetchEvents(): Promise<EventRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchEventDetail(id: string): Promise<EventRow> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function fetchEventRsvps(eventId: string): Promise<RsvpWithAttendee[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*, attendee:profiles(id, full_name, phone)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as RsvpWithAttendee[];
}

export async function createEvent(values: EventFormValues): Promise<EventRow> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesInsert<'events'> = { ...values };
  const { data, error } = await supabase.from('events').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, values: EventFormValues): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const payload: TablesUpdate<'events'> = { ...values };
  const { error } = await supabase.from('events').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadEventCoverImage(eventId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${eventId}/cover-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('events-media')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('events-media').getPublicUrl(path);
  const { error: updateError } = await supabase
    .from('events')
    .update({ cover_image_url: data.publicUrl })
    .eq('id', eventId);
  if (updateError) throw updateError;
  return data.publicUrl;
}
```

- [ ] **Step 3: Créer les hooks**

Crée `apps/admin/src/features/events/hooks/use-events.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createEvent,
  deleteEvent,
  fetchEventDetail,
  fetchEventRsvps,
  fetchEvents,
  updateEvent,
  uploadEventCoverImage,
} from '../services/events.service';
import type { EventFormValues } from '../schemas/event.schema';

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: fetchEvents });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: () => fetchEventDetail(id!),
    enabled: !!id,
  });
}

export function useEventRsvps(eventId: string | undefined) {
  return useQuery({
    queryKey: ['events', 'rsvps', eventId],
    queryFn: () => fetchEventRsvps(eventId!),
    enabled: !!eventId,
  });
}

function useInvalidateEvent(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['events', 'detail', id] });
  };
}

export function useSaveEvent(id?: string) {
  const invalidate = useInvalidateEvent(id);
  return useMutation({
    mutationFn: (values: EventFormValues) => (id ? updateEvent(id, values) : createEvent(values)),
    onSuccess: () => {
      toast.success(id ? 'Événement mis à jour.' : 'Événement créé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success('Événement supprimé.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadEventCoverImage(eventId: string) {
  const invalidate = useInvalidateEvent(eventId);
  return useMutation({
    mutationFn: (file: File) => uploadEventCoverImage(eventId, file),
    onSuccess: () => {
      toast.success('Image de couverture mise à jour.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 4: Définir les colonnes**

Crée `apps/admin/src/features/events/components/events-columns.tsx` :

```tsx
'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { EventRow } from '@dakareaseu/types';
import { EVENT_CATEGORY_LABELS } from '../schemas/event.schema';
import { Badge } from '@/components/ui/badge';

export const eventsColumns: ColumnDef<EventRow>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <Link href={`/dashboard/events/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => EVENT_CATEGORY_LABELS[row.original.category] ?? row.original.category,
  },
  { accessorKey: 'event_date', header: 'Date' },
  { accessorKey: 'venue', header: 'Lieu' },
  {
    accessorKey: 'is_featured',
    header: 'À la une',
    cell: ({ row }) => (
      <Badge variant={row.original.is_featured ? 'default' : 'secondary'}>
        {row.original.is_featured ? 'Oui' : 'Non'}
      </Badge>
    ),
  },
];
```

- [ ] **Step 5: Créer le formulaire**

Crée `apps/admin/src/features/events/components/event-form.tsx` :

```tsx
'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import {
  eventSchema,
  type EventFormValues,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
} from '../schemas/event.schema';
import type { EventRow } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveEvent, useUploadEventCoverImage } from '../hooks/use-events';

const DEFAULT_VALUES: EventFormValues = {
  title: '',
  category: 'concert',
  event_date: '',
  event_time: '',
  venue: '',
  partner: '',
  price_label: '',
  price_value: 0,
  is_featured: false,
  description: '',
};

export function EventForm({
  event,
  onSaved,
}: {
  event?: EventRow;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveEvent(event?.id);
  const uploadMutation = useUploadEventCoverImage(event?.id ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          category: event.category,
          event_date: event.event_date,
          event_time: event.event_time ?? '',
          venue: event.venue ?? '',
          partner: event.partner ?? '',
          price_label: event.price_label ?? '',
          price_value: event.price_value,
          is_featured: event.is_featured,
          description: event.description ?? '',
        }
      : DEFAULT_VALUES,
  });

  async function onSubmit(values: EventFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!event && result && 'id' in result) onSaved?.(result.id);
  }

  function handleCoverFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && event) uploadMutation.mutate(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6">
      {event && (
        <div className="flex items-center gap-4">
          {event.cover_image_url && (
            <Image
              src={event.cover_image_url}
              alt=""
              width={160}
              height={100}
              className="h-24 w-40 rounded object-cover"
              unoptimized
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Envoi…' : "Changer l'image de couverture"}
          </Button>
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {EVENT_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="event_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partenaire</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (libellé affiché)</FormLabel>
                <FormControl>
                  <Input placeholder="Gratuit / 5 000 CFA" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (valeur numérique)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 md:col-span-2">
                <FormLabel className="!mt-0">Mettre à la une</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={saveMutation.isPending} className="md:col-span-2">
            {saveMutation.isPending
              ? 'Enregistrement…'
              : event
                ? 'Enregistrer les modifications'
                : "Créer l'événement"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

- [ ] **Step 6: Créer la liste des participants RSVP**

Crée `apps/admin/src/features/events/components/event-rsvps-list.tsx` :

```tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventRsvps } from '../hooks/use-events';

const STATUS_LABELS: Record<string, string> = {
  interested: 'Intéressé·e',
  confirmed: 'Confirmé·e',
};

export function EventRsvpsList({ eventId }: { eventId: string }) {
  const { data: rsvps = [], isLoading } = useEventRsvps(eventId);

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (rsvps.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        Aucune participation enregistrée pour le moment.
      </p>
    );

  return (
    <ul className="space-y-2">
      {rsvps.map((rsvp) => (
        <li
          key={rsvp.id}
          className="flex items-center justify-between rounded-md border p-3 text-sm"
        >
          <div>
            <p className="font-medium">
              {rsvp.attendee?.full_name ?? 'Étudiant·e sans nom renseigné'}
            </p>
            <p className="text-muted-foreground">{rsvp.attendee?.phone ?? '—'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={rsvp.status === 'confirmed' ? 'default' : 'secondary'}>
              {STATUS_LABELS[rsvp.status] ?? rsvp.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {rsvp.checked_in_at
                ? `Check-in : ${new Date(rsvp.checked_in_at).toLocaleString('fr-FR')}`
                : 'Pas encore check-in'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 7: Créer les pages**

Crée `apps/admin/src/app/(dashboard)/events/page.tsx` :

```tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table';
import { useEvents } from '@/features/events/hooks/use-events';
import { eventsColumns } from '@/features/events/components/events-columns';

export default function EventsPage() {
  const { data = [], isLoading } = useEvents();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Événements</h1>
          <p className="text-muted-foreground">Actualités culturelles et événementielles.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">Nouvel événement</Link>
        </Button>
      </div>
      <DataTable
        columns={eventsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun événement enregistré."
      />
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/events/[id]/page.tsx` :

```tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvent } from '@/features/events/hooks/use-events';
import { EventForm } from '@/features/events/components/event-form';
import { EventRsvpsList } from '@/features/events/components/event-rsvps-list';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(params.id);

  if (isLoading || !event) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm event={event} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Participants (RSVP)</CardTitle>
        </CardHeader>
        <CardContent>
          <EventRsvpsList eventId={event.id} />
        </CardContent>
      </Card>
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/events/new/page.tsx` :

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventForm } from '@/features/events/components/event-form';

export default function NewEventPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvel événement</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm onSaved={(id) => router.push(`/dashboard/events/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 8: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/events` liste les 6 événements du seed avec les badges "À la une" cohérents (ex. "Festival Salam" → Oui), ouvrir un événement affiche son formulaire pré-rempli, l'upload d'image de couverture fonctionne, et la section "Participants (RSVP)" affiche "Aucune participation enregistrée pour le moment." (le seed ne crée pas de RSVP — comportement attendu). Arrête le serveur.

- [ ] **Step 9: Commit**

```bash
git add apps/admin/src/features/events apps/admin/src/app/\(dashboard\)/events
git commit -m "feat(admin): ajouter le CRUD des événements avec image de couverture et liste des participants RSVP"
```

---

### Task 13: File de vérification étudiante (signed URLs + approbation/rejet + blocage)

**Files:**

- Create: `apps/admin/src/app/api/student-id-signed-url/route.ts`
- Create: `apps/admin/src/features/verifications/services/verifications.service.ts`
- Create: `apps/admin/src/features/verifications/hooks/use-verifications.ts`
- Create: `apps/admin/src/features/verifications/components/verification-card.tsx`
- Create: `apps/admin/src/features/verifications/components/verification-document-viewer.tsx`
- Create: `apps/admin/src/app/(dashboard)/verifications/page.tsx`
- Test: `apps/admin/src/features/verifications/services/verifications.service.test.ts`

- [ ] **Step 1: Créer le Route Handler de génération d'URL signée**

Le bucket `student-ids` est **privé** (cf. plan foundation, policy `student_ids_select_owner_or_admin`). Une session admin authentifiée via le client RLS standard peut directement appeler `createSignedUrl` (RLS sur `storage.objects` autorise `public.is_admin()` en lecture) — **pas besoin de service-role ici**. On encapsule néanmoins l'appel dans un Route Handler côté serveur pour garder l'URL signée hors des logs client et limiter sa durée de vie.

Crée `apps/admin/src/app/api/student-id-signed-url/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

const SIGNED_URL_TTL_SECONDS = 120;

export async function POST(request: Request) {
  const { path } = (await request.json()) as { path?: string };
  if (!path) {
    return NextResponse.json({ error: 'Le champ "path" est requis.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  }

  // RLS (`student_ids_select_owner_or_admin`) autorise cet appel pour un admin —
  // contournement par le client navigateur impossible, contournement RLS inutile ici.
  const { data, error } = await supabase.storage
    .from('student-ids')
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Impossible de générer une URL signée.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ signedUrl: data.signedUrl, expiresInSeconds: SIGNED_URL_TTL_SECONDS });
}
```

- [ ] **Step 2: Créer le service de la file de vérification**

Crée `apps/admin/src/features/verifications/services/verifications.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Profile, Enums } from '@dakareaseu/types';

export type VerificationStatus = Enums<'verification_status'>;

export async function fetchPendingVerifications(): Promise<Profile[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('verification_status', 'pending')
    .not('verification_doc_url', 'is', null)
    .order('updated_at', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Met à jour `profiles.verification_status`. Le trigger `notify_*` du plan
 * foundation (notification_type = 'verification_status_update') s'exécute
 * automatiquement côté base — aucune action supplémentaire ici.
 */
export async function setVerificationStatus(
  profileId: string,
  status: VerificationStatus,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: status })
    .eq('id', profileId);
  if (error) throw error;
}

export async function setProfileBlocked(profileId: string, isBlocked: boolean): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: isBlocked })
    .eq('id', profileId);
  if (error) throw error;
}

/**
 * Demande une URL signée (durée de vie courte) vers le document privé d'un
 * étudiant via le Route Handler serveur (`/api/student-id-signed-url`), qui
 * vérifie le rôle admin avant d'appeler `storage.createSignedUrl`.
 */
export async function fetchSignedDocumentUrl(path: string): Promise<string> {
  const response = await fetch('/api/student-id-signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  const body = (await response.json()) as { signedUrl?: string; error?: string };
  if (!response.ok || !body.signedUrl) {
    throw new Error(body.error ?? 'Impossible de récupérer le document.');
  }
  return body.signedUrl;
}
```

- [ ] **Step 3: Écrire le test du service (mappe correctement les réponses du Route Handler)**

Crée `apps/admin/src/features/verifications/services/verifications.service.test.ts` :

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchSignedDocumentUrl } from './verifications.service';

const originalFetch = global.fetch;

describe('fetchSignedDocumentUrl', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the signed URL when the route handler responds successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          signedUrl: 'https://signed.example.com/card.jpg',
          expiresInSeconds: 120,
        }),
    }) as unknown as typeof fetch;

    const url = await fetchSignedDocumentUrl('user-123/carte.jpg');

    expect(url).toBe('https://signed.example.com/card.jpg');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/student-id-signed-url',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws with the server-provided message when the request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Accès réservé aux administrateurs.' }),
    }) as unknown as typeof fetch;

    await expect(fetchSignedDocumentUrl('user-123/carte.jpg')).rejects.toThrow(
      'Accès réservé aux administrateurs.',
    );
  });
});
```

- [ ] **Step 4: Lancer le test**

Run: `cd apps/admin && pnpm vitest run src/features/verifications/services/verifications.service.test.ts`
Expected: `2 passed`.

- [ ] **Step 5: Créer les hooks**

Crée `apps/admin/src/features/verifications/hooks/use-verifications.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchPendingVerifications,
  fetchSignedDocumentUrl,
  setProfileBlocked,
  setVerificationStatus,
  type VerificationStatus,
} from '../services/verifications.service';

export function usePendingVerifications() {
  return useQuery({ queryKey: ['verifications', 'pending'], queryFn: fetchPendingVerifications });
}

export function useSignedDocumentUrl(path: string | null) {
  return useQuery({
    queryKey: ['verifications', 'signed-url', path],
    queryFn: () => fetchSignedDocumentUrl(path!),
    enabled: !!path,
    staleTime: 60_000,
    retry: false,
  });
}

export function useSetVerificationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, status }: { profileId: string; status: VerificationStatus }) =>
      setVerificationStatus(profileId, status),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === 'approved' ? 'Carte étudiante approuvée.' : 'Carte étudiante rejetée.',
      );
      queryClient.invalidateQueries({ queryKey: ['verifications', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSetProfileBlocked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, isBlocked }: { profileId: string; isBlocked: boolean }) =>
      setProfileBlocked(profileId, isBlocked),
    onSuccess: (_data, variables) => {
      toast.success(variables.isBlocked ? 'Compte bloqué.' : 'Compte débloqué.');
      queryClient.invalidateQueries({ queryKey: ['verifications', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 6: Créer le visualiseur de document (URL signée)**

Crée `apps/admin/src/features/verifications/components/verification-document-viewer.tsx` :

```tsx
'use client';

import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useSignedDocumentUrl } from '../hooks/use-verifications';

export function VerificationDocumentViewer({ documentPath }: { documentPath: string | null }) {
  const { data: signedUrl, isLoading, isError, error } = useSignedDocumentUrl(documentPath);

  if (!documentPath) {
    return <p className="text-sm text-muted-foreground">Aucun document n&apos;a été téléversé.</p>;
  }
  if (isLoading) return <Skeleton className="h-64 w-full max-w-sm" />;
  if (isError || !signedUrl) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : 'Document inaccessible.'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Image
        src={signedUrl}
        alt="Carte étudiante"
        width={400}
        height={260}
        className="max-w-sm rounded-md border object-contain"
        unoptimized
      />
      <p className="text-xs text-muted-foreground">
        Lien temporaire (expire après 2 minutes) généré via une URL signée du bucket privé
        `student-ids`.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Créer la carte de vérification (document + actions)**

Crée `apps/admin/src/features/verifications/components/verification-card.tsx` :

```tsx
'use client';

import type { Profile } from '@dakareaseu/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerificationDocumentViewer } from './verification-document-viewer';
import { useSetProfileBlocked, useSetVerificationStatus } from '../hooks/use-verifications';

export function VerificationCard({ profile }: { profile: Profile }) {
  const statusMutation = useSetVerificationStatus();
  const blockMutation = useSetProfileBlocked();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{profile.full_name ?? 'Étudiant·e sans nom renseigné'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {profile.phone ?? 'Téléphone non renseigné'}
          </p>
        </div>
        <Badge variant={profile.is_blocked ? 'destructive' : 'secondary'}>
          {profile.is_blocked ? 'Compte bloqué' : 'Compte actif'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <VerificationDocumentViewer documentPath={profile.verification_doc_url} />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => statusMutation.mutate({ profileId: profile.id, status: 'approved' })}
            disabled={statusMutation.isPending}
          >
            Approuver
          </Button>
          <Button
            variant="destructive"
            onClick={() => statusMutation.mutate({ profileId: profile.id, status: 'rejected' })}
            disabled={statusMutation.isPending}
          >
            Rejeter
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              blockMutation.mutate({ profileId: profile.id, isBlocked: !profile.is_blocked })
            }
            disabled={blockMutation.isPending}
          >
            {profile.is_blocked ? 'Débloquer le compte' : 'Bloquer le compte'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 8: Créer la page de la file de vérification**

Crée `apps/admin/src/app/(dashboard)/verifications/page.tsx` :

```tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { usePendingVerifications } from '@/features/verifications/hooks/use-verifications';
import { VerificationCard } from '@/features/verifications/components/verification-card';

export default function VerificationsPage() {
  const { data: profiles = [], isLoading } = usePendingVerifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vérification étudiante</h1>
        <p className="text-muted-foreground">
          Cartes étudiantes en attente de revue manuelle (cf. décision produit §4.6 — pas d&apos;OCR
          automatisé).
        </p>
      </div>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune carte étudiante en attente de revue.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {profiles.map((profile) => (
            <VerificationCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Vérifier le flux complet manuellement**

Préalable : crée un compte étudiant de test, uploade un fichier dans le bucket privé `student-ids` sous `<user_id>/carte-test.jpg` (depuis Supabase Studio → Storage, ou via l'app mobile une fois disponible), assure-toi que `profiles.verification_status = 'pending'` et `verification_doc_url = '<user_id>/carte-test.jpg'` pour ce compte.

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/verifications` affiche une carte pour ce compte avec l'image du document chargée via URL signée (visible quelques secondes, puis le lien expire après 2 minutes — recharger la page régénère un nouveau lien). Cliquer "Approuver" fait disparaître la carte de la liste (le profil n'a plus `verification_status = 'pending'`) et — vérifiable dans Supabase Studio → Table Editor → `notifications` — crée une ligne `type = 'verification_status_update'` pour ce compte (générée automatiquement par le trigger du plan foundation, sans code admin supplémentaire). Le bouton "Bloquer le compte" bascule `is_blocked` et le badge "Compte bloqué/actif" se met à jour. Arrête le serveur.

- [ ] **Step 10: Commit**

```bash
git add apps/admin/src/app/api/student-id-signed-url apps/admin/src/features/verifications apps/admin/src/app/\(dashboard\)/verifications
git commit -m "feat(admin): ajouter la file de vérification étudiante (URLs signées, approbation/rejet, blocage)"
```

---

### Task 14: Gestion des réservations (liste filtrable + transitions de statut)

**Files:**

- Create: `apps/admin/src/features/bookings/services/bookings.service.ts`
- Create: `apps/admin/src/features/bookings/hooks/use-bookings.ts`
- Create: `apps/admin/src/features/bookings/components/bookings-columns.tsx`
- Create: `apps/admin/src/features/bookings/components/booking-status-actions.tsx`
- Create: `apps/admin/src/features/bookings/components/bookings-filters.tsx`
- Create: `apps/admin/src/app/(dashboard)/bookings/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/bookings/[id]/page.tsx`

- [ ] **Step 1: Créer le service**

Crée `apps/admin/src/features/bookings/services/bookings.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Booking, Listing, Profile, BookingStatus, PaymentStatus } from '@dakareaseu/types';

export interface BookingWithRelations extends Booking {
  listing: Pick<Listing, 'id' | 'title' | 'district'> | null;
  renter: Pick<Profile, 'id' | 'full_name' | 'phone'> | null;
}

export interface BookingsFilters {
  status?: BookingStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
}

export async function fetchBookings(filters: BookingsFilters): Promise<BookingWithRelations[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from('bookings')
    .select('*, listing:listings(id, title, district), renter:profiles(id, full_name, phone)')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.paymentStatus && filters.paymentStatus !== 'all')
    query = query.eq('payment_status', filters.paymentStatus);

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as BookingWithRelations[];
}

export async function fetchBookingDetail(id: string): Promise<BookingWithRelations> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, listing:listings(id, title, district), renter:profiles(id, full_name, phone)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as BookingWithRelations;
}

/**
 * Met à jour `bookings.status`. Le trigger `notify_booking_status_change` du
 * plan foundation insère automatiquement une notification
 * (`type = 'booking_status_update'`) pour le locataire — aucune action
 * supplémentaire ici. Realtime côté mobile capte ce changement (cf. §4.5).
 */
export async function setBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 2: Créer les hooks**

Crée `apps/admin/src/features/bookings/hooks/use-bookings.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchBookingDetail,
  fetchBookings,
  setBookingStatus,
  type BookingsFilters,
} from '../services/bookings.service';
import type { BookingStatus } from '@dakareaseu/types';

export function useBookings(filters: BookingsFilters) {
  return useQuery({ queryKey: ['bookings', filters], queryFn: () => fetchBookings(filters) });
}

export function useBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => fetchBookingDetail(id!),
    enabled: !!id,
  });
}

export function useSetBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      setBookingStatus(id, status),
    onSuccess: (_data, variables) => {
      toast.success('Statut de la réservation mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 3: Définir les colonnes**

Crée `apps/admin/src/features/bookings/components/bookings-columns.tsx` :

```tsx
'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';
import type { BookingWithRelations } from '../services/bookings.service';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'default',
};

const PAYMENT_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  success: 'default',
  failed: 'destructive',
};

export const bookingsColumns: ColumnDef<BookingWithRelations>[] = [
  {
    id: 'listing',
    header: 'Logement',
    cell: ({ row }) => (
      <Link href={`/dashboard/bookings/${row.original.id}`} className="font-medium hover:underline">
        {row.original.listing?.title ?? 'Logement supprimé'}
      </Link>
    ),
  },
  {
    id: 'renter',
    header: 'Locataire',
    cell: ({ row }) => row.original.renter?.full_name ?? '—',
  },
  {
    accessorKey: 'duration_months',
    header: 'Durée',
    cell: ({ row }) => `${row.original.duration_months} mois`,
  },
  {
    accessorKey: 'total_amount',
    header: 'Montant',
    cell: ({ row }) => `${row.original.total_amount.toLocaleString('fr-FR')} XOF`,
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] ?? 'secondary'}>
        {BOOKING_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'payment_status',
    header: 'Paiement',
    cell: ({ row }) => (
      <Badge variant={PAYMENT_VARIANT[row.original.payment_status] ?? 'secondary'}>
        {PAYMENT_STATUS_LABELS[row.original.payment_status] ?? row.original.payment_status}
      </Badge>
    ),
  },
];
```

- [ ] **Step 4: Créer la barre de filtres**

Crée `apps/admin/src/features/bookings/components/bookings-filters.tsx` :

```tsx
'use client';

import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@dakareaseu/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BookingsFilters } from '../services/bookings.service';

export function BookingsFiltersBar({
  filters,
  onChange,
}: {
  filters: BookingsFilters;
  onChange: (filters: BookingsFilters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, status: value as BookingsFilters['status'] })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.paymentStatus ?? 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, paymentStatus: value as BookingsFilters['paymentStatus'] })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut de paiement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les paiements</SelectItem>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 5: Créer les actions de transition de statut**

Crée `apps/admin/src/features/bookings/components/booking-status-actions.tsx` :

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { useSetBookingStatus } from '../hooks/use-bookings';
import type { Booking } from '@dakareaseu/types';

const TRANSITIONS: Record<
  Booking['status'],
  { label: string; next: Booking['status']; variant?: 'default' | 'destructive' | 'outline' }[]
> = {
  pending: [
    { label: 'Confirmer', next: 'confirmed' },
    { label: 'Annuler', next: 'cancelled', variant: 'destructive' },
  ],
  confirmed: [
    { label: 'Marquer comme terminée', next: 'completed' },
    { label: 'Annuler', next: 'cancelled', variant: 'destructive' },
  ],
  cancelled: [],
  completed: [],
};

export function BookingStatusActions({ booking }: { booking: Booking }) {
  const mutation = useSetBookingStatus();
  const transitions = TRANSITIONS[booking.status];

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucune transition possible depuis ce statut.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((transition) => (
        <Button
          key={transition.next}
          variant={transition.variant ?? 'default'}
          onClick={() => mutation.mutate({ id: booking.id, status: transition.next })}
          disabled={mutation.isPending}
        >
          {transition.label}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Créer les pages**

Crée `apps/admin/src/app/(dashboard)/bookings/page.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { DataTable } from '@/shared/components/data-table';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import { bookingsColumns } from '@/features/bookings/components/bookings-columns';
import { BookingsFiltersBar } from '@/features/bookings/components/bookings-filters';
import type { BookingsFilters } from '@/features/bookings/services/bookings.service';

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingsFilters>({ status: 'all', paymentStatus: 'all' });
  const { data = [], isLoading } = useBookings(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="text-muted-foreground">
          Suivi des réservations de logement et de leur statut de paiement simulé.
        </p>
      </div>
      <BookingsFiltersBar filters={filters} onChange={setFilters} />
      <DataTable
        columns={bookingsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune réservation ne correspond à ces filtres."
      />
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/bookings/[id]/page.tsx` :

```tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@dakareaseu/shared';
import { useBookingDetail } from '@/features/bookings/hooks/use-bookings';
import { BookingStatusActions } from '@/features/bookings/components/booking-status-actions';

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: booking, isLoading } = useBookingDetail(params.id);

  if (isLoading || !booking) return <Skeleton className="h-72 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{booking.listing?.title ?? 'Logement supprimé'}</h1>
          <p className="text-muted-foreground">
            Locataire : {booking.renter?.full_name ?? '—'} (
            {booking.renter?.phone ?? 'téléphone non renseigné'})
          </p>
        </div>
        <div className="flex gap-2">
          <Badge>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
          <Badge variant="outline">{PAYMENT_STATUS_LABELS[booking.payment_status]}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Détails</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Date de début</p>
            <p className="font-medium">{booking.start_date}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Durée</p>
            <p className="font-medium">{booking.duration_months} mois</p>
          </div>
          <div>
            <p className="text-muted-foreground">Montant total</p>
            <p className="font-medium">{booking.total_amount.toLocaleString('fr-FR')} XOF</p>
          </div>
          <div>
            <p className="text-muted-foreground">Moyen de paiement</p>
            <p className="font-medium">{booking.payment_method ?? '—'}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Changer le statut</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingStatusActions booking={booking} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/bookings` affiche une table vide ("Aucune réservation ne correspond à ces filtres." — le seed du plan foundation ne crée pas de réservations, c'est attendu sans comptes étudiants liés). Pour valider le workflow, crée manuellement une réservation de test depuis Supabase Studio (`insert into public.bookings (user_id, listing_id, start_date, duration_months, total_amount, status) values ('<un-id-de-profil-étudiant>', 'b0000000-0000-0000-0000-000000000001', '2026-09-01', 6, 1080000, 'pending');`), recharge la page : la ligne apparaît, ouvrir son détail affiche les boutons "Confirmer"/"Annuler", cliquer "Confirmer" met à jour le badge et — vérifiable dans `notifications` — crée une ligne `type = 'booking_status_update'`. Arrête le serveur.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/features/bookings apps/admin/src/app/\(dashboard\)/bookings
git commit -m "feat(admin): ajouter la gestion des réservations (filtres, transitions de statut)"
```

---

### Task 15: File des demandes de recherche guidée + alerte Realtime

**Files:**

- Create: `apps/admin/src/features/guided-search/services/guided-search.service.ts`
- Create: `apps/admin/src/features/guided-search/hooks/use-guided-search-requests.ts`
- Create: `apps/admin/src/features/guided-search/hooks/use-new-request-realtime-alert.ts`
- Create: `apps/admin/src/features/guided-search/components/guided-search-columns.tsx`
- Create: `apps/admin/src/features/guided-search/components/guided-search-status-actions.tsx`
- Create: `apps/admin/src/app/(dashboard)/guided-search/page.tsx`
- Create: `apps/admin/src/app/(dashboard)/guided-search/[id]/page.tsx`
- Modify: `apps/admin/src/shared/components/dashboard-shell.tsx`

- [ ] **Step 1: Créer le service**

Crée `apps/admin/src/features/guided-search/services/guided-search.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { GuidedSearchRequest, Profile, School, GuidedSearchStatus } from '@dakareaseu/types';

export interface GuidedSearchRequestWithRelations extends GuidedSearchRequest {
  student: Pick<Profile, 'id' | 'full_name' | 'phone'> | null;
  school: Pick<School, 'id' | 'name' | 'district'> | null;
}

export interface GuidedSearchFilters {
  status?: GuidedSearchStatus | 'all';
}

export async function fetchGuidedSearchRequests(
  filters: GuidedSearchFilters,
): Promise<GuidedSearchRequestWithRelations[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from('guided_search_requests')
    .select('*, student:profiles(id, full_name, phone), school:schools(id, name, district)')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as GuidedSearchRequestWithRelations[];
}

export async function fetchGuidedSearchRequestDetail(
  id: string,
): Promise<GuidedSearchRequestWithRelations> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('guided_search_requests')
    .select('*, student:profiles(id, full_name, phone), school:schools(id, name, district)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as GuidedSearchRequestWithRelations;
}

export async function setGuidedSearchStatus(id: string, status: GuidedSearchStatus): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('guided_search_requests').update({ status }).eq('id', id);
  if (error) throw error;
}

/**
 * Recalcule les meilleurs logements correspondants via la RPC `match_listings`
 * (cf. plan foundation — réimplémentation SQL de `computeMatches`), pour aider
 * l'admin à proposer une sélection pertinente à l'étudiant.
 */
export async function fetchMatchesForRequest(request: GuidedSearchRequest) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc('match_listings', {
    p_type: request.housing_type,
    p_budget: request.budget,
    p_school_id: request.school_id,
    p_district: request.district,
    p_furnished: request.furnished_pref,
    p_coloc: request.coloc_pref,
    p_months: request.duration_months,
  });
  if (error) throw error;
  return data.slice(0, 5);
}
```

- [ ] **Step 2: Créer les hooks de données**

Crée `apps/admin/src/features/guided-search/hooks/use-guided-search-requests.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchGuidedSearchRequestDetail,
  fetchGuidedSearchRequests,
  fetchMatchesForRequest,
  setGuidedSearchStatus,
  type GuidedSearchFilters,
} from '../services/guided-search.service';
import type { GuidedSearchRequest, GuidedSearchStatus } from '@dakareaseu/types';

export function useGuidedSearchRequests(filters: GuidedSearchFilters) {
  return useQuery({
    queryKey: ['guided-search', filters],
    queryFn: () => fetchGuidedSearchRequests(filters),
  });
}

export function useGuidedSearchRequestDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['guided-search', 'detail', id],
    queryFn: () => fetchGuidedSearchRequestDetail(id!),
    enabled: !!id,
  });
}

export function useMatchesForRequest(request: GuidedSearchRequest | undefined) {
  return useQuery({
    queryKey: ['guided-search', 'matches', request?.id],
    queryFn: () => fetchMatchesForRequest(request!),
    enabled: !!request,
  });
}

export function useSetGuidedSearchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GuidedSearchStatus }) =>
      setGuidedSearchStatus(id, status),
    onSuccess: (_data, variables) => {
      toast.success('Statut de la demande mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['guided-search'] });
      queryClient.invalidateQueries({ queryKey: ['guided-search', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 3: Créer le hook d'alerte Realtime sur les nouvelles notifications admin**

Crée `apps/admin/src/features/guided-search/hooks/use-new-request-realtime-alert.ts` :

```ts
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Notification } from '@dakareaseu/types';

/**
 * S'abonne aux notifications Realtime de l'admin connecté, filtrées sur
 * `type = 'new_guided_search_request'` (cf. §4.5/§8 du prompt — Realtime
 * ciblé). Ces lignes sont insérées par le trigger
 * `notify_admins_new_guided_search` du plan foundation pour CHAQUE profil
 * `role = 'admin'` à chaque nouvelle `guided_search_requests` — le canal est
 * donc naturellement scopé aux notifications du destinataire courant via le
 * filtre `user_id=eq.<currentUserId>`, qui correspond à la policy RLS
 * `notifications_select_self`.
 */
export function useNewGuidedSearchRequestAlert(currentUserId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`admin-guided-search-alerts-${currentUserId}`)
      .on<Notification>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.type !== 'new_guided_search_request') return;

          toast.info(payload.new.title, { description: payload.new.body ?? undefined });
          queryClient.invalidateQueries({ queryKey: ['guided-search'] });
          queryClient.invalidateQueries({ queryKey: ['overview', 'stats'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);
}
```

- [ ] **Step 4: Brancher l'alerte Realtime dans le shell du dashboard**

Édite `apps/admin/src/shared/components/dashboard-shell.tsx` :

1. Modifie la signature du composant pour accepter `currentUserId` :

```tsx
export function DashboardShell({
  adminName,
  currentUserId,
  children,
}: {
  adminName: string;
  currentUserId: string;
  children: React.ReactNode;
}) {
```

2. Ajoute l'import en haut du fichier :

```tsx
import { useNewGuidedSearchRequestAlert } from '@/features/guided-search/hooks/use-new-request-realtime-alert';
```

3. Ajoute, juste après la ligne `const signOut = useSignOut();`, l'appel au hook :

```tsx
useNewGuidedSearchRequestAlert(currentUserId);
```

Ensuite, édite `apps/admin/src/app/(dashboard)/layout.tsx` pour passer la nouvelle prop — remplace la ligne :

```tsx
return (
  <DashboardShell adminName={profile.full_name ?? user.email ?? 'Admin'}>{children}</DashboardShell>
);
```

par :

```tsx
return (
  <DashboardShell adminName={profile.full_name ?? user.email ?? 'Admin'} currentUserId={user.id}>
    {children}
  </DashboardShell>
);
```

- [ ] **Step 5: Définir les colonnes**

Crée `apps/admin/src/features/guided-search/components/guided-search-columns.tsx` :

```tsx
'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { GUIDED_SEARCH_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';
import type { GuidedSearchRequestWithRelations } from '../services/guided-search.service';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  open: 'default',
  matched: 'secondary',
  closed: 'outline',
};

export const guidedSearchColumns: ColumnDef<GuidedSearchRequestWithRelations>[] = [
  {
    id: 'student',
    header: 'Étudiant·e',
    cell: ({ row }) => (
      <Link
        href={`/dashboard/guided-search/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.student?.full_name ?? 'Étudiant·e sans nom renseigné'}
      </Link>
    ),
  },
  {
    accessorKey: 'housing_type',
    header: 'Type recherché',
  },
  {
    id: 'school',
    header: 'École',
    cell: ({ row }) => row.original.school?.name ?? '—',
  },
  {
    accessorKey: 'district',
    header: 'Quartier',
    cell: ({ row }) => row.original.district ?? '—',
  },
  {
    accessorKey: 'budget',
    header: 'Budget',
    cell: ({ row }) => `${row.original.budget.toLocaleString('fr-FR')} XOF`,
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] ?? 'secondary'}>
        {GUIDED_SEARCH_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
];
```

- [ ] **Step 6: Créer les actions de transition de statut**

Crée `apps/admin/src/features/guided-search/components/guided-search-status-actions.tsx` :

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { useSetGuidedSearchStatus } from '../hooks/use-guided-search-requests';
import type { GuidedSearchRequest } from '@dakareaseu/types';

export function GuidedSearchStatusActions({ request }: { request: GuidedSearchRequest }) {
  const mutation = useSetGuidedSearchStatus();

  if (request.status === 'closed') {
    return <p className="text-sm text-muted-foreground">Cette demande est fermée.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {request.status === 'open' && (
        <Button
          onClick={() => mutation.mutate({ id: request.id, status: 'matched' })}
          disabled={mutation.isPending}
        >
          Marquer comme matchée
        </Button>
      )}
      <Button
        variant="outline"
        onClick={() => mutation.mutate({ id: request.id, status: 'closed' })}
        disabled={mutation.isPending}
      >
        Fermer la demande
      </Button>
    </div>
  );
}
```

- [ ] **Step 7: Créer les pages**

Crée `apps/admin/src/app/(dashboard)/guided-search/page.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { GUIDED_SEARCH_STATUS_LABELS } from '@dakareaseu/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/shared/components/data-table';
import { useGuidedSearchRequests } from '@/features/guided-search/hooks/use-guided-search-requests';
import { guidedSearchColumns } from '@/features/guided-search/components/guided-search-columns';
import type { GuidedSearchFilters } from '@/features/guided-search/services/guided-search.service';

export default function GuidedSearchPage() {
  const [filters, setFilters] = useState<GuidedSearchFilters>({ status: 'all' });
  const { data = [], isLoading } = useGuidedSearchRequests(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demandes de recherche guidée</h1>
        <p className="text-muted-foreground">
          Critères soumis par les étudiants via la recherche guidée.
        </p>
      </div>
      <Select
        value={filters.status ?? 'all'}
        onValueChange={(value) => setFilters({ status: value as GuidedSearchFilters['status'] })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {Object.entries(GUIDED_SEARCH_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        columns={guidedSearchColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucune demande ne correspond à ce filtre."
      />
    </div>
  );
}
```

Crée `apps/admin/src/app/(dashboard)/guided-search/[id]/page.tsx` :

```tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGuidedSearchRequestDetail,
  useMatchesForRequest,
} from '@/features/guided-search/hooks/use-guided-search-requests';
import { GuidedSearchStatusActions } from '@/features/guided-search/components/guided-search-status-actions';

export default function GuidedSearchDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: request, isLoading } = useGuidedSearchRequestDetail(params.id);
  const { data: matches = [], isLoading: matchesLoading } = useMatchesForRequest(request);

  if (isLoading || !request) return <Skeleton className="h-72 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {request.student?.full_name ?? 'Étudiant·e sans nom renseigné'}
        </h1>
        <p className="text-muted-foreground">
          {request.student?.phone ?? 'Téléphone non renseigné'}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Critères</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Type recherché</p>
            <p className="font-medium">{request.housing_type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">École</p>
            <p className="font-medium">{request.school?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quartier</p>
            <p className="font-medium">{request.district ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-medium">{request.budget.toLocaleString('fr-FR')} XOF</p>
          </div>
          <div>
            <p className="text-muted-foreground">Préférence meublé</p>
            <p className="font-medium">{request.furnished_pref}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Préférence colocation</p>
            <p className="font-medium">{request.coloc_pref}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Durée souhaitée</p>
            <p className="font-medium">{request.duration_months} mois</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Meilleurs logements correspondants (RPC match_listings)</CardTitle>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune correspondance calculée.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {matches.map((match) => (
                <li
                  key={match.listing_id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {match.listing_id}
                  </span>
                  <span className="font-semibold">
                    {match.match_pct}% — {match.reasons.join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Changer le statut</CardTitle>
        </CardHeader>
        <CardContent>
          <GuidedSearchStatusActions request={request} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 8: Vérifier visuellement (y compris l'alerte Realtime)**

Run: `cd apps/admin && pnpm dev`
Expected (étape 1) : `/dashboard/guided-search` affiche une table vide ("Aucune demande ne correspond à ce filtre." — pas de demandes dans le seed). Pour tester le workflow et le Realtime : ouvre un second onglet connecté en tant qu'**étudiant** (ou utilise `psql`/Supabase Studio) et insère une ligne dans `guided_search_requests` (`insert into public.guided_search_requests (user_id, housing_type, budget, district, duration_months) values ('<id-etudiant>', 'studio', 150000, 'Fann', 3);`). **Sans recharger** la page admin (`/dashboard/guided-search` ou toute autre page du dashboard, l'abonnement étant dans le shell global), un toast "Nouvelle demande de recherche guidée" apparaît dans les ~2 secondes et la table se rafraîchit avec la nouvelle ligne. Ouvrir son détail affiche les critères, les meilleurs matchs calculés via `match_listings`, et les boutons de transition de statut ("Marquer comme matchée" → "Fermer la demande"). Arrête le serveur.

- [ ] **Step 9: Commit**

```bash
git add apps/admin/src/features/guided-search apps/admin/src/app/\(dashboard\)/guided-search apps/admin/src/shared/components/dashboard-shell.tsx apps/admin/src/app/\(dashboard\)/layout.tsx
git commit -m "feat(admin): ajouter la file des demandes de recherche guidée avec alerte Realtime sur nouvelle demande"
```

---

### Task 16: Modération des avis (visualisation + suppression)

**Files:**

- Create: `apps/admin/src/features/reviews/services/reviews.service.ts`
- Create: `apps/admin/src/features/reviews/hooks/use-reviews.ts`
- Create: `apps/admin/src/features/reviews/components/reviews-columns.tsx`
- Create: `apps/admin/src/app/(dashboard)/reviews/page.tsx`

> **Périmètre :** prompt.md §10 liste explicitement "Modération des avis : visibilité/suppression si nécessaire" parmi les fonctionnalités du dashboard admin, et §5 confirme `reviews` comme table du modèle de données avec policy `reviews_delete_self_or_admin`. C'est donc dans le périmètre — implémenté ici en lecture + suppression uniquement (pas d'édition du contenu d'un avis : un admin ne réécrit pas les mots d'un étudiant, il modère en le retirant si nécessaire).

- [ ] **Step 1: Créer le service**

Crée `apps/admin/src/features/reviews/services/reviews.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { Review, Profile, ReviewTargetType } from '@dakareaseu/types';

export interface ReviewWithAuthor extends Review {
  author: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface ReviewsFilters {
  targetType?: ReviewTargetType | 'all';
}

export async function fetchReviews(filters: ReviewsFilters): Promise<ReviewWithAuthor[]> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from('reviews')
    .select('*, author:profiles(id, full_name)')
    .order('created_at', { ascending: false });

  if (filters.targetType && filters.targetType !== 'all')
    query = query.eq('target_type', filters.targetType);

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as ReviewWithAuthor[];
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
```

> Remarque : `Enums<'review_target_type'>` n'est pas (encore) exporté comme alias direct par `packages/types` (seul `ReviewTargetType` ne figure pas dans la liste fournie en Task 11 du plan foundation). Si `import type { ReviewTargetType } from '@dakareaseu/types'` échoue au typecheck (Step 4), remplace-le par `import type { Enums } from '@dakareaseu/types'; type ReviewTargetType = Enums<'review_target_type'>;` directement dans ce fichier — les deux formes sont strictement équivalentes au niveau des types.

- [ ] **Step 2: Créer les hooks**

Crée `apps/admin/src/features/reviews/hooks/use-reviews.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteReview, fetchReviews, type ReviewsFilters } from '../services/reviews.service';

export function useReviews(filters: ReviewsFilters) {
  return useQuery({ queryKey: ['reviews', filters], queryFn: () => fetchReviews(filters) });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success('Avis supprimé.');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 3: Définir les colonnes (avec action de suppression intégrée)**

Crée `apps/admin/src/features/reviews/components/reviews-columns.tsx` :

```tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ReviewWithAuthor } from '../services/reviews.service';
import { useDeleteReview } from '../hooks/use-reviews';

const TARGET_TYPE_LABELS: Record<string, string> = {
  listing: 'Logement',
  restaurant: 'Restaurant',
  stay: 'Séjour',
};

export const reviewsColumns: ColumnDef<ReviewWithAuthor>[] = [
  {
    id: 'author',
    header: 'Auteur',
    cell: ({ row }) => row.original.author?.full_name ?? 'Étudiant·e sans nom renseigné',
  },
  {
    accessorKey: 'target_type',
    header: 'Cible',
    cell: ({ row }) => (
      <Badge variant="outline">
        {TARGET_TYPE_LABELS[row.original.target_type] ?? row.original.target_type}
      </Badge>
    ),
  },
  {
    accessorKey: 'rating',
    header: 'Note',
    cell: ({ row }) => `★ ${row.original.rating} / 5`,
  },
  {
    accessorKey: 'comment',
    header: 'Commentaire',
    cell: ({ row }) => <p className="max-w-md truncate">{row.original.comment ?? '—'}</p>,
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('fr-FR'),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <DeleteReviewButton reviewId={row.original.id} />,
  },
];

function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const mutation = useDeleteReview();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => mutation.mutate(reviewId)}
      disabled={mutation.isPending}
    >
      Supprimer
    </Button>
  );
}
```

- [ ] **Step 4: Créer la page**

Crée `apps/admin/src/app/(dashboard)/reviews/page.tsx` :

```tsx
'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/shared/components/data-table';
import { useReviews } from '@/features/reviews/hooks/use-reviews';
import { reviewsColumns } from '@/features/reviews/components/reviews-columns';
import type { ReviewsFilters } from '@/features/reviews/services/reviews.service';

const TARGET_TYPE_OPTIONS: { value: NonNullable<ReviewsFilters['targetType']>; label: string }[] = [
  { value: 'all', label: 'Toutes les cibles' },
  { value: 'listing', label: 'Logements' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'stay', label: 'Séjours' },
];

export default function ReviewsPage() {
  const [filters, setFilters] = useState<ReviewsFilters>({ targetType: 'all' });
  const { data = [], isLoading } = useReviews(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modération des avis</h1>
        <p className="text-muted-foreground">
          Visualisez et supprimez les avis problématiques (logements, restaurants, séjours).
        </p>
      </div>
      <Select
        value={filters.targetType ?? 'all'}
        onValueChange={(value) => setFilters({ targetType: value as ReviewsFilters['targetType'] })}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TARGET_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        columns={reviewsColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun avis enregistré."
      />
    </div>
  );
}
```

- [ ] **Step 5: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/reviews` affiche une table vide (le seed ne crée pas d'avis). Crée un avis de test depuis Supabase Studio (`insert into public.reviews (author_id, target_type, target_id, rating, comment) values ('<id-etudiant>', 'listing', 'b0000000-0000-0000-0000-000000000001', 5, 'Super studio, je recommande !');`), recharge : la ligne apparaît avec son badge de cible et sa note, le filtre "Logements" la conserve / "Restaurants" la masque, "Supprimer" la retire après confirmation côté toast. Arrête le serveur.

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/features/reviews apps/admin/src/app/\(dashboard\)/reviews
git commit -m "feat(admin): ajouter la modération des avis (visualisation, filtre par cible, suppression)"
```

---

### Task 17: Gestion des utilisateurs (liste, rôles, blocage — exception service-role pour `auth.users`)

**Files:**

- Create: `apps/admin/src/app/api/users/route.ts`
- Create: `apps/admin/src/features/users/services/users.service.ts`
- Create: `apps/admin/src/features/users/hooks/use-users.ts`
- Create: `apps/admin/src/features/users/components/users-columns.tsx`
- Create: `apps/admin/src/app/(dashboard)/users/page.tsx`
- Test: `apps/admin/src/app/api/users/route.test.ts`

- [ ] **Step 1: Créer le Route Handler service-role (lecture combinée `profiles` + `auth.users`)**

C'est l'exception documentée n°1 du client service-role (cf. `admin-client.ts`, Task 2) : RLS ne peut pas exposer `auth.users.email` / `last_sign_in_at` via PostgREST, ces colonnes n'étant pas dupliquées dans `profiles`.

Crée `apps/admin/src/app/api/users/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string;
  isBlocked: boolean;
  verificationStatus: string;
  lastSignInAt: string | null;
  createdAt: string;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (requesterProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  }

  // À partir d'ici : opérations que RLS ne peut pas exprimer → client service-role.
  const adminClient = createSupabaseAdminClient();

  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('id, full_name, role, is_blocked, verification_status, created_at')
    .order('created_at', { ascending: false });
  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const authUsersById = new Map(authUsers.users.map((authUser) => [authUser.id, authUser]));

  const rows: AdminUserRow[] = profiles.map((profile) => {
    const authUser = authUsersById.get(profile.id);
    return {
      id: profile.id,
      email: authUser?.email ?? null,
      fullName: profile.full_name,
      role: profile.role,
      isBlocked: profile.is_blocked,
      verificationStatus: profile.verification_status,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      createdAt: profile.created_at,
    };
  });

  return NextResponse.json({ users: rows });
}
```

- [ ] **Step 2: Écrire le test du Route Handler (refuse l'accès non-admin, fusionne profils + auth.users)**

Crée `apps/admin/src/app/api/users/route.test.ts` :

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();
const profileSingleMock = vi.fn();
const listUsersMock = vi.fn();
const profilesSelectMock = vi.fn();

vi.mock('@/lib/supabase/server-client', () => ({
  createSupabaseServerClient: () =>
    Promise.resolve({
      auth: { getUser: getUserMock },
      from: () => ({
        select: () => ({ eq: () => ({ single: profileSingleMock }) }),
      }),
    }),
}));

vi.mock('@/lib/supabase/admin-client', () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({ order: profilesSelectMock }),
    }),
    auth: { admin: { listUsers: listUsersMock } },
  }),
}));

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when the requester is not an admin', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'student-1' } } });
    profileSingleMock.mockResolvedValue({ data: { role: 'student' } });

    const { GET } = await import('./route');
    const response = await GET();

    expect(response.status).toBe(403);
  });

  it('merges profiles with auth.users email and last_sign_in_at for admins', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    profileSingleMock.mockResolvedValue({ data: { role: 'admin' } });
    profilesSelectMock.mockResolvedValue({
      data: [
        {
          id: 'student-1',
          full_name: 'Aminata D.',
          role: 'student',
          is_blocked: false,
          verification_status: 'approved',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
    });
    listUsersMock.mockResolvedValue({
      data: {
        users: [
          {
            id: 'student-1',
            email: 'aminata@example.com',
            last_sign_in_at: '2026-02-01T00:00:00Z',
          },
        ],
      },
      error: null,
    });

    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.users).toEqual([
      {
        id: 'student-1',
        email: 'aminata@example.com',
        fullName: 'Aminata D.',
        role: 'student',
        isBlocked: false,
        verificationStatus: 'approved',
        lastSignInAt: '2026-02-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
  });
});
```

- [ ] **Step 3: Lancer le test**

Run: `cd apps/admin && pnpm vitest run src/app/api/users/route.test.ts`
Expected: `2 passed`.

- [ ] **Step 4: Créer le service côté client (appelle le Route Handler + écritures RLS standard)**

Crée `apps/admin/src/features/users/services/users.service.ts` :

```ts
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { AdminUserRow } from '@/app/api/users/route';

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const response = await fetch('/api/users');
  const body = (await response.json()) as { users?: AdminUserRow[]; error?: string };
  if (!response.ok || !body.users) {
    throw new Error(body.error ?? 'Impossible de charger la liste des utilisateurs.');
  }
  return body.users;
}

/**
 * Mise à jour de `profiles.is_blocked` — couverte par la policy RLS
 * `profiles_update_self_or_admin` + le trigger `protect_profile_privileged_fields`
 * (qui autorise justement les admins à modifier ce champ). Pas besoin de
 * service-role : le client RLS standard suffit (cf. `admin-client.ts`).
 */
export async function setUserBlocked(userId: string, isBlocked: boolean): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: isBlocked })
    .eq('id', userId);
  if (error) throw error;
}
```

- [ ] **Step 5: Créer les hooks**

Crée `apps/admin/src/features/users/hooks/use-users.ts` :

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchAdminUsers, setUserBlocked } from '../services/users.service';

export function useAdminUsers() {
  return useQuery({ queryKey: ['users'], queryFn: fetchAdminUsers });
}

export function useSetUserBlocked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) =>
      setUserBlocked(userId, isBlocked),
    onSuccess: (_data, variables) => {
      toast.success(variables.isBlocked ? 'Compte bloqué.' : 'Compte débloqué.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

- [ ] **Step 6: Définir les colonnes**

Crée `apps/admin/src/features/users/components/users-columns.tsx` :

```tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { VERIFICATION_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminUserRow } from '@/app/api/users/route';
import { useSetUserBlocked } from '../hooks/use-users';

export const usersColumns: ColumnDef<AdminUserRow>[] = [
  { accessorKey: 'fullName', header: 'Nom' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => (
      <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: 'verificationStatus',
    header: 'Vérification',
    cell: ({ row }) =>
      VERIFICATION_STATUS_LABELS[row.original.verificationStatus] ??
      row.original.verificationStatus,
  },
  {
    accessorKey: 'lastSignInAt',
    header: 'Dernière connexion',
    cell: ({ row }) =>
      row.original.lastSignInAt
        ? new Date(row.original.lastSignInAt).toLocaleString('fr-FR')
        : 'Jamais',
  },
  {
    id: 'blockToggle',
    header: 'Statut du compte',
    cell: ({ row }) => <BlockToggleButton user={row.original} />,
  },
];

function BlockToggleButton({ user }: { user: AdminUserRow }) {
  const mutation = useSetUserBlocked();
  return (
    <Button
      variant={user.isBlocked ? 'destructive' : 'outline'}
      size="sm"
      onClick={() => mutation.mutate({ userId: user.id, isBlocked: !user.isBlocked })}
      disabled={mutation.isPending || user.role === 'admin'}
    >
      {user.isBlocked ? 'Débloquer' : 'Bloquer'}
    </Button>
  );
}
```

- [ ] **Step 7: Créer la page**

Crée `apps/admin/src/app/(dashboard)/users/page.tsx` :

```tsx
'use client';

import { DataTable } from '@/shared/components/data-table';
import { useAdminUsers } from '@/features/users/hooks/use-users';
import { usersColumns } from '@/features/users/components/users-columns';

export default function UsersPage() {
  const { data = [], isLoading } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground">
          Liste des comptes (email et dernière connexion via `auth.users`, lus côté serveur avec la
          clé service-role — seule exception RLS documentée pour cette fonctionnalité).
        </p>
      </div>
      <DataTable
        columns={usersColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun utilisateur enregistré."
      />
    </div>
  );
}
```

- [ ] **Step 8: Vérifier visuellement**

Run: `cd apps/admin && pnpm dev`
Expected: `/dashboard/users` liste tous les comptes (au moins le compte admin de test et tout étudiant créé en test), avec email et date de dernière connexion correctement résolus depuis `auth.users`. Le bouton "Bloquer" est désactivé sur les comptes `role = 'admin'` (protection contre l'auto-blocage accidentel) et fonctionnel sur les comptes étudiants — cliquer dessus bascule `is_blocked` et le badge correspondant. Arrête le serveur.

- [ ] **Step 9: Commit**

```bash
git add apps/admin/src/app/api/users apps/admin/src/features/users apps/admin/src/app/\(dashboard\)/users
git commit -m "feat(admin): ajouter la gestion des utilisateurs (liste fusionnée auth.users/profiles, blocage)"
```

---

### Task 18: Configuration des tests (Vitest + React Testing Library) et exécution complète de la suite

**Files:**

- Create: `apps/admin/vitest.config.ts`
- Create: `apps/admin/vitest.setup.ts`
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/tsconfig.json`

> **Choix d'outillage :** Vitest + React Testing Library pour les unités (services, hooks de mapping, colonnes de table, Route Handlers) — rapide, cohabite naturellement avec l'écosystème Vite/ESM utilisé par les autres tests du monorepo (`supabase/tests` utilise déjà `tsx`/Vitest-compatible). On NE configure PAS Playwright dans ce plan : les flux critiques (connexion, validation d'annonce, vérification étudiante) sont déjà couverts par les étapes de "vérification visuelle manuelle" de chaque tâche, et ajouter un second runner e2e serait une couche d'outillage supplémentaire sans besoin métier prouvé à ce stade (cf. "le meilleur code est souvent le code qui n'existe pas" — `docs/philosophie-developpement.md`). Si l'équipe constate des régressions répétées sur ces flux, ajouter Playwright reste une extension simple sans réécriture.

- [ ] **Step 1: Installer les dépendances de test**

Run (depuis `apps/admin`) :

```bash
cd apps/admin
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: les paquets apparaissent dans `devDependencies`.

- [ ] **Step 2: Créer la configuration Vitest**

Crée `apps/admin/vitest.config.ts` :

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dakareaseu/types': path.resolve(__dirname, '../../packages/types/src'),
      '@dakareaseu/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
```

- [ ] **Step 3: Créer le fichier de setup**

Crée `apps/admin/vitest.setup.ts` :

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Ajouter les scripts de test à `package.json`**

Lis `apps/admin/package.json`, puis ajoute dans `scripts` (à côté de `dev`/`build`/`start`/`lint`) :

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 5: Inclure les fichiers de test dans `tsconfig.json`**

Lis `apps/admin/tsconfig.json`. Si la section `include` ne couvre pas déjà `**/*.test.ts(x)` (généralement `**/*.ts` et `**/*.tsx` couvrent déjà tout), aucune modification n'est nécessaire — `create-next-app` génère un `include` suffisamment large. Vérifie en lançant le typecheck (Step 7) : s'il échoue avec des erreurs "Cannot find module" sur les fichiers de test, ajoute `"vitest.setup.ts"` à la liste `include`.

- [ ] **Step 6: Lancer la suite complète de tests**

Run: `cd apps/admin && pnpm test`
Expected: tous les fichiers `*.test.ts`/`*.test.tsx` créés dans les tâches précédentes (`overview.service.test.ts`, `listings-columns.test.tsx`, `verifications.service.test.ts`, `route.test.ts`) passent — `Test Files  4 passed`, `Tests  7 passed` (1 + 1 + 2 + 2... vérifie le total exact affiché et assure-toi qu'il n'y a aucun `failed`/`skipped` inattendu).

- [ ] **Step 7: Lancer le typecheck complet**

Run: `cd apps/admin && pnpm exec tsc --noEmit`
Expected: aucune erreur (sortie vide, code de sortie 0).

- [ ] **Step 8: Lancer le lint**

Run: `cd apps/admin && pnpm lint`
Expected: `✔ No ESLint warnings or errors`.

- [ ] **Step 9: Commit**

```bash
git add apps/admin/vitest.config.ts apps/admin/vitest.setup.ts apps/admin/package.json apps/admin/pnpm-lock.yaml apps/admin/tsconfig.json
git commit -m "test(admin): configurer Vitest + React Testing Library et valider la suite complète"
```

---

### Task 19: Déploiement Vercel — `next.config`, vérification de non-fuite de la clé service-role, build de production

**Files:**

- Modify: `apps/admin/next.config.mjs`
- Create: `apps/admin/.env.example` (à la racine de `apps/admin`, distinct de `.env.local.example` créé en Task 0 — celui-ci documente toutes les variables pour Vercel/CI)

- [ ] **Step 1: Configurer `next.config.mjs` (domaines d'images Supabase Storage + mode strict)**

Lis `apps/admin/next.config.mjs`, puis remplace son contenu par :

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
```

> Note : les composants `<Image>` de ce projet utilisent `unoptimized` (cf. `listing-media-manager.tsx` et autres) car les URLs publiques/signées Supabase sont déjà servies depuis un CDN — `remotePatterns` reste utile si l'optimisation est activée plus tard, et documente explicitement les origines autorisées.

- [ ] **Step 2: Documenter les variables d'environnement de déploiement**

Crée `apps/admin/.env.example` :

```bash
# ============================================================================
# Variables d'environnement — apps/admin (déploiement Vercel)
#
# Le provisioning du projet Vercel lui-même (lien au repo, déploiements preview/
# prod) est documenté dans le plan infra (`2026-06-07-infra-cicd.md`) et
# `SETUP.md`. Cette liste assure que apps/admin est structuré pour déployer
# proprement : variables nécessaires, et lesquelles sont exposées au navigateur.
# ============================================================================

# --- Exposées au navigateur (préfixe NEXT_PUBLIC_ obligatoire et volontaire) ---
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# --- Serveur uniquement (Vercel : "Environment Variables" sans case "Expose to Browser") ---
# Utilisée exclusivement dans apps/admin/src/lib/supabase/admin-client.ts, depuis
# des Route Handlers (apps/admin/src/app/api/**/route.ts). JAMAIS référencée
# depuis un fichier 'use client', jamais préfixée NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 3: Vérifier qu'aucun fichier client ne référence la clé service-role**

Run (PowerShell, depuis la racine du repo) :

```powershell
Get-ChildItem -Path "apps\admin\src" -Recurse -Include *.ts,*.tsx |
  Select-String -Pattern "SUPABASE_SERVICE_ROLE_KEY" |
  Where-Object { $_.Path -notmatch "admin-client\.ts$" -and $_.Path -notmatch "\.test\.(ts|tsx)$" }
```

Expected: **aucune sortie**. Toute ligne affichée signale une fuite potentielle de la clé service-role hors de `admin-client.ts` — corrige immédiatement en remplaçant la référence par `createSupabaseAdminClient()` (qui encapsule la lecture de la variable) ou par le client RLS standard si l'opération ne nécessite pas service-role.

Run (vérifie également qu'aucun composant `'use client'` n'importe `admin-client`) :

```powershell
$clientFiles = Get-ChildItem -Path "apps\admin\src" -Recurse -Include *.tsx,*.ts |
  Select-String -Pattern "^'use client'" -List | Select-Object -ExpandProperty Path
foreach ($file in $clientFiles) {
  Select-String -Path $file -Pattern "lib/supabase/admin-client" | ForEach-Object { Write-Output "FUITE POTENTIELLE: $($_.Path)" }
}
```

Expected: aucune ligne `FUITE POTENTIELLE`.

- [ ] **Step 4: Build de production complet**

Run: `cd apps/admin && pnpm build`
Expected: `Compiled successfully`, et la sortie liste les routes générées (`○ /dashboard`, `ƒ /api/users`, `ƒ /api/student-id-signed-url`, etc. — `○` = statique, `ƒ` = dynamique/Server). Aucune route ne doit afficher d'avertissement lié à `SUPABASE_SERVICE_ROLE_KEY` manquante au build (elle n'est utilisée qu'au runtime, dans des Route Handlers).

- [ ] **Step 5: Démarrer le serveur de production localement (sanity check final)**

Run: `cd apps/admin && pnpm start`
Expected: le serveur démarre sur `http://localhost:3000`, `/login` est accessible, la connexion admin fonctionne, `/dashboard` affiche les KPIs réels. Arrête le serveur (`Ctrl+C`).

- [ ] **Step 6: Commit**

```bash
git add apps/admin/next.config.mjs apps/admin/.env.example
git commit -m "chore(admin): finaliser la configuration de déploiement (next.config images, vérification anti-fuite service-role)"
```

---

## Definition of Done

Reprend les critères de prompt.md §13 pertinents pour `apps/admin` :

- [ ] CRUD complet et opérationnel sur **toutes** les entités du §10 : annonces (logements + médias + colocation + écoles à proximité + workflow de validation), écoles, restaurants (+ médias), transport, événements (+ image de couverture + RSVP), vérification étudiante (approbation/rejet + visualisation document signé + blocage), réservations (filtres + transitions de statut), demandes de recherche guidée (filtres + statuts + matchs RPC), modération des avis (visualisation + suppression), utilisateurs (liste + blocage).
- [ ] Accès strictement réservé aux comptes `profiles.role = 'admin'` : middleware + garde de layout serveur redirigent tout utilisateur non-admin (non connecté OU `role = 'student'`) vers `/login`, avec déconnexion automatique en cas de tentative.
- [ ] Realtime fonctionnel et ciblé sur le seul cas pertinent côté admin (cf. §4.5/§8) : alerte toast + invalidation de cache sur `new_guided_search_request`, scopée aux notifications du destinataire courant (`filter: user_id=eq.<currentUserId>`, conforme à la policy RLS `notifications_select_self`).
- [ ] Médias uploadables et consultables : photos/vidéos/visites 3D vers `listings-media`, photos vers `restaurants-media`, images de couverture vers `schools-media` et `events-media` (tous publics) ; documents d'identité étudiante consultés via URL signée à durée de vie courte depuis le bucket privé `student-ids` (jamais d'URL publique générée pour ce bucket).
- [ ] Aucune logique de sécurité reposant uniquement sur le frontend : toutes les écritures passent par le client RLS standard (policies `public.is_admin()`), le client service-role est confiné aux deux exceptions documentées (`auth.users` pour la liste utilisateurs, opérations Auth admin), jamais importé depuis un composant `'use client'`, jamais exposé au navigateur (`SUPABASE_SERVICE_ROLE_KEY` non préfixée `NEXT_PUBLIC_`, vérifié par grep en Task 19).
- [ ] Tous les formulaires validés via React Hook Form + Zod (schémas dans `features/*/schemas/` et `packages/shared/src/schemas/`), toutes les données serveur passent par TanStack Query (zéro `useEffect` de fetch), Zustand n'est pas utilisé pour des données serveur (ce plan n'introduit d'ailleurs aucun store Zustand — l'état serveur suffit, conformément à "le meilleur code est souvent le code qui n'existe pas").
- [ ] TypeScript strict, zéro erreur de typecheck (`tsc --noEmit`), lint propre (`pnpm lint`), sur `apps/admin`.
- [ ] Suite de tests verte (`pnpm test` — Vitest + React Testing Library) couvrant au minimum : un service de mapping de données (`overview.service`), des colonnes de table (`listings-columns`), un service avec appel réseau mocké (`verifications.service`), et un Route Handler avec contrôle de rôle (`/api/users`).
- [ ] Build de production (`pnpm build`) et démarrage (`pnpm start`) réussis localement ; `next.config.mjs` autorise les origines d'images Supabase Storage nécessaires.
- [ ] Aucune trace de "Dakar'ease", "bailleur"/"agence"/"propriétaire" dans l'UI admin (le champ interne `listings.created_by` peut être manipulé en base mais n'est exposé dans aucun libellé utilisateur de ce dashboard) ; l'écran `AdminDashboard` du prototype mobile n'a pas été recréé tel quel — entièrement réécrit selon la philosophie du projet (feature-based, TanStack Query, Zod) et son périmètre fonctionnel est intégralement couvert ici.
- [ ] `apps/admin/.env.example` documente les 3 variables nécessaires et distingue clairement celles exposées au navigateur de celle réservée au serveur ; `.env.local.example` permet à un nouvel engineer de démarrer en local sans deviner les noms de variables.

---

Plan complet et enregistré dans `docs/superpowers/plans/2026-06-07-admin-dashboard.md`.
