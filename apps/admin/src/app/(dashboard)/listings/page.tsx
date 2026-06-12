import { ListingsTable } from '@/features/listings/components/listings-table';

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Annonces</h1>
        <p className="text-muted-foreground">
          Gérez les logements, leur statut de publication et leurs médias.
        </p>
      </div>
      <ListingsTable />
    </div>
  );
}
