'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { VERIFICATION_STATUS_LABELS } from '@dakareaseu/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminUserRow } from '@/app/api/users/route';
import { useSetUserBlocked } from '../hooks/use-users';

export const usersColumns: ColumnDef<AdminUserRow>[] = [
  { accessorKey: 'fullName', header: 'Nom' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => (
      <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: 'verificationStatus',
    header: 'Vérification',
    cell: ({ row }) =>
      VERIFICATION_STATUS_LABELS[row.original.verificationStatus] ??
      row.original.verificationStatus,
  },
  {
    accessorKey: 'lastSignInAt',
    header: 'Dernière connexion',
    cell: ({ row }) =>
      row.original.lastSignInAt
        ? new Date(row.original.lastSignInAt).toLocaleString('fr-FR')
        : 'Jamais',
  },
  {
    id: 'blockToggle',
    header: 'Statut du compte',
    cell: ({ row }) => <BlockToggleButton user={row.original} />,
  },
];

function BlockToggleButton({ user }: { user: AdminUserRow }) {
  const mutation = useSetUserBlocked();
  return (
    <Button
      variant={user.isBlocked ? 'destructive' : 'outline'}
      size="sm"
      onClick={() => mutation.mutate({ userId: user.id, isBlocked: !user.isBlocked })}
      disabled={mutation.isPending || user.role === 'admin'}
    >
      {user.isBlocked ? 'Débloquer' : 'Bloquer'}
    </Button>
  );
}
