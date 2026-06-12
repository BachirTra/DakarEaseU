'use client';

import { DataTable } from '@/shared/components/data-table';
import { useAdminUsers } from '@/features/users/hooks/use-users';
import { usersColumns } from '@/features/users/components/users-columns';

export default function UsersPage() {
  const { data = [], isLoading } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground">
          Liste des comptes (email et dernière connexion via auth.users, lus côté serveur avec la
          clé service-role — seule exception RLS documentée pour cette fonctionnalité).
        </p>
      </div>
      <DataTable
        columns={usersColumns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Aucun utilisateur enregistré."
      />
    </div>
  );
}
