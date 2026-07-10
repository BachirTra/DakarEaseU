# DakarEaseU — Guide de provisionnement

Guide complet pour provisionner l'environnement de développement du projet DakarEaseU, incluant GitHub, Supabase, Expo/EAS, Vercel et Google OAuth.

## Prérequis

- **Node.js** ≥ 20.x et **npm** ≥ 10.x
- **Git** configuré (git config user.name / user.email)
- **Comptes créés** : GitHub, Supabase, Expo, Vercel, Google Cloud Console

Vérifier les versions :

```bash
node --version    # v20.x ou supérieur
npm --version     # 10.x ou supérieur
git --version
```

## 1. Cloner le dépôt et installer les dépendances

```bash
git clone https://github.com/<organisation>/dakareaseu.git
cd dakareaseu
npm install
```

Cela installe les dépendances de la racine et de tous les workspaces (apps/admin, apps/mobile, packages/shared).

## 2. Variables d'environnement — structure globale

Deux fichiers `.env` doivent être remplis :

- **À la racine** (`.env`) : variables partagées et secrets serveur
- **Dans `apps/mobile/`** (`.env`) : variables spécifiques à l'app Expo

### Copier les fichiers template

```bash
# À la racine
cp .env.example .env

# Pour l'app mobile
cp apps/mobile/.env.example apps/mobile/.env
```

Remplacer toutes les valeurs `<...>` en suivant les sections ci-dessous.

### ⚠️ Règle d'or des secrets

- Variables finissant par `_KEY` **sans** préfixe `NEXT_PUBLIC_` / `EXPO_PUBLIC_` → **SECRET SERVEUR** → jamais committées
- Variables avec préfixe `NEXT_PUBLIC_` / `EXPO_PUBLIC_` → **PUBLIQUES** → exposées au navigateur/téléphone
- Les préfixes exposent les variables dans le bundle JS/Expo — utilisez-les uniquement pour des données publiques

## 3. Supabase — backend unique

### Créer le projet

