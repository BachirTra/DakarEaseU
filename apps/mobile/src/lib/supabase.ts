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

// Node.js < 22 has no native WebSocket — required by @supabase/realtime-js in Jest/CI.
// In React Native at runtime, WebSocket is always provided by the RN runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wsImpl = typeof WebSocket !== 'undefined' ? undefined : (require('ws') as typeof WebSocket);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  ...(wsImpl ? { realtime: { transport: wsImpl } } : {}),
});
