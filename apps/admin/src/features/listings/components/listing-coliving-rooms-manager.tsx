'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colivingRoomSchema, type ColivingRoomFormValues } from '@dakareaseu/shared';
import type { ListingColivingRoom } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useDeleteColivingRoom, useUpsertColivingRoom } from '../hooks/use-listing-detail';

export function ListingColivingRoomsManager({
  listingId,
  rooms,
}: {
  listingId: string;
  rooms: ListingColivingRoom[];
}) {
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const upsertMutation = useUpsertColivingRoom(listingId);
  const deleteMutation = useDeleteColivingRoom(listingId);

  const form = useForm<ColivingRoomFormValues>({
    resolver: zodResolver(colivingRoomSchema),
    defaultValues: { label: '', price: 0, surface_m2: null, is_available: true },
  });

  function startEdit(room: ListingColivingRoom) {
    setEditingId(room.id);
    form.reset({
      label: room.label,
      price: room.price,
      surface_m2: room.surface_m2,
      is_available: room.is_available,
    });
  }

  function startCreate() {
    setEditingId(undefined);
    form.reset({ label: '', price: 0, surface_m2: null, is_available: true });
  }

  async function onSubmit(values: ColivingRoomFormValues) {
    await upsertMutation.mutateAsync({ room: values, id: editingId });
    startCreate();
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="flex items-center justify-between rounded-md border p-3 text-sm"
          >
            <div>
              <p className="font-medium">{room.label}</p>
              <p className="text-muted-foreground">
                {room.price.toLocaleString('fr-FR')} XOF · {room.surface_m2 ?? '?'} m² ·{' '}
                {room.is_available ? 'disponible' : 'indisponible'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => startEdit(room)}>
                Modifier
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(room.id)}
              >
                Supprimer
              </Button>
            </div>
          </li>
        ))}
        {rooms.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune chambre nommée pour cette annonce.</p>
        )}
      </ul>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-3 rounded-md border p-3 md:grid-cols-4"
        >
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nom de la chambre</FormLabel>
                <FormControl>
                  <Input placeholder="Chambre 1 — vue jardin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surface_m2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface (m²)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-2 md:col-span-2">
                <FormLabel className="!mt-0">Disponible</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex items-end gap-2 md:col-span-2">
            <Button type="submit" disabled={upsertMutation.isPending}>
              {editingId ? 'Mettre à jour' : 'Ajouter la chambre'}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={startCreate}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
