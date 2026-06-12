import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { listingsColumns } from './listings-columns';
import type { Listing } from '@dakareaseu/types';

const sampleListing = {
  id: 'b0000000-0000-0000-0000-000000000006',
  title: 'Chambre meublée Point E',
  description: null,
  price: 90000,
  currency: 'XOF',
  period: 'mois',
  type: 'chambre',
  surface_m2: null,
  bedrooms: null,
  bathrooms: null,
  district: 'Point E',
  distance_label: null,
  furnished: true,
  colocation_available: false,
  min_duration_months: 3,
  amenities: [],
  particularities: [],
  requirements: [],
  verification_status: 'pending',
  rating: null,
  reviews_count: 0,
  created_by: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
} satisfies Listing;

function TableHarness({ data }: { data: Listing[] }) {
  const table = useReactTable({
    data,
    columns: listingsColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <table>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

describe('listingsColumns', () => {
  it('renders the French label and badge for a pending listing', () => {
    render(<TableHarness data={[sampleListing]} />);
    expect(screen.getByText('Chambre meublée Point E')).toBeInTheDocument();
    expect(screen.getByText('Chambre')).toBeInTheDocument();
    expect(screen.getByText('Point E')).toBeInTheDocument();
    expect(screen.getByText('90 000 XOF')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });
});
