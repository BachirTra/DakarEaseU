import { ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { fetchProfile } from "@/features/auth/services/auth.service";

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
