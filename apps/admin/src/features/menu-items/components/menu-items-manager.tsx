'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { MenuItem } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteMenuItem, useMenuItems } from '../hooks/use-menu-items';
import { MenuItemForm } from './menu-item-form';

export function MenuItemsManager({ restaurantId }: { restaurantId: string }) {
  const { data: items, isLoading } = useMenuItems(restaurantId);
  const deleteMutation = useDeleteMenuItem(restaurantId);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading || !items) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((item: MenuItem) =>
          editingId === item.id ? (
            <li key={item.id} className="rounded-md border p-3">
              <MenuItemForm
                restaurantId={restaurantId}
                currentCount={items.length}
                menuItem={item}
                onSaved={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  Aucune
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{item.name}</span>
                  {!item.is_available ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      Indisponible
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="truncate text-sm text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
              <span className="whitespace-nowrap text-sm font-semibold">
                {item.price.toLocaleString('fr-FR')} FCFA
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(item.id)}
                >
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(item.id)}
                >
                  Supprimer
                </Button>
              </div>
            </li>
          ),
        )}
        {items.length === 0 && !adding ? (
          <li className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Aucun plat pour le moment.
          </li>
        ) : null}
      </ul>

      {adding ? (
        <div className="rounded-md border p-3">
          <MenuItemForm
            restaurantId={restaurantId}
            currentCount={items.length}
            onSaved={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
          Ajouter un plat
        </Button>
      )}
    </div>
  );
}
