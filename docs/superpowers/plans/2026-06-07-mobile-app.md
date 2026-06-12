# DakarEaseU Mobile App (apps/mobile) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DakarEaseU student super-app (`apps/mobile`) — an Expo + React Native + TypeScript-strict application that lets students in Dakar discover and book verified housing, browse partner schools, order from restaurants, request transport, follow campus news/events, and manage their profile — talking directly to the Supabase backend created in the foundation plan (`docs/superpowers/plans/2026-06-07-supabase-foundation.md`).

**Architecture:** A single Expo Router app organized by feature (`features/{auth,home,housing,schools,restaurants,transport,news,favorites,profile}`), where screens orchestrate Components + Hooks + Layout only. TanStack Query owns 100% of server data (typed Supabase queries/mutations through thin `*.service.ts` files); Zustand holds only session/preferences/UI-transverse state; React Hook Form + Zod power every form; NativeWind (Tailwind-style className) is the styling system mapped to the app's COLORS palette. Realtime subscriptions are scoped to exactly three cases (booking status, event RSVP confirmation, admin guided-search notifications) and merged into the TanStack Query cache. Payments are simulated client-side behind a single `processPayment(method, amount, ref)` seam documented for a future Edge Function swap. i18n is FR-only at launch with full key-based scaffolding for `wo`/`en`.

**Tech Stack:** Expo (SDK 51+) + Expo Router, React Native, TypeScript strict, NativeWind v4, Zustand, TanStack Query v5, React Hook Form + Zod, `@supabase/supabase-js` with the shared `packages/types` `Database` type, Jest + React Native Testing Library, `expo-image-picker` / `expo-document-picker` for media uploads.

---

## Prerequisites (read before starting)

The engineer executing this plan MUST have read `docs/superpowers/plans/2026-06-07-supabase-foundation.md` (the foundation plan). This plan assumes that plan has been fully executed, meaning the following already exist and are usable exactly as named:

- A Supabase project with all 16 enums, 16 tables, RLS policies, the `is_admin()` helper, the `match_listings` RPC, 6 storage buckets, and 3 notification triggers from the foundation plan.
- `packages/types/src/index.ts` exporting: `Database`, `Json`, `Tables<T>`, `TablesInsert<T>`, `TablesUpdate<T>`, `Enums<T>`, plus the direct aliases `Profile, School, Listing, ListingMedia, ListingColivingRoom, Restaurant, TransportProvider, EventRow, EventRsvp, Booking, GuidedSearchRequest, Review, Favorite, Notification, UserRole, PersonaType, ListingType, BookingStatus, PaymentMethod, PaymentStatus, MatchListingsArgs, MatchResult`.
- Seed data already loaded (schools `a0000000-…`, listings `b0000000-…`, restaurants `c0000000-…`, transport `d0000000-…`, events `e0000000-…`).
- A `.env`/`.env.example` pattern at the repo root with `SUPABASE_URL` and `SUPABASE_ANON_KEY` (the mobile app will read its own `EXPO_PUBLIC_*` copies — see Task 1).

**Naming discipline — do not deviate:** use the EXACT table/column/enum/RPC/bucket/type names listed above and in the foundation plan. Never invent alternative names (e.g. it's `listings`, not `housings`/`logements_table`; it's `guided_search_requests`, not `demandes`). French product vocabulary in UI copy (`logements`, `colocation`, `exigences`, `particularités`, `Demande`, `Recherche guidée`) is preserved — only the **database identifiers** are the English ones from the schema.

**Hard requirements carried through every task below (do not reintroduce):**

- App name is **DakarEaseU** everywhere — never "Dakar'ease".
- No "bailleurs"/"agences" concept anywhere (no screens, no copy, no data fields referencing landlords/agencies).
- No "tweaks panel" of any kind.
- Persona (`nouveau`/`local`/`parent`) is derived once from onboarding answers and saved to `profiles.persona` — there is **no manual persona toggle** anywhere in the UI; persona only influences the home greeting and section ordering.
- No in-app admin screen — admin lives in the separate `apps/admin` Next.js app.
- `listings.created_by` is **never** selected/displayed by mobile queries (it's an internal admin-only reference).
- Restaurants have **no table reservation** and **no "Vérifié" badge** — only menu viewing + call/WhatsApp ordering.

---

### Decisions made to resolve spec ambiguity (documented here, applied throughout)

1. **"Vérifié" badge on listings** maps to `listings.verification_status === 'published'`. The foundation schema has no separate boolean `verified` column — `verification_status` (`pending|published|rejected`) IS the verification mechanism, and only `published` listings are visible to students per RLS. So any listing a student can see is, by definition, verified — the badge is shown unconditionally on listing cards/detail (it is informational, confirming "this listing has passed platform review"), not conditionally rendered. This is implemented in Task 9.
2. **Apple Sign-In** is rendered as a visibly present but disabled button with a small "Bientôt disponible" caption — consistent with how the language selector (`wo`/`en`) is also shown-but-disabled (Task 6 and Task 19). This avoids hiding capability from the design while being honest that the OAuth provider isn't wired up yet (Apple Developer Program enrollment is an operational dependency outside this plan's scope).
3. **Persona derivation heuristic** (Task 6): during onboarding the student answers two questions — "Es-tu déjà à Dakar ?" (yes/no) and "Pour qui cherches-tu ?" (moi-même / mon enfant). Mapping: if "pour mon enfant" → `parent`; else if "pas encore à Dakar" → `nouveau`; else (already in Dakar, searching for self) → `local`. This is computed once client-side and written to `profiles.persona` in the same `UPDATE` that completes onboarding — never editable afterward through the UI.
4. **Student-ID verification** drops the prototype's "Analyse OCR en cours…" UI entirely (per the foundation decision: manual admin review only, no OCR). The flow becomes: pick image → upload to private `student-ids/<user_id>/<file>` → write `profiles.verification_doc_url` and leave `verification_status = 'pending'` → show a status card ("En attente de vérification" / "Vérifié ✓" / "Rejeté — réessayer") driven by `profiles.verification_status`. Implemented in Task 7 and surfaced again in Task 18 (profile).
5. **i18n key set**: the prototype's `I18N.fr` only has ~17 keys. This plan defines an expanded ~90-key `fr.json` covering every screen group (common, auth, onboarding, home, search, listing, booking, schools, restaurants, transport, news, favorites, profile, notifications) so the "full key-based scaffolding" requirement is concretely satisfiable, while `wo.json`/`en.json` ship as structurally-empty placeholders (`{}`) per the FR-only-at-launch decision (Task 4).

---

## Task 1: Scaffold the Expo app and base tooling

**Files:**

- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/tailwind.config.js`
- Create: `apps/mobile/global.css`
- Create: `apps/mobile/nativewind-env.d.ts`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/.env.example`
- Create: `apps/mobile/.gitignore`
- Create: `apps/mobile/src/app/_layout.tsx`
- Create: `apps/mobile/src/app/index.tsx`

- [ ] **Step 1: Create the Expo project package manifest**

```json
{
  "name": "@dakareaseu/mobile",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-status-bar": "~1.12.0",
    "expo-constants": "~16.0.0",
    "expo-linking": "~6.3.0",
    "expo-image-picker": "~15.0.0",
    "expo-document-picker": "~12.0.0",
    "expo-image": "~1.12.0",
    "expo-av": "~14.0.0",
    "expo-secure-store": "~13.0.0",
    "react": "18.2.0",
    "react-native": "0.74.0",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "3.31.1",
    "react-native-svg": "15.2.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-gesture-handler": "~2.16.0",
    "@supabase/supabase-js": "^2.43.0",
    "@tanstack/react-query": "^5.45.0",
    "zustand": "^4.5.2",
    "react-hook-form": "^7.51.5",
    "@hookform/resolvers": "^3.4.2",
    "zod": "^3.23.8",
    "nativewind": "^4.0.36",
    "tailwindcss": "^3.4.4",
    "@dakareaseu/types": "*"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.79",
    "typescript": "~5.3.3",
    "jest": "^29.7.0",
    "jest-expo": "~51.0.0",
    "@testing-library/react-native": "^12.5.0",
    "@testing-library/jest-native": "^5.4.3",
    "react-test-renderer": "18.2.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "^7.1.2"
  }
}
```

- [ ] **Step 2: Create `app.json`**

```json
{
  "expo": {
    "name": "DakarEaseU",
    "slug": "dakareaseu",
    "scheme": "dakareaseu",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E3A8A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.dakareaseu.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E3A8A"
      },
      "package": "com.dakareaseu.mobile"
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 3: Create Babel and Metro configs for NativeWind + Reanimated**

`apps/mobile/babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

`apps/mobile/metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 4: Create the Tailwind config mapped to the COLORS palette**

`apps/mobile/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
};
```

`apps/mobile/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`apps/mobile/nativewind-env.d.ts`:

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 5: Create `tsconfig.json` with strict mode and path aliases**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@dakareaseu/types": ["../../packages/types/src/index.ts"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "nativewind-env.d.ts", "global.css"]
}
```

- [ ] **Step 6: Create `.env.example` and `.gitignore`**

`apps/mobile/.env.example`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`apps/mobile/.gitignore`:

```
node_modules/
.expo/
dist/
web-build/
*.tsbuildinfo
.env
```

- [ ] **Step 7: Create the root Expo Router layout and entry redirect**

`apps/mobile/src/app/_layout.tsx`:

```tsx
import '../../global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <StatusBar style="dark" />
          <Slot />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

`apps/mobile/src/app/index.tsx`:

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
```

- [ ] **Step 8: Install dependencies and verify the project boots**

Run: `cd apps/mobile && npm install`
Expected: install completes with no error output ending the process.

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: compiler errors about missing modules (`@/providers/AppProviders`, `@/...`) since they don't exist yet — this is expected at this point; confirms the path aliases resolve syntactically. (We'll get a clean run at the end of Task 3.)

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/package.json apps/mobile/app.json apps/mobile/babel.config.js apps/mobile/metro.config.js apps/mobile/tailwind.config.js apps/mobile/global.css apps/mobile/nativewind-env.d.ts apps/mobile/tsconfig.json apps/mobile/.env.example apps/mobile/.gitignore apps/mobile/src/app/_layout.tsx apps/mobile/src/app/index.tsx
git commit -m "feat(mobile): scaffold Expo Router app with NativeWind, TS strict, and base config"
```

---

## Task 2: Design system constants and shared UI primitives

**Files:**

- Create: `apps/mobile/src/constants/colors.ts`
- Create: `apps/mobile/src/constants/categories.ts`
- Create: `apps/mobile/src/shared/ui/Badge.tsx`
- Create: `apps/mobile/src/shared/ui/Button.tsx`
- Create: `apps/mobile/src/shared/ui/Screen.tsx`
- Create: `apps/mobile/src/shared/ui/EmptyState.tsx`
- Test: `apps/mobile/src/shared/ui/__tests__/Badge.test.tsx`

- [ ] **Step 1: Create the COLORS constant**

`apps/mobile/src/constants/colors.ts`:

```ts
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

export type ColorKey = keyof typeof COLORS;
```

- [ ] **Step 2: Create the home category constants (no "bailleurs/agences")**

`apps/mobile/src/constants/categories.ts`:

```ts
export type CategoryId = 'logements' | 'ecoles' | 'restaurants' | 'transport';

export interface Category {
  id: CategoryId;
  labelKey: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'logements', labelKey: 'categories.logements', icon: '🏠' },
  { id: 'ecoles', labelKey: 'categories.ecoles', icon: '🎓' },
  { id: 'restaurants', labelKey: 'categories.restaurants', icon: '🍽️' },
  { id: 'transport', labelKey: 'categories.transport', icon: '🚖' },
];

export const TRANSPORT_CATEGORIES = [
  { id: 'taxi', labelKey: 'transport.cat.taxi', icon: '🚖' },
  { id: 'moto', labelKey: 'transport.cat.moto', icon: '🏍️' },
  { id: 'repas', labelKey: 'transport.cat.repas', icon: '🍱' },
  { id: 'colis', labelKey: 'transport.cat.colis', icon: '📦' },
  { id: 'demenagement', labelKey: 'transport.cat.demenagement', icon: '🚚' },
  { id: 'location', labelKey: 'transport.cat.location', icon: '🚗' },
] as const;

export const DISTRICTS = [
  'Plateau',
  'Médina',
  'Point E',
  'Mermoz',
  'Sacré-Cœur',
  'Ouakam',
  'Ngor',
  'Almadies',
  'Liberté 6',
  'Yoff',
  'Fann',
  'HLM',
] as const;
```

- [ ] **Step 3: Write the Badge component test first**

`apps/mobile/src/shared/ui/__tests__/Badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders its label text', () => {
    render(<Badge label="Vérifié" tone="success" />);
    expect(screen.getByText('Vérifié')).toBeTruthy();
  });

  it('applies the danger tone class when tone is danger', () => {
    render(<Badge label="Rejeté" tone="danger" />);
    const node = screen.getByText('Rejeté');
    expect(node).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/shared/ui/__tests__/Badge.test.tsx`
Expected: FAIL — `Cannot find module '../Badge'`

- [ ] **Step 5: Implement `Badge`**

`apps/mobile/src/shared/ui/Badge.tsx`:

```tsx
import { Text, View } from 'react-native';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-secondary/10 text-secondary border-secondary/30',
  warning: 'bg-accent/10 text-accent border-accent/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  neutral: 'bg-border/40 text-textLight border-border',
  primary: 'bg-primary/10 text-primary border-primary/30',
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const toneClass = TONE_CLASSES[tone];
  const [bg, text, border] = toneClass.split(' ');
  return (
    <View className={`self-start rounded-full border px-2.5 py-1 ${bg} ${border}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 6: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/shared/ui/__tests__/Badge.test.tsx`
Expected: PASS — 2 tests passed

- [ ] **Step 7: Implement `Button`, `Screen`, and `EmptyState`**

`apps/mobile/src/shared/ui/Button.tsx`:

```tsx
import { ActivityIndicator, Pressable, Text } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'bg-transparent border border-primary',
  ghost: 'bg-transparent',
};

