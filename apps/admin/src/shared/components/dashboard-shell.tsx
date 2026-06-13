'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';
import { useNewGuidedSearchRequestAlert } from '@/features/guided-search/hooks/use-new-request-realtime-alert';

const NAV_ITEMS = [
  { href: '/', label: "Vue d'ensemble" },
  { href: '/listings', label: 'Annonces' },
  { href: '/schools', label: 'Écoles' },
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/transport', label: 'Transport' },
  { href: '/events', label: 'Événements' },
  { href: '/verifications', label: 'Vérification étudiante' },
  { href: '/bookings', label: 'Réservations' },
  { href: '/guided-search', label: 'Demandes' },
  { href: '/reviews', label: 'Avis' },
  { href: '/users', label: 'Utilisateurs' },
];

export function DashboardShell({
  adminName,
  currentUserId,
  children,
}: {
  adminName: string;
  currentUserId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const signOut = useSignOut();
  useNewGuidedSearchRequestAlert(currentUserId);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-card p-4">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold">DakarEaseU</p>
          <p className="text-sm text-muted-foreground">Espace admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <p className="text-sm text-muted-foreground">Connecté en tant que {adminName}</p>
          <Button variant="outline" size="sm" onClick={() => signOut.mutate()}>
            Déconnexion
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
