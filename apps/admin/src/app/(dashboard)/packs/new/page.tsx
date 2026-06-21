'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackForm } from '@/features/packs/components/pack-form';

export default function NewPackPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouveau pack</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <PackForm onSaved={(id) => router.push(`/packs/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
