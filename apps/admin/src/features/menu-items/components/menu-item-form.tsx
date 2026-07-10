'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema, type MenuItemFormValues } from '../schemas/menu-item.schema';
import type { MenuItem } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveMenuItem } from '../hooks/use-menu-items';
import { uploadMenuItemImage } from '../services/menu-items.service';

const DEFAULT_VALUES: MenuItemFormValues = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  is_available: true,
};

export function MenuItemForm({
  restaurantId,
  currentCount,
  menuItem,
  onSaved,
  onCancel,
}: {
  restaurantId: string;
  currentCount: number;
  menuItem?: MenuItem;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const saveMutation = useSaveMenuItem(restaurantId, currentCount, menuItem?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: menuItem
      ? {
          name: menuItem.name,
          description: menuItem.description ?? '',
          price: menuItem.price,
          image_url: menuItem.image_url ?? '',
          is_available: menuItem.is_available,
        }
      : DEFAULT_VALUES,
  });

  const imageUrl = form.watch('image_url');

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadMenuItemImage(restaurantId, file);
      form.setValue('image_url', url);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function onSubmit(values: MenuItemFormValues) {
    await saveMutation.mutateAsync(values);
    if (!menuItem) form.reset(DEFAULT_VALUES);
    onSaved?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du plat</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Prix (FCFA)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2">
          <FormLabel className="mb-2 block">Photo du plat</FormLabel>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                width={96}
                height={72}
                className="h-18 w-24 rounded object-cover"
                unoptimized
              />
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Envoi…' : imageUrl ? 'Changer la photo' : 'Téléverser une photo'}
            </Button>
            {imageUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => form.setValue('image_url', '')}
              >
                Retirer
              </Button>
            ) : null}
          </div>
        </div>
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 md:col-span-2">
              <FormLabel className="!mt-0">Disponible</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={saveMutation.isPending || uploading}>
            {saveMutation.isPending
              ? 'Enregistrement…'
              : menuItem
                ? 'Enregistrer'
                : 'Ajouter le plat'}
          </Button>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
