'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackDetail } from '@/features/packs/hooks/use-packs';
import { PackForm } from '@/features/packs/components/pack-form';
import { PackItemsManager } from '@/features/packs/components/pack-items-manager';

export default function PackDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = usePackDetail(params.id);

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;
  const { pack, items } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{pack.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <PackForm pack={pack} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Articles du pack</CardTitle>
        </CardHeader>
        <CardContent>
          <PackItemsManager packId={pack.id} initialItems={items} />
        </CardContent>
      </Card>
    </div>
  );
}
