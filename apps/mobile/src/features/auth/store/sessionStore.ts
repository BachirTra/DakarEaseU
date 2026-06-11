import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@dakareaseu/types";

interface SessionState {
  session: Session | null;
  user: Session["user"] | null;
  profile: Profile | null;
  isInitializing: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitializing: (value: boolean) => void;
  clear: () => void;
}

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
