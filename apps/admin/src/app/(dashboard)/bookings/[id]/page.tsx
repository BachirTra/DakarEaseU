'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@dakareaseu/shared';
import { useBookingDetail } from '@/features/bookings/hooks/use-bookings';
import { BookingStatusActions } from '@/features/bookings/components/booking-status-actions';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'default',
};

const PAYMENT_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  success: 'default',
  failed: 'destructive',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading, error } = useBookingDetail(id);

  if (isLoading) return <p className="text-muted-foreground">Chargement…</p>;
  if (error || !booking)
    return <p className="text-destructive">Erreur lors du chargement de la réservation.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bookings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
        <h1 className="text-2xl font-bold">Réservation</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Logement</span>
              {booking.listing ? (
                <Link
                  href={`/listings/${booking.listing.id}`}
                  className="font-medium hover:underline"
                >
                  {booking.listing.title}
                </Link>
              ) : (
                <span>Supprimé</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Locataire</span>
              <span>{booking.renter?.full_name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Téléphone</span>
              <span>{booking.renter?.phone ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée</span>
              <span>{booking.duration_months} mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant total</span>
              <span>{booking.total_amount.toLocaleString('fr-FR')} XOF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant={STATUS_VARIANT[booking.status] ?? 'secondary'}>
                {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paiement</span>
              <Badge variant={PAYMENT_VARIANT[booking.payment_status] ?? 'secondary'}>
                {PAYMENT_STATUS_LABELS[booking.payment_status] ?? booking.payment_status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingStatusActions booking={booking} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
