# Infra & CI/CD DakarEaseU — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser le squelette d'infrastructure complet de DakarEaseU : monorepo npm workspaces (`apps/*`, `packages/*`, `supabase/`), scaffolding minimal de `packages/shared`, fichiers `.env`/`.env.example` cohérents avec le socle Supabase, `Dockerfile` + `.dockerignore`, pipelines GitHub Actions (CI lint/typecheck/test/build + CD Vercel/EAS), configuration Vercel (`apps/admin`) et EAS (`apps/mobile`), et — livrable central — un `SETUP.md` à la racine qui sert de runbook complet pour que le porteur de projet provisionne lui-même tous les comptes/services externes (GitHub, Supabase, Vercel, Expo/EAS, Google Cloud) pendant que le code est généré en parallèle.

**Architecture:** Monorepo **npm workspaces** (pas de Turborepo/Nx — cf. prompt.md §12) avec trois couches : `apps/{mobile,admin}` (les deux frontends, qui parlent directement à Supabase), `packages/{shared,types}` (code et types partagés, source de vérité unique), `supabase/` (schéma, migrations, seed — peuplé par le plan socle). Ce plan pose le squelette et les fichiers de configuration **autour** de ce que les plans `supabase-foundation`, `mobile-app` et `admin-dashboard` remplissent ; il ne réécrit jamais leur contenu. Aucun backend custom à déployer — seuls les deux frontends (Vercel pour l'admin, EAS pour le mobile) et la configuration Supabase ont un cycle de déploiement.

**Tech Stack:** npm workspaces, Node.js 20.x, TypeScript, ESLint + Prettier, Docker (multi-stage `node:20-alpine`), GitHub Actions (`actions/checkout`, `actions/setup-node`, `amondnet/vercel-action`, `expo/expo-github-action`), Vercel, Expo Application Services (EAS).

---

## Avant de commencer — séquencement avec les plans frères

Ce plan est l'un de quatre plans frères écrits en parallèle (socle Supabase déjà écrit, mobile et admin en cours d'écriture par d'autres agents). Pour éviter les conflits :

- **`packages/types`** est entièrement créé et peuplé par `2026-06-07-supabase-foundation.md` (Task 11 : `package.json`, `tsconfig.json`, `src/database.types.ts` généré, `src/index.ts`). **Ce plan ne touche PAS à `packages/types`** — il se contente de référencer son existence dans la racine workspaces et de vérifier qu'il est bien résolu par `npm ls --workspaces` une fois que le plan socle l'aura posé (ou, si ce plan s'exécute en premier, de poser un stub minimal pour que le workspace résolve — voir Task 2).
- **`supabase/`** (config, migrations, seed, tests) est entièrement créé et peuplé par le plan socle. Ce plan se contente de s'assurer que le dossier existe (vide ou peuplé) pour que les workspaces et `.gitignore` le référencent correctement, et que `.env`/`.env.example` sont cohérents avec les variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` qu'il documente dans sa section "Avant de commencer".
- **`apps/mobile`** et **`apps/admin`** : ce plan pose uniquement les fichiers de **configuration d'infrastructure** qui leur appartiennent (`eas.json`, `app.json` essentiels côté mobile ; `vercel.json` ou note d'auto-détection côté admin). Il ne crée PAS le code applicatif (écrans, features, composants) — cela relève des plans `mobile-app` et `admin-dashboard`. Si ces dossiers n'existent pas encore au moment où ce plan s'exécute, les tâches ci-dessous créent les répertoires et les fichiers de config minimaux nécessaires ; les plans frères les compléteront sans écraser ces fichiers (ils étendent `package.json`, ajoutent du code, etc. — à coordonner si collision : ce plan documente explicitement qui possède quoi, voir Task 1).
- **Discrepancy notée** : `docs/philosophie-developpement.md` liste `packages/{shared, ui, types}` alors que `prompt.md` §11 dit explicitement de **ne pas créer `packages/ui`** sauf besoin réel avéré (rendu RN vs DOM trop différent). **`prompt.md` fait foi** (le prompt le dit lui-même : "Lis ces deux documents... Ils priment sur tes habitudes par défaut" mais en cas de contradiction entre eux, prompt.md est le document maître donné en §0). Ce plan ne crée donc **pas** `packages/ui`.

---

### Task 1: Poser le squelette du monorepo (répertoires + `package.json` racine + workspaces)

**Files:**
- Create: `package.json` (racine — actuellement vide)
- Create: `apps/mobile/.gitkeep` (placeholder si le dossier n'existe pas encore)
- Create: `apps/admin/.gitkeep` (placeholder si le dossier n'existe pas encore)
- Create: `packages/shared/.gitkeep` (supprimé à l'étape suivante par le vrai contenu)
- Create: `supabase/.gitkeep` (placeholder si le dossier n'existe pas encore — supprimé par le plan socle dès qu'il y pose du contenu réel)

- [ ] **Step 1: Vérifier l'état actuel des répertoires**

Run: `Get-ChildItem -Directory apps, packages, supabase -ErrorAction SilentlyContinue | Select-Object FullName`
Expected: liste les sous-dossiers existants (probablement aucun pour `apps/*` et `packages/*` à ce stade, `supabase/` peut déjà exister si le plan socle est passé en premier). Note le résultat — il détermine si tu dois créer les dossiers ou seulement vérifier leur présence.

- [ ] **Step 2: Créer les répertoires manquants avec un `.gitkeep`**

Run (PowerShell — adapte si certains dossiers existent déjà, ignore les erreurs "already exists") :
```powershell
foreach ($dir in @('apps/mobile', 'apps/admin', 'packages/shared', 'supabase')) {
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  $keep = Join-Path $dir '.gitkeep'
  if (-not (Test-Path $keep) -and (Get-ChildItem $dir -Force | Measure-Object).Count -eq 0) {
    New-Item -ItemType File $keep | Out-Null
  }
}
```
Expected: aucune erreur ; `Get-ChildItem -Directory apps, packages` montre désormais `apps/mobile`, `apps/admin`, `packages/shared` (et `packages/types` apparaîtra une fois le plan socle exécuté).

- [ ] **Step 3: Écrire le `package.json` racine**

Remplace le contenu (vide) de `package.json` par :

```json
{
  "name": "dakareaseu",
  "version": "0.1.0",
  "private": true,
  "description": "DakarEaseU — super-app étudiante pour Dakar (mobile Expo + dashboard admin Next.js + backend Supabase)",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,css}\" --ignore-path .gitignore",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,css}\" --ignore-path .gitignore"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.3.3",
    "typescript": "^5.5.0"
  }
}
```

> Pourquoi **npm workspaces** plutôt que pnpm : le plan socle (`2026-06-07-supabase-foundation.md`, déjà écrit et faisant référence) utilise systématiquement `npm install`/`npm run` (ex. `supabase/tests/package.json`, ses étapes `cd supabase/tests && npm install`). npm est livré avec Node.js (zéro outil supplémentaire à installer pour le porteur de projet), supporte nativement les workspaces, et est largement suffisant pour un monorepo à 2 apps + 2 packages sans Turborepo/Nx (cf. prompt.md §12 : "au choix le plus simple à mettre en place"). Rester cohérent avec le plan socle évite toute confusion `npm ci` vs `pnpm install` dans la CI.

- [ ] **Step 4: Vérifier que le JSON est valide**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf-8')); console.log('package.json racine valide')"`
Expected: `package.json racine valide`

- [ ] **Step 5: Commit**

```bash
git add package.json apps packages supabase
git commit -m "chore(infra): poser le squelette du monorepo npm workspaces (apps, packages, supabase)"
```

---

### Task 2: Configuration TypeScript, ESLint et Prettier racine

**Files:**
- Create: `tsconfig.base.json`
- Create: `.eslintrc.json`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 1: Écrire `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": false,
    "noEmit": true
  },
  "exclude": ["node_modules", "dist", "build", ".next", ".expo"]
}
```

Chaque package/app référence ce fichier via `"extends": "../../tsconfig.base.json"` dans son propre `tsconfig.json` (les plans `mobile-app` et `admin-dashboard` créent ces fichiers avec leurs propres `compilerOptions` spécifiques — JSX, types RN/Next — qui étendent celui-ci).

- [ ] **Step 2: Écrire `.eslintrc.json`**

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": false
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "env": {
    "es2022": true,
    "node": true
  },
  "ignorePatterns": [
    "node_modules",
    "dist",
    "build",
    ".next",
    ".expo",
    "coverage",
    "**/*.config.js",
    "supabase/.branches",
    "supabase/.temp"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

Les apps (`apps/mobile`, `apps/admin`) étendent ce fichier racine avec leurs propres règles (plugins React/React Native/Next — posés par leurs plans respectifs) via `"extends": ["../../.eslintrc.json", ...]`.

- [ ] **Step 3: Écrire `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 4: Écrire `.prettierignore`**

```text
node_modules
dist
build
.next
.expo
.expo-shared
coverage
package-lock.json
pnpm-lock.yaml
supabase/.branches
supabase/.temp
packages/types/src/database.types.ts
```

(Le fichier `database.types.ts` est généré automatiquement par `supabase gen types typescript` — on ne le reformate pas pour éviter des diffs de commit inutiles à chaque régénération.)

- [ ] **Step 5: Vérifier que les fichiers JSON sont valides**

Run: `node -e "for (const f of ['tsconfig.base.json', '.eslintrc.json', '.prettierrc.json']) { JSON.parse(require('fs').readFileSync(f, 'utf-8')); console.log(f, 'valide'); }"`
Expected:
```
tsconfig.base.json valide
.eslintrc.json valide
.prettierrc.json valide
```

- [ ] **Step 6: Commit**

```bash
git add tsconfig.base.json .eslintrc.json .prettierrc.json .prettierignore
git commit -m "chore(infra): ajouter la configuration TypeScript/ESLint/Prettier partagée"
```

---

### Task 3: Réécrire le `.gitignore` racine (le fichier existant est un brouillon entièrement commenté)

**Files:**
- Modify: `.gitignore` (actuellement constitué de lignes commentées sans effet — `# prompt.md`, `# docs/`, etc., aucune ne s'applique réellement)

- [ ] **Step 1: Constater le problème**

Run: `Get-Content .gitignore`
Expected: affiche des lignes toutes préfixées par `#` (donc inertes en tant que règles `.gitignore` — actuellement RIEN n'est ignoré, ce qui est dangereux pour `.env` et `node_modules`). Ce fichier doit être entièrement remplacé.

- [ ] **Step 2: Réécrire le contenu complet**

Remplace tout le contenu de `.gitignore` par :

```gitignore
# ============================================================================
# Dépendances
# ============================================================================
node_modules/
.pnpm-store/

# ============================================================================
# Variables d'environnement — NE JAMAIS COMMITTER DE VRAIS SECRETS
# ============================================================================
.env
.env.local
.env.*.local
apps/mobile/.env
apps/admin/.env
apps/admin/.env.local

# ============================================================================
# Builds & sorties de compilation
# ============================================================================
dist/
build/
out/
.next/
.turbo/
coverage/
*.tsbuildinfo

# ============================================================================
# Expo / React Native (apps/mobile)
# ============================================================================
.expo/
.expo-shared/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
android/
ios/

# ============================================================================
# Supabase CLI (état local Docker, branches, fichiers temporaires)
# ============================================================================
supabase/.branches
supabase/.temp
supabase/.env

# ============================================================================
# Éditeurs / OS
# ============================================================================
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
Thumbs.db

# ============================================================================
# Logs
# ============================================================================
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# ============================================================================
# Claude Code / outils IA locaux (préférences de session, jamais partagés)
# ============================================================================
.claude/settings.local.json
```

- [ ] **Step 3: Vérifier que `.env` est désormais ignoré**

Run: `git check-ignore -v .env`
Expected: affiche une ligne du type `.gitignore:13:.env	.env` confirmant que `.env` est bien filtré par la règle du `.gitignore`.

- [ ] **Step 4: Vérifier qu'aucun fichier sensible n'est déjà suivi par erreur**

Run: `git ls-files | Select-String -Pattern '\.env$|node_modules'`
Expected: aucune sortie (vide) — confirme qu'aucun `.env` ni `node_modules` n'a été commité par accident dans l'historique actuel.

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore(infra): remplacer le .gitignore inerte par une version complète (env, builds, Expo, Supabase CLI)"
```

---

### Task 4: Scaffold `packages/shared` — constantes transverses et schémas Zod de base

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/schemas.ts`
- Create: `packages/shared/src/index.ts`
- Delete: `packages/shared/.gitkeep` (remplacé par du contenu réel)

> Périmètre volontairement minimal (YAGNI, cf. `docs/philosophie-developpement.md` — "le meilleur code est souvent le code qui n'existe pas") : seulement les constantes et schémas dont on est **certain** qu'ils seront partagés entre `apps/mobile` et `apps/admin` d'après le prompt (districts, catégories de transport/listing, statuts d'entités, validation de formulaires communs). Les plans `mobile-app` et `admin-dashboard` étendent ces schémas avec leurs champs spécifiques (ex. `.extend({...})`) plutôt que de redéfinir les bases.

- [ ] **Step 1: Écrire `packages/shared/package.json`**

```json
{
  "name": "@dakareaseu/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Écrire `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "noEmit": false
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Écrire `packages/shared/src/constants.ts`**

Valeurs reprises telles quelles de `design/dakar-ease/project/data.jsx` (`DISTRICTS`, `CATEGORIES`, `TRANSPORT_CATS`), traduites en TypeScript avec des `as const` pour des types littéraux exploitables par Zod et les deux apps :

```ts
/**
 * Constantes métier transverses, partagées entre `apps/mobile` et `apps/admin`.
 * Source : design/dakar-ease/project/data.jsx (DISTRICTS, CATEGORIES, TRANSPORT_CATS),
 * recopiées telles quelles — c'est la référence produit pour le MVP.
 *
 * Règle YAGNI : n'ajoute une constante ici que si DEUX apps en ont réellement besoin.
 * Les listes spécifiques à une app restent dans cette app.
 */

/** Quartiers de Dakar couverts par le moteur de recherche (logements/restaurants). */
export const DISTRICTS = [
  'Almadies',
  'Fann',
  'Mermoz',
  'Sacré-Cœur',
  'Ouakam',
  'Point E',
] as const;

export type District = (typeof DISTRICTS)[number];

/** Catégories de la page d'accueil / navigation principale. */
export const CATEGORIES = [
  { id: 'logements', label: 'Logements', icon: '🏠' },
  { id: 'ecoles', label: 'Écoles', icon: '🎓' },
  { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { id: 'transport', label: 'Transport', icon: '🚖' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

/** Catégories de prestataires de transport/livraison (annuaire `transport_providers`). */
export const TRANSPORT_CATS = [
  { id: 'taxi', label: 'Taxi / VTC', icon: '🚖' },
  { id: 'moto', label: 'Moto Jakarta', icon: '🏍️' },
  { id: 'repas', label: 'Livraison repas', icon: '🍱' },
  { id: 'colis', label: 'Livraison colis', icon: '📦' },
  { id: 'demenagement', label: 'Déménagement', icon: '🚚' },
  { id: 'location', label: 'Location voiture', icon: '🚗' },
] as const;

export type TransportCategoryId = (typeof TRANSPORT_CATS)[number]['id'];

/**
 * Types de logement — DOIT rester synchronisé avec l'enum SQL `listing_type`
 * défini dans `supabase/migrations/<timestamp>_extensions_enums_helpers.sql`
 * (cf. plan socle : 'studio' | 'chambre' | 'appartement' | 'maison').
 * Dupliqué ici (et non importé depuis packages/types) car packages/shared ne doit
 * pas dépendre de packages/types — ce sont deux sources de vérité différentes
 * (l'une dérivée du schéma SQL, l'autre des constantes produit). En cas de
 * désaccord, l'enum SQL fait foi : mets à jour cette liste pour qu'elle corresponde.
 */
export const LISTING_TYPES = ['studio', 'chambre', 'appartement', 'maison'] as const;
export type ListingTypeValue = (typeof LISTING_TYPES)[number];

/** Palette "Confiance" — identité visuelle unique du produit (cf. prompt.md §3, COLORS dans data.jsx). */
export const COLORS = {
  primary: '#1E3A8A',
  primaryLight: '#3B5FC7',
  secondary: '#10B981',
  accent: '#F59E0B',
  bg: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textLight: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
} as const;
```

- [ ] **Step 4: Écrire `packages/shared/src/schemas.ts`**

```ts
import { z } from 'zod';

import { DISTRICTS, LISTING_TYPES } from './constants';

/**
 * Schémas Zod transverses — base commune réutilisée et étendue par
 * `apps/mobile` (React Hook Form + Zod) et `apps/admin` (formulaires CRUD).
 *
 * Règle : un schéma ne vit ici QUE s'il est validé à l'identique des deux côtés.
 * Les schémas spécifiques à un flux (ex. formulaire de réservation mobile,
 * formulaire de création d'annonce admin) restent dans `features/<x>/schemas/`
 * de leur app respective et étendent ceux-ci avec `.extend({...})`.
 */

/** Quartier — doit appartenir à la liste DISTRICTS connue du produit. */
export const districtSchema = z.enum(DISTRICTS);

/** Type de logement — doit correspondre à l'enum SQL `listing_type`. */
export const listingTypeSchema = z.enum(LISTING_TYPES);

/**
 * Critères de recherche guidée (`guided_search_requests`), formulaire multi-étapes
 * mobile ET vue "Demandes" côté admin (lecture seule des mêmes champs).
 * `housing_type`/`furnished_pref`/`coloc_pref` utilisent 'any' comme valeur
 * "pas de préférence", cohérent avec les colonnes par défaut de la migration socle.
 */
export const guidedSearchCriteriaSchema = z.object({
  housingType: z.union([listingTypeSchema, z.literal('any'), z.literal('coloc')]).default('any'),
  schoolId: z.string().uuid().nullable().optional(),
  district: districtSchema.optional(),
  budget: z.number().int().positive('Le budget doit être un nombre positif'),
  furnishedPref: z.enum(['any', 'yes', 'no']).default('any'),
  colocPref: z.enum(['any', 'yes', 'no']).default('any'),
  durationMonths: z.number().int().min(1, 'La durée minimale est de 1 mois').default(3),
});

export type GuidedSearchCriteria = z.infer<typeof guidedSearchCriteriaSchema>;

/**
 * Avis (review) — note 1 à 5 + commentaire optionnel. Identique mobile (formulaire
 * de dépôt d'avis) et admin (modération : affichage + éventuelle édition).
 */
export const reviewInputSchema = z.object({
  rating: z.number().int().min(1, 'Note minimale : 1').max(5, 'Note maximale : 5'),
  comment: z.string().trim().max(2000, 'Commentaire trop long (2000 caractères max)').optional(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

/**
 * Méthode de paiement simulée (cf. prompt.md §4.3 — paiement Wave/Orange Money/Carte
 * simulé pour le MVP). DOIT rester synchronisé avec l'enum SQL `payment_method`.
 */
export const paymentMethodSchema = z.enum(['wave', 'orange_money', 'card']);
export type PaymentMethodValue = z.infer<typeof paymentMethodSchema>;
```

- [ ] **Step 5: Écrire `packages/shared/src/index.ts`**

```ts
export * from './constants';
export * from './schemas';
```

- [ ] **Step 6: Supprimer le `.gitkeep` devenu inutile**

Run: `Remove-Item packages/shared/.gitkeep -ErrorAction SilentlyContinue`
Expected: aucune sortie (le fichier est supprimé silencieusement, ou n'existait déjà plus).

- [ ] **Step 7: Installer les dépendances et vérifier la compilation**

Run (depuis la racine du repo) :
```bash
npm install
cd packages/shared && npx tsc --noEmit && cd ../..
```
Expected: `npm install` se termine sans erreur (crée `node_modules/` et `package-lock.json` à la racine, lie `@dakareaseu/shared` en symlink dans `node_modules/@dakareaseu/`) ; `npx tsc --noEmit` ne produit aucune sortie (0 erreur de type).

- [ ] **Step 8: Commit**

```bash
git add packages/shared package-lock.json
git commit -m "feat(shared): scaffold packages/shared (constantes transverses + schémas Zod de base)"
```

---

### Task 5: Écrire `.env.example` (racine) — référence complète de toutes les variables

**Files:**
- Create: `.env.example`

> Cette tâche écrit la liste **exhaustive et commentée** des variables nécessaires à travers `supabase/`, `apps/mobile`, `apps/admin`. Elle est strictement cohérente avec la section "Avant de commencer" du plan socle (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`) — ne duplique pas ses explications, les complète avec les variables `EXPO_PUBLIC_*`/`NEXT_PUBLIC_*` consommées par les deux frontends.

- [ ] **Step 1: Écrire le contenu complet de `.env.example`**

```bash
# ============================================================================
# DakarEaseU — Variables d'environnement (RÉFÉRENCE)
#
# Copie ce fichier en `.env` à la racine et remplace les valeurs `<...>` par
# les vraies valeurs récupérées en suivant le runbook `SETUP.md` (racine du repo).
#
# ⚠️  RÈGLE D'OR : tout ce qui finit par "_KEY" sans préfixe NEXT_PUBLIC_/EXPO_PUBLIC_
#     est un SECRET SERVEUR — ne JAMAIS le committer, ne JAMAIS le préfixer
#     NEXT_PUBLIC_/EXPO_PUBLIC_ (ces préfixes rendent la variable visible dans le
#     bundle JS livré au navigateur/téléphone — donc PUBLIQUE de fait).
# ============================================================================


# ----------------------------------------------------------------------------
# SUPABASE — backend unique du projet (cf. SETUP.md §2 et le plan
# 2026-06-07-supabase-foundation.md, section "Avant de commencer", pour le détail
# de comment obtenir chaque valeur)
# ----------------------------------------------------------------------------

# URL du projet Supabase. Visible dans Dashboard → Project Settings → API → Project URL.
# PUBLIQUE (peut être exposée côté client) — mais reste dans .env pour la CLI/les scripts serveur.
SUPABASE_URL=https://zcunsetanubonygjhxsd.supabase.co

# Clé "anon" (publique). Dashboard → Project Settings → API → Project API keys → "anon public".
# PUBLIQUE — protégée uniquement par les policies RLS, jamais par le secret de la clé elle-même.
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdW5zZXRhbnVib255Z2poeHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4ODcwNzQsImV4cCI6MjA5NjQ2MzA3NH0.uSAaXh7yUNH96ahQgS60CZtLypaIy2NrolccVhqCAXA

# Clé "service_role" (SECRÈTE). Dashboard → Project Settings → API → Project API keys → "service_role".
# SERVEUR UNIQUEMENT — contourne TOUTES les policies RLS. Ne JAMAIS l'exposer côté mobile/admin client,
# ne JAMAIS la committer. Utilisée uniquement par : scripts d'admin locaux, futures Edge Functions,
# scripts de seed/vérification RLS (cf. plan socle, supabase/tests).
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdW5zZXRhbnVib255Z2poeHNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg4NzA3NCwiZXhwIjoyMDk2NDYzMDc0fQ.bUVHmEOdAMLADgk6WXKVdlQrHmZJLMUFhj5sZnp7X9o

# Référence du projet (le segment d'URL après /project/ dans le dashboard, ex. "abcdefghijklmnop").
# Utilisée par la CLI Supabase (`supabase link --project-ref ...`) et par packages/types
# (`supabase gen types typescript --linked`).
SUPABASE_PROJECT_REF=zcunsetanubonygjhxsd

# Mot de passe de la base Postgres du projet (défini à la création du projet Supabase,
# régénérable dans Dashboard → Project Settings → Database → "Reset database password").
# SERVEUR UNIQUEMENT — utilisé par la CLI Supabase pour `db push`/`db pull` vers le projet distant.
SUPABASE_DB_PASSWORD=<Noaccess_no1707>


# ----------------------------------------------------------------------------
# APPS/MOBILE (Expo / React Native)
# Toute variable préfixée EXPO_PUBLIC_ est embarquée TELLE QUELLE dans le bundle
# JS livré sur le téléphone — considère-la comme publique (lisible par quiconque
# décompile l'app). Ne jamais y mettre service_role ou tout autre secret serveur.
# Ces deux variables sont les SEULES nécessaires côté mobile pour parler à Supabase
# (le mobile parle directement à Supabase, pas de couche API intermédiaire — cf.
# architecture-cible.md).
# ----------------------------------------------------------------------------
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...

# Identifiant du projet EAS (Expo Application Services), nécessaire pour les builds
# cloud et les notifications push. Dashboard Expo → ton projet → Project ID,
# ou généré automatiquement au premier `eas init`/`eas build:configure`.
# PUBLIQUE — référencée aussi dans apps/mobile/app.json (extra.eas.projectId).
EXPO_PUBLIC_EAS_PROJECT_ID=00000000-0000-0000-0000-000000000000


# ----------------------------------------------------------------------------
# APPS/ADMIN (Next.js)
# Convention Next.js : NEXT_PUBLIC_* est exposée au navigateur (bundle client),
# tout le reste reste strictement côté serveur (Server Components, Route Handlers,
# Server Actions). Mêmes deux clés publiques que le mobile + la clé service-role
# pour les opérations admin qui doivent contourner RLS (ex. lister TOUS les profils,
# approuver une vérification de carte étudiante, gérer les rôles).
# ----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...

# SERVEUR UNIQUEMENT (jamais NEXT_PUBLIC_) — utilisée côté serveur Next.js (Server
# Actions/Route Handlers) pour les opérations qui nécessitent de contourner RLS :
# liste complète des profils, modification de profiles.role/verification_status/
# is_blocked, accès en lecture au bucket privé student-ids pour la modération.
# Doit être configurée dans Vercel → Project Settings → Environment Variables,
# JAMAIS dans NEXT_PUBLIC_*, jamais committée.
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key-NEVER-COMMIT...


# ----------------------------------------------------------------------------
# OAUTH GOOGLE (Supabase Auth — provider Google, cf. prompt.md §4.8 et §9 "auth")
# Ces identifiants sont saisis dans Supabase Dashboard → Authentication → Providers
# → Google (PAS dans le code des apps — Supabase gère le flux OAuth lui-même).
# Documentés ici pour mémoire/traçabilité uniquement ; ne sont consommés par
# aucune app directement.
# ----------------------------------------------------------------------------
GOOGLE_OAUTH_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=<google-oauth-client-secret-NEVER-COMMIT>


# ----------------------------------------------------------------------------
# CI/CD — déploiement (valeurs à placer dans GitHub Actions Secrets, PAS ici en
# pratique courante — listées pour que ce fichier reste la référence COMPLÈTE
# de toutes les clés du projet, cf. SETUP.md §6 "Où coller chaque secret")
# ----------------------------------------------------------------------------

# Vercel — déploiement de apps/admin (cf. .github/workflows/deploy-admin.yml)
VERCEL_TOKEN=<vercel-token-NEVER-COMMIT>
VERCEL_ORG_ID=<vercel-org-id>
VERCEL_PROJECT_ID=<vercel-project-id>

# Expo/EAS — builds et updates de apps/mobile (cf. .github/workflows/deploy-mobile.yml)
EXPO_TOKEN=<expo-token-NEVER-COMMIT>
```

- [ ] **Step 2: Vérifier que le fichier ne contient aucune vraie valeur secrète**

Run: `Select-String -Path .env.example -Pattern '^[A-Z_]+=.*' | Where-Object { $_.Line -notmatch '<|xxxx|eyJ\.\.\.|00000000-0000' }`
Expected: aucune sortie (vide) — toutes les valeurs sont des placeholders reconnaissables (`<...>`, `xxxx...`, `eyJ...`, ou un UUID de zéros), pas de vraie clé.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs(infra): documenter toutes les variables d'environnement dans .env.example"
```

---

### Task 6: Remplir le `.env` racine avec la même structure (placeholders)

**Files:**
- Modify: `.env` (racine, actuellement vide)

> Le vrai contenu de `.env` ne peut pas être connu à ce stade (les comptes externes n'existent pas encore — c'est précisément ce que `SETUP.md` guide le porteur de projet à créer). Cette tâche pose donc la **même structure** que `.env.example`, avec les mêmes placeholders, comme point de départ explicite : le porteur de projet n'a plus qu'à remplacer chaque `<...>`/`xxxx...` par la vraie valeur, sans deviner quelles variables sont attendues.

- [ ] **Step 1: Copier la structure de `.env.example` vers `.env`**

Run (PowerShell) :
```powershell
Copy-Item .env.example .env -Force
```
Expected: `.env` contient désormais exactement le même texte que `.env.example` (mêmes placeholders).

- [ ] **Step 2: Adapter l'en-tête pour refléter qu'il s'agit du fichier RÉEL (pas de la référence)**

Ouvre `.env` et remplace les 6 premières lignes (le bloc d'en-tête commençant par `# DakarEaseU — Variables d'environnement (RÉFÉRENCE)`) par :

```bash
# ============================================================================
# DakarEaseU — Variables d'environnement RÉELLES (ce fichier, à la racine)
#
# ⚠️  Ce fichier est ignoré par git (.gitignore) — il ne sera JAMAIS commité.
#     Remplace chaque valeur `<...>`/`xxxx...` ci-dessous par la vraie valeur,
#     en suivant le runbook `SETUP.md` (racine du repo) étape par étape.
#     Garde `.env.example` synchronisé en STRUCTURE (noms de variables et
#     commentaires) mais JAMAIS en valeurs réelles.
# ============================================================================
```

- [ ] **Step 3: Vérifier que `.env` est bien ignoré par git malgré son contenu actuel**

Run: `git status --porcelain | Select-String '\.env$'`
Expected: aucune sortie listant `.env` comme fichier à committer (il doit apparaître nulle part dans `git status`, ni en `??`, ni en `M` — la règle `.gitignore` posée en Task 3 le filtre).

Run (double vérification explicite) : `git check-ignore .env && Write-Output 'OK: .env est ignoré'`
Expected: `OK: .env est ignoré`

- [ ] **Step 4: Pas de commit pour `.env`**

`.env` est volontairement **non commité** (il est dans `.gitignore`). Ne lance PAS `git add .env`. Si `git status` montre `.env` comme suivi (`tracked`), c'est un signal d'alerte : cela voudrait dire qu'il a été commité avant la mise en place du `.gitignore` — vérifie avec `git ls-files | Select-String '^\.env$'` (qui doit retourner vide) avant de continuer.

---

### Task 7: Écrire le `Dockerfile` racine et `.dockerignore`

**Files:**
- Create: `Dockerfile` (actuellement vide)
- Create: `.dockerignore`

> **Décision de scope — quoi containeriser ?** DakarEaseU est une architecture 100% Supabase-centrée : il n'y a **aucun serveur backend custom à faire tourner** (cf. `architecture-cible.md` — "Pas de NestJS/Express/... pour le MVP"). Les deux seules choses qui s'exécutent en continu sont (a) le mobile, distribué via stores/EAS — pas containerisable au sens "service tournant", et (b) le dashboard admin Next.js, hébergé sur Vercel (qui ne nécessite normalement pas de Dockerfile). **Le choix le plus défendable est donc un `Dockerfile` qui build et sert `apps/admin`** : il sert (1) de **parité locale** — un développeur peut reproduire l'environnement exact de prod sans dépendre de Vercel, utile pour déboguer un problème de build ; (2) de **filet de secours d'auto-hébergement** — si Vercel devenait indisponible/payant/inadapté, l'image Docker permet de redéployer ailleurs (Fly.io, Render, VPS Docker...) sans réécrire l'app. Ce n'est PAS le chemin de déploiement principal (Vercel l'est, via `deploy-admin.yml`), mais un filet de sécurité peu coûteux à maintenir une fois écrit.

- [ ] **Step 1: Écrire le contenu complet de `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1

# ============================================================================
# DakarEaseU — Dockerfile pour apps/admin (Next.js)
#
# Pourquoi ce choix : DakarEaseU est 100% Supabase-centré, sans backend custom à
# déployer (cf. docs/architecture-cible.md). Le seul artefact "serveur" du repo
# est le dashboard admin Next.js, dont l'hébergement principal est Vercel (cf.
# .github/workflows/deploy-admin.yml). Cette image sert de :
#   1. Parité locale : reproduire l'environnement de build/run exact sans Vercel ;
#   2. Filet de secours d'auto-hébergement si Vercel devient indisponible/inadapté.
# Build multi-stage : deps → build → runtime, basé sur node:20-alpine (petite
# image), utilisateur non-root, sortie Next.js "standalone" pour un runtime minimal.
#
# Build :  docker build -t dakareaseu-admin .
# Run   :  docker run -p 3000:3000 --env-file .env dakareaseu-admin
# ============================================================================

# ---- Stage 1 : deps — installe uniquement les dépendances nécessaires au build ----
FROM node:20-alpine AS deps
WORKDIR /repo

# Copie des manifests du monorepo pour profiter du cache Docker des dépendances
# (cette couche n'est invalidée que si un package.json change, pas à chaque edit de code).
COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN npm ci --workspace=@dakareaseu/admin --workspace=@dakareaseu/shared --workspace=@dakareaseu/types --include-workspace-root

# ---- Stage 2 : builder — construit l'app Next.js en mode standalone ----
FROM node:20-alpine AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/package.json /repo/package-lock.json ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@dakareaseu/admin

# ---- Stage 3 : runtime — image minimale, ne contient que le strict nécessaire ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Utilisateur non-root (bonne pratique de sécurité — ne jamais exécuter le process en root)
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Sortie Next.js "standalone" : un server.js autonome + le minimum de node_modules
# (nécessite `output: 'standalone'` dans apps/admin/next.config.js — posé par le
# plan admin-dashboard ; si absent, ce build échoue avec "Cannot find module server.js").
COPY --from=builder --chown=nextjs:nodejs /repo/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/admin/public ./apps/admin/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/admin/server.js"]
```

- [ ] **Step 2: Écrire le contenu complet de `.dockerignore`**

```text
# Dépendances et builds — réinstallés/reconstruits dans l'image
node_modules
**/node_modules
.next
**/.next
dist
**/dist
.expo
**/.expo
coverage

# Environnement et secrets — ne jamais copier dans une image
.env
.env.*
!.env.example

# Outils de dev / VCS / docs (inutiles à l'exécution du serveur)
.git
.github
.vscode
.idea
docs
design
*.md
.claude

# Supabase CLI (état local, jamais nécessaire dans l'image admin)
supabase/.branches
supabase/.temp
```

- [ ] **Step 3: Vérifier la syntaxe du Dockerfile (sans builder l'image complète — trop long pour une étape de vérification)**

Run: `docker build --check -t dakareaseu-admin:syntax-check .`
Expected: `Check complete, no warnings found.` (ou liste d'avertissements de syntaxe à corriger s'il y en a — aucune erreur bloquante attendue). Si `docker` n'est pas disponible dans l'environnement d'exécution de cette tâche, note-le et passe à l'étape suivante : la vérification complète (`docker build` réel) se fera quand `apps/admin` existera avec son `next.config.js` en mode `standalone` (posé par le plan admin-dashboard) — documente ce point dans le commit.

- [ ] **Step 4: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "feat(infra): ajouter le Dockerfile multi-stage pour apps/admin (parité locale / secours auto-hébergement) et .dockerignore"
```

---

### Task 8: Pipeline CI — `.github/workflows/ci.yml` (Lint → TypeCheck → Tests → Build)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Écrire le contenu complet du workflow**

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20.x'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Installer les dépendances
        run: npm ci

      - name: Lint (toutes les apps/packages qui exposent un script "lint")
        run: npm run lint --workspaces --if-present

      - name: Vérifier le formatage Prettier
        run: npm run format:check

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Installer les dépendances
        run: npm ci

      - name: Type check (toutes les apps/packages)
        run: npm run typecheck --workspaces --if-present

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: typecheck
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Installer les dépendances
        run: npm ci

      - name: Tests (toutes les apps/packages qui exposent un script "test")
        run: npm run test --workspaces --if-present
        env:
          CI: true

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    strategy:
      matrix:
        target:
          - workspace: '@dakareaseu/admin'
            label: admin
          - workspace: '@dakareaseu/mobile'
            label: mobile
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Installer les dépendances
        run: npm ci

      - name: Build ${{ matrix.target.label }}
        run: npm run build --workspace=${{ matrix.target.workspace }} --if-present
```

> Notes de conception :
> - Jobs **séquentiels** (`needs:`) plutôt qu'une matrice unique : reflète l'ordre `Lint → Type Check → Tests → Build` exigé par prompt.md §2/§12, et fait échouer la pipeline tôt (lint cassé = pas la peine de lancer les tests).
> - `--workspaces --if-present` fan-out automatiquement sur `apps/mobile`, `apps/admin`, `packages/shared`, `packages/types` — chacun expose (ou non) `lint`/`typecheck`/`test`/`build` selon ses besoins (les plans `mobile-app`/`admin-dashboard` posent ces scripts dans leurs `package.json` respectifs ; `--if-present` évite que l'absence d'un script dans un package fasse échouer toute la CI).
> - Cache npm natif via `actions/setup-node@v4` + `cache: 'npm'` (basé sur `package-lock.json`) — pas besoin de configuration manuelle de cache.
> - Le job `build` n'inclut pas `packages/*` en matrice : ce sont des libs TypeScript sans étape de build "déployable" critique (leur `typecheck` suffit à valider leur intégrité ; s'ils exposent un `build`, `--if-present` le couvrirait déjà via les jobs précédents si on l'ajoutait — ici on cible volontairement les deux artefacts qui comptent : les apps).

- [ ] **Step 2: Valider la syntaxe YAML**

Run: `node -e "const yaml = require('js-yaml'); yaml.load(require('fs').readFileSync('.github/workflows/ci.yml', 'utf-8')); console.log('ci.yml : YAML valide')"`

Si `js-yaml` n'est pas installé : Run: `npx -y js-yaml .github/workflows/ci.yml > $null; if ($LASTEXITCODE -eq 0) { Write-Output 'ci.yml : YAML valide' } else { Write-Output 'ERREUR de syntaxe YAML' }`
Expected: `ci.yml : YAML valide`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: ajouter le pipeline CI (lint, typecheck, tests, build) sur PR et push main/develop"
```

---

### Task 9: Pipeline CD — `.github/workflows/deploy-admin.yml` (déploiement Vercel)

**Files:**
- Create: `.github/workflows/deploy-admin.yml`

> Approche retenue : **`amondnet/vercel-action`**, déclenchée depuis GitHub Actions sur push vers `main` (production) et sur Pull Request vers `main` (preview). C'est l'approche la plus simple à auditer et la plus explicite dans le pipeline (vs. l'intégration Git native de Vercel qui déploie "en silence" sans passer par nos jobs CI). Elle nécessite trois secrets GitHub (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) — obtenus en suivant `SETUP.md` §4, à ajouter dans **Repo GitHub → Settings → Secrets and variables → Actions → New repository secret**.

- [ ] **Step 1: Écrire le contenu complet du workflow**

```yaml
name: Deploy Admin (Vercel)

on:
  push:
    branches: [main]
    paths:
      - 'apps/admin/**'
      - 'packages/**'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/deploy-admin.yml'
  pull_request:
    branches: [main]
    paths:
      - 'apps/admin/**'
      - 'packages/**'

concurrency:
  group: deploy-admin-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - name: Déployer sur Vercel (preview sur PR, production sur main)
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/admin
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
          github-comment: true

      - name: Afficher l'URL déployée
        run: echo "Déployé sur ${{ steps.vercel-deploy.outputs.preview-url }}"
```

> Notes :
> - `paths:` limite le déclenchement aux changements pertinents pour l'admin (et ses dépendances `packages/*`) — évite de redéployer l'admin sur chaque commit mobile.
> - `vercel-args` bascule automatiquement entre déploiement de preview (PR) et production (`--prod`, uniquement sur push `main`) — couvre exactement l'exigence de prompt.md §12 ("preview sur PR, prod sur `main`").
> - `working-directory: apps/admin` suppose que le projet Vercel est configuré avec **Root Directory = `apps/admin`** (cf. Task 11 et `SETUP.md` §4) — Vercel détecte alors automatiquement le framework Next.js sans configuration supplémentaire.
> - `github-comment: true` poste l'URL de preview en commentaire sur la PR — confort de revue, zéro configuration additionnelle.

- [ ] **Step 2: Valider la syntaxe YAML**

Run: `npx -y js-yaml .github/workflows/deploy-admin.yml > $null; if ($LASTEXITCODE -eq 0) { Write-Output 'deploy-admin.yml : YAML valide' } else { Write-Output 'ERREUR de syntaxe YAML' }`
Expected: `deploy-admin.yml : YAML valide`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-admin.yml
git commit -m "ci: ajouter le pipeline de déploiement Vercel pour apps/admin (preview sur PR, prod sur main)"
```

---

### Task 10: Pipeline CD — `.github/workflows/deploy-mobile.yml` (build EAS sur tag/déclenchement manuel)

**Files:**
- Create: `.github/workflows/deploy-mobile.yml`

> Approche retenue : **`expo/expo-github-action`**, déclenchée **manuellement** (`workflow_dispatch`) ou sur **tag** `mobile-v*` — PAS sur chaque push, conformément à prompt.md §12 ("les builds natifs sont longs et coûteux — ne pas les lancer sur chaque push"). Nécessite le secret GitHub `EXPO_TOKEN` (cf. `SETUP.md` §3).

- [ ] **Step 1: Écrire le contenu complet du workflow**

```yaml
name: Deploy Mobile (EAS)

on:
  workflow_dispatch:
    inputs:
      profile:
        description: 'Profil de build EAS (cf. apps/mobile/eas.json)'
        required: true
        default: 'preview'
        type: choice
        options:
          - development
          - preview
          - production
      platform:
        description: 'Plateforme cible'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - android
          - ios
  push:
    tags:
      - 'mobile-v*'

concurrency:
  group: deploy-mobile-${{ github.ref }}
  cancel-in-progress: false

jobs:
  eas-build:
    name: EAS Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Installer les dépendances (depuis la racine du monorepo — package-lock.json y vit)
        run: npm ci

      - name: Configurer Expo/EAS CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Lancer le build EAS (non-interactif)
        working-directory: apps/mobile
        run: |
          PROFILE="${{ github.event.inputs.profile || 'production' }}"
          PLATFORM="${{ github.event.inputs.platform || 'all' }}"
          eas build --profile "$PROFILE" --platform "$PLATFORM" --non-interactive --no-wait
```

> Notes :
> - `workflow_dispatch` avec des `inputs` permet de choisir le profil EAS (`development`/`preview`/`production`, cf. Task 12 — `apps/mobile/eas.json`) et la plateforme directement depuis l'onglet "Actions" de GitHub — aucune ligne de commande nécessaire pour le porteur de projet.
> - Déclenchement secondaire sur tag `mobile-v*` (ex. `git tag mobile-v1.0.0 && git push --tags`) pour les sorties versionnées formelles.
> - `--no-wait` : le job GitHub Actions ne bloque pas pendant toute la durée du build natif (10–30 min) — le build continue sur l'infrastructure EAS, suivable depuis le dashboard Expo. Évite de consommer des minutes GitHub Actions inutilement (coût).
> - `cancel-in-progress: false` : on ne veut JAMAIS annuler un build EAS déjà lancé (coûteux à relancer).

- [ ] **Step 2: Valider la syntaxe YAML**

Run: `npx -y js-yaml .github/workflows/deploy-mobile.yml > $null; if ($LASTEXITCODE -eq 0) { Write-Output 'deploy-mobile.yml : YAML valide' } else { Write-Output 'ERREUR de syntaxe YAML' }`
Expected: `deploy-mobile.yml : YAML valide`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-mobile.yml
git commit -m "ci: ajouter le pipeline de build EAS pour apps/mobile (déclenchement manuel ou par tag, profils dev/preview/prod)"
```

---

### Task 11: Configuration Vercel pour `apps/admin`

**Files:**
- Create: `apps/admin/vercel.json`

> Pour la majorité des projets Next.js dans un monorepo, **Vercel détecte automatiquement le framework** dès lors que le "Root Directory" du projet est réglé sur `apps/admin` dans les réglages du projet Vercel (cf. `SETUP.md` §4 — aucune action requise dans ce cas). On ajoute néanmoins un `vercel.json` minimal pour : (a) documenter explicitement les commandes attendues si jamais l'auto-détection échoue dans un contexte monorepo, (b) fixer la région de déploiement proche de la cible utilisateur (Afrique de l'Ouest → Europe la plus proche desservie par Vercel).

- [ ] **Step 1: Écrire le contenu complet de `apps/admin/vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "cd ../.. && npm run build --workspace=@dakareaseu/admin",
  "installCommand": "cd ../.. && npm ci",
  "outputDirectory": ".next",
  "regions": ["cdg1"]
}
```

> Notes :
> - `cdg1` = région Vercel à Paris — la plus proche géographiquement de Dakar parmi les régions disponibles, minimise la latence pour les admins basés au Sénégal/en France.
> - `buildCommand`/`installCommand` préfixés par `cd ../..` : nécessaire dans un monorepo npm workspaces pour que `npm ci`/`npm run build --workspace=...` s'exécutent depuis la racine (où vit `package-lock.json`) plutôt que depuis `apps/admin` seul — sinon Vercel ne résout pas les dépendances `@dakareaseu/shared`/`@dakareaseu/types`.
> - Si le porteur de projet configure le projet Vercel avec **Root Directory = `apps/admin`** ET que la case "Include source files outside of the Root Directory" est cochée (recommandé pour les monorepos, cf. `SETUP.md` §4), Vercel gère cela nativement et ce fichier sert surtout de documentation/garde-fou explicite.

- [ ] **Step 2: Vérifier que le JSON est valide**

Run: `node -e "JSON.parse(require('fs').readFileSync('apps/admin/vercel.json', 'utf-8')); console.log('vercel.json valide')"`
Expected: `vercel.json valide`

- [ ] **Step 3: Commit**

```bash
git add apps/admin/vercel.json
git commit -m "chore(infra): configurer vercel.json pour apps/admin (région cdg1, commandes monorepo)"
```

---

### Task 12: Configuration EAS pour `apps/mobile` (`eas.json` + essentiels `app.json`)

**Files:**
- Create: `apps/mobile/eas.json`
- Create: `apps/mobile/app.json` (squelette minimal — étendu par le plan `mobile-app` avec le contenu spécifique aux écrans/assets)

> Note de coordination : si `apps/mobile/app.json` existe déjà au moment de l'exécution de cette tâche (posé en premier par le plan `mobile-app`), **ne l'écrase pas** — limite-toi à vérifier que les clés `expo.name`, `expo.slug`, `expo.ios.bundleIdentifier`, `expo.android.package` et `expo.extra.eas.projectId` sont présentes et cohérentes avec ce qui suit, et ajoute uniquement celles qui manquent. Le contenu ci-dessous est le **squelette minimal** attendu si le fichier n'existe pas encore.

- [ ] **Step 1: Écrire le contenu complet de `apps/mobile/eas.json`**

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxxxxxxxxxxxxxxxxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ...your-anon-key..."
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxxxxxxxxxxxxxxxxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ...your-anon-key..."
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "channel": "production",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxxxxxxxxxxxxxxxxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ...your-anon-key..."
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

> Notes :
> - **Trois profils** `development`/`preview`/`production` exactement comme demandé : `development` (client de dev avec hot-reload, distribution interne, simulateur iOS activé), `preview` (build interne partageable type APK, pour tests sans passer par les stores), `production` (build store : `app-bundle` Android / soumission iOS via `submit`).
> - Les valeurs `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` ici sont des **placeholders explicites** (`https://xxxx...`, `eyJ...`) — le porteur de projet les remplace par les vraies valeurs (les mêmes que dans `.env`/`.env.example`, cf. Task 5). Alternative plus propre à terme : utiliser `eas secret:create` pour stocker ces valeurs côté EAS plutôt qu'en clair dans `eas.json` (documenté dans `SETUP.md` §3 comme amélioration possible — YAGNI pour le MVP, la clé anon est de toute façon publique).
> - `appVersionSource: "remote"` : EAS gère l'incrémentation de version de build automatiquement — évite les conflits de versions lors de builds parallèles.

- [ ] **Step 2: Écrire le contenu complet de `apps/mobile/app.json`**

```json
{
  "expo": {
    "name": "DakarEaseU",
    "slug": "dakareaseu",
    "scheme": "dakareaseu",
    "version": "0.1.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E3A8A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "sn.dakareaseu.app",
      "infoPlist": {
        "NSCameraUsageDescription": "DakarEaseU a besoin de la caméra pour photographier ta carte étudiante lors de la vérification.",
        "NSPhotoLibraryUsageDescription": "DakarEaseU a besoin d'accéder à tes photos pour importer ta carte étudiante ou ta photo de profil."
      }
    },
    "android": {
      "package": "sn.dakareaseu.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E3A8A"
      },
      "permissions": ["CAMERA", "READ_MEDIA_IMAGES"]
    },
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "DakarEaseU a besoin d'accéder à tes photos pour importer ta carte étudiante ou ta photo de profil.",
          "cameraPermission": "DakarEaseU a besoin de la caméra pour photographier ta carte étudiante lors de la vérification."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#1E3A8A"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "00000000-0000-0000-0000-000000000000"
      }
    },
    "owner": "<expo-username-or-org-slug>"
  }
}
```

> Notes :
> - `bundleIdentifier`/`package` = `sn.dakareaseu.app` : suit la convention `<TLD-pays>.<produit>.<app>` (`.sn` = Sénégal), cohérent avec "DakarEaseU partout" (prompt.md §1 — renommage complet, aucune trace de "Dakar'ease").
> - Plugins listés correspondent aux besoins identifiés dans le spec : `expo-image-picker` (upload carte étudiante à l'onboarding §9 "auth", photos d'avatar/annonces) et `expo-notifications` (notifications ciblées Realtime §4.5/§9 "notifications"). Les permissions caméra/photos sont déclarées avec des messages en français, contextualisés à l'usage réel (carte étudiante).
> - `extra.eas.projectId` et `owner` sont des **placeholders explicites** (`00000000-...`, `<expo-username-or-org-slug>`) — remplacés une fois le compte Expo et le projet EAS créés (cf. `SETUP.md` §3 ; `eas init` peut aussi remplir `projectId` automatiquement).
> - `scheme: "dakareaseu"` : nécessaire pour les redirections OAuth (Google/Apple) et les deep links — cohérent avec le flux auth du prompt §9.

- [ ] **Step 3: Vérifier que les deux fichiers JSON sont valides**

Run: `node -e "for (const f of ['apps/mobile/eas.json', 'apps/mobile/app.json']) { JSON.parse(require('fs').readFileSync(f, 'utf-8')); console.log(f, 'valide'); }"`
Expected:
```
apps/mobile/eas.json valide
apps/mobile/app.json valide
```

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/eas.json apps/mobile/app.json
git commit -m "chore(infra): configurer EAS (eas.json — profils dev/preview/prod) et les essentiels app.json pour apps/mobile"
```

---

### Task 13: Écrire `SETUP.md` — runbook complet de provisionnement des comptes externes

**Files:**
- Create: `SETUP.md` (racine du repo)

> **C'est le livrable central de ce plan.** Le porteur de projet l'utilise comme guide pas-à-pas pour créer lui-même tous les comptes/projets externes pendant que le code est généré en parallèle ("Tu t'en charges, je code en parallèle"). Chaque étape donne le chemin de menu exact (autant que raisonnablement inférable), le format de la valeur à récupérer, et où la coller ensuite.

- [ ] **Step 1: Écrire le contenu complet de `SETUP.md`**

```markdown
# SETUP — Provisionnement des comptes et services externes (DakarEaseU)

> **À qui s'adresse ce document ?** Au porteur de projet (toi). Pendant que le code de
> DakarEaseU est généré (mobile, admin, infra), **tu dois créer et configurer toi-même
> les comptes/projets externes ci-dessous** — c'est un prérequis pour que les déploiements
> et intégrations fonctionnent. Suis les étapes dans l'ordre : certaines dépendent des
> précédentes (ex. tu as besoin du repo GitHub avant de pouvoir lier Vercel dessus).
>
> Tout au long de ce document : les valeurs entre `<...>` sont des PLACEHOLDERS — remplace-les
> par les vraies valeurs que tu récupères à chaque étape. Note-les au fur et à mesure dans
> ton gestionnaire de mots de passe — tu en auras besoin pour `.env` (racine), GitHub Secrets,
> Vercel, et EAS (cf. tableau récapitulatif en fin de document).

---

## Sommaire

1. [Dépôt GitHub](#1-dépôt-github)
2. [Projet Supabase](#2-projet-supabase)
3. [Compte Expo / projet EAS](#3-compte-expo--projet-eas)
4. [Compte Vercel / projet lié à `apps/admin`](#4-compte-vercel--projet-lié-à-appsadmin)
5. [Google Cloud Console (OAuth Google pour Supabase Auth)](#5-google-cloud-console-oauth-google-pour-supabase-auth)
6. [Où coller chaque secret — tableau récapitulatif](#6-où-coller-chaque-secret--tableau-récapitulatif)
7. [Apple Developer Program (différé — à faire plus tard)](#7-apple-developer-program-différé--à-faire-plus-tard)
8. [Checklist finale avant que l'équipe commence à coder dessus](#8-checklist-finale-avant-que-léquipe-commence-à-coder-dessus)

---

## 1. Dépôt GitHub

Si le repo `DakarEaseU` est déjà créé et que tu lis ce fichier dedans, passe directement à
"1.2 Branches et protections".

### 1.1 Créer le dépôt (si ce n'est pas déjà fait)

1. Va sur [github.com/new](https://github.com/new).
2. **Repository name** : `DakarEaseU` (ou `dakareaseu` — minuscules recommandées pour
   cohérence avec les noms de package npm `@dakareaseu/*`).
3. **Visibility** : `Private` (recommandé tant que le projet n'est pas public).
4. Ne coche PAS "Add a README" si tu importes un repo existant (pour éviter un conflit
   d'historique). Clique **Create repository**.
5. Si le code existe déjà localement (c'est le cas — tu es en train de le générer) :
   ```bash
   git remote add origin https://github.com/<ton-compte-ou-org>/DakarEaseU.git
   git push -u origin main
   ```

### 1.2 Branches et protections

1. Crée la branche `develop` à partir de `main` :
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```
2. Va dans **Settings → Branches → Add branch protection rule**.
3. Pour `main` : coche "Require a pull request before merging", "Require status checks to
   pass before merging" (sélectionne les jobs `Lint`, `Type Check`, `Tests`, `Build` une fois
   que le premier run de la CI a eu lieu et qu'ils apparaissent dans la liste).
4. Répète pour `develop` avec des règles plus souples si tu le souhaites (au minimum
   "Require a pull request before merging").

### 1.3 Ajouter des collaborateurs (si applicable)

**Settings → Collaborators and teams → Add people** — invite par nom d'utilisateur GitHub
ou e-mail, choisis le rôle (`Write` pour un développeur, `Admin` pour un co-mainteneur).

### 1.4 Configurer les secrets GitHub Actions

**Settings → Secrets and variables → Actions → New repository secret.**

Tu ajouteras ici, au fur et à mesure que tu les obtiens dans les étapes suivantes :
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `EXPO_TOKEN`. (Cf. tableau §6 pour la
liste complète et la correspondance avec chaque pipeline.)

---

## 2. Projet Supabase

> ⚠️ Cette section résume ce dont tu as besoin pour DÉMARRER (création du projet et
> récupération des clés). Le détail de l'utilisation de ces valeurs (CLI, migrations,
> lien projet local/distant) est documenté dans le plan
> `docs/superpowers/plans/2026-06-07-supabase-foundation.md` (section "Avant de
> commencer") — les deux documents sont volontairement cohérents, ne les laisse pas
> diverger si tu modifies l'un des deux.

### 2.1 Créer le compte et l'organisation

1. Va sur [supabase.com](https://supabase.com) → **Start your project** → connecte-toi
   avec GitHub (recommandé — simplifie l'accès ultérieur).
2. Si demandé, crée une **organisation** : nom suggéré `DakarEaseU` (ou ton nom/pseudo si
   tu préfères un compte personnel). Plan : **Free** (suffisant pour le MVP).

### 2.2 Créer le projet

1. **New project** :
   - **Name** : `dakareaseu` (ou `dakareaseu-prod` si tu prévois un projet `dakareaseu-staging`
     séparé plus tard — pour le MVP, un seul projet suffit).
   - **Database Password** : génère un mot de passe fort (le bouton "Generate a password"
     est recommandé) — **note-le immédiatement** dans ton gestionnaire de mots de passe,
     c'est la valeur `SUPABASE_DB_PASSWORD`. Tu ne pourras plus le revoir en clair ensuite
     (seulement le réinitialiser).
   - **Region** : choisis la région la plus proche de Dakar parmi celles proposées par
     Supabase (hébergé sur AWS). Recommandation : **`eu-west-1` (Europe — Irlande)** ou,
     si disponible pour ton plan, **`eu-west-2`/`eu-central-1`** — toutes nettement plus
     proches du Sénégal que les régions US/Asie, avec une latence raisonnable pour des
     utilisateurs basés à Dakar. Évite les régions Amérique/Asie.
   - **Pricing Plan** : **Free** (suffisant pour le MVP — quotas larges pour démarrer).
2. Clique **Create new project**. La provisionnement prend 1 à 2 minutes.

### 2.3 Récupérer les clés et identifiants

Une fois le projet prêt, va dans **Project Settings** (icône engrenage, panneau latéral) :

| Valeur | Où la trouver | Variable `.env` |
|---|---|---|
| URL du projet | **Project Settings → API → Project URL** (format `https://<ref>.supabase.co`) | `SUPABASE_URL` (et `EXPO_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` — même valeur) |
| Clé publique ("anon") | **Project Settings → API → Project API keys → `anon` `public`** | `SUPABASE_ANON_KEY` (et `EXPO_PUBLIC_SUPABASE_ANON_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` — même valeur) |
| Clé secrète ("service_role") | **Project Settings → API → Project API keys → `service_role` `secret`** (clique "Reveal") | `SUPABASE_SERVICE_ROLE_KEY` — ⚠️ SECRET, ne jamais exposer côté client |
| Référence du projet | Dans l'URL du dashboard : `app.supabase.com/project/<ref>` — la partie `<ref>` | `SUPABASE_PROJECT_REF` |
| Mot de passe DB | Celui que tu as généré/noté à la création (§2.2) — réinitialisable via **Project Settings → Database → Reset database password** | `SUPABASE_DB_PASSWORD` |

Reporte ces 5 valeurs dans `.env` (racine du repo, déjà présent avec la bonne structure de
placeholders — remplace simplement chaque `<...>`/`xxxx...` par la vraie valeur).

### 2.4 Activer le provider Google (préparation — clés ajoutées en §5)

Tu reviendras ici une fois les identifiants OAuth Google obtenus (§5) :
**Authentication → Providers → Google** → active le toggle, colle le `Client ID` et le
`Client Secret` Google, et copie l'URL de redirection affichée par Supabase (tu en auras
besoin pour configurer le client OAuth Google, cf. §5.3).

---

## 3. Compte Expo / projet EAS

### 3.1 Créer le compte

1. Va sur [expo.dev/signup](https://expo.dev/signup) → crée un compte (ou connecte-toi
   avec GitHub).
2. Note ton **nom d'utilisateur ou slug d'organisation Expo** — c'est la valeur à mettre
   dans `apps/mobile/app.json` → `expo.owner`.

### 3.2 Installer la CLI EAS et créer le projet

1. En local (une fois) :
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Depuis `apps/mobile/` :
   ```bash
   eas init
   ```
   Cela crée automatiquement un projet EAS lié à ce dossier et **renseigne
   `expo.extra.eas.projectId`** dans `app.json` à ta place (remplace le placeholder
   `00000000-0000-0000-0000-000000000000`). Note aussi cette valeur pour
   `EXPO_PUBLIC_EAS_PROJECT_ID` dans `.env`.

### 3.3 Obtenir le token EXPO_TOKEN pour la CI

1. Va sur [expo.dev](https://expo.dev) → ton profil (en haut à droite) → **Account
   settings → Access tokens**.
2. **Create token** → nomme-le `dakareaseu-github-actions` → copie la valeur générée
   (elle ne sera plus affichée ensuite).
3. C'est la valeur `EXPO_TOKEN` — à coller dans **GitHub repo → Settings → Secrets and
   variables → Actions → New repository secret** (nom : `EXPO_TOKEN`).

### 3.4 (Optionnel — confort) Builds de développement

Pour tester l'app sur un appareil physique pendant le développement sans attendre un
build complet :
```bash
cd apps/mobile
eas build --profile development --platform android
```
(Nécessite un compte Expo configuré et `eas.json` déjà en place — posé par ce plan, cf.
`apps/mobile/eas.json`.)

---

## 4. Compte Vercel / projet lié à `apps/admin`

### 4.1 Créer le compte

1. Va sur [vercel.com/signup](https://vercel.com/signup) → **Continue with GitHub**
   (fortement recommandé — permet la liaison directe au repo et les déploiements
   automatiques sur push/PR).
2. Autorise Vercel à accéder à ton compte/organisation GitHub (tu peux limiter l'accès
   au seul repo `DakarEaseU` dans les réglages d'autorisation GitHub si tu préfères).

### 4.2 Créer le projet et le lier au repo

1. Sur le tableau de bord Vercel : **Add New... → Project**.
2. Sélectionne le repo `DakarEaseU` dans la liste (importe-le si nécessaire).
3. Dans l'écran de configuration **avant de cliquer "Deploy"** :
   - **Framework Preset** : Vercel devrait détecter `Next.js` automatiquement une fois
     le Root Directory réglé (étape suivante) — sinon, sélectionne-le manuellement.
   - **Root Directory** : clique "Edit" → sélectionne `apps/admin`. **Coche l'option
     "Include source files outside of the Root Directory in the Build Step"** (essentielle
     dans un monorepo — sinon Vercel ne voit pas `packages/shared`/`packages/types`).
   - **Build and Output Settings** : laisse les valeurs auto-détectées (le fichier
     `apps/admin/vercel.json` du repo les précise déjà si besoin).
4. **Environment Variables** (section pliable dans le même écran, ou plus tard via
   **Project Settings → Environment Variables**) — ajoute (coche `Production`, `Preview`
   ET `Development` pour chacune sauf mention contraire) :

   | Nom | Valeur | Visibilité |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | celle de `SUPABASE_URL` (§2.3) | Publique (client + serveur) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | celle de `SUPABASE_ANON_KEY` (§2.3) | Publique (client + serveur) |
   | `SUPABASE_SERVICE_ROLE_KEY` | celle de `SUPABASE_SERVICE_ROLE_KEY` (§2.3) | **Sensitive / serveur uniquement** — Vercel propose une case "Sensitive" : coche-la, elle masque la valeur dans l'UI après sauvegarde |

   ⚠️ Ne préfixe JAMAIS `SUPABASE_SERVICE_ROLE_KEY` par `NEXT_PUBLIC_` — cela l'exposerait
   dans le bundle client.
5. Clique **Deploy**. Le premier déploiement peut échouer si le code de `apps/admin`
   n'existe pas encore — c'est normal à ce stade ; tu pourras relancer un déploiement une
   fois le code généré (ou laisser le pipeline `deploy-admin.yml` le faire automatiquement
   au prochain push sur `main`).

### 4.3 Récupérer les identifiants pour GitHub Actions

1. **`VERCEL_TOKEN`** : [vercel.com/account/tokens](https://vercel.com/account/tokens) →
   **Create Token** → nomme-le `dakareaseu-github-actions` → Scope : ton compte/org →
   copie la valeur (affichée une seule fois).
2. **`VERCEL_ORG_ID`** et **`VERCEL_PROJECT_ID`** : deux options —
   - Option A (recommandée, la plus simple) : dans le dossier `apps/admin/` en local,
     lance `npx vercel link` (connecte-toi avec le même compte, sélectionne le projet créé
     en §4.2). Cela crée `apps/admin/.vercel/project.json` contenant `orgId` et `projectId`
     en clair — copie ces deux valeurs, **puis supprime ou n'ajoute jamais ce dossier à
     git** (il doit être dans `.gitignore` — vérifie qu'une règle `.vercel` y figure ;
     sinon ajoute-la).
   - Option B : **Project Settings → General** affiche le `Project ID` ; le `Team ID`/
     `Org ID` est visible dans **Team Settings → General** (ou dans l'URL du dashboard
     pour un compte personnel).
3. Ajoute les trois valeurs dans **GitHub repo → Settings → Secrets and variables →
   Actions** : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

## 5. Google Cloud Console (OAuth Google pour Supabase Auth)

> **Pourquoi c'est nécessaire** : le flux d'authentification du MVP inclut explicitement
> "OAuth Google" (cf. `prompt.md` §4.8 et §9 — l'écran Auth propose connexion email/mot de
> passe **et** Google). Contrairement à Apple Sign-In (différé, payant, cf. §7), Google
> OAuth est gratuit et fait partie du périmètre MVP — ce n'est PAS une option à retirer.

### 5.1 Créer le projet Google Cloud

1. Va sur [console.cloud.google.com](https://console.cloud.google.com) → connecte-toi
   avec un compte Google.
2. En haut à gauche, clique le sélecteur de projet → **New Project**.
3. **Project name** : `DakarEaseU` → **Create**.

### 5.2 Configurer l'écran de consentement OAuth

1. Menu ☰ → **APIs & Services → OAuth consent screen**.
2. **User Type** : `External` (sauf si tu as un Google Workspace dédié) → **Create**.
3. Renseigne : **App name** = `DakarEaseU`, **User support email** = ton e-mail,
   **Developer contact information** = ton e-mail. Sauvegarde et continue les écrans
   suivants (Scopes : laisse les valeurs par défaut pour le MVP — `email`, `profile`,
   `openid` suffisent ; Test users : ajoute ton propre compte Google pendant que l'app
   est en mode test).

### 5.3 Créer les identifiants OAuth (Client ID + Secret)

1. Menu ☰ → **APIs & Services → Credentials → + Create Credentials → OAuth client ID**.
2. **Application type** : `Web application`.
3. **Name** : `DakarEaseU - Supabase Auth`.
4. **Authorized redirect URIs** → **+ Add URI** → colle l'URL de callback fournie par
   Supabase (visible dans **Supabase Dashboard → Authentication → Providers → Google**,
   généralement au format `https://<project-ref>.supabase.co/auth/v1/callback`).
5. Clique **Create**. Une fenêtre affiche le **Client ID** et le **Client Secret** —
   copie les deux immédiatement (le secret ne sera plus affiché en clair ensuite, mais
   reste régénérable).

### 5.4 Brancher les identifiants dans Supabase

1. Retourne dans **Supabase Dashboard → Authentication → Providers → Google**.
2. Active le toggle, colle le **Client ID** (`GOOGLE_OAUTH_CLIENT_ID`) et le **Client
   Secret** (`GOOGLE_OAUTH_CLIENT_SECRET`), sauvegarde.
3. Reporte les deux valeurs dans `.env` (sections prévues, pour traçabilité — elles ne
   sont consommées par aucune app directement, uniquement par la configuration Supabase
   elle-même).

> Pas d'autre usage de Google Cloud nécessaire pour le MVP : pas de Google Maps (le
> design utilise des libellés de distance textuels statiques, cf. `district`/
> `distance_label` dans le schéma), pas de Google Sign-In natif côté mobile (Supabase
> Auth gère le flux OAuth web), pas d'autre API Google mentionnée dans `prompt.md`. Ne
> crée pas d'autres clés API Google "au cas où" (YAGNI).

---

## 6. Où coller chaque secret — tableau récapitulatif

| Secret | `.env` (racine, local) | GitHub Actions Secrets | Vercel (Project Settings → Env Vars) | EAS / Expo |
|---|:---:|:---:|:---:|:---:|
| `SUPABASE_URL` | ✅ | — | — | — |
| `SUPABASE_ANON_KEY` | ✅ | — | — | — |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (jamais commité) | — | ✅ (coché "Sensitive") | — |
| `SUPABASE_PROJECT_REF` | ✅ | — | — | — |
| `SUPABASE_DB_PASSWORD` | ✅ (jamais commité) | — | — | — |
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | — | — | ✅ (`eas.json` → `build.*.env`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | — | — | ✅ (`eas.json` → `build.*.env`) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | ✅ | — | — | ✅ (`app.json` → `extra.eas.projectId`, rempli par `eas init`) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ (même valeur que `SUPABASE_URL`) | — | ✅ | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ (même valeur que `SUPABASE_ANON_KEY`) | — | ✅ | — |
| `GOOGLE_OAUTH_CLIENT_ID` | ✅ | — | — | — (saisi dans Supabase Dashboard, §5.4) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | ✅ (jamais commité) | — | — | — (saisi dans Supabase Dashboard, §5.4) |
| `VERCEL_TOKEN` | — | ✅ | — | — |
| `VERCEL_ORG_ID` | — | ✅ | — | — |
| `VERCEL_PROJECT_ID` | — | ✅ | — | — |
| `EXPO_TOKEN` | — | ✅ | — | — |

Légende : ✅ = doit être configuré à cet endroit · — = non applicable / non nécessaire à
cet endroit.

---

## 7. Apple Developer Program (différé — à faire plus tard)

Conformément à `prompt.md` §4.8, **ne bloque pas le MVP là-dessus** — c'est payant
(~99 $/an) et nécessaire uniquement pour "Sign in with Apple" et la publication sur
l'App Store. Étapes à effectuer **le jour où tu actives ce compte** :

1. Inscris-toi sur [developer.apple.com/programs](https://developer.apple.com/programs/)
   (~99 $/an, validation sous 24-48h).
2. Crée un **App ID** dans **Certificates, Identifiers & Profiles** avec la capacité
   "Sign in with Apple" activée, en cohérence avec `bundleIdentifier` =
   `sn.dakareaseu.app` (déjà posé dans `apps/mobile/app.json`).
3. Dans **Supabase Dashboard → Authentication → Providers → Apple**, active le toggle et
   renseigne les identifiants Apple (Services ID, Team ID, Key ID, clé privée `.p8`).
4. Active le bouton "Continuer avec Apple" dans l'UI mobile (le code prévoit déjà ce point
   d'extension, cf. plan `mobile-app` — le bouton existe en `disabled`/masqué jusqu'à cette
   étape).
5. Pour la publication iOS : configure `eas submit` avec les identifiants Apple
   (App Store Connect API Key) — cf.
   [docs.expo.dev/submit/ios](https://docs.expo.dev/submit/ios/).

Aucune action requise maintenant — section conservée ici pour mémoire et traçabilité.

---

## 8. Checklist finale avant que l'équipe commence à coder dessus

Coche chaque ligne uniquement quand elle est **vérifiée concrètement** (pas supposée) :

- [ ] Le repo GitHub `DakarEaseU` existe, `main` et `develop` sont poussées, les
      protections de branche sur `main` sont actives.
- [ ] Le projet Supabase est créé (région proche du Sénégal), et les 5 valeurs
      (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
      `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`) sont dans `.env` (racine).
- [ ] `npx supabase login` puis `npx supabase link --project-ref <ref>` réussissent
      (confirme que la CLI locale est bien connectée au projet distant — cf. plan
      `supabase-foundation`, Task 0).
- [ ] Le compte Expo existe, `eas init` a été lancé depuis `apps/mobile/` (renseigne
      `expo.extra.eas.projectId` dans `app.json`), et `EXPO_TOKEN` est dans GitHub Secrets.
- [ ] Le compte Vercel existe, le projet est lié au repo avec **Root Directory =
      `apps/admin`** et "Include source files outside of the Root Directory" coché, les
      3 variables d'environnement Supabase sont configurées dans Vercel (avec
      `SUPABASE_SERVICE_ROLE_KEY` marquée "Sensitive"), et `VERCEL_TOKEN`/`VERCEL_ORG_ID`/
      `VERCEL_PROJECT_ID` sont dans GitHub Secrets.
- [ ] Le projet Google Cloud existe, l'écran de consentement OAuth est configuré, le
      client OAuth Web a la bonne URL de redirection Supabase, et le provider Google est
      actif côté **Supabase Dashboard → Authentication → Providers**.
- [ ] `git status` ne montre **jamais** `.env` comme fichier suivi (`git ls-files | grep
      '^\.env$'` retourne vide) — confirmation finale qu'aucun secret ne peut fuiter.
- [ ] Le tableau du §6 a été parcouru ligne par ligne et chaque secret est à sa place.

Une fois cette checklist entièrement cochée, les pipelines CI/CD (`ci.yml`,
`deploy-admin.yml`, `deploy-mobile.yml`) peuvent s'exécuter avec succès de bout en bout,
et l'équipe peut commencer à développer/tester contre de vrais services externes.
```

- [ ] **Step 2: Vérifier que le fichier ne contient aucune vraie valeur secrète**

Run: `Select-String -Path SETUP.md -Pattern '(eyJ[A-Za-z0-9_-]{20,}|sbp_[a-f0-9]{20,})'`
Expected: aucune sortie (vide) — confirme l'absence de tout token/clé réel accidentellement collé dans le runbook (seuls des placeholders `<...>`/`xxxx...`/exemples génériques `eyJ...` tronqués apparaissent).

- [ ] **Step 3: Commit**

```bash
git add SETUP.md
git commit -m "docs: ajouter SETUP.md — runbook complet de provisionnement des comptes externes (GitHub, Supabase, Expo/EAS, Vercel, Google Cloud)"
```

---

### Task 14: Smoke-test du squelette monorepo — `npm install` + résolution des workspaces

**Files:** (aucun nouveau fichier — tâche de vérification mécanique de bout en bout)

> Cette tâche prouve que le squelette posé dans les tâches précédentes est **mécaniquement
> sain** — pas seulement plausible sur le papier. Si `packages/types` n'existe pas encore
> (le plan socle ne l'a pas encore exécuté), cette étape vérifie ce qui existe et note
> explicitement ce qui reste à valider une fois le plan socle passé.

- [ ] **Step 1: Installer toutes les dépendances depuis la racine**

Run: `npm install`
Expected: se termine sans erreur fatale (`npm warn` est acceptable, `npm error` ne l'est pas). Crée/`package-lock.json` à la racine, `node_modules/` avec des liens symboliques vers chaque workspace local (`node_modules/@dakareaseu/shared` → `packages/shared`, etc.).

- [ ] **Step 2: Lister les workspaces résolus**

Run: `npm ls --workspaces --depth=0`
Expected: affiche au minimum `@dakareaseu/shared@0.0.0` rattaché à `packages/shared`. Si `apps/mobile`, `apps/admin` ou `packages/types` ont déjà été peuplés par les plans frères avec un `package.json` valide, ils apparaissent aussi dans la liste — sinon, seuls les dossiers contenant un `package.json` sont reconnus comme workspaces (les `.gitkeep` seuls ne suffisent pas, c'est attendu).

- [ ] **Step 3: Vérifier que `@dakareaseu/shared` est résolvable depuis la racine**

Run: `node -e "const pkg = require('./node_modules/@dakareaseu/shared/package.json'); console.log('Résolu :', pkg.name, pkg.version)"`
Expected: `Résolu : @dakareaseu/shared 0.0.0`

- [ ] **Step 4: Lancer le typecheck global (fan-out workspaces)**

Run: `npm run typecheck --workspaces --if-present`
Expected: `@dakareaseu/shared` exécute `tsc --noEmit` sans erreur. Les autres workspaces (s'ils existent déjà et exposent `typecheck`) s'exécutent aussi — toute erreur à ce stade dans un package déjà peuplé par un plan frère doit être signalée mais n'invalide pas CE plan (elle relève du plan propriétaire de ce package).

- [ ] **Step 5: Documenter le résultat dans une note de suivi (si des workspaces manquent encore)**

Si `npm ls --workspaces --depth=0` ne montre pas encore `apps/mobile`, `apps/admin` et
`packages/types` (parce que les plans frères ne sont pas encore passés), ce n'est **pas un
échec de cette tâche** — note-le simplement dans le message de commit (Step 6) pour que
quiconque relit l'historique comprenne que le smoke-test complet (les 4 workspaces + 1
package résolus) doit être rejoué une fois les trois plans frères terminés. Ajoute alors
une commande de re-vérification finale à lancer manuellement à ce moment-là :

Run (à rejouer plus tard, une fois les 3 plans frères terminés) : `npm ls --workspaces --depth=0`
Expected (à terme) : 4 entrées — `@dakareaseu/mobile`, `@dakareaseu/admin`,
`@dakareaseu/shared`, `@dakareaseu/types` — toutes résolues sans `UNMET DEPENDENCY`.

- [ ] **Step 6: Commit (du lockfile mis à jour, si modifié)**

```bash
git add package-lock.json
git commit -m "chore(infra): valider la résolution npm workspaces du squelette monorepo (smoke-test)"
```

(Si `package-lock.json` n'a pas changé depuis la Task 4 — `npm install` est idempotent —
ce commit peut être vide ; dans ce cas, passe directement à la suite sans committer : `git status` doit confirmer `nothing to commit, working tree clean`.)

---

## Definition of Done

Reprend les critères infra-pertinents de `prompt.md` §13 :

- [ ] **Monorepo** : `package.json` racine avec workspaces `apps/*`/`packages/*`, scripts
      `lint`/`typecheck`/`test`/`build` qui fan-out via `--workspaces --if-present` ;
      `npm install` réussit et `npm ls --workspaces` résout chaque package (Task 14).
- [ ] **`packages/shared`** : scaffold posé (`package.json`, `tsconfig.json`,
      `src/{constants,schemas,index}.ts`), constantes `DISTRICTS`/`CATEGORIES`/
      `TRANSPORT_CATS`/`COLORS` fidèles à `design/dakar-ease/project/data.jsx`, schémas Zod
      de base prêts à être étendus par mobile et admin, `tsc --noEmit` passe.
- [ ] **`.env`/`.env.example`** : toutes les variables documentées avec commentaires
      PUBLIC/SERVER-ONLY, valeurs réalistes en placeholder, `.env` confirmé ignoré par git
      (`git check-ignore .env` réussit, `git ls-files` ne le liste jamais).
- [ ] **`Dockerfile`/`.dockerignore`** : build multi-stage `node:20-alpine` pour
      `apps/admin`, utilisateur non-root, `EXPOSE 3000`, choix de scope justifié en prose
      dans le plan (parité locale + filet de secours, pas le chemin de déploiement
      principal).
- [ ] **CI** : `.github/workflows/ci.yml` exécute `Lint → Type Check → Tests → Build` sur
      PR et push `main`/`develop`, avec cache npm et Node 20.x.
- [ ] **CD admin** : `.github/workflows/deploy-admin.yml` déploie `apps/admin` sur Vercel
      (preview sur PR, prod sur `main`) via les secrets `VERCEL_TOKEN`/`VERCEL_ORG_ID`/
      `VERCEL_PROJECT_ID`.
- [ ] **CD mobile** : `.github/workflows/deploy-mobile.yml` déclenche un build EAS sur
      déclenchement manuel ou tag `mobile-v*` (jamais sur chaque push) via le secret
      `EXPO_TOKEN`, avec choix de profil `development`/`preview`/`production`.
- [ ] **Vercel** : `apps/admin/vercel.json` documente la config attendue (région `cdg1`,
      commandes monorepo) ; `SETUP.md` documente la configuration dashboard (Root
      Directory, env vars, "Sensitive" pour la clé service-role).
- [ ] **EAS** : `apps/mobile/eas.json` avec 3 profils (`development`/`preview`/`production`)
      et `apps/mobile/app.json` avec nom "DakarEaseU", bundle ID `sn.dakareaseu.app`,
      `extra.eas.projectId` (placeholder, rempli par `eas init`), plugins
      `expo-image-picker`/`expo-notifications`.
- [ ] **`SETUP.md`** : runbook complet et autonome — GitHub, Supabase (cohérent avec le
      plan socle), Expo/EAS, Vercel, Google Cloud (justifié comme nécessaire — OAuth
      Google est dans le périmètre MVP, pas Apple), tableau "secret → emplacement(s)",
      checklist finale, section Apple Developer explicitement différée.
- [ ] **Secrets** : aucune vraie clé/valeur sensible commitée nulle part (`.env`,
      `SETUP.md`, workflows) — uniquement des placeholders clairement identifiables.
- [ ] **Aucune trace** de "Dakar'ease" dans les fichiers de config produits par ce plan
      (vérifié : noms de package `@dakareaseu/*`, bundle ID `sn.dakareaseu.app`, app name
      "DakarEaseU" partout).

> ⚠️ **Action requise du porteur de projet — `SETUP.md` n'est PAS optionnel** : tant que
> les comptes externes décrits dans `SETUP.md` ne sont pas créés et leurs clés renseignées
> dans `.env`/GitHub Secrets/Vercel/EAS (cf. tableau §6 du runbook et sa "Checklist
> finale"), **aucun déploiement ne peut réussir** : la CI peut tourner (elle ne dépend pas
> de secrets externes), mais `deploy-admin.yml` et `deploy-mobile.yml` échoueront sans les
> secrets `VERCEL_*`/`EXPO_TOKEN`, et les apps elles-mêmes ne pourront pas se connecter à
> Supabase sans les clés réelles dans `.env`/Vercel/EAS. C'est un **bloquant intentionnel**
> et documenté — le porteur de projet doit traiter `SETUP.md` comme sa feuille de route
> prioritaire, en parallèle du développement du code.
