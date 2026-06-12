import { Redirect } from 'expo-router';
import { useSessionStore } from '@/features/auth/store/sessionStore';

export default function Index() {
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);

  if (!user) return <Redirect href="/(auth)/login" />;
  if (profile && !profile.persona) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)/home" />;
}