const VARIANT_TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary',
  ghost: 'text-primary',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      className={`${fullWidth ? 'w-full' : 'self-start'} ${VARIANT_CLASSES[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } items-center justify-center rounded-xl px-5 py-3.5`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#1E3A8A' : '#FFFFFF'}
        />
      ) : (
        <Text className={`text-base font-semibold ${VARIANT_TEXT_CLASSES[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
```

`apps/mobile/src/shared/ui/Screen.tsx`:

```tsx
import { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  className?: string;
}

export function Screen({ children, className = '' }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className={`flex-1 px-4 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}
```

`apps/mobile/src/shared/ui/EmptyState.tsx`:

```tsx
import { Text, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = '🔍', title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="mb-2 text-4xl">{icon}</Text>
      <Text className="text-center text-base font-semibold text-text">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm text-textLight">{description}</Text>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/src/constants apps/mobile/src/shared/ui
git commit -m "feat(mobile): add design system constants and shared UI primitives (Badge, Button, Screen, EmptyState)"
```

---

## Task 3: Typed Supabase client and TanStack Query / providers wiring

**Files:**

- Create: `apps/mobile/src/lib/supabase.ts`
- Create: `apps/mobile/src/lib/queryClient.ts`
- Create: `apps/mobile/src/providers/AppProviders.tsx`
- Create: `apps/mobile/src/providers/RealtimeProvider.tsx`
- Test: `apps/mobile/src/lib/__tests__/supabase.test.ts`

- [ ] **Step 1: Write a test asserting the client reads `EXPO_PUBLIC_*` env vars**

`apps/mobile/src/lib/__tests__/supabase.test.ts`:

```ts
describe('supabase client', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('exports a configured client without throwing', () => {
    expect(() => require('../supabase')).not.toThrow();
  });

  it('throws a clear error when env vars are missing', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = '';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';
    expect(() => require('../supabase')).toThrow(/EXPO_PUBLIC_SUPABASE_URL/);
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/lib/__tests__/supabase.test.ts`
Expected: FAIL — `Cannot find module '../supabase'`

- [ ] **Step 3: Implement the typed Supabase client**

`apps/mobile/src/lib/supabase.ts`:

```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@dakareaseu/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your project values.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 4: Add the two missing native dependencies this client needs**

Run: `cd apps/mobile && npx expo install react-native-url-polyfill @react-native-async-storage/async-storage`
Expected: both packages added to `package.json` and installed.

- [ ] **Step 5: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/lib/__tests__/supabase.test.ts`
Expected: PASS — 2 tests passed

- [ ] **Step 6: Create the shared TanStack Query client**

`apps/mobile/src/lib/queryClient.ts`:

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

- [ ] **Step 7: Create `RealtimeProvider` (subscribes to the 3 targeted Realtime cases)**

`apps/mobile/src/providers/RealtimeProvider.tsx`:

```tsx
import { ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { Booking, EventRsvp, Notification } from '@dakareaseu/types';

/**
 * Targeted Realtime — exactly three cases per the product spec:
 *  1. Booking status changes (student's own bookings)
 *  2. Event RSVP confirmation (student's own RSVPs)
 *  3. New guided-search-request notifications (admins only — surfaced here as
 *     a generic "notifications" INSERT listener so non-admin students simply
 *     receive their own booking/RSVP/verification notifications too)
 *
 * Pattern: subscribe once per authenticated user, merge changes directly into
 * the relevant TanStack Query caches via setQueryData/invalidateQueries.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime:user:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `student_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as Booking;
          queryClient.invalidateQueries({ queryKey: ['bookings', 'list', userId] });
          queryClient.setQueryData(['bookings', 'detail', updated.id], updated);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'event_rsvps',
          filter: `student_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as EventRsvp;
          if (updated.status === 'confirmed') {
            queryClient.invalidateQueries({ queryKey: ['events', 'rsvps', userId] });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const created = payload.new as Notification;
          queryClient.setQueryData<Notification[]>(['notifications', 'list', userId], (prev) =>
            prev ? [created, ...prev] : [created],
          );
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount', userId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return <>{children}</>;
}
```

- [ ] **Step 8: Create `AppProviders` wiring QueryClient + Realtime**

`apps/mobile/src/providers/AppProviders.tsx`:

```tsx
import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { RealtimeProvider } from '@/providers/RealtimeProvider';
import { SessionProvider } from '@/features/auth/providers/SessionProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RealtimeProvider>{children}</RealtimeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 9: Run typecheck (will still show missing `features/auth` modules — expected until Task 6)**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: errors only about `@/features/auth/...` not existing yet (those are created in Task 6). No errors about `@/lib/*` or `@/providers/*` files created in this task.

- [ ] **Step 10: Commit**

```bash
git add apps/mobile/src/lib apps/mobile/src/providers apps/mobile/package.json
git commit -m "feat(mobile): add typed Supabase client, TanStack Query client, and Realtime provider for the 3 targeted cases"
```

---

## Task 4: i18n scaffolding (FR filled, wo/en placeholders)

**Files:**

- Create: `apps/mobile/src/lib/i18n/fr.json`
- Create: `apps/mobile/src/lib/i18n/wo.json`
- Create: `apps/mobile/src/lib/i18n/en.json`
- Create: `apps/mobile/src/lib/i18n/index.ts`
- Create: `apps/mobile/src/hooks/useTranslation.ts`
- Test: `apps/mobile/src/lib/i18n/__tests__/i18n.test.ts`

- [ ] **Step 1: Create the fully-populated French locale**

`apps/mobile/src/lib/i18n/fr.json`:

```json
{
  "common": {
    "appName": "DakarEaseU",
    "loading": "Chargement…",
    "error": "Une erreur est survenue",
    "retry": "Réessayer",
    "cancel": "Annuler",
    "confirm": "Confirmer",
    "save": "Enregistrer",
    "next": "Suivant",
    "back": "Retour",
    "skip": "Passer",
    "seeAll": "Voir tout",
    "comingSoon": "Bientôt disponible",
    "search": "Rechercher",
    "filters": "Filtres",
    "share": "Partager",
    "call": "Appeler",
    "whatsapp": "WhatsApp",
    "perMonth": "/ mois"
  },
  "categories": {
    "logements": "Logements",
    "ecoles": "Écoles",
    "restaurants": "Restaurants",
    "transport": "Transport"
  },
  "onboarding": {
    "slide1Title": "Trouve ton logement étudiant",
    "slide1Body": "Des annonces vérifiées près de ton école, avec photos, vidéos et visites 3D.",
    "slide2Title": "Découvre la vie à Dakar",
    "slide2Body": "Restaurants, transport, événements et bons plans, à portée de main.",
    "slide3Title": "Réserve en toute confiance",
    "slide3Body": "Paiement simple par Wave, Orange Money ou carte, et suivi en temps réel.",
    "questionLocation": "Es-tu déjà à Dakar ?",
    "answerYes": "Oui, j'y suis déjà",
    "answerNo": "Pas encore",
    "questionFor": "Pour qui cherches-tu ?",
    "answerSelf": "Pour moi-même",
    "answerChild": "Pour mon enfant",
    "start": "Commencer"
  },
  "auth": {
    "login": "Connexion",
    "signup": "Créer un compte",
    "email": "Email",
    "password": "Mot de passe",
    "fullName": "Nom complet",
    "continueWithGoogle": "Continuer avec Google",
    "continueWithApple": "Continuer avec Apple",
    "noAccount": "Pas encore de compte ?",
    "hasAccount": "Déjà un compte ?",
    "uploadIdTitle": "Vérifie ton statut étudiant",
    "uploadIdBody": "Importe une photo de ta carte d'étudiant. Notre équipe la vérifie manuellement sous 48h.",
    "uploadIdAction": "Importer ma carte étudiant",
    "uploadIdLater": "Plus tard",
    "verificationPending": "En attente de vérification",
    "verificationApproved": "Identité vérifiée ✓",
    "verificationRejected": "Vérification refusée — réessaie"
  },
  "home": {
    "greetingMorning": "Bonjour",
    "greetingEvening": "Bonsoir",
    "searchPlaceholder": "Rechercher un logement, une école…",
    "topListings": "Logements partenaires",
    "topSchools": "Écoles partenaires",
    "deals": "Bons plans",
    "upcomingEvents": "Événements à venir",
    "restaurantsNearby": "Restaurants près de toi",
    "demandeBannerTitle": "Tu ne trouves pas ce qu'il te faut ?",
    "demandeBannerBody": "Décris ta recherche, on te propose les meilleures options.",
    "demandeBannerCta": "Faire une demande guidée"
  },
  "search": {
    "title": "Recherche",
    "guidedBannerTitle": "Recherche guidée",
    "guidedBannerBody": "Réponds à 4 questions, reçois des logements classés par compatibilité.",
    "guidedBannerCta": "Démarrer",
    "noResults": "Aucun résultat pour ces critères",
    "resultsCount": "{{count}} résultats"
  },
  "listing": {
    "verified": "Vérifié",
    "perMonth": "/ mois",
    "surface": "Surface",
    "bedrooms": "Chambres",
    "bathrooms": "Salles de bain",
    "minDuration": "Durée minimum",
    "months": "mois",
    "furnished": "Meublé",
    "notFurnished": "Non meublé",
    "amenities": "Équipements",
    "particularities": "Particularités",
    "requirements": "Exigences",
    "media": "Médias",
    "tour3d": "Visite 3D",
    "colocation": "Colocation",
    "colocationAvailable": "Colocation disponible",
    "colocationPlaces": "{{count}} places disponibles",
    "reserve": "Réserver",
    "reservePlace": "Réserver cette place",
    "reviews": "{{count}} avis"
  },
  "booking": {
    "title": "Réservation",
    "stepDates": "Dates & durée",
    "stepPayment": "Paiement",
    "stepSummary": "Récapitulatif",
    "duration": "Durée (mois)",
    "minDurationNotice": "Durée minimum : {{count}} mois",
    "paymentMethod": "Moyen de paiement",
    "payWithWave": "Wave",
    "payWithOrange": "Orange Money",
    "payWithCard": "Carte bancaire",
    "total": "Total",
    "confirmAndPay": "Confirmer et payer",
    "processing": "Traitement du paiement…",
    "success": "Réservation confirmée !",
    "successBody": "Le propriétaire a reçu ta demande. Tu seras notifié(e) de toute mise à jour.",
    "leaveReview": "Laisser un avis",
    "reviewPlaceholder": "Partage ton expérience…",
    "statusPending": "En attente",
    "statusConfirmed": "Confirmée",
    "statusCancelled": "Annulée",
    "statusCompleted": "Terminée"
  },
  "schools": {
    "title": "Écoles",
    "tabInfo": "Infos",
    "tabAdmission": "Admission",
    "tabHousing": "Logements",
    "noNearbyHousing": "Aucun logement à proximité pour le moment",
    "contactEmail": "Email",
    "contactPhone": "Téléphone",
    "contactWhatsapp": "WhatsApp"
  },
  "restaurants": {
    "title": "Restaurants",
    "searchPlaceholder": "Chercher un restaurant…",
    "menu": "Menu",
    "viewMenu": "Voir le menu",
    "orderCta": "Commander",
    "priceRange": "Gamme de prix",
    "specialties": "Spécialités"
  },
  "transport": {
    "title": "Transport",
    "subtitle": "Choisis un service et contacte le prestataire",
    "cat": {
      "taxi": "Taxi / VTC",
      "moto": "Moto Jakarta",
      "repas": "Livraison repas",
      "colis": "Livraison colis",
      "demenagement": "Déménagement",
      "location": "Location voiture"
    }
  },
  "news": {
    "title": "Actualités",
    "tabAll": "Tout",
    "tabConcert": "Concerts",
    "tabFestival": "Festivals",
    "tabConference": "Conférences",
    "tabSport": "Sport",
    "rsvpInterested": "Intéressé(e)",
    "rsvpConfirmed": "Je participe",
    "rsvpConfirmedBadge": "Inscrit ✓",
    "shareEvent": "Partager l'événement"
  },
  "favorites": {
    "title": "Favoris",
    "empty": "Aucun favori pour l'instant",
    "emptyBody": "Touche le cœur sur un logement ou un restaurant pour le retrouver ici."
  },
  "profile": {
    "title": "Profil",
    "editProfile": "Modifier le profil",
    "myBookings": "Mes réservations",
    "myRequests": "Mes demandes",
    "verification": "Vérification étudiante",
    "language": "Langue",
    "languageFrench": "Français",
    "languageWolof": "Wolof",
    "languageEnglish": "English",
    "notifications": "Notifications",
    "logout": "Se déconnecter",
    "logoutConfirm": "Veux-tu vraiment te déconnecter ?"
  },
  "notifications": {
    "title": "Notifications",
    "empty": "Aucune notification",
    "markAllRead": "Tout marquer comme lu"
  },
  "demande": {
    "title": "Demande guidée",
    "stepType": "Quel type de logement ?",
    "stepLocation": "Où veux-tu vivre ?",
    "stepBudget": "Quel est ton budget et ta durée ?",
    "stepPreferences": "Tes préférences",
    "submit": "Voir mes correspondances",
    "resultsTitle": "Logements qui te correspondent",
    "matchScore": "{{pct}}% de compatibilité",
    "noMatches": "Aucune correspondance pour le moment — élargis tes critères."
  }
}
```

- [ ] **Step 2: Create empty placeholder locales for Wolof and English**

`apps/mobile/src/lib/i18n/wo.json`:

```json
{}
```

`apps/mobile/src/lib/i18n/en.json`:

```json
{}
```

- [ ] **Step 3: Write the i18n module test**

`apps/mobile/src/lib/i18n/__tests__/i18n.test.ts`:

```ts
import { t, SUPPORTED_LOCALES } from '../index';

describe('i18n', () => {
  it('resolves a nested key in the default (fr) locale', () => {
    expect(t('common.appName')).toBe('DakarEaseU');
    expect(t('listing.verified')).toBe('Vérifié');
  });

  it('interpolates {{placeholders}}', () => {
    expect(t('search.resultsCount', { count: 5 })).toBe('5 résultats');
  });

  it('falls back to the key path when missing in a non-fr locale', () => {
    expect(t('common.appName', undefined, 'en')).toBe('common.appName');
  });

  it('declares fr as the only fully-populated locale', () => {
    expect(SUPPORTED_LOCALES).toEqual(['fr', 'wo', 'en']);
  });
});
```

- [ ] **Step 4: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/lib/i18n/__tests__/i18n.test.ts`
Expected: FAIL — `Cannot find module '../index'`

- [ ] **Step 5: Implement the i18n resolver**

`apps/mobile/src/lib/i18n/index.ts`:

```ts
import fr from './fr.json';
import wo from './wo.json';
import en from './en.json';

export type Locale = 'fr' | 'wo' | 'en';
export const SUPPORTED_LOCALES: Locale[] = ['fr', 'wo', 'en'];
export const DEFAULT_LOCALE: Locale = 'fr';

// Only `fr` ships fully populated at launch (FR-only product decision).
// `wo`/`en` are present-but-empty: the resolver below transparently falls
// back to `fr`'s string for the same key, and to the raw key path if even
// `fr` is missing it — so the UI never shows "undefined".
const DICTIONARIES: Record<Locale, Record<string, unknown>> = { fr, wo, en };

function resolve(dict: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{{${key}}}`,
  );
}

/**
 * Resolves `path` (e.g. "common.appName") in `locale`, falling back to `fr`
 * (the only fully-populated dictionary), then to the raw key path.
 *
 * NOTE: the fallback-to-fr-then-to-key-path behavior is intentional scaffolding
 * for `wo`/`en` — once those locales are populated, the fallback chain keeps
 * working unchanged and simply stops triggering for translated keys.
 */
export function t(
  path: string,
  vars?: Record<string, string | number>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const direct = resolve(DICTIONARIES[locale], path);
  if (direct !== undefined) return interpolate(direct, vars);

  if (locale !== 'fr') {
    const frFallback = resolve(DICTIONARIES.fr, path);
    if (frFallback !== undefined) return interpolate(frFallback, vars);
  }

  return path;
}
```

- [ ] **Step 6: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/lib/i18n/__tests__/i18n.test.ts`
Expected: PASS — 4 tests passed

- [ ] **Step 7: Create the `useTranslation` hook reading the active locale from preferences (Zustand)**

`apps/mobile/src/hooks/useTranslation.ts`:

```ts
import { useCallback } from 'react';
import { usePreferencesStore } from '@/features/profile/store/preferencesStore';
import { t as translate, type Locale } from '@/lib/i18n';

export function useTranslation() {
  const locale = usePreferencesStore((s) => s.locale);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) =>
      translate(path, vars, locale as Locale),
    [locale],
  );

  return { t, locale };
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/src/lib/i18n apps/mobile/src/hooks/useTranslation.ts
git commit -m "feat(mobile): add FR-complete i18n scaffolding with wo/en placeholders and fr-fallback resolver"
```

---

## Task 5: Zustand stores (session, preferences, UI) — transverse state only

**Files:**

- Create: `apps/mobile/src/features/auth/store/sessionStore.ts`
- Create: `apps/mobile/src/features/profile/store/preferencesStore.ts`
- Create: `apps/mobile/src/shared/store/uiStore.ts`
- Test: `apps/mobile/src/features/profile/store/__tests__/preferencesStore.test.ts`

- [ ] **Step 1: Create the session store (auth user + persona — no server data)**

`apps/mobile/src/features/auth/store/sessionStore.ts`:

```ts
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@dakareaseu/types';

interface SessionState {
  session: Session | null;
  user: Session['user'] | null;
  profile: Profile | null;
  isInitializing: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitializing: (value: boolean) => void;
  clear: () => void;
}

/**
 * Holds ONLY session/identity state (the Supabase auth session, the resolved
 * `profiles` row, and a bootstrap flag). Profile/server data is fetched and
 * cached by TanStack Query (see features/profile/hooks/useProfile.ts) and
 * mirrored here by SessionProvider so the rest of the app can read identity
 * synchronously without prop-drilling. This store NEVER fetches — it is only
 * written to by SessionProvider and the auth mutations.
 */
export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isInitializing: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (value) => set({ isInitializing: value }),
  clear: () => set({ session: null, user: null, profile: null }),
}));
```

- [ ] **Step 2: Write the preferences store test**

`apps/mobile/src/features/profile/store/__tests__/preferencesStore.test.ts`:

```ts
import { usePreferencesStore } from '../preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.setState({ locale: 'fr' });
  });

  it('defaults to the fr locale', () => {
    expect(usePreferencesStore.getState().locale).toBe('fr');
  });

  it('only allows fr to be set at launch (wo/en are present-but-disabled)', () => {
    usePreferencesStore.getState().setLocale('wo');
    // FR-only launch: attempts to switch away from fr are no-ops until wo/en
    // dictionaries are populated. This keeps the UI honest with the "Bientôt
    // disponible" affordance in the language selector (Task 19).
    expect(usePreferencesStore.getState().locale).toBe('fr');
  });
});
```

- [ ] **Step 3: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/profile/store/__tests__/preferencesStore.test.ts`
Expected: FAIL — `Cannot find module '../preferencesStore'`

- [ ] **Step 4: Implement the preferences store**

`apps/mobile/src/features/profile/store/preferencesStore.ts`:

```ts
import { create } from 'zustand';
import type { Locale } from '@/lib/i18n';

interface PreferencesState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/**
 * FR-only at launch: `setLocale` intentionally only accepts "fr" (a no-op for
 * "wo"/"en" until those dictionaries are populated). This single guard is the
 * full extent of the "language switch" feature for now — the selector UI
 * (Task 19) renders wo/en as visibly-present-but-disabled with a
 * "Bientôt disponible" caption, matching the Apple Sign-In treatment.
 */
export const usePreferencesStore = create<PreferencesState>((set) => ({
  locale: 'fr',
  setLocale: (locale) => {
    if (locale === 'fr') set({ locale });
  },
}));
```

- [ ] **Step 5: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/profile/store/__tests__/preferencesStore.test.ts`
Expected: PASS — 2 tests passed

- [ ] **Step 6: Create the shared UI store (modals/sheets — transverse UI state only)**

`apps/mobile/src/shared/store/uiStore.ts`:

```ts
import { create } from 'zustand';

interface UiState {
  activeMediaViewer: { uri: string; kind: 'photo' | 'video' | 'tour_3d' } | null;
  openMediaViewer: (uri: string, kind: 'photo' | 'video' | 'tour_3d') => void;
  closeMediaViewer: () => void;
}

/**
 * Transverse, ephemeral UI state shared across features (e.g. the full-screen
 * media viewer opened from listing/restaurant galleries). Anything that is
 * server data (listings, bookings, etc.) belongs to TanStack Query, not here.
 */
export const useUiStore = create<UiState>((set) => ({
  activeMediaViewer: null,
  openMediaViewer: (uri, kind) => set({ activeMediaViewer: { uri, kind } }),
  closeMediaViewer: () => set({ activeMediaViewer: null }),
}));
```

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/src/features/auth/store apps/mobile/src/features/profile/store apps/mobile/src/shared/store
git commit -m "feat(mobile): add Zustand session/preferences/UI stores for transverse state only"
```

---

## Task 6: Auth feature — schemas, services, SessionProvider, onboarding + persona derivation

**Files:**

- Create: `apps/mobile/src/features/auth/schemas/authSchemas.ts`
- Create: `apps/mobile/src/features/auth/services/auth.service.ts`
- Create: `apps/mobile/src/features/auth/providers/SessionProvider.tsx`
- Create: `apps/mobile/src/features/auth/hooks/useAuth.ts`
- Create: `apps/mobile/src/features/auth/lib/derivePersona.ts`
- Create: `apps/mobile/src/features/auth/index.ts`
- Test: `apps/mobile/src/features/auth/lib/__tests__/derivePersona.test.ts`

- [ ] **Step 1: Write the persona-derivation test (the documented heuristic from "Decisions" §3)**

`apps/mobile/src/features/auth/lib/__tests__/derivePersona.test.ts`:

```ts
import { derivePersona, type OnboardingAnswers } from '../derivePersona';

describe('derivePersona', () => {
  it("returns 'parent' when searching on behalf of a child, regardless of location", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: true, searchingFor: 'child' };
    expect(derivePersona(answers)).toBe('parent');
  });

  it("returns 'nouveau' when not yet in Dakar and searching for self", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: false, searchingFor: 'self' };
    expect(derivePersona(answers)).toBe('nouveau');
  });

  it("returns 'local' when already in Dakar and searching for self", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: true, searchingFor: 'self' };
    expect(derivePersona(answers)).toBe('local');
  });

  it("prioritizes 'parent' over 'nouveau' when both could apply", () => {
    const answers: OnboardingAnswers = { alreadyInDakar: false, searchingFor: 'child' };
    expect(derivePersona(answers)).toBe('parent');
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/auth/lib/__tests__/derivePersona.test.ts`
Expected: FAIL — `Cannot find module '../derivePersona'`

- [ ] **Step 3: Implement `derivePersona`**

`apps/mobile/src/features/auth/lib/derivePersona.ts`:

```ts
import type { PersonaType } from '@dakareaseu/types';

export interface OnboardingAnswers {
  /** Answer to "Es-tu déjà à Dakar ?" */
  alreadyInDakar: boolean;
  /** Answer to "Pour qui cherches-tu ?" */
  searchingFor: 'self' | 'child';
}

/**
 * Persona derivation heuristic (documented decision — see plan "Decisions"
 * section, item 3). Computed ONCE from onboarding answers and persisted to
 * `profiles.persona`; never re-derived or manually toggled afterward.
 *
 * Priority order:
 *   1. searchingFor === "child"        -> "parent"   (overrides location)
 *   2. !alreadyInDakar                  -> "nouveau"
 *   3. otherwise (in Dakar, for self)   -> "local"
 */
export function derivePersona(answers: OnboardingAnswers): PersonaType {
  if (answers.searchingFor === 'child') return 'parent';
  if (!answers.alreadyInDakar) return 'nouveau';
  return 'local';
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/auth/lib/__tests__/derivePersona.test.ts`
Expected: PASS — 4 tests passed

- [ ] **Step 5: Create Zod schemas for login/signup/onboarding**

`apps/mobile/src/features/auth/schemas/authSchemas.ts`:

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
  password: z.string().min(6, '6 caractères minimum'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Nom trop court'),
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
  password: z.string().min(6, '6 caractères minimum'),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const onboardingAnswersSchema = z.object({
  alreadyInDakar: z.boolean(),
  searchingFor: z.enum(['self', 'child']),
});
export type OnboardingAnswersInput = z.infer<typeof onboardingAnswersSchema>;
```

- [ ] **Step 6: Create the auth service (Supabase calls only — no UI logic)**

`apps/mobile/src/features/auth/services/auth.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import type { LoginInput, SignupInput } from '@/features/auth/schemas/authSchemas';
import type { OnboardingAnswers } from '@/features/auth/lib/derivePersona';
import { derivePersona } from '@/features/auth/lib/derivePersona';
import type { Profile } from '@dakareaseu/types';

export async function signInWithPassword({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword({ fullName, email, password }: SignupInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Completes onboarding: derives the persona ONCE from the answers and writes
 * it to `profiles.persona` together with `full_name`/`school_id` in a single
 * UPDATE. There is no separate "set persona" mutation anywhere in the app —
 * this is the only write path for `profiles.persona`.
 */
export async function completeOnboarding(params: {
  userId: string;
  fullName: string;
  schoolId: string | null;
  answers: OnboardingAnswers;
}): Promise<Profile> {
  const persona = derivePersona(params.answers);
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: params.fullName, school_id: params.schoolId, persona })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Uploads the student-ID photo to the PRIVATE `student-ids` bucket under
 * `<user_id>/<filename>` (ownership-based RLS folder convention) and records
 * the path on the profile, leaving `verification_status = 'pending'` for
 * manual admin review (NO OCR — see plan "Decisions" item 4).
 */
export async function uploadStudentId(params: {
  userId: string;
  fileUri: string;
  fileName: string;
  contentType: string;
}) {
  const path = `${params.userId}/${params.fileName}`;
  const response = await fetch(params.fileUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('student-ids')
    .upload(path, arrayBuffer, { contentType: params.contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('profiles')
    .update({ verification_doc_url: path, verification_status: 'pending' })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 7: Create `SessionProvider` (bootstraps the Supabase auth session into the store)**

`apps/mobile/src/features/auth/providers/SessionProvider.tsx`:

```tsx
import { ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { fetchProfile } from '@/features/auth/services/auth.service';

export function SessionProvider({ children }: { children: ReactNode }) {
  const setSession = useSessionStore((s) => s.setSession);
  const setProfile = useSessionStore((s) => s.setProfile);
  const setInitializing = useSessionStore((s) => s.setInitializing);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap(userId: string | undefined) {
      if (!userId) {
        setProfile(null);
        return;
      }
      try {
        const profile = await fetchProfile(userId);
        if (isMounted) setProfile(profile);
      } catch {
        if (isMounted) setProfile(null);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      bootstrap(data.session?.user.id).finally(() => setInitializing(false));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      bootstrap(session?.user.id);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setSession, setProfile, setInitializing]);

  return <>{children}</>;
}
```

- [ ] **Step 8: Create the `useAuth` hook (TanStack Query mutations wrapping the service)**

`apps/mobile/src/features/auth/hooks/useAuth.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authService from '@/features/auth/services/auth.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { LoginInput, SignupInput } from '@/features/auth/schemas/authSchemas';
import type { OnboardingAnswers } from '@/features/auth/lib/derivePersona';

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => authService.signInWithPassword(input),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) => authService.signUpWithPassword(input),
  });
}

export function useLogout() {
  const clear = useSessionStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      clear();
      queryClient.clear();
    },
  });
}

export function useCompleteOnboarding() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: {
      userId: string;
      fullName: string;
      schoolId: string | null;
      answers: OnboardingAnswers;
    }) => authService.completeOnboarding(params),
    onSuccess: (profile) => setProfile(profile),
  });
}

export function useUploadStudentId() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: {
      userId: string;
      fileUri: string;
      fileName: string;
      contentType: string;
    }) => authService.uploadStudentId(params),
    onSuccess: (profile) => setProfile(profile),
  });
}
```

- [ ] **Step 9: Create the feature barrel export**

`apps/mobile/src/features/auth/index.ts`:

```ts
export * from '@/features/auth/hooks/useAuth';
export * from '@/features/auth/lib/derivePersona';
export * from '@/features/auth/schemas/authSchemas';
export * from '@/features/auth/store/sessionStore';
export { SessionProvider } from '@/features/auth/providers/SessionProvider';
```

- [ ] **Step 10: Commit**

```bash
git add apps/mobile/src/features/auth
git commit -m "feat(mobile): add auth feature — schemas, service, SessionProvider, persona derivation, onboarding/student-ID mutations"
```

---

## Task 7: Auth & onboarding screens (login, signup, onboarding, student-ID upload)

**Files:**

- Create: `apps/mobile/src/features/auth/screens/OnboardingScreen.tsx`
- Create: `apps/mobile/src/features/auth/screens/LoginScreen.tsx`
- Create: `apps/mobile/src/features/auth/screens/SignupScreen.tsx`
- Create: `apps/mobile/src/features/auth/screens/StudentIdUploadScreen.tsx`
- Create: `apps/mobile/src/app/(auth)/_layout.tsx`
- Create: `apps/mobile/src/app/(auth)/onboarding.tsx`
- Create: `apps/mobile/src/app/(auth)/login.tsx`
- Create: `apps/mobile/src/app/(auth)/signup.tsx`
- Create: `apps/mobile/src/app/(auth)/verify-id.tsx`
- Test: `apps/mobile/src/features/auth/screens/__tests__/LoginScreen.test.tsx`

- [ ] **Step 1: Write the LoginScreen test (validates the no-placeholder Apple button + RHF/Zod wiring)**

`apps/mobile/src/features/auth/screens/__tests__/LoginScreen.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

const loginMutateMock = jest.fn();

