'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ReviewWithAuthor } from '../services/reviews.service';
import { useDeleteReview } from '../hooks/use-reviews';

const TARGET_TYPE_LABELS: Record<string, string> = {
  listing: 'Logement',
  restaurant: 'Restaurant',
  stay: 'Séjour',
};

export const reviewsColumns: ColumnDef<ReviewWithAuthor>[] = [
  {
    id: 'author',
    header: 'Auteur',
    cell: ({ row }) => row.original.author?.full_name ?? 'Étudiant·e sans nom renseigné',
  },
  {
    accessorKey: 'target_type',
    header: 'Cible',
    cell: ({ row }) => (
      <Badge variant="outline">
        {TARGET_TYPE_LABELS[row.original.target_type] ?? row.original.target_type}
      </Badge>
    ),
  },
  {
    accessorKey: 'rating',
    header: 'Note',
    cell: ({ row }) => `★ ${row.original.rating} / 5`,
  },
  {
    accessorKey: 'comment',
    header: 'Commentaire',
    cell: ({ row }) => <p className="max-w-md truncate">{row.original.comment ?? '—'}</p>,
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('fr-FR'),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <DeleteReviewButton reviewId={row.original.id} />,
  },
];

function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const mutation = useDeleteReview();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => mutation.mutate(reviewId)}
      disabled={mutation.isPending}
    >
      Supprimer
    </Button>
  );
}
