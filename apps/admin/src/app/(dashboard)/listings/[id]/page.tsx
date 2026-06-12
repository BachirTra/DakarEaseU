'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useListingDetail } from '@/features/listings/hooks/use-listing-detail';
import { ListingForm } from '@/features/listings/components/listing-form';
import { ListingMediaManager } from '@/features/listings/components/listing-media-manager';
import { ListingColivingRoomsManager } from '@/features/listings/components/listing-coliving-rooms-manager';
import { ListingVerificationActions } from '@/features/listings/components/listing-verification-actions';
import { ListingNearbySchoolsManager } from '@/features/listings/components/listing-nearby-schools-manager';

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useListingDetail(params.id);

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full" />;
  }

  const { listing, media, colivingRooms, nearbySchoolIds } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-muted-foreground">Quartier : {listing.district}</p>
        </div>
        <ListingVerificationActions listing={listing} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm listing={listing} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Médias (photos, vidéos, visites 3D)</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingMediaManager listingId={listing.id} media={media} />
        </CardContent>
      </Card>

      {listing.colocation_available && (
        <Card>
          <CardHeader>
            <CardTitle>Chambres en colocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ListingColivingRoomsManager listingId={listing.id} rooms={colivingRooms} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Écoles à proximité</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingNearbySchoolsManager
            listingId={listing.id}
            initialSchoolIds={nearbySchoolIds}
          />
        </CardContent>
      </Card>
    </div>
  );
}