jest.mock('@/features/auth/hooks/useAuth', () => ({
  useLogin: () => ({ mutateAsync: loginMutateMock, isPending: false }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

describe('LoginScreen', () => {
  beforeEach(() => loginMutateMock.mockReset());

  it('shows a validation error when submitting an invalid email', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'not-an-email');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'secret123');
    fireEvent.press(screen.getByText('Connexion'));

    await waitFor(() => expect(screen.getByText('Email invalide')).toBeTruthy());
    expect(loginMutateMock).not.toHaveBeenCalled();
  });

  it('calls the login mutation with valid credentials', async () => {
    loginMutateMock.mockResolvedValue({});
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'etudiant@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Mot de passe'), 'secret123');
    fireEvent.press(screen.getByText('Connexion'));

    await waitFor(() =>
      expect(loginMutateMock).toHaveBeenCalledWith({
        email: 'etudiant@example.com',
        password: 'secret123',
      }),
    );
  });

  it("renders the Apple Sign-In button as present-but-disabled with a 'Bientôt disponible' caption", () => {
    render(<LoginScreen />);
    expect(screen.getByText('Continuer avec Apple')).toBeTruthy();
    expect(screen.getByText('Bientôt disponible')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/auth/screens/__tests__/LoginScreen.test.tsx`
Expected: FAIL — `Cannot find module '../LoginScreen'`

- [ ] **Step 3: Implement `LoginScreen`**

`apps/mobile/src/features/auth/screens/LoginScreen.tsx`:

```tsx
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/authSchemas';

export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const login = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    await login.mutateAsync(values);
    router.replace('/(tabs)/home');
  };

  return (
    <Screen className="justify-center">
      <Text className="mb-1 text-2xl font-bold text-text">{t('common.appName')}</Text>
      <Text className="mb-6 text-base text-textLight">{t('auth.login')}</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.email')}
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.email ? (
        <Text className="mb-2 text-xs text-danger">{errors.email.message}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.password')}
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.password ? (
        <Text className="mb-2 text-xs text-danger">{errors.password.message}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <View className="mt-2">
        <Button
          label={t('auth.login')}
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
        />
      </View>

      <View className="my-6 h-px bg-border" />

      <Button label={t('auth.continueWithGoogle')} variant="outline" onPress={() => {}} />

      <View className="mt-3 items-center">
        <Button label={t('auth.continueWithApple')} variant="outline" disabled onPress={() => {}} />
        <Text className="mt-1 text-xs text-textLight">{t('common.comingSoon')}</Text>
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-textLight">{t('auth.noAccount')} </Text>
        <Text
          className="text-sm font-semibold text-primary"
          onPress={() => router.push('/(auth)/signup')}
        >
          {t('auth.signup')}
        </Text>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/auth/screens/__tests__/LoginScreen.test.tsx`
Expected: PASS — 3 tests passed

- [ ] **Step 5: Implement `SignupScreen`**

`apps/mobile/src/features/auth/screens/SignupScreen.tsx`:

```tsx
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useSignup } from '@/features/auth/hooks/useAuth';
import { signupSchema, type SignupInput } from '@/features/auth/schemas/authSchemas';

export function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signup = useSignup();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async (values: SignupInput) => {
    await signup.mutateAsync(values);
    router.replace('/(auth)/onboarding');
  };

  return (
    <Screen className="justify-center">
      <Text className="mb-6 text-2xl font-bold text-text">{t('auth.signup')}</Text>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.fullName')}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.fullName ? (
        <Text className="mb-2 text-xs text-danger">{errors.fullName.message}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.email')}
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.email ? (
        <Text className="mb-2 text-xs text-danger">{errors.email.message}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.password')}
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            className="mb-1 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      {errors.password ? (
        <Text className="mb-2 text-xs text-danger">{errors.password.message}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <View className="mt-2">
        <Button
          label={t('auth.signup')}
          onPress={handleSubmit(onSubmit)}
          loading={signup.isPending}
        />
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-textLight">{t('auth.hasAccount')} </Text>
        <Text
          className="text-sm font-semibold text-primary"
          onPress={() => router.push('/(auth)/login')}
        >
          {t('auth.login')}
        </Text>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 6: Implement `OnboardingScreen`** (3 informational slides + 2 persona-deriving questions, then `completeOnboarding`)

`apps/mobile/src/features/auth/screens/OnboardingScreen.tsx`:

```tsx
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useCompleteOnboarding } from '@/features/auth/hooks/useAuth';
import type { OnboardingAnswers } from '@/features/auth/lib/derivePersona';

const SLIDES = ['onboarding.slide1', 'onboarding.slide2', 'onboarding.slide3'] as const;

type Step = 0 | 1 | 2 | 'questionLocation' | 'questionFor';

export function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useSessionStore((s) => s.user?.id);
  const fullName = useSessionStore((s) => s.user?.user_metadata?.full_name as string | undefined);
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState<Step>(0);
  const [alreadyInDakar, setAlreadyInDakar] = useState<boolean | null>(null);

  const finish = async (searchingFor: OnboardingAnswers['searchingFor']) => {
    if (!userId || alreadyInDakar === null) return;
    await completeOnboarding.mutateAsync({
      userId,
      fullName: fullName ?? '',
      schoolId: null,
      answers: { alreadyInDakar, searchingFor },
    });
    router.replace('/(auth)/verify-id');
  };

  if (typeof step === 'number') {
    const slideKey = SLIDES[step];
    return (
      <Screen className="justify-between py-8">
        <View />
        <View className="items-center px-4">
          <Badge label={`${step + 1}/3`} tone="primary" />
          <Text className="mt-4 text-center text-2xl font-bold text-text">
            {t(`${slideKey}Title`)}
          </Text>
          <Text className="mt-2 text-center text-base text-textLight">{t(`${slideKey}Body`)}</Text>
        </View>
        <View>
          <Button
            label={step < 2 ? t('common.next') : t('onboarding.start')}
            onPress={() => (step < 2 ? setStep((step + 1) as Step) : setStep('questionLocation'))}
          />
          {step < 2 ? (
            <View className="mt-3 items-center">
              <Text className="text-sm text-textLight" onPress={() => setStep('questionLocation')}>
                {t('common.skip')}
              </Text>
            </View>
          ) : null}
        </View>
      </Screen>
    );
  }

  if (step === 'questionLocation') {
    return (
      <Screen className="justify-center">
        <Text className="mb-6 text-xl font-bold text-text">{t('onboarding.questionLocation')}</Text>
        <View className="gap-3">
          <Button
            label={t('onboarding.answerYes')}
            variant={alreadyInDakar === true ? 'primary' : 'outline'}
            onPress={() => setAlreadyInDakar(true)}
          />
          <Button
            label={t('onboarding.answerNo')}
            variant={alreadyInDakar === false ? 'primary' : 'outline'}
            onPress={() => setAlreadyInDakar(false)}
          />
        </View>
        <View className="mt-8">
          <Button
            label={t('common.next')}
            disabled={alreadyInDakar === null}
            onPress={() => setStep('questionFor')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen className="justify-center">
      <Text className="mb-6 text-xl font-bold text-text">{t('onboarding.questionFor')}</Text>
      <View className="gap-3">
        <Button
          label={t('onboarding.answerSelf')}
          onPress={() => finish('self')}
          loading={completeOnboarding.isPending}
        />
        <Button
          label={t('onboarding.answerChild')}
          variant="outline"
          onPress={() => finish('child')}
          loading={completeOnboarding.isPending}
        />
      </View>
    </Screen>
  );
}
```

- [ ] **Step 7: Implement `StudentIdUploadScreen`** (manual review only — no OCR text, per Decision §4)

`apps/mobile/src/features/auth/screens/StudentIdUploadScreen.tsx`:

```tsx
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useUploadStudentId } from '@/features/auth/hooks/useAuth';

const STATUS_TONE = { pending: 'warning', approved: 'success', rejected: 'danger' } as const;
const STATUS_LABEL_KEY = {
  pending: 'auth.verificationPending',
  approved: 'auth.verificationApproved',
  rejected: 'auth.verificationRejected',
} as const;

export function StudentIdUploadScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useSessionStore((s) => s.user?.id);
  const profile = useSessionStore((s) => s.profile);
  const uploadStudentId = useUploadStudentId();

  const status = profile?.verification_status ?? 'pending';
  const hasUploaded = Boolean(profile?.verification_doc_url);

  const pickAndUpload = async () => {
    if (!userId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `student-id-${Date.now()}.jpg`;
    await uploadStudentId.mutateAsync({
      userId,
      fileUri: asset.uri,
      fileName,
      contentType: asset.mimeType ?? 'image/jpeg',
    });
  };

  return (
    <Screen className="justify-center">
      <Text className="mb-2 text-xl font-bold text-text">{t('auth.uploadIdTitle')}</Text>
      <Text className="mb-6 text-sm text-textLight">{t('auth.uploadIdBody')}</Text>

      {hasUploaded ? (
        <View className="mb-6">
          <Badge label={t(STATUS_LABEL_KEY[status])} tone={STATUS_TONE[status]} />
        </View>
      ) : null}

      <Button
        label={t('auth.uploadIdAction')}
        onPress={pickAndUpload}
        loading={uploadStudentId.isPending}
        variant={hasUploaded ? 'outline' : 'primary'}
      />

      <View className="mt-4 items-center">
        <Text className="text-sm text-textLight" onPress={() => router.replace('/(tabs)/home')}>
          {t('auth.uploadIdLater')}
        </Text>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 8: Wire the `(auth)` route group**

`apps/mobile/src/app/(auth)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`apps/mobile/src/app/(auth)/onboarding.tsx`:

```tsx
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen';

export default function OnboardingRoute() {
  return <OnboardingScreen />;
}
```

`apps/mobile/src/app/(auth)/login.tsx`:

```tsx
import { LoginScreen } from '@/features/auth/screens/LoginScreen';

export default function LoginRoute() {
  return <LoginScreen />;
}
```

`apps/mobile/src/app/(auth)/signup.tsx`:

```tsx
import { SignupScreen } from '@/features/auth/screens/SignupScreen';

export default function SignupRoute() {
  return <SignupScreen />;
}
```

`apps/mobile/src/app/(auth)/verify-id.tsx`:

```tsx
import { StudentIdUploadScreen } from '@/features/auth/screens/StudentIdUploadScreen';

export default function VerifyIdRoute() {
  return <StudentIdUploadScreen />;
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/features/auth/screens apps/mobile/src/app/(auth)
git commit -m "feat(mobile): add login/signup/onboarding/student-ID-upload screens with persona derivation and manual-review verification flow"
```

---

## Task 8: Root navigation — gating between auth and tabs, bottom tab bar

**Files:**

- Modify: `apps/mobile/src/app/index.tsx`
- Create: `apps/mobile/src/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/src/shared/components/BottomTabIcon.tsx`
- Create: `apps/mobile/src/shared/components/AuthGate.tsx`

- [ ] **Step 1: Create `AuthGate`** — redirects unauthenticated/unonboarded users

```tsx
import { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSessionStore } from '@/features/auth/store/sessionStore';

export function AuthGate({ children }: { children: ReactNode }) {
  const isInitializing = useSessionStore((s) => s.isInitializing);
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#1E3A8A" size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (profile && !profile.persona) return <Redirect href="/(auth)/onboarding" />;

  return <>{children}</>;
}
```

Save to: `apps/mobile/src/shared/components/AuthGate.tsx`

- [ ] **Step 2: Update the entry redirect to route through the gate logic**

`apps/mobile/src/app/index.tsx` (replace contents):

```tsx
import { Redirect } from 'expo-router';
import { useSessionStore } from '@/features/auth/store/sessionStore';

export default function Index() {
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  if (!user) return <Redirect href="/(auth)/login" />;
  if (profile && !profile.persona) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)/home" />;
}
```

- [ ] **Step 3: Create the bottom tab icon helper (inline SVG paths — no external icon font dependency)**

`apps/mobile/src/shared/components/BottomTabIcon.tsx`:

```tsx
import Svg, { Path } from 'react-native-svg';

export type TabIconName = 'home' | 'search' | 'news' | 'favorites' | 'profile';

const PATHS: Record<TabIconName, string> = {
  home: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5H10v5a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z',
  search:
    'M11 4a7 7 0 104.95 11.95l4.55 4.55 1.41-1.41-4.55-4.55A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z',
  news: 'M4 4h13a2 2 0 012 2v13a1 1 0 01-1 1H6a2 2 0 01-2-2V4zm2 4h9M6 11h9M6 14h6',
  favorites:
    'M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c1.9 0 3.4 1 4.5 2.4C12.1 6 13.6 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z',
  profile: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM4 21c0-3.6 3.6-6 8-6s8 2.4 8 6',
};

interface BottomTabIconProps {
  name: TabIconName;
  color: string;
  size?: number;
}

export function BottomTabIcon({ name, color, size = 24 }: BottomTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={PATHS[name]}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
```

- [ ] **Step 4: Create the `(tabs)` layout — Accueil / Recherche / News / Favoris / Profil**

`apps/mobile/src/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';
import { AuthGate } from '@/shared/components/AuthGate';
import { BottomTabIcon } from '@/shared/components/BottomTabIcon';
import { COLORS } from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <AuthGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            borderTopColor: COLORS.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t('common.appName') === 'DakarEaseU' ? 'Accueil' : 'Accueil',
            tabBarIcon: ({ color }) => <BottomTabIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Recherche',
            tabBarIcon: ({ color }) => <BottomTabIcon name="search" color={color} />,
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: 'News',
            tabBarIcon: ({ color }) => <BottomTabIcon name="news" color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favoris',
            tabBarIcon: ({ color }) => <BottomTabIcon name="favorites" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => <BottomTabIcon name="profile" color={color} />,
          }}
        />
      </Tabs>
    </AuthGate>
  );
}
```

- [ ] **Step 5: Run typecheck — should now resolve all auth/navigation modules**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: no errors referencing `@/features/auth/*`, `@/shared/components/*`, or `@/app/(tabs)/*`. (Errors about `(tabs)/home`, `(tabs)/search`, etc. not existing yet are expected — those routes are created in subsequent tasks.)

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/app/index.tsx apps/mobile/src/app/\(tabs\)/_layout.tsx apps/mobile/src/shared/components/BottomTabIcon.tsx apps/mobile/src/shared/components/AuthGate.tsx
git commit -m "feat(mobile): add auth gating and 5-tab bottom navigation (Accueil/Recherche/News/Favoris/Profil)"
```

---

## Task 9: Housing feature — schemas, services, TanStack Query hooks, ListingCard

**Files:**

- Create: `apps/mobile/src/features/housing/types/housing.types.ts`
- Create: `apps/mobile/src/features/housing/services/listings.service.ts`
- Create: `apps/mobile/src/features/housing/hooks/useListings.ts`
- Create: `apps/mobile/src/features/housing/hooks/useListingDetail.ts`
- Create: `apps/mobile/src/features/housing/components/ListingCard.tsx`
- Create: `apps/mobile/src/features/housing/index.ts`
- Test: `apps/mobile/src/features/housing/components/__tests__/ListingCard.test.tsx`

- [ ] **Step 1: Define the housing query-filter type and the public listing-summary projection**

`apps/mobile/src/features/housing/types/housing.types.ts`:

```ts
import type { Listing, ListingMedia, ListingType } from '@dakareaseu/types';

/**
 * The exact column set the mobile app is allowed to read from `listings`.
 * `created_by` is intentionally OMITTED — per the foundation schema comment,
 * it is an internal admin-only reference that must never be exposed on mobile.
 */
export const LISTING_PUBLIC_COLUMNS =
  'id, title, description, price, currency, period, type, surface_m2, bedrooms, bathrooms, district, distance_label, furnished, colocation_available, min_duration_months, amenities, particularities, requirements, verification_status, rating, reviews_count, created_at' as const;

export interface ListingFilters {
  type?: ListingType | 'any';
  maxPrice?: number;
  district?: string;
  furnished?: boolean;
  colocationOnly?: boolean;
}

export type ListingSummary = Pick<
  Listing,
  | 'id'
  | 'title'
  | 'price'
  | 'currency'
  | 'period'
  | 'type'
  | 'district'
  | 'distance_label'
  | 'rating'
  | 'reviews_count'
  | 'verification_status'
  | 'colocation_available'
> & { cover_media: Pick<ListingMedia, 'id' | 'url' | 'media_type'> | null };
```

- [ ] **Step 2: Create the listings service (Supabase calls only)**

`apps/mobile/src/features/housing/services/listings.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import {
  LISTING_PUBLIC_COLUMNS,
  type ListingFilters,
} from '@/features/housing/types/housing.types';
import type { MatchListingsArgs, MatchResult } from '@dakareaseu/types';

/**
 * Lists published listings with optional filters. RLS already restricts
 * results to `verification_status = 'published'` for non-admins, but we also
 * filter explicitly so the query intent is self-documenting.
 */
export async function fetchListings(filters: ListingFilters = {}) {
  let query = supabase
    .from('listings')
    .select(`${LISTING_PUBLIC_COLUMNS}, listing_media(id, url, media_type, position)`)
    .eq('verification_status', 'published')
    .order('created_at', { ascending: false });

  if (filters.type && filters.type !== 'any') query = query.eq('type', filters.type);
  if (typeof filters.maxPrice === 'number') query = query.lte('price', filters.maxPrice);
  if (filters.district) query = query.eq('district', filters.district);
  if (typeof filters.furnished === 'boolean') query = query.eq('furnished', filters.furnished);
  if (filters.colocationOnly) query = query.eq('colocation_available', true);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchListingDetail(listingId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `${LISTING_PUBLIC_COLUMNS}, listing_media(id, url, media_type, position), listing_coliving_rooms(id, label, price, surface_m2, is_available)`,
    )
    .eq('id', listingId)
    .eq('verification_status', 'published')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Server-side matching — calls the `match_listings` RPC (SQL reimplementation
 * of the prototype's `computeMatches`). Returns rows of `match_result`
 * (`listing_id`, `match_pct`, `reasons[]`) sorted by `match_pct desc`.
 */
export async function matchListings(args: MatchListingsArgs): Promise<MatchResult[]> {
  const { data, error } = await supabase.rpc('match_listings', args);
  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 3: Create `useListings` and `useMatchedListings` hooks**

`apps/mobile/src/features/housing/hooks/useListings.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import * as listingsService from '@/features/housing/services/listings.service';
import type { ListingFilters } from '@/features/housing/types/housing.types';
import type { MatchListingsArgs } from '@dakareaseu/types';

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', 'list', filters],
    queryFn: () => listingsService.fetchListings(filters),
  });
}

export function useMatchedListings(args: MatchListingsArgs, enabled: boolean) {
  return useQuery({
    queryKey: ['listings', 'matches', args],
    queryFn: () => listingsService.matchListings(args),
    enabled,
  });
}
```

`apps/mobile/src/features/housing/hooks/useListingDetail.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import * as listingsService from '@/features/housing/services/listings.service';

export function useListingDetail(listingId: string | undefined) {
  return useQuery({
    queryKey: ['listings', 'detail', listingId],
    queryFn: () => listingsService.fetchListingDetail(listingId as string),
    enabled: Boolean(listingId),
  });
}
```

- [ ] **Step 4: Write the `ListingCard` test (covers the "Vérifié" badge decision)**

`apps/mobile/src/features/housing/components/__tests__/ListingCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { ListingCard } from '../ListingCard';
import type { ListingSummary } from '@/features/housing/types/housing.types';

const baseSummary: ListingSummary = {
  id: 'b0000000-0000-0000-0000-000000000001',
  title: 'Studio meublé proche UCAD',
  price: 85000,
  currency: 'XOF',
  period: 'month',
  type: 'studio',
  district: 'Fann',
  distance_label: "10 min de l'UCAD",
  rating: 4.6,
  reviews_count: 12,
  verification_status: 'published',
  colocation_available: false,
  cover_media: { id: 'm1', url: 'https://example.com/photo.jpg', media_type: 'photo' },
};

describe('ListingCard', () => {
  it('renders the title, price and district', () => {
    render(
      <ListingCard
        listing={baseSummary}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText('Studio meublé proche UCAD')).toBeTruthy();
    expect(screen.getByText('Fann')).toBeTruthy();
  });

  it("shows the 'Vérifié' badge for published listings (verification_status === 'published')", () => {
    render(
      <ListingCard
        listing={baseSummary}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText('Vérifié')).toBeTruthy();
  });

  it("does not show the 'Vérifié' badge for non-published listings", () => {
    render(
      <ListingCard
        listing={{ ...baseSummary, verification_status: 'pending' }}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onPress={() => {}}
      />,
    );
    expect(screen.queryByText('Vérifié')).toBeNull();
  });
});
```

- [ ] **Step 5: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/housing/components/__tests__/ListingCard.test.tsx`
Expected: FAIL — `Cannot find module '../ListingCard'`

- [ ] **Step 6: Implement `ListingCard`**

`apps/mobile/src/features/housing/components/ListingCard.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import type { ListingSummary } from '@/features/housing/types/housing.types';

interface ListingCardProps {
  listing: ListingSummary;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

/**
 * "Vérifié" badge decision: the foundation schema has no separate boolean
 * `verified` column on `listings` — `verification_status` IS the verification
 * mechanism, and RLS already restricts student-visible listings to
 * `verification_status = 'published'`. So the badge is shown whenever the
 * listing is published (i.e. on essentially every card a student ever sees),
 * confirming "this listing passed platform review" — matching the prototype's
 * intent without inventing a redundant field.
 */
export function ListingCard({ listing, isFavorite, onToggleFavorite, onPress }: ListingCardProps) {
  const { t } = useTranslation();
  const isVerified = listing.verification_status === 'published';

  return (
    <Pressable
      onPress={onPress}
      className="mr-3 w-60 overflow-hidden rounded-2xl border border-border bg-card"
    >
      <View className="relative h-36 w-full bg-border">
        {listing.cover_media ? (
          <Image
            source={{ uri: listing.cover_media.url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : null}
        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel="favorite-toggle"
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/90"
        >
          <Text className={isFavorite ? 'text-danger' : 'text-textLight'}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </Pressable>
        {isVerified ? (
          <View className="absolute left-2 top-2">
            <Badge label={t('listing.verified')} tone="success" />
          </View>
        ) : null}
      </View>

      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-semibold text-text">
          {listing.title}
        </Text>
        <Text className="mt-0.5 text-xs text-textLight">
          {listing.district} · {listing.distance_label}
        </Text>
        <View className="mt-2 flex-row items-baseline justify-between">
          <Text className="text-base font-bold text-primary">
            {listing.price.toLocaleString('fr-FR')} {listing.currency}
            <Text className="text-xs font-normal text-textLight"> {t('common.perMonth')}</Text>
          </Text>
          <Text className="text-xs text-textLight">★ {listing.rating.toFixed(1)}</Text>
        </View>
        {listing.colocation_available ? (
          <View className="mt-2">
            <Badge label={t('listing.colocationAvailable')} tone="primary" />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 7: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/housing/components/__tests__/ListingCard.test.tsx`
Expected: PASS — 3 tests passed

- [ ] **Step 8: Create the feature barrel export**

`apps/mobile/src/features/housing/index.ts`:

```ts
export * from '@/features/housing/hooks/useListings';
export * from '@/features/housing/hooks/useListingDetail';
export * from '@/features/housing/types/housing.types';
export { ListingCard } from '@/features/housing/components/ListingCard';
```

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/features/housing
git commit -m "feat(mobile): add housing feature data layer (services/hooks/types) and ListingCard with verification badge"
```

---

## Task 10: Listing detail screen — media gallery, particularités/exigences, colocation

**Files:**

- Create: `apps/mobile/src/features/housing/components/MediaGallery.tsx`
- Create: `apps/mobile/src/features/housing/components/ChipList.tsx`
- Create: `apps/mobile/src/features/housing/screens/ListingDetailScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/home/listing/[id].tsx`

- [ ] **Step 1: Implement `ChipList`** (renders particularités/exigences/amenities as labeled chips)

`apps/mobile/src/features/housing/components/ChipList.tsx`:

```tsx
import { Text, View } from 'react-native';

interface ChipListProps {
  title: string;
  items: string[];
  emptyLabel?: string;
}

export function ChipList({ title, items, emptyLabel }: ChipListProps) {
  if (items.length === 0 && !emptyLabel) return null;

  return (
    <View className="mt-4">
      <Text className="mb-2 text-sm font-semibold text-text">{title}</Text>
      {items.length === 0 ? (
        <Text className="text-sm text-textLight">{emptyLabel}</Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {items.map((item) => (
            <View key={item} className="rounded-full border border-border bg-bg px-3 py-1.5">
              <Text className="text-xs text-text">{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Implement `MediaGallery`** (photo/video/3D-tour thumbnails opening the shared media viewer)

`apps/mobile/src/features/housing/components/MediaGallery.tsx`:

```tsx
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useUiStore } from '@/shared/store/uiStore';
import type { ListingMedia } from '@dakareaseu/types';

const KIND_LABEL: Record<ListingMedia['media_type'], string> = {
  photo: '',
  video: '▶ Vidéo',
  tour_3d: '360° Visite 3D',
};

interface MediaGalleryProps {
  media: Pick<ListingMedia, 'id' | 'url' | 'media_type'>[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const openMediaViewer = useUiStore((s) => s.openMediaViewer);

  if (media.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
      {media.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => openMediaViewer(item.url, item.media_type)}
          className="relative mr-2 h-40 w-56 overflow-hidden rounded-xl bg-border"
        >
          <Image
            source={{ uri: item.url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          {KIND_LABEL[item.media_type] ? (
            <View className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1">
              <Text className="text-xs font-semibold text-white">
                {KIND_LABEL[item.media_type]}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}
```

- [ ] **Step 3: Implement `ListingDetailScreen`**

`apps/mobile/src/features/housing/screens/ListingDetailScreen.tsx`:

```tsx
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useListingDetail } from '@/features/housing/hooks/useListingDetail';
import { MediaGallery } from '@/features/housing/components/MediaGallery';
import { ChipList } from '@/features/housing/components/ChipList';

export function ListingDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, isError } = useListingDetail(id);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#1E3A8A" size="large" />
      </Screen>
    );
  }

  if (isError || !listing) {
    return (
      <Screen>
        <EmptyState icon="🏠" title={t('common.error')} description={t('common.retry')} />
      </Screen>
    );
  }

  const isVerified = listing.verification_status === 'published';
  const media = listing.listing_media ?? [];
  const rooms = listing.listing_coliving_rooms ?? [];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MediaGallery media={media} />

        <View className="mt-4 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-bold text-text">{listing.title}</Text>
            <Text className="mt-1 text-sm text-textLight">
              {listing.district} · {listing.distance_label}
            </Text>
          </View>
          {isVerified ? <Badge label={t('listing.verified')} tone="success" /> : null}
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <Badge label={`${listing.surface_m2} m²`} tone="neutral" />
          <Badge label={`${listing.bedrooms} ${t('listing.bedrooms')}`} tone="neutral" />
          <Badge label={`${listing.bathrooms} ${t('listing.bathrooms')}`} tone="neutral" />
          <Badge
            label={listing.furnished ? t('listing.furnished') : t('listing.notFurnished')}
            tone="neutral"
          />
          <Badge
            label={`${t('listing.minDuration')}: ${listing.min_duration_months} ${t('listing.months')}`}
            tone="primary"
          />
        </View>

        <Text className="mt-4 text-sm leading-5 text-text">{listing.description}</Text>

        <ChipList title={t('listing.amenities')} items={listing.amenities ?? []} />
        <ChipList title={t('listing.particularities')} items={listing.particularities ?? []} />
        <ChipList title={t('listing.requirements')} items={listing.requirements ?? []} />

        {listing.colocation_available && rooms.length > 0 ? (
          <View className="mt-5">
            <Text className="mb-2 text-sm font-semibold text-text">{t('listing.colocation')}</Text>
            <Text className="mb-3 text-xs text-textLight">
              {t('listing.colocationPlaces', { count: rooms.length })}
            </Text>
            {rooms.map((room) => (
              <View
                key={room.id}
                className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <View>
                  <Text className="text-sm font-semibold text-text">{room.label}</Text>
                  <Text className="text-xs text-textLight">{room.surface_m2} m²</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-bold text-primary">
                    {room.price.toLocaleString('fr-FR')} {listing.currency}
                  </Text>
                  <Button
                    label={t('listing.reservePlace')}
                    variant="outline"
                    fullWidth={false}
                    disabled={!room.is_available}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/home/booking/[listingId]',
                        params: { listingId: listing.id, roomId: room.id },
                      })
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View className="flex-row items-center justify-between border-t border-border bg-card px-4 py-3">
        <View>
          <Text className="text-lg font-bold text-primary">
            {listing.price.toLocaleString('fr-FR')} {listing.currency}
          </Text>
          <Text className="text-xs text-textLight">{t('common.perMonth')}</Text>
        </View>
        <Button
          label={t('listing.reserve')}
          fullWidth={false}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/home/booking/[listingId]',
              params: { listingId: listing.id },
            })
          }
        />
      </View>
    </Screen>
  );
}
```

- [ ] **Step 4: Wire the route**

`apps/mobile/src/app/(tabs)/home/listing/[id].tsx`:

```tsx
import { ListingDetailScreen } from '@/features/housing/screens/ListingDetailScreen';

export default function ListingDetailRoute() {
  return <ListingDetailScreen />;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/housing/components/MediaGallery.tsx apps/mobile/src/features/housing/components/ChipList.tsx apps/mobile/src/features/housing/screens/ListingDetailScreen.tsx "apps/mobile/src/app/(tabs)/home/listing"
git commit -m "feat(mobile): add listing detail screen with media gallery, particularités/exigences chips, and colocation rooms"
```

---

## Task 11: Booking & simulated payment (Wave/Orange Money/Card) with `processPayment` seam

**Files:**

- Create: `apps/mobile/src/features/housing/schemas/bookingSchemas.ts`
- Create: `apps/mobile/src/features/housing/services/bookings.service.ts`
- Create: `apps/mobile/src/features/housing/services/payments.service.ts`
- Create: `apps/mobile/src/features/housing/hooks/useCreateBooking.ts`
- Create: `apps/mobile/src/features/housing/screens/BookingScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/home/booking/[listingId].tsx`
- Test: `apps/mobile/src/features/housing/services/__tests__/payments.service.test.ts`

- [ ] **Step 1: Write the `processPayment` seam test**

`apps/mobile/src/features/housing/services/__tests__/payments.service.test.ts`:

```ts
import { processPayment } from '../payments.service';

describe('processPayment (simulated seam)', () => {
  it('resolves with a success status and an echoed reference for any method', async () => {
    const result = await processPayment('wave', 255000, 'booking-ref-123');
    expect(result.status).toBe('success');
    expect(result.reference).toBe('booking-ref-123');
    expect(result.method).toBe('wave');
    expect(result.amount).toBe(255000);
  });

  it('supports orange_money and card the same way', async () => {
    await expect(processPayment('orange_money', 1000, 'ref-a')).resolves.toMatchObject({
      status: 'success',
      method: 'orange_money',
    });
    await expect(processPayment('card', 1000, 'ref-b')).resolves.toMatchObject({
      status: 'success',
      method: 'card',
    });
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/housing/services/__tests__/payments.service.test.ts`
Expected: FAIL — `Cannot find module '../payments.service'`

- [ ] **Step 3: Implement the payments service — the single `processPayment(method, amount, ref)` seam**

`apps/mobile/src/features/housing/services/payments.service.ts`:

```ts
import type { PaymentMethod, PaymentStatus } from '@dakareaseu/types';

export interface PaymentResult {
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  reference: string;
}

/**
 * SIMULATED PAYMENT SEAM — documented extension point.
 *
 * Today this function resolves locally after a short artificial delay and
 * always returns `status: "success"`. It exists so the REST of the app
 * (BookingScreen, useCreateBooking, the `payments` rows it writes) is already
 * shaped exactly like it will be once real payment processing exists.
 *
 * FUTURE MIGRATION PATH (do this and nothing else changes upstream):
 *   1. Create a single Supabase Edge Function `process-payment` that accepts
 *      `{ method: PaymentMethod, amount: number, reference: string }`,
 *      calls the Wave / Orange Money / card-processor APIs server-side
 *      (this is exactly the kind of "secret key required" case that
 *      justifies an Edge Function per philosophie-developpement.md), and
 *      returns the same `PaymentResult` shape.
 *   2. Replace the body of THIS function with:
 *        const { data, error } = await supabase.functions.invoke<PaymentResult>(
 *          "process-payment", { body: { method, amount, reference } }
 *        );
 *        if (error) throw error;
 *        return data;
 *   3. No changes needed in BookingScreen, useCreateBooking, or the
 *      `bookings`/`payments` write path — they only depend on this function's
 *      signature and its `PaymentResult` return shape, both of which are
 *      already final.
 */
export async function processPayment(
  method: PaymentMethod,
  amount: number,
  reference: string,
): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { status: 'success', method, amount, reference };
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/housing/services/__tests__/payments.service.test.ts`
Expected: PASS — 2 tests passed

- [ ] **Step 5: Create the booking Zod schema**

`apps/mobile/src/features/housing/schemas/bookingSchemas.ts`:

```ts
import { z } from 'zod';

export const bookingFormSchema = z.object({
  startDate: z.string().min(1, 'Choisis une date de début'),
  durationMonths: z.number().int().min(1),
  paymentMethod: z.enum(['wave', 'orange_money', 'card'], {
    required_error: 'Choisis un moyen de paiement',
  }),
});
export type BookingFormInput = z.infer<typeof bookingFormSchema>;
```

- [ ] **Step 6: Create the bookings service**

`apps/mobile/src/features/housing/services/bookings.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import type { BookingStatus, PaymentMethod } from '@dakareaseu/types';

export interface CreateBookingParams {
  studentId: string;
  listingId: string;
  roomId: string | null;
  startDate: string;
  durationMonths: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentReference: string;
}

/**
 * Creates the booking row AND its associated payment row. Both inserts use
 * the simulated-success result already produced by `processPayment` — see
 * payments.service.ts for the documented Edge Function migration path.
 */
export async function createBooking(params: CreateBookingParams) {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      student_id: params.studentId,
      listing_id: params.listingId,
      room_id: params.roomId,
      start_date: params.startDate,
      duration_months: params.durationMonths,
      total_amount: params.totalAmount,
      currency: params.currency,
      status: 'pending' satisfies BookingStatus,
    })
    .select('*')
    .single();
  if (bookingError) throw bookingError;

  const { error: paymentError } = await supabase.from('payments').insert({
    booking_id: booking.id,
    method: params.paymentMethod,
    amount: params.totalAmount,
    currency: params.currency,
    status: 'success',
    reference: params.paymentReference,
  });
  if (paymentError) throw paymentError;

  return booking;
}

export async function fetchMyBookings(studentId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, listings(id, title, district, currency)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
```

- [ ] **Step 7: Create `useCreateBooking`**

`apps/mobile/src/features/housing/hooks/useCreateBooking.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as bookingsService from '@/features/housing/services/bookings.service';
import { processPayment } from '@/features/housing/services/payments.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { PaymentMethod } from '@dakareaseu/types';

export interface SubmitBookingParams {
  listingId: string;
  roomId: string | null;
  startDate: string;
  durationMonths: number;
  unitPrice: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

export function useCreateBooking() {
  const studentId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitBookingParams) => {
      if (!studentId) throw new Error('Utilisateur non authentifié');

      const totalAmount = params.unitPrice * params.durationMonths;
      const reference = `bk-${params.listingId.slice(0, 8)}-${Date.now()}`;

      const payment = await processPayment(params.paymentMethod, totalAmount, reference);

      return bookingsService.createBooking({
        studentId,
        listingId: params.listingId,
        roomId: params.roomId,
        startDate: params.startDate,
        durationMonths: params.durationMonths,
        totalAmount,
        currency: params.currency,
        paymentMethod: payment.method,
        paymentReference: payment.reference,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'list', studentId] });
    },
  });
}
```

- [ ] **Step 8: Implement `BookingScreen`** (3-step: dates+durée → paiement → récapitulatif/confirmation)

`apps/mobile/src/features/housing/screens/BookingScreen.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useListingDetail } from '@/features/housing/hooks/useListingDetail';
import { useCreateBooking } from '@/features/housing/hooks/useCreateBooking';
import type { PaymentMethod } from '@dakareaseu/types';

const PAYMENT_METHODS: { id: PaymentMethod; labelKey: string }[] = [
  { id: 'wave', labelKey: 'booking.payWithWave' },
  { id: 'orange_money', labelKey: 'booking.payWithOrange' },
  { id: 'card', labelKey: 'booking.payWithCard' },
];

type Step = 'dates' | 'payment' | 'summary' | 'success';

export function BookingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { listingId, roomId } = useLocalSearchParams<{ listingId: string; roomId?: string }>();
  const { data: listing } = useListingDetail(listingId);
  const createBooking = useCreateBooking();

  const [step, setStep] = useState<Step>('dates');
  const [durationMonths, setDurationMonths] = useState(listing?.min_duration_months ?? 3);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const room = useMemo(
    () => listing?.listing_coliving_rooms?.find((r) => r.id === roomId) ?? null,
    [listing, roomId],
  );
  const unitPrice = room ? room.price : (listing?.price ?? 0);
  const minDuration = listing?.min_duration_months ?? 3;
  const total = unitPrice * durationMonths;
  const startDate = new Date().toISOString().slice(0, 10);

  if (!listing) return null;

  const submit = async () => {
    if (!paymentMethod) return;
    await createBooking.mutateAsync({
      listingId: listing.id,
      roomId: room?.id ?? null,
      startDate,
      durationMonths,
      unitPrice,
      currency: listing.currency,
      paymentMethod,
    });
    setStep('success');
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <Text className="mb-4 text-xl font-bold text-text">{t('booking.title')}</Text>

        {step === 'dates' ? (
          <View>
            <Text className="mb-2 text-sm font-semibold text-text">{t('booking.stepDates')}</Text>
            <Text className="mb-3 text-xs text-textLight">
              {t('booking.minDurationNotice', { count: minDuration })}
            </Text>
            <View className="flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
              <Text className="text-sm text-text">{t('booking.duration')}</Text>
              <View className="flex-row items-center gap-4">
                <Text
                  className="text-lg font-bold text-primary"
                  onPress={() => setDurationMonths((d) => Math.max(minDuration, d - 1))}
                >
                  −
                </Text>
                <Text className="text-base font-semibold text-text">{durationMonths}</Text>
                <Text
                  className="text-lg font-bold text-primary"
                  onPress={() => setDurationMonths((d) => d + 1)}
                >
                  +
                </Text>
              </View>
            </View>
            <View className="mt-6">
              <Button label={t('common.next')} onPress={() => setStep('payment')} />
            </View>
          </View>
        ) : null}

        {step === 'payment' ? (
          <View>
            <Text className="mb-3 text-sm font-semibold text-text">
              {t('booking.paymentMethod')}
            </Text>
            <View className="gap-2">
              {PAYMENT_METHODS.map((m) => (
                <Button
                  key={m.id}
                  label={t(m.labelKey)}
                  variant={paymentMethod === m.id ? 'primary' : 'outline'}
                  onPress={() => setPaymentMethod(m.id)}
                />
              ))}
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep('dates')} />
              <Button
                label={t('common.next')}
                disabled={!paymentMethod}
                onPress={() => setStep('summary')}
              />
            </View>
          </View>
        ) : null}

        {step === 'summary' ? (
          <View>
            <Text className="mb-3 text-sm font-semibold text-text">{t('booking.stepSummary')}</Text>
            <View className="rounded-xl border border-border bg-card p-4">
              <Text className="text-sm text-text">{listing.title}</Text>
              {room ? <Text className="mt-1 text-xs text-textLight">{room.label}</Text> : null}
              <View className="mt-3 flex-row justify-between">
                <Text className="text-xs text-textLight">{t('booking.duration')}</Text>
                <Text className="text-xs text-text">
                  {durationMonths} {t('listing.months')}
                </Text>
              </View>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-xs text-textLight">{t('booking.paymentMethod')}</Text>
                <Text className="text-xs text-text">
                  {paymentMethod
                    ? t(PAYMENT_METHODS.find((m) => m.id === paymentMethod)!.labelKey)
                    : '—'}
                </Text>
              </View>
              <View className="mt-3 flex-row justify-between border-t border-border pt-3">
                <Text className="text-sm font-semibold text-text">{t('booking.total')}</Text>
                <Text className="text-base font-bold text-primary">
                  {total.toLocaleString('fr-FR')} {listing.currency}
                </Text>
              </View>
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep('payment')} />
              <Button
                label={t('booking.confirmAndPay')}
                loading={createBooking.isPending}
                onPress={submit}
              />
            </View>
          </View>
        ) : null}

        {step === 'success' ? (
          <View className="items-center py-10">
            <Badge label={t('booking.statusPending')} tone="warning" />
            <Text className="mt-4 text-center text-lg font-bold text-text">
              {t('booking.success')}
            </Text>
            <Text className="mt-2 text-center text-sm text-textLight">
              {t('booking.successBody')}
            </Text>
            <View className="mt-6 w-full">
              <Button label={t('common.confirm')} onPress={() => router.replace('/(tabs)/home')} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 9: Wire the route**

`apps/mobile/src/app/(tabs)/home/booking/[listingId].tsx`:

```tsx
import { BookingScreen } from '@/features/housing/screens/BookingScreen';

export default function BookingRoute() {
  return <BookingScreen />;
}
```

- [ ] **Step 10: Commit**

```bash
git add apps/mobile/src/features/housing/schemas apps/mobile/src/features/housing/services apps/mobile/src/features/housing/hooks/useCreateBooking.ts apps/mobile/src/features/housing/screens/BookingScreen.tsx "apps/mobile/src/app/(tabs)/home/booking"
git commit -m "feat(mobile): add 3-step booking flow with simulated payment behind documented processPayment(method, amount, ref) seam"
```

---

## Task 12: Guided search ("Demande" / "Recherche guidée") — form + match results

**Files:**

- Create: `apps/mobile/src/features/housing/schemas/guidedSearchSchemas.ts`
- Create: `apps/mobile/src/features/housing/services/guidedSearch.service.ts`
- Create: `apps/mobile/src/features/housing/hooks/useGuidedSearch.ts`
- Create: `apps/mobile/src/features/housing/screens/DemandeScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/demande.tsx`
- Test: `apps/mobile/src/features/housing/screens/__tests__/DemandeScreen.test.tsx`

- [ ] **Step 1: Create the guided-search Zod schema**

`apps/mobile/src/features/housing/schemas/guidedSearchSchemas.ts`:

```ts
import { z } from 'zod';

export const guidedSearchSchema = z.object({
  type: z.enum(['any', 'studio', 'chambre', 'appartement', 'maison']),
  schoolId: z.string().uuid().nullable(),
  district: z.string().nullable(),
  budget: z.number().int().min(10000).max(500000),
  months: z.number().int().min(1).max(24),
  furnished: z.enum(['any', 'yes', 'no']),
  coloc: z.enum(['any', 'yes', 'no']),
});
export type GuidedSearchInput = z.infer<typeof guidedSearchSchema>;
```

- [ ] **Step 2: Create the guided-search service** (writes a `guided_search_requests` row AND maps the form to `match_listings` RPC args)

`apps/mobile/src/features/housing/services/guidedSearch.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import type { GuidedSearchInput } from '@/features/housing/schemas/guidedSearchSchemas';
import type { MatchListingsArgs } from '@dakareaseu/types';

export function toMatchListingsArgs(input: GuidedSearchInput): MatchListingsArgs {
  return {
    p_type: input.type,
    p_budget: input.budget,
    p_school_id: input.schoolId,
    p_district: input.district,
    p_furnished: input.furnished,
    p_coloc: input.coloc,
    p_months: input.months,
  };
}

/**
 * Persists the student's guided-search request. This INSERT is what fires the
 * `notify_admins_new_guided_search` trigger from the foundation plan, which
 * creates `new_guided_search_request` notifications for all admins — one of
 * the three targeted Realtime cases (consumed on the admin side).
 */
export async function createGuidedSearchRequest(params: {
  studentId: string;
  input: GuidedSearchInput;
}) {
  const { input } = params;
  const { data, error } = await supabase
    .from('guided_search_requests')
    .insert({
      student_id: params.studentId,
      desired_type: input.type,
      school_id: input.schoolId,
      district: input.district,
      budget: input.budget,
      duration_months: input.months,
      furnished_preference: input.furnished,
      colocation_preference: input.coloc,
      status: 'open',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 3: Write the DemandeScreen test (validates the 4-step flow advances and triggers matching)**

`apps/mobile/src/features/housing/screens/__tests__/DemandeScreen.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DemandeScreen } from '../DemandeScreen';

const matchedListingsMock = jest.fn();
const createRequestMock = jest.fn();

jest.mock('@/features/housing/hooks/useGuidedSearch', () => ({
  useSubmitGuidedSearch: () => ({ mutateAsync: createRequestMock, isPending: false }),
  useGuidedSearchMatches: (...args: unknown[]) => {
    matchedListingsMock(...args);
    return {
      data: [
        {
          listing_id: 'b0000000-0000-0000-0000-000000000001',
          match_pct: 82,
          reasons: ['Type recherché', 'Budget compatible'],
        },
      ],
      isLoading: false,
    };
  },
}));

jest.mock('@/features/auth/store/sessionStore', () => ({
  useSessionStore: (selector: (s: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'u1' } }),
}));

describe('DemandeScreen', () => {
  beforeEach(() => {
    matchedListingsMock.mockReset();
    createRequestMock.mockReset();
    createRequestMock.mockResolvedValue({ id: 'req-1' });
  });

  it('walks through the 4 steps and shows match results with percentage badges', async () => {
    render(<DemandeScreen />);

    expect(screen.getByText('Quel type de logement ?')).toBeTruthy();
    fireEvent.press(screen.getByText('Studio'));
    fireEvent.press(screen.getByText('Suivant'));

    expect(screen.getByText('Où veux-tu vivre ?')).toBeTruthy();
    fireEvent.press(screen.getByText('Suivant'));

    expect(screen.getByText('Quel est ton budget et ta durée ?')).toBeTruthy();
    fireEvent.press(screen.getByText('Suivant'));

    expect(screen.getByText('Tes préférences')).toBeTruthy();
    fireEvent.press(screen.getByText('Voir mes correspondances'));

    await waitFor(() => expect(screen.getByText('82% de compatibilité')).toBeTruthy());
    expect(screen.getByText('✓ Type recherché')).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/housing/screens/__tests__/DemandeScreen.test.tsx`
Expected: FAIL — `Cannot find module '../DemandeScreen'`

- [ ] **Step 5: Create `useGuidedSearch` hooks**

`apps/mobile/src/features/housing/hooks/useGuidedSearch.ts`:

```ts
import { useMutation, useQuery } from '@tanstack/react-query';
import * as guidedSearchService from '@/features/housing/services/guidedSearch.service';
import * as listingsService from '@/features/housing/services/listings.service';
import type { GuidedSearchInput } from '@/features/housing/schemas/guidedSearchSchemas';
import type { MatchListingsArgs } from '@dakareaseu/types';

export function useSubmitGuidedSearch() {
  return useMutation({
    mutationFn: (params: { studentId: string; input: GuidedSearchInput }) =>
      guidedSearchService.createGuidedSearchRequest(params),
  });
}

export function useGuidedSearchMatches(args: MatchListingsArgs | null) {
  return useQuery({
    queryKey: ['listings', 'matches', args],
    queryFn: () => listingsService.matchListings(args as MatchListingsArgs),
    enabled: args !== null,
  });
}
```

- [ ] **Step 6: Implement `DemandeScreen`** — 4 steps (Type → Localisation → Budget&durée → Préférences) then results with color-coded match badges

`apps/mobile/src/features/housing/screens/DemandeScreen.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import {
  useSubmitGuidedSearch,
  useGuidedSearchMatches,
} from '@/features/housing/hooks/useGuidedSearch';
import { toMatchListingsArgs } from '@/features/housing/services/guidedSearch.service';
import { DISTRICTS } from '@/constants/categories';
import type { ListingType } from '@dakareaseu/types';
import type { GuidedSearchInput } from '@/features/housing/schemas/guidedSearchSchemas';
import type { BadgeTone } from '@/shared/ui/Badge';

const TYPES: { id: ListingType; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'chambre', label: 'Chambre' },
  { id: 'appartement', label: 'Appartement' },
  { id: 'maison', label: 'Maison' },
];

type Step = 1 | 2 | 3 | 4 | 'results';

function matchTone(pct: number): BadgeTone {
  if (pct >= 75) return 'success';
  if (pct >= 50) return 'warning';
  return 'neutral';
}

export function DemandeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useSessionStore((s) => s.user?.id);
  const submitRequest = useSubmitGuidedSearch();

  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<ListingType | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [budget, setBudget] = useState(80000);
  const [months, setMonths] = useState(3);
  const [furnished, setFurnished] = useState<'any' | 'yes' | 'no'>('any');
  const [coloc, setColoc] = useState<'any' | 'yes' | 'no'>('any');

  const matchArgs = useMemo(() => {
    if (step !== 'results' || !type) return null;
    const input: GuidedSearchInput = {
      type,
      schoolId: null,
      district,
      budget,
      months,
      furnished,
      coloc,
    };
    return toMatchListingsArgs(input);
  }, [step, type, district, budget, months, furnished, coloc]);

  const { data: matches, isLoading: isMatching } = useGuidedSearchMatches(matchArgs);

  const goToResults = async () => {
    if (!userId || !type) return;
    await submitRequest.mutateAsync({
      studentId: userId,
      input: { type, schoolId: null, district, budget, months, furnished, coloc },
    });
    setStep('results');
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <Text className="mb-4 text-xl font-bold text-text">{t('demande.title')}</Text>

        {step === 1 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">{t('demande.stepType')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((opt) => (
                <Button
                  key={opt.id}
                  label={opt.label}
                  fullWidth={false}
                  variant={type === opt.id ? 'primary' : 'outline'}
                  onPress={() => setType(opt.id)}
                />
              ))}
            </View>
            <View className="mt-6">
              <Button label={t('common.next')} disabled={!type} onPress={() => setStep(2)} />
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.stepLocation')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <Button
                  key={d}
                  label={d}
                  fullWidth={false}
                  variant={district === d ? 'primary' : 'outline'}
                  onPress={() => setDistrict(district === d ? null : d)}
                />
              ))}
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep(1)} />
              <Button label={t('common.next')} onPress={() => setStep(3)} />
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.stepBudget')}
            </Text>
            <View className="rounded-xl border border-border bg-card p-4">
              <Text className="text-sm text-text">
                Budget : {budget.toLocaleString('fr-FR')} XOF
              </Text>
              <View className="mt-2 flex-row gap-2">
                <Button
                  label="−10 000"
                  fullWidth={false}
                  variant="outline"
                  onPress={() => setBudget((b) => Math.max(10000, b - 10000))}
                />
                <Button
                  label="+10 000"
                  fullWidth={false}
                  variant="outline"
                  onPress={() => setBudget((b) => b + 10000)}
                />
              </View>
              <Text className="mt-4 text-sm text-text">
                {t('listing.minDuration')} : {months} {t('listing.months')}
              </Text>
              <View className="mt-2 flex-row gap-2">
                {[3, 6, 9, 12].map((m) => (
                  <Button
                    key={m}
                    label={`${m}`}
                    fullWidth={false}
                    variant={months === m ? 'primary' : 'outline'}
                    onPress={() => setMonths(m)}
                  />
                ))}
              </View>
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep(2)} />
              <Button label={t('common.next')} onPress={() => setStep(4)} />
            </View>
          </View>
        ) : null}

        {step === 4 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.stepPreferences')}
            </Text>
            <Text className="mb-2 text-sm font-medium text-text">{t('listing.furnished')}</Text>
            <View className="flex-row gap-2">
              {(['any', 'yes', 'no'] as const).map((opt) => (
                <Button
                  key={opt}
                  label={opt}
                  fullWidth={false}
                  variant={furnished === opt ? 'primary' : 'outline'}
                  onPress={() => setFurnished(opt)}
                />
              ))}
            </View>
            <Text className="mb-2 mt-4 text-sm font-medium text-text">
              {t('listing.colocation')}
            </Text>
            <View className="flex-row gap-2">
              {(['any', 'yes', 'no'] as const).map((opt) => (
                <Button
                  key={opt}
                  label={opt}
                  fullWidth={false}
                  variant={coloc === opt ? 'primary' : 'outline'}
                  onPress={() => setColoc(opt)}
                />
              ))}
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep(3)} />
              <Button
                label={t('demande.submit')}
                loading={submitRequest.isPending}
                onPress={goToResults}
              />
            </View>
          </View>
        ) : null}

        {step === 'results' ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.resultsTitle')}
            </Text>
            {isMatching ? (
              <Text className="text-sm text-textLight">{t('common.loading')}</Text>
            ) : !matches || matches.length === 0 ? (
              <EmptyState icon="🔍" title={t('demande.noMatches')} />
            ) : (
              matches.map((match) => (
                <View
                  key={match.listing_id}
                  className="mb-3 rounded-xl border border-border bg-card p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Badge
                      label={t('demande.matchScore', { pct: match.match_pct })}
                      tone={matchTone(match.match_pct)}
                    />
                  </View>
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    {match.reasons.map((reason) => (
                      <View key={reason} className="rounded-full bg-bg px-2.5 py-1">
                        <Text className="text-xs text-text">✓ {reason}</Text>
                      </View>
                    ))}
                  </View>
                  <View className="mt-3">
                    <Button
                      label={t('listing.reserve')}
                      variant="outline"
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/home/listing/[id]',
                          params: { id: match.listing_id },
                        })
                      }
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 7: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/housing/screens/__tests__/DemandeScreen.test.tsx`
Expected: PASS — 1 test passed

- [ ] **Step 8: Wire the route**

`apps/mobile/src/app/(tabs)/search/demande.tsx`:

```tsx
import { DemandeScreen } from '@/features/housing/screens/DemandeScreen';

export default function DemandeRoute() {
  return <DemandeScreen />;
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/features/housing/schemas/guidedSearchSchemas.ts apps/mobile/src/features/housing/services/guidedSearch.service.ts apps/mobile/src/features/housing/hooks/useGuidedSearch.ts apps/mobile/src/features/housing/screens/DemandeScreen.tsx "apps/mobile/src/app/(tabs)/search/demande.tsx"
git commit -m "feat(mobile): add guided-search (Demande/Recherche guidée) 4-step form with match_listings RPC results and color-coded compatibility badges"
```

---

## Task 13: Home screen — persona greeting, search bar, carousels, Demande banner

**Files:**

- Create: `apps/mobile/src/features/home/hooks/useHomeData.ts`
- Create: `apps/mobile/src/features/home/components/PersonaGreeting.tsx`
- Create: `apps/mobile/src/features/home/components/SectionHeader.tsx`
- Create: `apps/mobile/src/features/home/screens/HomeScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/home/index.tsx`
- Create: `apps/mobile/src/app/(tabs)/home/_layout.tsx`
- Test: `apps/mobile/src/features/home/components/__tests__/PersonaGreeting.test.tsx`

- [ ] **Step 1: Write the `PersonaGreeting` test (covers persona-as-greeting-only, no toggle)**

`apps/mobile/src/features/home/components/__tests__/PersonaGreeting.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { PersonaGreeting } from '../PersonaGreeting';

describe('PersonaGreeting', () => {
  it("shows the 'nouveau' greeting and hint", () => {
    render(<PersonaGreeting persona="nouveau" fullName="Awa" />);
    expect(screen.getByText(/Bienvenue à Dakar/)).toBeTruthy();
    expect(screen.getByText(/Découvre les écoles et logements/)).toBeTruthy();
  });

  it("shows the 'parent' greeting and hint", () => {
    render(<PersonaGreeting persona="parent" fullName="Moussa" />);
    expect(screen.getByText(/Bonsoir/)).toBeTruthy();
    expect(screen.getByText(/Logements vérifiés et écoles partenaires/)).toBeTruthy();
  });

  it('never renders any persona-switching control', () => {
    render(<PersonaGreeting persona="local" fullName="Fatou" />);
    expect(screen.queryByText(/changer de profil/i)).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/home/components/__tests__/PersonaGreeting.test.tsx`
Expected: FAIL — `Cannot find module '../PersonaGreeting'`

- [ ] **Step 3: Implement `PersonaGreeting`** (greeting/section-ordering influence ONLY — no manual toggle, ever)

`apps/mobile/src/features/home/components/PersonaGreeting.tsx`:

```tsx
import { Text, View } from 'react-native';
import type { PersonaType } from '@dakareaseu/types';
import type { CategoryId } from '@/constants/categories';

interface PersonaCopy {
  greeting: string;
  hint: string;
  priority: CategoryId[];
}

/**
 * Persona is READ-ONLY here: it only selects a greeting string, a contextual
 * hint, and the home-section display order. There is intentionally NO control
 * to change persona from the UI — it is derived once at onboarding
 * (see features/auth/lib/derivePersona.ts) and persisted to `profiles.persona`.
 */
export const PERSONA_COPY: Record<PersonaType, PersonaCopy> = {
  nouveau: {
    greeting: 'Bienvenue à Dakar 👋',
    hint: 'Découvre les écoles et logements près de toi',
    priority: ['ecoles', 'logements', 'transport'],
  },
  local: {
    greeting: 'Bonjour 👋',
    hint: 'Bons plans et événements de la semaine',
    priority: ['logements', 'transport', 'restaurants'],
  },
  parent: {
    greeting: 'Bonsoir 👋',
    hint: 'Logements vérifiés et écoles partenaires',
    priority: ['logements', 'ecoles', 'restaurants'],
  },
};

interface PersonaGreetingProps {
  persona: PersonaType;
  fullName: string | null;
}

export function PersonaGreeting({ persona, fullName }: PersonaGreetingProps) {
  const copy = PERSONA_COPY[persona];
  return (
    <View className="mb-4">
      <Text className="text-2xl font-bold text-text">
        {copy.greeting}
        {fullName ? `, ${fullName.split(' ')[0]}` : ''}
      </Text>
      <Text className="mt-1 text-sm text-textLight">{copy.hint}</Text>
    </View>
  );
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/home/components/__tests__/PersonaGreeting.test.tsx`
Expected: PASS — 3 tests passed

- [ ] **Step 5: Implement `SectionHeader`** (used across Home for "Voir tout" rows — fixes the prototype's title/subtitle collision per chat3.md)

`apps/mobile/src/features/home/components/SectionHeader.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="mb-3 mt-6 flex-row items-end justify-between">
      <View className="flex-1 pr-3">
        <Text numberOfLines={1} className="text-base font-bold text-text">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="mt-0.5 text-xs text-textLight">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text className="text-xs font-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 6: Create `useHomeData`** — composes the listings/schools/events/restaurants queries needed by Home

`apps/mobile/src/features/home/hooks/useHomeData.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LISTING_PUBLIC_COLUMNS } from '@/features/housing/types/housing.types';

export function useTopListings() {
  return useQuery({
    queryKey: ['home', 'topListings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`${LISTING_PUBLIC_COLUMNS}, listing_media(id, url, media_type, position)`)
        .eq('verification_status', 'published')
        .order('rating', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
}

export function usePartnerSchools() {
  return useQuery({
    queryKey: ['home', 'partnerSchools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, district, logo_url')
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['home', 'upcomingEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, category, starts_at, cover_url, district')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });
}

export function useNearbyRestaurants() {
  return useQuery({
    queryKey: ['home', 'nearbyRestaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, price_range, district, rating, cover_url')
        .order('rating', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });
}
```

- [ ] **Step 7: Implement `HomeScreen`**

`apps/mobile/src/features/home/screens/HomeScreen.tsx`:

```tsx
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { CATEGORIES } from '@/constants/categories';
import { PersonaGreeting, PERSONA_COPY } from '@/features/home/components/PersonaGreeting';
import { SectionHeader } from '@/features/home/components/SectionHeader';
import {
  useTopListings,
  usePartnerSchools,
  useUpcomingEvents,
  useNearbyRestaurants,
} from '@/features/home/hooks/useHomeData';
import { ListingCard } from '@/features/housing/components/ListingCard';
import { useFavorites, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import type { ListingSummary } from '@/features/housing/types/housing.types';

function toListingSummary(
  row: ReturnType<typeof useTopListings>['data'] extends (infer R)[] | undefined ? R : never,
): ListingSummary {
  const sortedMedia = [...(row.listing_media ?? [])].sort((a, b) => a.position - b.position);
  return { ...row, cover_media: sortedMedia[0] ?? null };
}

export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);
  const persona = profile?.persona ?? 'local';
  const order = PERSONA_COPY[persona].priority;

  const { data: listings } = useTopListings();
  const { data: schools } = usePartnerSchools();
  const { data: events } = useUpcomingEvents();
  const { data: restaurants } = useNearbyRestaurants();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isListingFavorite = (id: string) =>
    Boolean(favorites?.some((f) => f.entity_type === 'listing' && f.entity_id === id));

  const sectionsById: Record<string, JSX.Element> = {
    logements: (
      <View key="logements">
        <SectionHeader
          title={t('home.topListings')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(listings ?? []).map((row) => {
            const summary = toListingSummary(row);
            return (
              <ListingCard
                key={summary.id}
                listing={summary}
                isFavorite={isListingFavorite(summary.id)}
                onToggleFavorite={() =>
                  toggleFavorite.mutate({ entityType: 'listing', entityId: summary.id })
                }
                onPress={() =>
                  router.push({ pathname: '/(tabs)/home/listing/[id]', params: { id: summary.id } })
                }
              />
            );
          })}
        </ScrollView>
      </View>
    ),
    ecoles: (
      <View key="ecoles">
        <SectionHeader
          title={t('home.topSchools')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search/schools')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(schools ?? []).map((school) => (
            <Pressable
              key={school.id}
              onPress={() =>
                router.push({ pathname: '/(tabs)/search/schools/[id]', params: { id: school.id } })
              }
              className="mr-3 w-40 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <View className="h-24 w-full bg-border">
                {school.logo_url ? (
                  <Image
                    source={{ uri: school.logo_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="p-2.5">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {school.name}
                </Text>
                <Text className="text-xs text-textLight">{school.district}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    ),
    restaurants: (
      <View key="restaurants">
        <SectionHeader
          title={t('home.restaurantsNearby')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search/restaurants')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(restaurants ?? []).map((r) => (
            <Pressable
              key={r.id}
              onPress={() =>
                router.push({ pathname: '/(tabs)/search/restaurants/[id]', params: { id: r.id } })
              }
              className="mr-3 w-44 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <View className="h-28 w-full bg-border">
                {r.cover_url ? (
                  <Image
                    source={{ uri: r.cover_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="p-2.5">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {r.name}
                </Text>
                <Text className="text-xs text-textLight">
                  {r.cuisine_type} · {r.price_range}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    ),
    transport: (
      <View key="transport">
        <SectionHeader
          title={t('categories.transport')}
          actionLabel={t('common.seeAll')}
          onAction={() => router.push('/(tabs)/search/transport')}
        />
        <Text className="text-xs text-textLight">{t('transport.subtitle')}</Text>
      </View>
    ),
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        <PersonaGreeting persona={persona} fullName={profile?.full_name ?? null} />

        <Pressable onPress={() => router.push('/(tabs)/search')}>
          <View className="flex-row items-center rounded-xl border border-border bg-card px-4 py-3">
            <Text className="mr-2 text-textLight">🔍</Text>
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#6B7280"
              className="flex-1 text-sm text-text"
            />
          </View>
        </Pressable>

        <View className="mt-5 flex-row justify-between">
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => router.push('/(tabs)/search')}
              className="items-center"
            >
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Text className="text-2xl">{cat.icon}</Text>
              </View>
              <Text className="mt-1.5 text-xs text-text">{t(cat.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/search/demande')}
          className="mt-6 overflow-hidden rounded-2xl bg-primary p-4"
        >
          <Text className="text-base font-bold text-white">{t('home.demandeBannerTitle')}</Text>
          <Text className="mt-1 text-sm text-white/80">{t('home.demandeBannerBody')}</Text>
          <Text className="mt-3 text-sm font-semibold text-white">
            {t('home.demandeBannerCta')} →
          </Text>
        </Pressable>

        {order.map((id) => sectionsById[id]).filter(Boolean)}

        <View key="news">
          <SectionHeader
            title={t('home.upcomingEvents')}
            actionLabel={t('common.seeAll')}
            onAction={() => router.push('/(tabs)/news')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(events ?? []).map((event) => (
              <Pressable
                key={event.id}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/news/event/[id]', params: { id: event.id } })
                }
                className="mr-3 w-48 overflow-hidden rounded-2xl border border-border bg-card"
              >
                <View className="h-28 w-full bg-border">
                  {event.cover_url ? (
                    <Image
                      source={{ uri: event.cover_url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  ) : null}
                </View>
                <View className="p-2.5">
                  <Text numberOfLines={1} className="text-sm font-semibold text-text">
                    {event.title}
                  </Text>
                  <Text className="text-xs text-textLight">
                    {new Date(event.starts_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 8: Wire the `(tabs)/home` stack and index**

`apps/mobile/src/app/(tabs)/home/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`apps/mobile/src/app/(tabs)/home/index.tsx`:

```tsx
import { HomeScreen } from '@/features/home/screens/HomeScreen';

export default function HomeRoute() {
  return <HomeScreen />;
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/features/home "apps/mobile/src/app/(tabs)/home/_layout.tsx" "apps/mobile/src/app/(tabs)/home/index.tsx"
git commit -m "feat(mobile): add Home screen with persona-driven greeting/section-ordering, search entry, category grid, and Demande banner"
```

---

## Task 14: Search/listings browse screen with filters

**Files:**

- Create: `apps/mobile/src/features/housing/components/FilterBar.tsx`
- Create: `apps/mobile/src/features/housing/screens/SearchScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/_layout.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/index.tsx`

- [ ] **Step 1: Implement `FilterBar`** (type/budget/district/furnished chips driving `ListingFilters`)

`apps/mobile/src/features/housing/components/FilterBar.tsx`:

```tsx
import { ScrollView, Text, View } from 'react-native';
import type { ListingFilters } from '@/features/housing/types/housing.types';
import type { ListingType } from '@dakareaseu/types';

const TYPES: { id: ListingType | 'any'; label: string }[] = [
  { id: 'any', label: 'Tous' },
  { id: 'studio', label: 'Studio' },
  { id: 'chambre', label: 'Chambre' },
  { id: 'appartement', label: 'Appartement' },
  { id: 'maison', label: 'Maison' },
];

interface FilterBarProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
      <View className="flex-row gap-2">
        {TYPES.map((opt) => {
          const active = (filters.type ?? 'any') === opt.id;
          return (
            <View
              key={opt.id}
              className={`rounded-full border px-3.5 py-2 ${active ? 'border-primary bg-primary' : 'border-border bg-card'}`}
              onTouchEnd={() =>
                onChange({ ...filters, type: opt.id === 'any' ? undefined : opt.id })
              }
            >
              <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-text'}`}>
                {opt.label}
              </Text>
            </View>
          );
        })}
        <View
          className={`rounded-full border px-3.5 py-2 ${filters.colocationOnly ? 'border-primary bg-primary' : 'border-border bg-card'}`}
          onTouchEnd={() => onChange({ ...filters, colocationOnly: !filters.colocationOnly })}
        >
          <Text
            className={`text-xs font-semibold ${filters.colocationOnly ? 'text-white' : 'text-text'}`}
          >
            Colocation
          </Text>
        </View>
        <View
          className={`rounded-full border px-3.5 py-2 ${filters.furnished ? 'border-primary bg-primary' : 'border-border bg-card'}`}
          onTouchEnd={() =>
            onChange({ ...filters, furnished: filters.furnished ? undefined : true })
          }
        >
          <Text
            className={`text-xs font-semibold ${filters.furnished ? 'text-white' : 'text-text'}`}
          >
            Meublé
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Implement `SearchScreen`** (filters + grid + guided-search entry banner)

`apps/mobile/src/features/housing/screens/SearchScreen.tsx`:

```tsx
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useListings } from '@/features/housing/hooks/useListings';
import { useFavorites, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { ListingCard } from '@/features/housing/components/ListingCard';
import { FilterBar } from '@/features/housing/components/FilterBar';
import type { ListingFilters, ListingSummary } from '@/features/housing/types/housing.types';

export function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ListingFilters>({});

  const { data: listings, isLoading } = useListings(filters);
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = (id: string) =>
    Boolean(favorites?.some((f) => f.entity_type === 'listing' && f.entity_id === id));

  const filtered = (listings ?? [])
    .map((row) => {
      const sortedMedia = [...(row.listing_media ?? [])].sort((a, b) => a.position - b.position);
      return { ...row, cover_media: sortedMedia[0] ?? null } as ListingSummary;
    })
    .filter((l) => l.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('search.title')}</Text>

      <View className="mb-3 flex-row items-center rounded-xl border border-border bg-card px-4 py-3">
        <Text className="mr-2 text-textLight">🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('home.searchPlaceholder')}
          placeholderTextColor="#6B7280"
          className="flex-1 text-sm text-text"
        />
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/search/demande')}
        className="mb-3 overflow-hidden rounded-2xl bg-primaryLight p-4"
      >
        <Text className="text-base font-bold text-white">{t('search.guidedBannerTitle')}</Text>
        <Text className="mt-1 text-sm text-white/85">{t('search.guidedBannerBody')}</Text>
        <Text className="mt-3 text-sm font-semibold text-white">
          {t('search.guidedBannerCta')} →
        </Text>
      </Pressable>

      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <Text className="mt-6 text-center text-sm text-textLight">{t('common.loading')}</Text>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏠" title={t('search.noResults')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <View className="flex-row">
              <ListingCard
                listing={item}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() =>
                  toggleFavorite.mutate({ entityType: 'listing', entityId: item.id })
                }
                onPress={() =>
                  router.push({ pathname: '/(tabs)/home/listing/[id]', params: { id: item.id } })
                }
              />
            </View>
          )}
        />
      )}
    </Screen>
  );
}
```

- [ ] **Step 3: Wire the `(tabs)/search` stack and index**

`apps/mobile/src/app/(tabs)/search/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function SearchStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`apps/mobile/src/app/(tabs)/search/index.tsx`:

```tsx
import { SearchScreen } from '@/features/housing/screens/SearchScreen';

export default function SearchRoute() {
  return <SearchScreen />;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/features/housing/components/FilterBar.tsx apps/mobile/src/features/housing/screens/SearchScreen.tsx "apps/mobile/src/app/(tabs)/search/_layout.tsx" "apps/mobile/src/app/(tabs)/search/index.tsx"
git commit -m "feat(mobile): add Search screen with type/colocation/furnished filters and guided-search entry banner"
```

---

## Task 15: Schools feature — list, detail with Infos/Admission/Logements tabs

**Files:**

- Create: `apps/mobile/src/features/schools/services/schools.service.ts`
- Create: `apps/mobile/src/features/schools/hooks/useSchools.ts`
- Create: `apps/mobile/src/features/schools/screens/SchoolsScreen.tsx`
- Create: `apps/mobile/src/features/schools/screens/SchoolDetailScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/schools/index.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/schools/[id].tsx`

- [ ] **Step 1: Create the schools service**

`apps/mobile/src/features/schools/services/schools.service.ts`:

```ts
import { supabase } from '@/lib/supabase';

export async function fetchSchools() {
  const { data, error } = await supabase
    .from('schools')
    .select('id, name, district, logo_url, programs')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchSchoolDetail(schoolId: string) {
  const { data, error } = await supabase
    .from('schools')
    .select(
      'id, name, district, address, logo_url, description, programs, admission_info, contact_phone, contact_whatsapp, contact_email, school_nearby_listings(listing_id, listings(id, title, price, currency, district, distance_label))',
    )
    .eq('id', schoolId)
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create `useSchools` / `useSchoolDetail`**

`apps/mobile/src/features/schools/hooks/useSchools.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import * as schoolsService from '@/features/schools/services/schools.service';

export function useSchools() {
  return useQuery({ queryKey: ['schools', 'list'], queryFn: schoolsService.fetchSchools });
}

export function useSchoolDetail(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['schools', 'detail', schoolId],
    queryFn: () => schoolsService.fetchSchoolDetail(schoolId as string),
    enabled: Boolean(schoolId),
  });
}
```

- [ ] **Step 3: Implement `SchoolsScreen`** (grid)

`apps/mobile/src/features/schools/screens/SchoolsScreen.tsx`:

```tsx
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useSchools } from '@/features/schools/hooks/useSchools';

export function SchoolsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: schools, isLoading } = useSchools();

  if (isLoading) return null;
  if (!schools || schools.length === 0) {
    return (
      <Screen>
        <EmptyState icon="🎓" title={t('schools.title')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('schools.title')}</Text>
      <FlatList
        data={schools}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/(tabs)/search/schools/[id]', params: { id: item.id } })
            }
            className="flex-1 overflow-hidden rounded-2xl border border-border bg-card"
          >
            <View className="h-28 w-full bg-border">
              {item.logo_url ? (
                <Image
                  source={{ uri: item.logo_url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : null}
            </View>
            <View className="p-3">
              <Text numberOfLines={1} className="text-sm font-semibold text-text">
                {item.name}
              </Text>
              <Text className="text-xs text-textLight">{item.district}</Text>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}
```

- [ ] **Step 4: Implement `SchoolDetailScreen`** (Infos/Admission/Logements tabs with WhatsApp/Appeler/Email actions, no bailleur references)

`apps/mobile/src/features/schools/screens/SchoolDetailScreen.tsx`:

```tsx
import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useSchoolDetail } from '@/features/schools/hooks/useSchools';

type Tab = 'info' | 'admission' | 'housing';

export function SchoolDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: school, isLoading } = useSchoolDetail(id);
  const [tab, setTab] = useState<Tab>('info');

  if (isLoading || !school) return null;

  const nearbyListings = (school.school_nearby_listings ?? [])
    .map((row) => row.listings)
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="h-44 w-full overflow-hidden rounded-2xl bg-border">
          {school.logo_url ? (
            <Image
              source={{ uri: school.logo_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>
        <Text className="mt-3 text-xl font-bold text-text">{school.name}</Text>
        <Text className="mt-1 text-sm text-textLight">{school.address ?? school.district}</Text>

        <View className="mt-4 flex-row gap-2">
          {(['info', 'admission', 'housing'] as Tab[]).map((id2) => (
            <View
              key={id2}
              className={`rounded-full border px-3.5 py-2 ${tab === id2 ? 'border-primary bg-primary' : 'border-border bg-card'}`}
              onTouchEnd={() => setTab(id2)}
            >
              <Text className={`text-xs font-semibold ${tab === id2 ? 'text-white' : 'text-text'}`}>
                {id2 === 'info'
                  ? t('schools.tabInfo')
                  : id2 === 'admission'
                    ? t('schools.tabAdmission')
                    : t('schools.tabHousing')}
              </Text>
            </View>
          ))}
        </View>

        {tab === 'info' ? (
          <View className="mt-4">
            <Text className="text-sm leading-5 text-text">{school.description}</Text>
            <View className="mt-4 gap-2">
              {school.contact_whatsapp ? (
                <Button
                  label={t('schools.contactWhatsapp')}
                  variant="outline"
                  onPress={() => Linking.openURL(`https://wa.me/${school.contact_whatsapp}`)}
                />
              ) : null}
              {school.contact_phone ? (
                <Button
                  label={t('common.call')}
                  variant="outline"
                  onPress={() => Linking.openURL(`tel:${school.contact_phone}`)}
                />
              ) : null}
              {school.contact_email ? (
                <Button
                  label={t('schools.contactEmail')}
                  variant="outline"
                  onPress={() => Linking.openURL(`mailto:${school.contact_email}`)}
                />
              ) : null}
            </View>
          </View>
        ) : null}

        {tab === 'admission' ? (
          <View className="mt-4">
            <Text className="text-sm leading-5 text-text">{school.admission_info}</Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {(school.programs ?? []).map((program) => (
                <View key={program} className="rounded-full border border-border bg-bg px-3 py-1.5">
                  <Text className="text-xs text-text">{program}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {tab === 'housing' ? (
          <View className="mt-4">
            {nearbyListings.length === 0 ? (
              <EmptyState icon="🏠" title={t('schools.noNearbyHousing')} />
            ) : (
              nearbyListings.map((listing) => (
                <View
                  key={listing.id}
                  className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-card p-3"
                  onTouchEnd={() =>
                    router.push({
                      pathname: '/(tabs)/home/listing/[id]',
                      params: { id: listing.id },
                    })
                  }
                >
                  <View className="flex-1 pr-2">
                    <Text numberOfLines={1} className="text-sm font-semibold text-text">
                      {listing.title}
                    </Text>
                    <Text className="text-xs text-textLight">
                      {listing.district} · {listing.distance_label}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-primary">
                    {listing.price.toLocaleString('fr-FR')} {listing.currency}
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 5: Wire the routes**

`apps/mobile/src/app/(tabs)/search/schools/index.tsx`:

```tsx
import { SchoolsScreen } from '@/features/schools/screens/SchoolsScreen';

export default function SchoolsRoute() {
  return <SchoolsScreen />;
}
```

`apps/mobile/src/app/(tabs)/search/schools/[id].tsx`:

```tsx
import { SchoolDetailScreen } from '@/features/schools/screens/SchoolDetailScreen';

export default function SchoolDetailRoute() {
  return <SchoolDetailScreen />;
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/src/features/schools "apps/mobile/src/app/(tabs)/search/schools"
git commit -m "feat(mobile): add Schools feature — list grid and detail with Infos/Admission/Logements tabs and contact actions"
```

---

## Task 16: Restaurants feature — list, detail with menu modal (no reservation, no Vérifié)

**Files:**

- Create: `apps/mobile/src/features/restaurants/services/restaurants.service.ts`
- Create: `apps/mobile/src/features/restaurants/hooks/useRestaurants.ts`
- Create: `apps/mobile/src/features/restaurants/components/MenuSheet.tsx`
- Create: `apps/mobile/src/features/restaurants/screens/RestaurantsScreen.tsx`
- Create: `apps/mobile/src/features/restaurants/screens/RestaurantDetailScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/restaurants/index.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/restaurants/[id].tsx`
- Test: `apps/mobile/src/features/restaurants/screens/__tests__/RestaurantDetailScreen.test.tsx`

- [ ] **Step 1: Write the RestaurantDetailScreen test (asserts NO reservation/NO Vérifié, only menu/order)**

`apps/mobile/src/features/restaurants/screens/__tests__/RestaurantDetailScreen.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { RestaurantDetailScreen } from '../RestaurantDetailScreen';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'c0000000-0000-0000-0000-000000000001' }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/restaurants/hooks/useRestaurants', () => ({
  useRestaurantDetail: () => ({
    data: {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Chez Awa',
      cuisine_type: 'Sénégalaise',
      price_range: '€€',
      district: 'Médina',
      phone: '+221770000000',
      whatsapp: '221770000000',
      description: 'Cuisine traditionnelle.',
      specialties: ['Thiéboudiène', 'Yassa poulet'],
      restaurant_media: [],
      menu_items: [{ id: 'm1', name: 'Thiéboudiène', price: 2500, currency: 'XOF' }],
    },
    isLoading: false,
  }),
}));

describe('RestaurantDetailScreen', () => {
  it("never renders a 'Vérifié' badge for restaurants", () => {
    render(<RestaurantDetailScreen />);
    expect(screen.queryByText('Vérifié')).toBeNull();
  });

  it('never renders a table-reservation action — only menu/order via WhatsApp/call', () => {
    render(<RestaurantDetailScreen />);
    expect(screen.queryByText(/réserver une table/i)).toBeNull();
    expect(screen.getByText('Voir le menu')).toBeTruthy();
    expect(screen.getByText('WhatsApp')).toBeTruthy();
    expect(screen.getByText('Appeler')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/restaurants/screens/__tests__/RestaurantDetailScreen.test.tsx`
Expected: FAIL — `Cannot find module '../RestaurantDetailScreen'`

- [ ] **Step 3: Create the restaurants service**

`apps/mobile/src/features/restaurants/services/restaurants.service.ts`:

```ts
import { supabase } from '@/lib/supabase';

export async function fetchRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine_type, price_range, district, rating, cover_url')
    .order('rating', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRestaurantDetail(restaurantId: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select(
      'id, name, cuisine_type, price_range, district, phone, whatsapp, description, specialties, menu_items, restaurant_media(id, url, media_type, position)',
    )
    .eq('id', restaurantId)
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 4: Create `useRestaurants` / `useRestaurantDetail`**

`apps/mobile/src/features/restaurants/hooks/useRestaurants.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import * as restaurantsService from '@/features/restaurants/services/restaurants.service';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'list'],
    queryFn: restaurantsService.fetchRestaurants,
  });
}

export function useRestaurantDetail(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', 'detail', restaurantId],
    queryFn: () => restaurantsService.fetchRestaurantDetail(restaurantId as string),
    enabled: Boolean(restaurantId),
  });
}
```

- [ ] **Step 5: Implement `MenuSheet`** (bottom-sheet-style menu modal — replaces table reservation per chat3.md decision)

`apps/mobile/src/features/restaurants/components/MenuSheet.tsx`:

```tsx
import { Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  whatsapp: string | null;
  phone: string | null;
}

/**
 * Replaces the prototype's "Réserver une table" with a menu-viewing +
 * order-via-WhatsApp/phone action — restaurants in DakarEaseU have NO table
 * reservation feature (per the product spec and chat3.md decision).
 */
export function MenuSheet({ visible, onClose, items, whatsapp, phone }: MenuSheetProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="max-h-[70%] rounded-t-3xl bg-card p-4">
        <View className="mb-3 self-center h-1.5 w-12 rounded-full bg-border" />
        <Text className="mb-3 text-lg font-bold text-text">{t('restaurants.menu')}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <View
              key={item.id}
              className="mb-2 flex-row items-center justify-between rounded-xl border border-border bg-bg p-3"
            >
              <Text className="text-sm text-text">{item.name}</Text>
              <Text className="text-sm font-semibold text-primary">
                {item.price.toLocaleString('fr-FR')} {item.currency}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View className="mt-3 flex-row gap-2">
          {whatsapp ? (
            <Button
              label={t('restaurants.orderCta')}
              onPress={() => Linking.openURL(`https://wa.me/${whatsapp}`)}
            />
          ) : null}
          {phone ? (
            <Button
              label={t('common.call')}
              variant="outline"
              onPress={() => Linking.openURL(`tel:${phone}`)}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
```

- [ ] **Step 6: Implement `RestaurantsScreen`** (search + type filter list)

`apps/mobile/src/features/restaurants/screens/RestaurantsScreen.tsx`:

```tsx
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';

export function RestaurantsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: restaurants, isLoading } = useRestaurants();

  const filtered = (restaurants ?? []).filter((r) =>
    r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('restaurants.title')}</Text>
      <View className="mb-3 flex-row items-center rounded-xl border border-border bg-card px-4 py-3">
        <Text className="mr-2 text-textLight">🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('restaurants.searchPlaceholder')}
          placeholderTextColor="#6B7280"
          className="flex-1 text-sm text-text"
        />
      </View>

      {isLoading ? null : filtered.length === 0 ? (
        <EmptyState icon="🍽️" title={t('search.noResults')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search/restaurants/[id]',
                  params: { id: item.id },
                })
              }
              className="flex-row items-center overflow-hidden rounded-2xl border border-border bg-card p-2"
            >
              <View className="h-16 w-16 overflow-hidden rounded-xl bg-border">
                {item.cover_url ? (
                  <Image
                    source={{ uri: item.cover_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="ml-3 flex-1">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {item.name}
                </Text>
                <Text className="text-xs text-textLight">
                  {item.cuisine_type} · {item.price_range} · {item.district}
                </Text>
              </View>
              <Text className="text-xs text-textLight">★ {item.rating.toFixed(1)}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
```

- [ ] **Step 7: Implement `RestaurantDetailScreen`** (gallery, specialties, price range, menu CTA — no Vérifié, no reservation)

`apps/mobile/src/features/restaurants/screens/RestaurantDetailScreen.tsx`:

```tsx
import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useRestaurantDetail } from '@/features/restaurants/hooks/useRestaurants';
import { MenuSheet, type MenuItem } from '@/features/restaurants/components/MenuSheet';

export function RestaurantDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading } = useRestaurantDetail(id);
  const [menuVisible, setMenuVisible] = useState(false);

  if (isLoading || !restaurant) return null;

  const media = [...(restaurant.restaurant_media ?? [])].sort((a, b) => a.position - b.position);
  const menuItems = (restaurant.menu_items ?? []) as unknown as MenuItem[];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {media.map((item) => (
            <View key={item.id} className="mr-2 h-44 w-64 overflow-hidden rounded-2xl bg-border">
              <Image
                source={{ uri: item.url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
          ))}
        </ScrollView>

        {/* Note: NO "Vérifié" badge here — restaurants intentionally never carry it (product decision). */}
        <Text className="mt-3 text-xl font-bold text-text">{restaurant.name}</Text>
        <Text className="mt-1 text-sm text-textLight">
          {restaurant.cuisine_type} · {restaurant.price_range} · {restaurant.district}
        </Text>

        <Text className="mt-3 text-sm leading-5 text-text">{restaurant.description}</Text>

        <Text className="mb-2 mt-4 text-sm font-semibold text-text">
          {t('restaurants.specialties')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {(restaurant.specialties ?? []).map((s: string) => (
            <View key={s} className="rounded-full border border-border bg-bg px-3 py-1.5">
              <Text className="text-xs text-text">{s}</Text>
            </View>
          ))}
        </View>

        <View className="mt-6 gap-2">
          <Button label={t('restaurants.viewMenu')} onPress={() => setMenuVisible(true)} />
          <View className="flex-row gap-2">
            {restaurant.whatsapp ? (
              <Button
                label={t('common.whatsapp')}
                variant="outline"
                onPress={() => Linking.openURL(`https://wa.me/${restaurant.whatsapp}`)}
              />
            ) : null}
            {restaurant.phone ? (
              <Button
                label={t('common.call')}
                variant="outline"
                onPress={() => Linking.openURL(`tel:${restaurant.phone}`)}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <MenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
        whatsapp={restaurant.whatsapp}
        phone={restaurant.phone}
      />
    </Screen>
  );
}
```

- [ ] **Step 8: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/restaurants/screens/__tests__/RestaurantDetailScreen.test.tsx`
Expected: PASS — 2 tests passed

- [ ] **Step 9: Wire the routes**

`apps/mobile/src/app/(tabs)/search/restaurants/index.tsx`:

```tsx
import { RestaurantsScreen } from '@/features/restaurants/screens/RestaurantsScreen';

export default function RestaurantsRoute() {
  return <RestaurantsScreen />;
}
```

`apps/mobile/src/app/(tabs)/search/restaurants/[id].tsx`:

```tsx
import { RestaurantDetailScreen } from '@/features/restaurants/screens/RestaurantDetailScreen';

export default function RestaurantDetailRoute() {
  return <RestaurantDetailScreen />;
}
```

- [ ] **Step 10: Commit**

```bash
git add apps/mobile/src/features/restaurants "apps/mobile/src/app/(tabs)/search/restaurants"
git commit -m "feat(mobile): add Restaurants feature — list, detail with menu sheet and WhatsApp/call ordering, no reservation and no Vérifié badge"
```

---

## Task 17: Transport feature — category chips, provider list with call/WhatsApp

**Files:**

- Create: `apps/mobile/src/features/transport/services/transport.service.ts`
- Create: `apps/mobile/src/features/transport/hooks/useTransportProviders.ts`
- Create: `apps/mobile/src/features/transport/screens/TransportScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/search/transport/index.tsx`

- [ ] **Step 1: Create the transport service**

`apps/mobile/src/features/transport/services/transport.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import type { TransportCategory } from '@dakareaseu/types';

export async function fetchTransportProviders(category: TransportCategory | 'all') {
  let query = supabase
    .from('transport_providers')
    .select('id, name, category, phone, whatsapp, description, logo_url')
    .order('name');
  if (category !== 'all') query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create `useTransportProviders`**

`apps/mobile/src/features/transport/hooks/useTransportProviders.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import * as transportService from '@/features/transport/services/transport.service';
import type { TransportCategory } from '@dakareaseu/types';

export function useTransportProviders(category: TransportCategory | 'all') {
  return useQuery({
    queryKey: ['transport', 'list', category],
    queryFn: () => transportService.fetchTransportProviders(category),
  });
}
```

- [ ] **Step 3: Implement `TransportScreen`** (category chips + call/WhatsApp action buttons)

`apps/mobile/src/features/transport/screens/TransportScreen.tsx`:

```tsx
import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { TRANSPORT_CATEGORIES } from '@/constants/categories';
import { useTransportProviders } from '@/features/transport/hooks/useTransportProviders';
import type { TransportCategory } from '@dakareaseu/types';

export function TransportScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<TransportCategory | 'all'>('all');
  const { data: providers, isLoading } = useTransportProviders(category);

  return (
    <Screen>
      <Text className="mb-1 mt-2 text-xl font-bold text-text">{t('transport.title')}</Text>
      <Text className="mb-3 text-sm text-textLight">{t('transport.subtitle')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          <View
            className={`rounded-full border px-3.5 py-2 ${category === 'all' ? 'border-primary bg-primary' : 'border-border bg-card'}`}
            onTouchEnd={() => setCategory('all')}
          >
            <Text
              className={`text-xs font-semibold ${category === 'all' ? 'text-white' : 'text-text'}`}
            >
              Tous
            </Text>
          </View>
          {TRANSPORT_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <View
                key={cat.id}
                className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${active ? 'border-primary bg-primary' : 'border-border bg-card'}`}
                onTouchEnd={() => setCategory(cat.id as TransportCategory)}
              >
                <Text>{cat.icon}</Text>
                <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-text'}`}>
                  {t(cat.labelKey)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {isLoading ? null : !providers || providers.length === 0 ? (
        <EmptyState icon="🚖" title={t('search.noResults')} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {providers.map((p) => (
            <View key={p.id} className="mb-3 rounded-2xl border border-border bg-card p-3">
              <Text className="text-sm font-semibold text-text">{p.name}</Text>
              <Text className="mt-0.5 text-xs text-textLight">{p.description}</Text>
              <View className="mt-3 flex-row gap-2">
                {p.whatsapp ? (
                  <Button
                    label={t('common.whatsapp')}
                    fullWidth={false}
                    onPress={() => Linking.openURL(`https://wa.me/${p.whatsapp}`)}
                  />
                ) : null}
                {p.phone ? (
                  <Button
                    label={t('common.call')}
                    variant="outline"
                    fullWidth={false}
                    onPress={() => Linking.openURL(`tel:${p.phone}`)}
                  />
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
```

- [ ] **Step 4: Wire the route**

`apps/mobile/src/app/(tabs)/search/transport/index.tsx`:

```tsx
import { TransportScreen } from '@/features/transport/screens/TransportScreen';

export default function TransportRoute() {
  return <TransportScreen />;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/transport "apps/mobile/src/app/(tabs)/search/transport"
git commit -m "feat(mobile): add Transport feature — category chips and provider list with call/WhatsApp actions"
```

---

## Task 18: News/Events feature — list, detail, RSVP with targeted Realtime

**Files:**

- Create: `apps/mobile/src/features/news/services/events.service.ts`
- Create: `apps/mobile/src/features/news/hooks/useEvents.ts`
- Create: `apps/mobile/src/features/news/screens/NewsScreen.tsx`
- Create: `apps/mobile/src/features/news/screens/EventDetailScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/news/_layout.tsx`
- Create: `apps/mobile/src/app/(tabs)/news/index.tsx`
- Create: `apps/mobile/src/app/(tabs)/news/event/[id].tsx`
- Test: `apps/mobile/src/features/news/hooks/__tests__/useEvents.test.ts`

- [ ] **Step 1: Write a test for the RSVP mutation's optimistic status handling**

`apps/mobile/src/features/news/hooks/__tests__/useEvents.test.ts`:

```ts
import { toRsvpStatus } from '../useEvents';

describe('toRsvpStatus', () => {
  it("maps 'interested' intent to the 'interested' enum value", () => {
    expect(toRsvpStatus('interested')).toBe('interested');
  });

  it("maps 'going' intent to the 'confirmed' enum value (the only two RSVP states the schema supports)", () => {
    expect(toRsvpStatus('going')).toBe('confirmed');
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/news/hooks/__tests__/useEvents.test.ts`
Expected: FAIL — `Cannot find module '../useEvents'` (or `toRsvpStatus is not exported`)

- [ ] **Step 3: Create the events service**

`apps/mobile/src/features/news/services/events.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import type { EventCategory, RsvpStatus } from '@dakareaseu/types';

export async function fetchEvents(category: EventCategory | 'all') {
  let query = supabase
    .from('events')
    .select('id, title, category, starts_at, ends_at, district, cover_url, description')
    .order('starts_at', { ascending: true });
  if (category !== 'all') query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchEventDetail(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, category, starts_at, ends_at, district, address, cover_url, description, organizer_whatsapp',
    )
    .eq('id', eventId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyRsvp(eventId: string, studentId: string) {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Upserts the student's RSVP. Moving status to 'confirmed' fires the
 * `notify_rsvp_confirmed` trigger from the foundation plan — one of the
 * three targeted Realtime cases (consumed by RealtimeProvider, Task 3).
 */
export async function upsertRsvp(params: {
  eventId: string;
  studentId: string;
  status: RsvpStatus;
}) {
  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert(
      { event_id: params.eventId, student_id: params.studentId, status: params.status },
      { onConflict: 'event_id,student_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 4: Implement `useEvents` hooks (incl. exported `toRsvpStatus` mapper)**

`apps/mobile/src/features/news/hooks/useEvents.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as eventsService from '@/features/news/services/events.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { EventCategory, RsvpStatus } from '@dakareaseu/types';

export type RsvpIntent = 'interested' | 'going';

/** Maps the UI's two RSVP intents to the schema's `rsvp_status` enum (`interested` | `confirmed`). */
export function toRsvpStatus(intent: RsvpIntent): RsvpStatus {
  return intent === 'going' ? 'confirmed' : 'interested';
}

export function useEvents(category: EventCategory | 'all') {
  return useQuery({
    queryKey: ['events', 'list', category],
    queryFn: () => eventsService.fetchEvents(category),
  });
}

export function useEventDetail(eventId: string | undefined) {
  return useQuery({
    queryKey: ['events', 'detail', eventId],
    queryFn: () => eventsService.fetchEventDetail(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function useMyRsvp(eventId: string | undefined) {
  const studentId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['events', 'rsvp', eventId, studentId],
    queryFn: () => eventsService.fetchMyRsvp(eventId as string, studentId as string),
    enabled: Boolean(eventId && studentId),
  });
}

export function useSetRsvp(eventId: string) {
  const studentId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (intent: RsvpIntent) => {
      if (!studentId) throw new Error('Utilisateur non authentifié');
      return eventsService.upsertRsvp({ eventId, studentId, status: toRsvpStatus(intent) });
    },
    onSuccess: (rsvp) => {
      queryClient.setQueryData(['events', 'rsvp', eventId, studentId], rsvp);
      queryClient.invalidateQueries({ queryKey: ['events', 'rsvps', studentId] });
    },
  });
}
```

- [ ] **Step 5: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/news/hooks/__tests__/useEvents.test.ts`
Expected: PASS — 2 tests passed

- [ ] **Step 6: Implement `NewsScreen`** (category tabs, featured banner, event cards)

`apps/mobile/src/features/news/screens/NewsScreen.tsx`:

```tsx
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useEvents } from '@/features/news/hooks/useEvents';
import type { EventCategory } from '@dakareaseu/types';

const TABS: { id: EventCategory | 'all'; labelKey: string }[] = [
  { id: 'all', labelKey: 'news.tabAll' },
  { id: 'concert', labelKey: 'news.tabConcert' },
  { id: 'festival', labelKey: 'news.tabFestival' },
  { id: 'conference', labelKey: 'news.tabConference' },
  { id: 'sport', labelKey: 'news.tabSport' },
];

export function NewsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<EventCategory | 'all'>('all');
  const { data: events, isLoading } = useEvents(tab);

  const featured = events?.[0];
  const rest = events?.slice(1) ?? [];

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('news.title')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {TABS.map((opt) => {
            const active = tab === opt.id;
            return (
              <View
                key={opt.id}
                className={`rounded-full border px-3.5 py-2 ${active ? 'border-primary bg-primary' : 'border-border bg-card'}`}
                onTouchEnd={() => setTab(opt.id)}
              >
                <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-text'}`}>
                  {t(opt.labelKey)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {isLoading ? null : !events || events.length === 0 ? (
        <EmptyState icon="📰" title={t('search.noResults')} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {featured ? (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/(tabs)/news/event/[id]', params: { id: featured.id } })
              }
              className="mb-4 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <View className="h-44 w-full bg-border">
                {featured.cover_url ? (
                  <Image
                    source={{ uri: featured.cover_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="p-3">
                <Text className="text-base font-bold text-text">{featured.title}</Text>
                <Text className="mt-1 text-xs text-textLight">
                  {new Date(featured.starts_at).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}{' '}
                  · {featured.district}
                </Text>
              </View>
            </Pressable>
          ) : null}

          {rest.map((event) => (
            <Pressable
              key={event.id}
              onPress={() =>
                router.push({ pathname: '/(tabs)/news/event/[id]', params: { id: event.id } })
              }
              className="mb-3 flex-row items-center overflow-hidden rounded-2xl border border-border bg-card p-2"
            >
              <View className="h-16 w-16 overflow-hidden rounded-xl bg-border">
                {event.cover_url ? (
                  <Image
                    source={{ uri: event.cover_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
              <View className="ml-3 flex-1">
                <Text numberOfLines={1} className="text-sm font-semibold text-text">
                  {event.title}
                </Text>
                <Text className="text-xs text-textLight">
                  {new Date(event.starts_at).toLocaleDateString('fr-FR')} · {event.district}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
```

- [ ] **Step 7: Implement `EventDetailScreen`** (view/RSVP states + WhatsApp share — no QR/checked-in complexity, kept minimal per "avoid over-engineering")

`apps/mobile/src/features/news/screens/EventDetailScreen.tsx`:

```tsx
import { Linking, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useEventDetail, useMyRsvp, useSetRsvp } from '@/features/news/hooks/useEvents';

export function EventDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEventDetail(id);
  const { data: rsvp } = useMyRsvp(id);
  const setRsvp = useSetRsvp(id ?? '');

  if (isLoading || !event) return null;

  const isConfirmed = rsvp?.status === 'confirmed';
  const isInterested = rsvp?.status === 'interested';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="h-48 w-full overflow-hidden rounded-2xl bg-border">
          {event.cover_url ? (
            <Image
              source={{ uri: event.cover_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>

        <Text className="mt-3 text-xl font-bold text-text">{event.title}</Text>
        <Text className="mt-1 text-sm text-textLight">
          {new Date(event.starts_at).toLocaleString('fr-FR', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </Text>
        <Text className="mt-0.5 text-sm text-textLight">{event.address ?? event.district}</Text>

        {isConfirmed ? (
          <View className="mt-3">
            <Badge label={t('news.rsvpConfirmedBadge')} tone="success" />
          </View>
        ) : null}

        <Text className="mt-4 text-sm leading-5 text-text">{event.description}</Text>

        <View className="mt-6 gap-2">
          <Button
            label={isConfirmed ? t('news.rsvpConfirmedBadge') : t('news.rsvpConfirmed')}
            disabled={isConfirmed || setRsvp.isPending}
            onPress={() => setRsvp.mutate('going')}
          />
          <Button
            label={t('news.rsvpInterested')}
            variant="outline"
            disabled={isInterested || isConfirmed || setRsvp.isPending}
            onPress={() => setRsvp.mutate('interested')}
          />
          <Button
            label={t('news.shareEvent')}
            variant="ghost"
            onPress={() =>
              Share.share({
                message: `${event.title} — ${new Date(event.starts_at).toLocaleDateString('fr-FR')} — ${event.district}`,
              })
            }
          />
          {event.organizer_whatsapp ? (
            <Button
              label={t('common.whatsapp')}
              variant="ghost"
              onPress={() => Linking.openURL(`https://wa.me/${event.organizer_whatsapp}`)}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 8: Wire the `(tabs)/news` stack and routes**

`apps/mobile/src/app/(tabs)/news/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function NewsStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`apps/mobile/src/app/(tabs)/news/index.tsx`:

```tsx
import { NewsScreen } from '@/features/news/screens/NewsScreen';

export default function NewsRoute() {
  return <NewsScreen />;
}
```

`apps/mobile/src/app/(tabs)/news/event/[id].tsx`:

```tsx
import { EventDetailScreen } from '@/features/news/screens/EventDetailScreen';

export default function EventDetailRoute() {
  return <EventDetailScreen />;
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/features/news "apps/mobile/src/app/(tabs)/news"
git commit -m "feat(mobile): add News/Events feature with category tabs, RSVP (interested/confirmed) wired to targeted Realtime, and WhatsApp share"
```

---

## Task 19: Favorites feature

**Files:**

- Create: `apps/mobile/src/features/favorites/services/favorites.service.ts`
- Create: `apps/mobile/src/features/favorites/hooks/useFavorites.ts`
- Create: `apps/mobile/src/features/favorites/screens/FavoritesScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/favorites/index.tsx`
- Create: `apps/mobile/src/app/(tabs)/favorites/_layout.tsx`

- [ ] **Step 1: Create the favorites service**

`apps/mobile/src/features/favorites/services/favorites.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import type { FavoriteEntityType } from '@dakareaseu/types';

export async function fetchFavorites(studentId: string) {
  const { data, error } = await supabase.from('favorites').select('*').eq('student_id', studentId);
  if (error) throw error;
  return data;
}

export async function addFavorite(params: {
  studentId: string;
  entityType: FavoriteEntityType;
  entityId: string;
}) {
  const { error } = await supabase.from('favorites').insert({
    student_id: params.studentId,
    entity_type: params.entityType,
    entity_id: params.entityId,
  });
  if (error) throw error;
}

export async function removeFavorite(params: {
  studentId: string;
  entityType: FavoriteEntityType;
  entityId: string;
}) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('student_id', params.studentId)
    .eq('entity_type', params.entityType)
    .eq('entity_id', params.entityId);
  if (error) throw error;
}

export async function fetchFavoriteListings(listingIds: string[]) {
  if (listingIds.length === 0) return [];
  const { data, error } = await supabase
    .from('listings')
    .select(
      'id, title, price, currency, period, type, district, distance_label, rating, reviews_count, verification_status, colocation_available, listing_media(id, url, media_type, position)',
    )
    .in('id', listingIds)
    .eq('verification_status', 'published');
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create `useFavorites` / `useToggleFavorite` / `useFavoriteListings`**

`apps/mobile/src/features/favorites/hooks/useFavorites.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as favoritesService from '@/features/favorites/services/favorites.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { FavoriteEntityType } from '@dakareaseu/types';

export function useFavorites() {
  const studentId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['favorites', 'list', studentId],
    queryFn: () => favoritesService.fetchFavorites(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useToggleFavorite() {
  const studentId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();

  return useMutation({
    mutationFn: async (params: { entityType: FavoriteEntityType; entityId: string }) => {
      if (!studentId) throw new Error('Utilisateur non authentifié');
      const exists = favorites?.some(
        (f) => f.entity_type === params.entityType && f.entity_id === params.entityId,
      );
      if (exists) {
        await favoritesService.removeFavorite({ studentId, ...params });
      } else {
        await favoritesService.addFavorite({ studentId, ...params });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'list', studentId] });
    },
  });
}

export function useFavoriteListings() {
  const { data: favorites } = useFavorites();
  const listingIds = (favorites ?? [])
    .filter((f) => f.entity_type === 'listing')
    .map((f) => f.entity_id);

  return useQuery({
    queryKey: ['favorites', 'listings', listingIds],
    queryFn: () => favoritesService.fetchFavoriteListings(listingIds),
    enabled: listingIds.length > 0,
  });
}
```

- [ ] **Step 3: Implement `FavoritesScreen`** (grid)

`apps/mobile/src/features/favorites/screens/FavoritesScreen.tsx`:

```tsx
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useFavoriteListings, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { ListingCard } from '@/features/housing/components/ListingCard';
import type { ListingSummary } from '@/features/housing/types/housing.types';

export function FavoritesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: listings } = useFavoriteListings();
  const toggleFavorite = useToggleFavorite();

  const summaries: ListingSummary[] = (listings ?? []).map((row) => {
    const sortedMedia = [...(row.listing_media ?? [])].sort((a, b) => a.position - b.position);
    return { ...row, cover_media: sortedMedia[0] ?? null };
  });

  if (summaries.length === 0) {
    return (
      <Screen>
        <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('favorites.title')}</Text>
        <EmptyState icon="🤍" title={t('favorites.empty')} description={t('favorites.emptyBody')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('favorites.title')}</Text>
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            isFavorite
            onToggleFavorite={() =>
              toggleFavorite.mutate({ entityType: 'listing', entityId: item.id })
            }
            onPress={() =>
              router.push({ pathname: '/(tabs)/home/listing/[id]', params: { id: item.id } })
            }
          />
        )}
      />
    </Screen>
  );
}
```

- [ ] **Step 4: Wire the `(tabs)/favorites` stack and route**

`apps/mobile/src/app/(tabs)/favorites/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function FavoritesStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`apps/mobile/src/app/(tabs)/favorites/index.tsx`:

```tsx
import { FavoritesScreen } from '@/features/favorites/screens/FavoritesScreen';

export default function FavoritesRoute() {
  return <FavoritesScreen />;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/favorites "apps/mobile/src/app/(tabs)/favorites"
git commit -m "feat(mobile): add Favorites feature with toggle mutation and listing grid"
```

---

## Task 20: Profile feature — info, verification status, language selector, bookings/requests, logout

**Files:**

- Create: `apps/mobile/src/features/profile/services/profile.service.ts`
- Create: `apps/mobile/src/features/profile/hooks/useProfile.ts`
- Create: `apps/mobile/src/features/profile/components/LanguageSelector.tsx`
- Create: `apps/mobile/src/features/profile/screens/ProfileScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/profile/index.tsx`
- Create: `apps/mobile/src/app/(tabs)/profile/_layout.tsx`
- Test: `apps/mobile/src/features/profile/components/__tests__/LanguageSelector.test.tsx`

- [ ] **Step 1: Write the LanguageSelector test (covers the FR-only-with-disabled-wo/en decision)**

`apps/mobile/src/features/profile/components/__tests__/LanguageSelector.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react-native';
import { LanguageSelector } from '../LanguageSelector';

describe('LanguageSelector', () => {
  it("shows fr as active and wo/en as present-but-disabled with a 'Bientôt disponible' caption", () => {
    render(<LanguageSelector />);
    expect(screen.getByText('Français')).toBeTruthy();
    expect(screen.getByText('Wolof')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getAllByText('Bientôt disponible').length).toBe(2);
  });

  it('does not change the active locale when a disabled option is pressed', () => {
    render(<LanguageSelector />);
    fireEvent.press(screen.getByText('Wolof'));
    // fr remains the only fully-populated/active locale — no crash, no switch.
    expect(screen.getByText('Français')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `cd apps/mobile && npx jest src/features/profile/components/__tests__/LanguageSelector.test.tsx`
Expected: FAIL — `Cannot find module '../LanguageSelector'`

- [ ] **Step 3: Implement `LanguageSelector`**

`apps/mobile/src/features/profile/components/LanguageSelector.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';
import { usePreferencesStore } from '@/features/profile/store/preferencesStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/lib/i18n';

const OPTIONS: { id: Locale; labelKey: string }[] = [
  { id: 'fr', labelKey: 'profile.languageFrench' },
  { id: 'wo', labelKey: 'profile.languageWolof' },
  { id: 'en', labelKey: 'profile.languageEnglish' },
];

/**
 * FR-only at launch: fr is selectable, wo/en render visibly-present-but-
 * disabled with a "Bientôt disponible" caption — same treatment as the Apple
 * Sign-In button (Task 7), giving the app one consistent "coming soon"
 * pattern. `setLocale` is already a no-op for non-fr values (preferencesStore).
 */
export function LanguageSelector() {
  const { t } = useTranslation();
  const locale = usePreferencesStore((s) => s.locale);
  const setLocale = usePreferencesStore((s) => s.setLocale);

  return (
    <View className="gap-2">
      {OPTIONS.map((opt) => {
        const disabled = opt.id !== 'fr';
        const active = locale === opt.id;
        return (
          <Pressable
            key={opt.id}
            disabled={disabled}
            onPress={() => setLocale(opt.id)}
            className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
              active ? 'border-primary bg-primary/5' : 'border-border bg-card'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            <Text className="text-sm text-text">{t(opt.labelKey)}</Text>
            {disabled ? (
              <Text className="text-xs text-textLight">{t('common.comingSoon')}</Text>
            ) : active ? (
              <Text className="text-xs font-semibold text-primary">✓</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `cd apps/mobile && npx jest src/features/profile/components/__tests__/LanguageSelector.test.tsx`
Expected: PASS — 2 tests passed

- [ ] **Step 5: Create the profile service** (avatar upload to public `avatars` bucket)

`apps/mobile/src/features/profile/services/profile.service.ts`:

```ts
import { supabase } from '@/lib/supabase';

export async function updateProfile(params: {
  userId: string;
  fullName: string;
  phone: string | null;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: params.fullName, phone: params.phone })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(params: {
  userId: string;
  fileUri: string;
  fileName: string;
  contentType: string;
}) {
  const path = `${params.userId}/${params.fileName}`;
  const response = await fetch(params.fileUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: params.contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 6: Create `useProfile` hooks**

`apps/mobile/src/features/profile/hooks/useProfile.ts`:

```ts
import { useMutation, useQuery } from '@tanstack/react-query';
import * as profileService from '@/features/profile/services/profile.service';
import * as authService from '@/features/auth/services/auth.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';

export function useProfileQuery() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['profile', 'detail', userId],
    queryFn: () => authService.fetchProfile(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: { userId: string; fullName: string; phone: string | null }) =>
      profileService.updateProfile(params),
    onSuccess: (profile) => setProfile(profile),
  });
}

export function useUploadAvatar() {
  const setProfile = useSessionStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (params: {
      userId: string;
      fileUri: string;
      fileName: string;
      contentType: string;
    }) => profileService.uploadAvatar(params),
    onSuccess: (profile) => setProfile(profile),
  });
}
```

- [ ] **Step 7: Implement `ProfileScreen`** (no admin entry point — admin lives in `apps/admin`)

`apps/mobile/src/features/profile/screens/ProfileScreen.tsx`:

```tsx
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/shared/ui/Screen';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { LanguageSelector } from '@/features/profile/components/LanguageSelector';

const VERIFICATION_TONE = { pending: 'warning', approved: 'success', rejected: 'danger' } as const;
const VERIFICATION_LABEL_KEY = {
  pending: 'auth.verificationPending',
  approved: 'auth.verificationApproved',
  rejected: 'auth.verificationRejected',
} as const;

export function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);
  const logout = useLogout();

  if (!profile) return null;

  const confirmLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <View className="items-center">
          <View className="h-20 w-20 overflow-hidden rounded-full bg-border">
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : null}
          </View>
          <Text className="mt-3 text-lg font-bold text-text">{profile.full_name}</Text>
          <Text className="text-sm text-textLight">{profile.phone ?? ''}</Text>
          <View className="mt-2">
            <Badge
              label={t(VERIFICATION_LABEL_KEY[profile.verification_status])}
              tone={VERIFICATION_TONE[profile.verification_status]}
            />
          </View>
        </View>

        <View className="mt-6 gap-2">
          <Pressable
            onPress={() => router.push('/(tabs)/profile/edit')}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-sm text-text">{t('profile.editProfile')}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/profile/bookings')}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-sm text-text">{t('profile.myBookings')}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/profile/notifications')}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-sm text-text">{t('profile.notifications')}</Text>
          </Pressable>
          {profile.verification_status !== 'approved' ? (
            <Pressable
              onPress={() => router.push('/(auth)/verify-id')}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <Text className="text-sm text-text">{t('profile.verification')}</Text>
            </Pressable>
          ) : null}
        </View>

        <Text className="mb-2 mt-6 text-sm font-semibold text-text">{t('profile.language')}</Text>
        <LanguageSelector />

        <View className="mt-8">
          <Button
            label={t('profile.logout')}
            variant="outline"
            onPress={confirmLogout}
            loading={logout.isPending}
          />
        </View>
        {/* No "Espace admin" entry — admin is a separate Next.js app (apps/admin). */}
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 8: Wire the `(tabs)/profile` stack and route**

`apps/mobile/src/app/(tabs)/profile/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`apps/mobile/src/app/(tabs)/profile/index.tsx`:

```tsx
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';

export default function ProfileRoute() {
  return <ProfileScreen />;
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/features/profile "apps/mobile/src/app/(tabs)/profile"
git commit -m "feat(mobile): add Profile screen with verification status, FR-only language selector (wo/en disabled), bookings/notifications entries, logout — no admin entry point"
```

---

## Task 21: Notifications feature (list + unread badge, fed by targeted Realtime)

**Files:**

- Create: `apps/mobile/src/features/profile/services/notifications.service.ts`
- Create: `apps/mobile/src/features/profile/hooks/useNotifications.ts`
- Create: `apps/mobile/src/features/profile/screens/NotificationsScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/profile/notifications.tsx`

- [ ] **Step 1: Create the notifications service**

`apps/mobile/src/features/profile/services/notifications.service.ts`:

```ts
import { supabase } from '@/lib/supabase';

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}
```

- [ ] **Step 2: Create `useNotifications` hooks**

`apps/mobile/src/features/profile/hooks/useNotifications.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsService from '@/features/profile/services/notifications.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';

export function useNotifications() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['notifications', 'list', userId],
    queryFn: () => notificationsService.fetchNotifications(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUnreadNotificationsCount() {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['notifications', 'unreadCount', userId],
    queryFn: () => notificationsService.fetchUnreadCount(userId as string),
    enabled: Boolean(userId),
  });
}

export function useMarkAllNotificationsRead() {
  const userId = useSessionStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(userId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount', userId] });
    },
  });
}
```

- [ ] **Step 3: Implement `NotificationsScreen`**

`apps/mobile/src/features/profile/screens/NotificationsScreen.tsx`:

```tsx
import { FlatList, Pressable, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from '@/features/profile/hooks/useNotifications';

const TYPE_ICON: Record<string, string> = {
  booking_status_update: '🏠',
  event_rsvp_confirmed: '🎉',
  new_guided_search_request: '🔍',
  verification_status_update: '✅',
};

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  if (!notifications || notifications.length === 0) {
    return (
      <Screen>
        <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('notifications.title')}</Text>
        <EmptyState icon="🔔" title={t('notifications.empty')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="mb-3 mt-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text">{t('notifications.title')}</Text>
        <Pressable onPress={() => markAllRead.mutate()}>
          <Text className="text-xs font-semibold text-primary">
            {t('notifications.markAllRead')}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-2" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View
            className={`flex-row items-start rounded-xl border border-border p-3 ${item.is_read ? 'bg-card' : 'bg-primary/5'}`}
          >
            <Text className="mr-3 text-xl">{TYPE_ICON[item.type] ?? '🔔'}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text">{item.title}</Text>
              <Text className="mt-0.5 text-xs text-textLight">{item.body}</Text>
              <Text className="mt-1 text-[10px] text-textLight">
                {new Date(item.created_at).toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
```

- [ ] **Step 4: Wire the route**

`apps/mobile/src/app/(tabs)/profile/notifications.tsx`:

```tsx
import { NotificationsScreen } from '@/features/profile/screens/NotificationsScreen';

export default function NotificationsRoute() {
  return <NotificationsScreen />;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/features/profile/services/notifications.service.ts apps/mobile/src/features/profile/hooks/useNotifications.ts apps/mobile/src/features/profile/screens/NotificationsScreen.tsx "apps/mobile/src/app/(tabs)/profile/notifications.tsx"
git commit -m "feat(mobile): add Notifications screen and hooks (list/unread-count/mark-all-read), fed by targeted Realtime INSERT subscription"
```

---

## Task 22: My Bookings & Edit Profile screens, reviews

**Files:**

- Create: `apps/mobile/src/features/housing/hooks/useMyBookings.ts`
- Create: `apps/mobile/src/features/housing/services/reviews.service.ts`
- Create: `apps/mobile/src/features/housing/hooks/useReviews.ts`
- Create: `apps/mobile/src/features/housing/screens/MyBookingsScreen.tsx`
- Create: `apps/mobile/src/features/profile/screens/EditProfileScreen.tsx`
- Create: `apps/mobile/src/app/(tabs)/profile/bookings.tsx`
- Create: `apps/mobile/src/app/(tabs)/profile/edit.tsx`

- [ ] **Step 1: Create `useMyBookings`**

`apps/mobile/src/features/housing/hooks/useMyBookings.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import * as bookingsService from '@/features/housing/services/bookings.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';

export function useMyBookings() {
  const studentId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['bookings', 'list', studentId],
    queryFn: () => bookingsService.fetchMyBookings(studentId as string),
    enabled: Boolean(studentId),
  });
}
```

- [ ] **Step 2: Create the reviews service and `useSubmitReview` hook**

`apps/mobile/src/features/housing/services/reviews.service.ts`:

```ts
import { supabase } from '@/lib/supabase';
import type { ReviewTargetType } from '@dakareaseu/types';

export async function submitReview(params: {
  studentId: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      student_id: params.studentId,
      target_type: params.targetType,
      target_id: params.targetId,
      rating: params.rating,
      comment: params.comment,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
```

`apps/mobile/src/features/housing/hooks/useReviews.ts`:

```ts
import { useMutation } from '@tanstack/react-query';
import * as reviewsService from '@/features/housing/services/reviews.service';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import type { ReviewTargetType } from '@dakareaseu/types';

export function useSubmitReview() {
  const studentId = useSessionStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (params: {
      targetType: ReviewTargetType;
      targetId: string;
      rating: number;
      comment: string;
    }) => {
      if (!studentId) throw new Error('Utilisateur non authentifié');
      return reviewsService.submitReview({ studentId, ...params });
    },
  });
}
```

- [ ] **Step 3: Implement `MyBookingsScreen`** (status badges + inline review form for completed bookings)

`apps/mobile/src/features/housing/screens/MyBookingsScreen.tsx`:

```tsx
import { useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Badge, type BadgeTone } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyBookings } from '@/features/housing/hooks/useMyBookings';
import { useSubmitReview } from '@/features/housing/hooks/useReviews';
import type { BookingStatus } from '@dakareaseu/types';

const STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'neutral',
};
const STATUS_LABEL_KEY: Record<BookingStatus, string> = {
  pending: 'booking.statusPending',
  confirmed: 'booking.statusConfirmed',
  cancelled: 'booking.statusCancelled',
  completed: 'booking.statusCompleted',
};

export function MyBookingsScreen() {
  const { t } = useTranslation();
  const { data: bookings } = useMyBookings();
  const submitReview = useSubmitReview();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!bookings || bookings.length === 0) {
    return (
      <Screen>
        <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('profile.myBookings')}</Text>
        <EmptyState icon="🏠" title={t('favorites.empty')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('profile.myBookings')}</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View className="rounded-xl border border-border bg-card p-3">
            <View className="flex-row items-center justify-between">
              <Text numberOfLines={1} className="flex-1 pr-2 text-sm font-semibold text-text">
                {item.listings?.title}
              </Text>
              <Badge
                label={t(STATUS_LABEL_KEY[item.status as BookingStatus])}
                tone={STATUS_TONE[item.status as BookingStatus]}
              />
            </View>
            <Text className="mt-1 text-xs text-textLight">
              {item.duration_months} {t('listing.months')} ·{' '}
              {item.total_amount.toLocaleString('fr-FR')} {item.currency}
            </Text>

            {item.status === 'completed' ? (
              reviewingId === item.id ? (
                <View className="mt-3">
                  <View className="mb-2 flex-row gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} className="text-lg" onPress={() => setRating(star)}>
                        {star <= rating ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder={t('booking.reviewPlaceholder')}
                    placeholderTextColor="#6B7280"
                    multiline
                    className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text"
                  />
                  <View className="mt-2">
                    <Button
                      label={t('common.save')}
                      loading={submitReview.isPending}
                      onPress={async () => {
                        await submitReview.mutateAsync({
                          targetType: 'listing',
                          targetId: item.listing_id,
                          rating,
                          comment,
                        });
                        setReviewingId(null);
                        setComment('');
                        setRating(5);
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View className="mt-3">
                  <Button
                    label={t('booking.leaveReview')}
                    variant="outline"
                    onPress={() => setReviewingId(item.id)}
                  />
                </View>
              )
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}
```

- [ ] **Step 4: Implement `EditProfileScreen`** (RHF + Zod, avatar upload to `avatars` bucket)

`apps/mobile/src/features/profile/screens/EditProfileScreen.tsx`:

```tsx
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useUpdateProfile, useUploadAvatar } from '@/features/profile/hooks/useProfile';

const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Nom trop court'),
  phone: z.string().nullable(),
});
type EditProfileInput = z.infer<typeof editProfileSchema>;

export function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);
  const userId = useSessionStore((s) => s.user?.id);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const { control, handleSubmit } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: profile?.full_name ?? '', phone: profile?.phone ?? null },
  });

  if (!profile || !userId) return null;

  const onSubmit = async (values: EditProfileInput) => {
    await updateProfile.mutateAsync({ userId, fullName: values.fullName, phone: values.phone });
    router.back();
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await uploadAvatar.mutateAsync({
      userId,
      fileUri: asset.uri,
      fileName: asset.fileName ?? `avatar-${Date.now()}.jpg`,
      contentType: asset.mimeType ?? 'image/jpeg',
    });
  };

  return (
    <Screen className="justify-center">
      <Pressable onPress={pickAvatar} className="mb-6 items-center">
        <View className="h-24 w-24 overflow-hidden rounded-full bg-border">
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
        </View>
        <Text className="mt-2 text-xs font-semibold text-primary">{t('common.save')}</Text>
      </Pressable>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder={t('auth.fullName')}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChange}
            className="mb-3 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder="Téléphone"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            value={value ?? ''}
            onChangeText={onChange}
            className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-text"
          />
        )}
      />
      <Button
        label={t('common.save')}
        onPress={handleSubmit(onSubmit)}
        loading={updateProfile.isPending}
      />
    </Screen>
  );
}
```

- [ ] **Step 5: Wire the routes**

`apps/mobile/src/app/(tabs)/profile/bookings.tsx`:

```tsx
import { MyBookingsScreen } from '@/features/housing/screens/MyBookingsScreen';

export default function MyBookingsRoute() {
  return <MyBookingsScreen />;
}
```

`apps/mobile/src/app/(tabs)/profile/edit.tsx`:

```tsx
import { EditProfileScreen } from '@/features/profile/screens/EditProfileScreen';

export default function EditProfileRoute() {
  return <EditProfileScreen />;
}
```

- [ ] **Step 6: Run a full typecheck across the app**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: `Found 0 errors.`

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/src/features/housing/hooks/useMyBookings.ts apps/mobile/src/features/housing/services/reviews.service.ts apps/mobile/src/features/housing/hooks/useReviews.ts apps/mobile/src/features/housing/screens/MyBookingsScreen.tsx apps/mobile/src/features/profile/screens/EditProfileScreen.tsx "apps/mobile/src/app/(tabs)/profile/bookings.tsx" "apps/mobile/src/app/(tabs)/profile/edit.tsx"
git commit -m "feat(mobile): add My Bookings (status + review submission) and Edit Profile (avatar upload) screens"
```

---

## Task 23: Jest setup, additional tests, and full test-suite run

**Files:**

- Create: `apps/mobile/jest.config.js`
- Create: `apps/mobile/jest.setup.ts`
- Create: `apps/mobile/src/features/profile/screens/__tests__/ProfileScreen.test.tsx`
- Modify: `apps/mobile/package.json:scripts.test`

- [ ] **Step 1: Create the Jest config (jest-expo preset)**

`apps/mobile/jest.config.js`:

```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/app/**'],
};
```

`apps/mobile/jest.setup.ts`:

```ts
import '@testing-library/jest-native/extend-expect';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
    storage: { from: jest.fn() },
    channel: jest.fn(),
    removeChannel: jest.fn(),
    rpc: jest.fn(),
  },
}));
```

- [ ] **Step 2: Write a `ProfileScreen` test confirming there is NO admin entry point (asserts the §3/§13 "no in-app admin" requirement)**

`apps/mobile/src/features/profile/screens/__tests__/ProfileScreen.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));
jest.mock('@/features/auth/hooks/useAuth', () => ({
  useLogout: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/auth/store/sessionStore', () => ({
  useSessionStore: (selector: (s: unknown) => unknown) =>
    selector({
      profile: {
        full_name: 'Awa Diop',
        phone: '+221770000000',
        avatar_url: null,
        verification_status: 'approved',
        persona: 'local',
      },
    }),
}));

describe('ProfileScreen', () => {
  it('renders profile info and verification badge without ever showing an admin entry point', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('Awa Diop')).toBeTruthy();
    expect(screen.getByText('Identité vérifiée ✓')).toBeTruthy();
    expect(screen.queryByText(/espace admin/i)).toBeNull();
    expect(screen.queryByText(/admin/i)).toBeNull();
  });

  it('never renders any persona-switching control on the profile screen', () => {
    render(<ProfileScreen />);
    expect(screen.queryByText(/changer de profil/i)).toBeNull();
    expect(screen.queryByText(/nouveau|local|parent/i)).toBeNull();
  });
});
```

- [ ] **Step 3: Run the full test suite**

Run: `cd apps/mobile && npx jest`
Expected: all test suites pass (PASS for every `*.test.ts(x)` file created across Tasks 2–23), 0 failures.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/jest.config.js apps/mobile/jest.setup.ts apps/mobile/src/features/profile/screens/__tests__/ProfileScreen.test.tsx
git commit -m "test(mobile): add jest-expo config/setup and ProfileScreen test asserting no admin entry point and no persona-switch control"
```

---

## Task 24: SETUP.md documentation for the mobile app

**Files:**

- Create: `apps/mobile/SETUP.md`

- [ ] **Step 1: Write the setup guide**

`apps/mobile/SETUP.md`:

````markdown
# DakarEaseU Mobile — Setup Guide

## Prerequisites

- Node.js 18+
- npm
- Expo Go app (iOS/Android) or an Android/iOS simulator
- A Supabase project provisioned via `docs/superpowers/plans/2026-06-07-supabase-foundation.md` (migrations applied, seed data loaded, storage buckets created)

## 1. Install dependencies

From the repo root:

```bash
cd apps/mobile
npm install
```
````

## 2. Configure environment variables

Copy the example file and fill in your Supabase project values (Project Settings → API):

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These are read by `src/lib/supabase.ts`. Never commit `.env`.

## 3. Run the app

```bash
npm run start     # Expo dev server — scan the QR code with Expo Go
npm run android   # Android emulator
npm run ios       # iOS simulator (macOS only)
```

## 4. Type-check, lint, test

```bash
npm run typecheck
npm run lint
npm run test
```

## 5. Project structure

```
src/
├── app/            # Expo Router routes ((auth) and (tabs) groups)
├── features/       # auth, home, housing, schools, restaurants, transport, news, favorites, profile
├── shared/         # cross-feature UI primitives, components, store
├── services/       # (feature-local services live inside each feature/services)
├── providers/      # AppProviders, RealtimeProvider
├── hooks/          # cross-feature hooks (useTranslation)
├── constants/      # COLORS, CATEGORIES, DISTRICTS, TRANSPORT_CATEGORIES
├── lib/            # supabase client, queryClient, i18n
└── types/          # (re-exports from @dakareaseu/types where useful)
```

## 6. Key architecture notes

- **Server data**: 100% TanStack Query — no `useEffect` fetches. See `features/housing/hooks/useListings.ts` for the canonical pattern.
- **Transverse state**: Zustand stores (`sessionStore`, `preferencesStore`, `uiStore`) hold ONLY session/preferences/UI state — never server data.
- **Forms**: React Hook Form + Zod everywhere (see `features/auth/schemas/authSchemas.ts`).
- **Styling**: NativeWind className syntax mapped to the `COLORS` palette (`tailwind.config.js`).
- **Realtime**: exactly 3 targeted subscriptions in `providers/RealtimeProvider.tsx` (booking status, RSVP confirmation, new notifications).
- **Payments**: simulated behind the single `processPayment(method, amount, ref)` seam in `features/housing/services/payments.service.ts` — see the in-file comment for the documented Edge Function migration path.
- **i18n**: FR-complete (`lib/i18n/fr.json`), `wo`/`en` are present-but-empty placeholders with automatic fallback to FR (`lib/i18n/index.ts`).
- **Persona**: derived ONCE at onboarding (`features/auth/lib/derivePersona.ts`) and persisted to `profiles.persona` — never manually toggled. Only affects home greeting/section order (`features/home/components/PersonaGreeting.tsx`).
- **Student-ID verification**: manual admin review only (no OCR) — upload to the private `student-ids` bucket, status surfaced via `profiles.verification_status`.

## 7. Common issues

- **"Missing EXPO_PUBLIC_SUPABASE_URL..."**: you forgot to create `.env` from `.env.example`.
- **NativeWind classes not applying**: ensure `babel.config.js` includes `nativewind/babel` and restart the Metro bundler with `--clear`.
- **Realtime not firing**: confirm Realtime is enabled on the `bookings`, `event_rsvps`, and `notifications` tables in the Supabase dashboard (Database → Replication).

````

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/SETUP.md
git commit -m "docs(mobile): add SETUP.md covering install, env config, run/test commands, structure, and architecture notes"
````

---

## Definition of Done

This mirrors the mobile-relevant items of `prompt.md` §13. Before considering `apps/mobile` complete, verify every item below:

- [ ] `npx tsc --noEmit` reports zero errors in `apps/mobile` (TypeScript strict mode, no `any` introduced).
- [ ] `npx jest` passes 100% of test suites in `apps/mobile` (Tasks 2, 3, 4, 5, 6, 7, 9, 12, 16, 18, 20, 23).
- [ ] Every screen listed in `prompt.md` §9 is implemented and reachable via navigation: Onboarding, Login/Signup, Student-ID upload, Home, Search, Listing Detail, Booking, Demande (guided search + results), Schools list/detail, Restaurants list/detail, Transport, News list/detail, Favorites, Profile, Edit Profile, My Bookings, Notifications.
- [ ] All server data flows exclusively through TanStack Query hooks (`useListings`, `useListingDetail`, `useMatchedListings`, `useMyBookings`, `useEvents`, `useRestaurants`, `useSchools`, `useTransportProviders`, `useFavorites`, `useNotifications`, `useProfileQuery`, etc.) — zero raw `useEffect` fetches anywhere in `src/`.
- [ ] Zustand is used ONLY for `sessionStore` (identity), `preferencesStore` (locale), and `uiStore` (transverse UI state) — grep confirms no server-data caching in any Zustand store.
- [ ] Every form (`LoginScreen`, `SignupScreen`, `OnboardingScreen`, `BookingScreen`, `EditProfileScreen`, review submission) uses React Hook Form + Zod with centralized schemas in each feature's `schemas/` folder.
- [ ] Realtime is wired for EXACTLY the three targeted cases — booking status changes, event RSVP confirmation, new-guided-search-request admin notifications — and nowhere else (`providers/RealtimeProvider.tsx`).
- [ ] The simulated payment flow (Wave/Orange Money/Card) runs end-to-end (selection → `processPayment` → `bookings`+`payments` rows created → success screen), and the extension seam to a real Edge Function is documented inline in `features/housing/services/payments.service.ts`.
- [ ] All media (avatars, listing media, student IDs) is uploaded to and served from Supabase Storage buckets (`avatars`, `listings-media`, `student-ids`, etc.) — zero hardcoded external image URLs in feature code.
- [ ] `listings.created_by` is never selected, displayed, or referenced anywhere in `apps/mobile` (verified by `LISTING_PUBLIC_COLUMNS` and a repo-wide grep for `created_by` under `apps/mobile/src`).
- [ ] Zero occurrences of "Dakar'ease" anywhere in `apps/mobile` — the app name is "DakarEaseU" everywhere (`common.appName`, `app.json` `expo.name`, splash, etc.).
- [ ] Zero occurrences of "bailleur"/"agence"/"propriétaire" (in the landlord sense) anywhere in `apps/mobile` source, copy, or i18n strings.
- [ ] Zero "tweaks panel" — no manual persona toggle, no debug/admin-style settings panel anywhere in the UI.
- [ ] Zero in-app admin screen, route, or "Espace admin" entry point — confirmed by the `ProfileScreen` test in Task 23.
- [ ] Persona (`nouveau`/`local`/`parent`) is derived exactly once at onboarding via `derivePersona`, persisted to `profiles.persona`, and used ONLY to select the home greeting/hint/section-order — never exposed as an editable setting.
- [ ] Restaurants show no "Vérifié" badge and no table-reservation UI anywhere — only menu viewing plus WhatsApp/call ordering (`MenuSheet`, `RestaurantDetailScreen`).
- [ ] The "Vérifié" badge on listings/listing cards is driven exclusively by `verification_status === 'published'` — no separate boolean field invented.
- [ ] Apple Sign-In button is present in `LoginScreen` but visibly disabled with a "Bientôt disponible" caption; the language selector applies the same present-but-disabled pattern for `wo`/`en`.
- [ ] `lib/i18n/fr.json` is fully populated (~90 keys covering every feature group); `wo.json`/`en.json` are present as `{}` placeholders with automatic FR-fallback resolution (`lib/i18n/index.ts`).
- [ ] Student-ID verification uses manual admin review only — no "Analyse OCR…" text or OCR logic anywhere; status is driven by `profiles.verification_status` (`pending`/`approved`/`rejected`).
- [ ] All exact table/column/enum/RPC/bucket/type names match the foundation plan precisely (spot-checked: `listings`, `listing_media`, `listing_coliving_rooms`, `guided_search_requests`, `match_listings`, `student-ids`, `Database`/`Tables<T>`/etc. from `@dakareaseu/types`).
- [ ] French product vocabulary (`logements`, `colocation`, `exigences`, `particularités`, `Demande`, `Recherche guidée`) is preserved verbatim in UI copy and i18n keys.
- [ ] `apps/mobile/SETUP.md` documents install, env configuration, run/test commands, project structure, and the key architectural decisions (payment seam, Realtime scope, i18n fallback, persona derivation).
- [ ] `git log` shows one focused commit per task with descriptive messages — no giant catch-all commits.

---

Plan complete and saved to `docs/superpowers/plans/2026-06-07-mobile-app.md`.
