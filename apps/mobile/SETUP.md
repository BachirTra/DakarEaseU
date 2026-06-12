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
- **i18n**: FR-complete (`lib/i18n/fr.json`), `wo`/`en` are present-but-empty placeholders (`lib/i18n/index.ts`).
- **Persona**: derived ONCE at onboarding (`features/auth/lib/derivePersona.ts`) and persisted to `profiles.persona` — never manually toggled. Only affects home greeting/section order (`features/home/components/PersonaGreeting.tsx`).
- **Student-ID verification**: manual admin review only (no OCR) — upload to the private `student-ids` bucket, status surfaced via `profiles.verification_status`.

## 7. Common issues
- **"Missing EXPO_PUBLIC_SUPABASE_URL..."**: you forgot to create `.env` from `.env.example`.
- **NativeWind classes not applying**: ensure `babel.config.js` includes `nativewind/babel` and restart the Metro bundler with `--clear`.
- **Realtime not firing**: confirm Realtime is enabled on the `bookings`, `event_rsvps`, and `notifications` tables in the Supabase dashboard (Database → Replication).