1. Aller sur [supabase.com](https://supabase.com)
2. Cliquer sur "New project"
3. Choisir l'organisation, la région, le mot de passe DB
4. Attendre que le projet soit prêt (~2 minutes)

### Récupérer les credentials

1. Dans le dashboard Supabase, aller à **Settings → API**
2. Copier :
   - **Project URL** : `https://xxxxxx.supabase.co` → renseigner `SUPABASE_URL`
   - **Project API keys → anon public** → renseigner `SUPABASE_ANON_KEY`
   - **Project API keys → service_role** → renseigner `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secret)
3. Aller à **Settings → Database**
4. Copier le mot de passe DB → renseigner `SUPABASE_DB_PASSWORD` (⚠️ secret)
5. Copier le segment de l'URL (ex: `zcunsetanubonygjhxsd` de `https://zcunsetanubonygjhxsd.supabase.co`) → renseigner `SUPABASE_PROJECT_REF`

### Remplir `.env` à la racine

```bash
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_PROJECT_REF=xxxxxx
SUPABASE_DB_PASSWORD=votre_mot_de_passe_db
```

### Remplir `apps/mobile/.env`

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Remplir `apps/admin` (via `.env` racine, utilisé par Next.js)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Appliquer les migrations

Une fois les identifiants en place, appliquer les migrations Supabase :

```bash
npx supabase db push
```

Cela exécute tous les fichiers SQL dans `supabase/migrations/` sur votre projet Supabase.

## 4. Google OAuth

### Créer les credentials Google

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Sélectionner le projet (ou créer un nouveau)
3. Aller à **APIs & Services → Credentials**
4. Cliquer **Create Credentials → OAuth 2.0 Client ID**
5. Choisir **Web application**
6. Ajouter les **Authorized redirect URIs** :
   - Aller dans Supabase → **Authentication → Providers → Google** (avant d'activer)
   - Copier l'URL de callback Supabase fournie
   - La coller dans Google Cloud Console
7. Cliquer Create
8. Copier **Client ID** et **Client Secret**

### Configurer dans Supabase

1. Dans Supabase → **Authentication → Providers**
2. Activer **Google**
3. Coller les **Client ID** et **Client Secret**
4. Cliquer Save

### Remplir `.env` à la racine

```bash
GOOGLE_OAUTH_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxxxxxxxxxxx
```

### Note — Google Sign-In sur mobile

Ce **même client OAuth Web** alimente aussi la connexion Google de l'application mobile (`apps/mobile`), via le flux OAuth hébergé par Supabase (`supabase.auth.signInWithOAuth`). Il n'y a **pas besoin de créer un client Google Cloud iOS/Android séparé** ni d'ID client natif.

Une étape supplémentaire côté Supabase est requise pour le mobile : ajouter les **Redirect URLs** de l'app (`dakareaseu://` et l'URL proxy `exp://` d'Expo Go) dans **Authentication → URL Configuration**. Voir `apps/mobile/SETUP.md` section 5 pour le détail.

## 5. Expo / EAS — mobile

### Créer le compte et installer EAS CLI

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter
eas login
# → Saisir email/mot de passe Expo
```

### Initialiser le projet EAS

```bash
cd apps/mobile
eas init
```

Cela crée un `projectId` unique. Le CLI ajoute automatiquement une entrée dans `app.json` :

```json
{
  "expo": {
    "plugins": [...],
    "extra": {
      "eas": {
        "projectId": "00000000-0000-0000-0000-000000000000"
      }
    }
  }
}
```

### Récupérer le token Expo

1. Aller sur [expo.dev](https://expo.dev)
2. **Account Settings → Access Tokens**
3. Créer un token (ex: "CI Token")
4. Copier la valeur

### Remplir `.env` à la racine

```bash
EXPO_TOKEN=ExponentPushToken[...]
```

### Remplir `apps/mobile/.env`

```bash
EXPO_PUBLIC_EAS_PROJECT_ID=00000000-0000-0000-0000-000000000000
```

## 6. Vercel — admin (Next.js)

### Installer et lier le projet

```bash
npm install -g vercel

vercel login
# → Se connecter avec GitHub / Vercel account

cd apps/admin
vercel link
# → Suivre les instructions pour lier au projet Vercel
```

### Récupérer les IDs

1. Aller sur [vercel.com](https://vercel.com)
2. **Account Settings → Tokens**
   - Créer un token → copier → renseigner `VERCEL_TOKEN`
3. **Account Settings → General**
   - Copier l'**Account ID** (ou Team ID si en team) → renseigner `VERCEL_ORG_ID`
4. Dans le projet Admin → **Settings → General**
   - Copier l'**Project ID** → renseigner `VERCEL_PROJECT_ID`

### Remplir `.env` à la racine

```bash
VERCEL_TOKEN=<votre-token-Vercel>
VERCEL_ORG_ID=<Account-ID>
VERCEL_PROJECT_ID=<Project-ID>
```

## 7. GitHub Actions — configurer les secrets

Pour que les workflows CI/CD fonctionnent, ajouter les secrets à GitHub :

1. Aller sur **GitHub → Settings → Secrets and variables → Actions**
2. Cliquer **New repository secret**
3. Ajouter chaque secret :

| Secret                      | Valeur           | Source                           |
| --------------------------- | ---------------- | -------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Supabase Settings → API          |
| `SUPABASE_DB_PASSWORD`      | Mot de passe DB  | Supabase Settings → Database     |
| `VERCEL_TOKEN`              | Token            | Vercel Account Settings → Tokens |
| `VERCEL_ORG_ID`             | Account/Team ID  | Vercel Account Settings          |
| `VERCEL_PROJECT_ID`         | Project ID       | Vercel Project Settings          |
| `EXPO_TOKEN`                | Token            | expo.dev Account Settings        |

## 8. Lancer en local

### Mobile (Expo)

```bash
cd apps/mobile
npx expo start
```

Le serveur Expo démarre. Vous pouvez alors :

- **Scanner le QR code** avec l'app Expo Go (iOS/Android)
- **Simulateur iOS** : appuyer sur `i`
- **Simulateur Android** : appuyer sur `a` (nécessite Android Studio)

### Admin (Next.js)

```bash
cd apps/admin
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

### Lint et TypeCheck

```bash
# À la racine :
npm run lint
npm run typecheck
npm run test
npm run build
```

## 9. Tests & validation locale

### ESLint (tous les workspaces)

```bash
npm run lint
```

### TypeScript

```bash
npm run typecheck
```

### Tests (Jest)

```bash
npm run test
```

### Build de production

```bash
npm run build
```

## 10. Déploiement

### Admin → Vercel (automatique)

Tout push sur `main` touchant `apps/admin/**` déclenche automatiquement le workflow `.github/workflows/deploy-admin.yml`, qui :

1. Exécute `npm run lint`
2. Exécute `npm run typecheck`
3. Exécute `npm run test`
4. Déploie sur Vercel

### Mobile → EAS (manuel ou tag)

#### Déploiement manuel

```bash
# Dans .github/workflows → "Deploy Mobile (EAS)" → Run workflow
# Choisir le profil (preview, staging, production)
```

#### Déploiement automatique (tags)

Créer un tag et pousser :

```bash
git tag v1.0.0
git push origin v1.0.0
```

Cela déclenche le workflow `.github/workflows/deploy-mobile.yml`.

## 11. Architecture du projet — résumé

```
dakareaseu/
├── apps/
│   ├── admin/              # Next.js (App Router) — tableau de bord admin
│   └── mobile/             # Expo SDK 54 / React Native 0.81.5
├── packages/
│   └── shared/             # Constantes, schémas Zod, utilitaires transverses
├── supabase/
│   ├── migrations/         # SQL migrations (appliquées via `npx supabase db push`)
│   └── functions/          # Edge Functions Supabase (optionnel)
├── .github/
│   └── workflows/          # GitHub Actions (lint → typecheck → test → build → déployer)
├── .env.example            # Variables d'environnement (à copier en `.env`)
└── SETUP.md               # Ce guide
```

### Stack technique

- **Backend** : 100% Supabase (Auth, PostgreSQL, Storage, Realtime)
  - Aucun serveur custom ; tout est serverless
  - RLS (Row-Level Security) pour les permissions
  - Edge Functions pour logique spécifique

- **Frontend Admin** : Next.js 15 (App Router)
  - Hébergé sur Vercel
  - React 19, TypeScript
  - Supabase client JS pour la connexion et requêtes

- **Frontend Mobile** : Expo SDK 54
  - React Native 0.81.5
  - expo-router pour la navigation
  - Déployable via EAS Build

- **Shared** : TypeScript, Zod pour validation
  - Constantes (routes, types)
  - Schémas de validation
  - Utilitaires (formatage, conversions)

- **CI/CD** : GitHub Actions
  - Workflows pour lint, typecheck, tests, build
  - Déploiement admin automatique sur Vercel
  - Déploiement mobile manuel ou par tag

## 12. Troubleshooting

### "SUPABASE_URL not set"

→ Vérifier que `.env` existe à la racine et contient `SUPABASE_URL=...`

### "Can't find project ref"

→ Vérifier que `SUPABASE_PROJECT_REF` est rempli (segment d'URL : `xxxxxx` de `https://xxxxxx.supabase.co`)

### Expo start échoue avec erreur de certificat

```bash
# Réinstaller les dépendances Expo
cd apps/mobile
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

### Vercel deployment échoue

1. Vérifier que `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` sont dans GitHub Secrets
2. Relancer le workflow GitHub Actions manuellement
3. Vérifier les logs : GitHub → Actions → [workflow failed]

### "service_role key leaked"

→ Si exposé accidentellement, le régénérer dans Supabase Settings → API → Rotate

## 13. Prochaines étapes

1. ✅ Cloner et installer les dépendances
2. ✅ Configurer `.env` et `apps/mobile/.env`
3. ✅ Appliquer les migrations Supabase
4. ✅ Lancer en local (`npm run dev`, `npx expo start`)
5. ✅ Vérifier que l'authentification Google fonctionne
6. 🔗 Pousser sur le dépôt GitHub
7. 🚀 Attendre les workflows CI/CD
8. 📱 Déployer en staging puis production

---

**Questions ou problèmes ?** Consulter les logs GitHub Actions ou les documentations officielles :

- Supabase : [supabase.com/docs](https://supabase.com/docs)
- Expo : [docs.expo.dev](https://docs.expo.dev)
- Vercel : [vercel.com/docs](https://vercel.com/docs)
- Next.js : [nextjs.org/docs](https://nextjs.org/docs)
