'use client';

import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useSignedDocumentUrl } from '../hooks/use-verifications';

export function VerificationDocumentViewer({ documentPath }: { documentPath: string | null }) {
  const { data: signedUrl, isLoading, isError, error } = useSignedDocumentUrl(documentPath);

  if (!documentPath) {
    return <p className="text-sm text-muted-foreground">Aucun document n&apos;a été téléversé.</p>;
  }
  if (isLoading) return <Skeleton className="h-64 w-full max-w-sm" />;
  if (isError || !signedUrl) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : 'Document inaccessible.'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Image
        src={signedUrl}
        alt="Carte étudiante"
        width={400}
        height={260}
        className="max-w-sm rounded-md border object-contain"
        unoptimized
      />
      <p className="text-xs text-muted-foreground">
        Lien temporaire (expire après 2 minutes) généré via une URL signée du bucket privé{' '}
        <code>student-ids</code>.
      </p>
    </div>
  );
}
