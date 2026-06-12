# Philosophie de Développement

## Objectif

Nous développons un MVP mobile moderne avec React Native, Expo et Supabase. L'objectif n'est pas de construire une architecture enterprise, mais de construire **rapidement, proprement, de manière maintenable**, avec une excellente compatibilité IA et une montée en charge raisonnable.

Priorités : 1) simplicité, 2) lisibilité, 3) modularité, 4) vitesse de développement, 5) évolutivité progressive.

Refusé : sur-ingénierie, abstractions prématurées, couches inutiles, patterns complexes sans besoin métier réel.

---

## Principe fondamental — organisation par fonctionnalité

Le code s'organise **par fonctionnalité métier**, jamais par type technique.

Mauvais (par type technique — devient ingérable après quelques mois) :

```text
components/
hooks/
services/
screens/
utils/
```

Bon (par fonctionnalité — chaque feature possède tout ce dont elle a besoin) :

```text
features/
  auth/
  profile/
  documents/
  projects/
  settings/
```

---

## Architecture générale du repo

```text
apps/
├── mobile/
├── admin/

packages/
├── shared/
├── ui/
├── types/

supabase/
├── migrations/
├── seed/
├── functions/
```

## Mobile app — structure

```text
src/
├── app/
├── features/
├── shared/
├── services/
├── providers/
├── hooks/
├── constants/
├── lib/
└── types/
```

## Organisation d'une feature

```text
features/
└── documents/
    ├── components/
    ├── screens/
    ├── hooks/
    ├── services/
    ├── store/
    ├── schemas/
    ├── types/
    └── index.ts
```

**Règle de modularité** : une feature doit pouvoir être supprimée sans casser le reste du projet. Limiter les dépendances croisées.

## Shared

Uniquement ce qui est réellement mutualisé :

```text
shared/
├── components/
├── ui/
├── hooks/
├── utils/
├── constants/
└── types/
```

Règle : utilisé par une seule feature → reste dans la feature. Utilisé par plusieurs → va dans `shared`.

---

## Composants & écrans

- Composants : ~100 lignes idéalement, 200 max → au-delà, extraire des sous-composants.
- Écrans : très légers, ils **orchestrent** (Components + Hooks + Layout), ils ne contiennent pas la logique métier :

```tsx
// Mauvais
Screen
 ├── UI
 ├── API
 ├── Validation
 ├── State
 └── Business Logic

// Bon
Screen
 ├── Components
 ├── Hooks
 └── Layout
```

## Hooks

Toute logique réutilisable va dans un hook (`useCurrentUser`, `useProjects`, `useDocuments`, `useUploadMedia`, `useAuth`...). C'est la couche principale de logique côté front.

## Services

Uniquement : appels Supabase, appels API, upload, téléchargement. Pas de logique UI (`document.service.ts`, `auth.service.ts`, `storage.service.ts`).

## TanStack Query

Toutes les opérations serveur passent par `useQuery` / `useMutation`. Interdit : `useEffect(async () => {})`.

## Zustand

Uniquement pour : utilisateur connecté, préférences, état global transverse. Jamais les données serveur (qui appartiennent à TanStack Query).

---

## Supabase & base de données

Le mobile parle **directement** à Supabase — pas de couche intermédiaire. PostgreSQL est la source de vérité ; la logique métier critique vit dans les contraintes SQL, les policies RLS, et les fonctions SQL quand pertinent — pas uniquement dans le frontend.

## Sécurité

Toujours considérer le frontend comme compromis. Les protections vivent dans PostgreSQL / RLS / Edge Functions — jamais uniquement dans React Native.

## Dashboard Admin

Même philosophie, même découpage métier, même logique modulaire que le mobile :

```text
src/
├── app/
├── features/
├── shared/
├── providers/
├── lib/
└── types/
```

## Edge Functions

Créer une Edge Function uniquement si : une clé secrète est nécessaire, un webhook est nécessaire, ou un traitement serveur est obligatoire. Sinon, utiliser directement Supabase.

---

## Dette technique

Ne jamais optimiser avant d'avoir un problème réel. Ordre de priorité : 1) Faire fonctionner, 2) Faire propre, 3) Faire maintenable, 4) Faire performant. Jamais l'inverse.

## Règle finale

Avant chaque abstraction : _"Cette abstraction résout-elle un problème réel aujourd'hui ?"_ Si non → ne pas la créer. **Le meilleur code est souvent le code qui n'existe pas.**
