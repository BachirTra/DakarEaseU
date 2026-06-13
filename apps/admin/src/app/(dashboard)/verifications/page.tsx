'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { usePendingVerifications } from '@/features/verifications/hooks/use-verifications';
import { VerificationCard } from '@/features/verifications/components/verification-card';

export default function VerificationsPage() {
  const { data: profiles = [], isLoading } = usePendingVerifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vérification étudiante</h1>
        <p className="text-muted-foreground">
          Cartes étudiantes en attente de revue manuelle (cf. décision produit §4.6 — pas d&apos;OCR
          automatisé).
        </p>
      </div>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune carte étudiante en attente de revue.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {profiles.map((profile) => (
            <VerificationCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
