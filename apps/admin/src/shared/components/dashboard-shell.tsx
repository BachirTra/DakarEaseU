'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';

const NAV_ITEMS = [
  { href: '/dashboard', label: "Vue d'ensemble" },
  { href: '/dashboard/listings', label: 'Annonces' },
  { href: '/dashboard/schools', label: 'Écoles' },
  { href: '/dashboard/restaurants', label: 'Restaurants' },
  { href: '/dashboard/transport', label: 'Transport' },
  { href: '/dashboard/events', label: 'Événements' },
  { href: '/dashboard/verifications', label: 'Vérification étudiante' },
  { href: '/dashboard/bookings', label: 'Réservations' },
  { href: '/dashboard/guided-search', label: 'Demandes' },
  { href: '/dashboard/reviews', label: 'Avis' },
  { href: '/dashboard/users', label: 'Utilisateurs' },
];

export function DashboardShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-card p-4">
        <div className="mb-6 px-2">
          <p className="text-lg font-bold">DakarEaseU</p>
          <p className="text-sm text-muted-foreground">Espace admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
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
