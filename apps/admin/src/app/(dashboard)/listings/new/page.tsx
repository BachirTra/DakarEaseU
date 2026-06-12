'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListingForm } from '@/features/listings/components/listing-form';

export default function NewListingPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle annonce</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm onSaved={(id) => router.push(`/listings/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
