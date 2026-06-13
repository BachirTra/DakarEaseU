import '@testing-library/jest-native/extend-expect';

// @supabase/realtime-js throws on Node.js < 22 if no WebSocket implementation is found.
// ws is already a transitive dependency; assigning it globally satisfies the check.
// eslint-disable-next-line @typescript-eslint/no-require-imports
global.WebSocket = require('ws');

// Provide env vars so supabase.ts can be loaded without throwing in tests that import the real module.
process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: 'Link',
  Stack: { Screen: 'Screen' },
  Tabs: { Screen: 'Screen' },
}));
