'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { packSchema, type PackFormValues } from '../schemas/pack.schema';
import { uploadPackImage, type Pack } from '../services/packs.service';
import { useSavePack } from '../hooks/use-packs';
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
import { toast } from 'sonner';

const DEFAULT_VALUES: PackFormValues = {
  name: '',
  description: '',
  price: 0,
  is_active: true,
  cover_image_url: '',
};

export function PackForm({ pack, onSaved }: { pack?: Pack; onSaved?: (id: string) => void }) {
  const saveMutation = useSavePack(pack?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PackFormValues>({
    resolver: zodResolver(packSchema),
    defaultValues: pack
      ? {
          name: pack.name,
          description: pack.description ?? '',
          price: pack.price,
          is_active: pack.is_active,
          cover_image_url: pack.cover_image_url ?? '',
        }
      : DEFAULT_VALUES,
  });

  const coverImageUrl = form.watch('cover_image_url');

  async function handleCoverSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    if (!pack) {
      toast.error("Enregistrez d'abord le pack avant d'ajouter une image.");
      return;
    }
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const url = await uploadPackImage(file, `covers/${pack.id}.${ext}`);
      form.setValue('cover_image_url', `${url}?t=${Date.now()}`);
      toast.success('Image téléversée.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec du téléversement.');
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: PackFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!pack && result) onSaved?.(result.id);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
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
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                />
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
                <Textarea rows={3} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 md:col-span-2">
              <FormLabel className="!mt-0">Actif</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="md:col-span-2">
          <FormLabel className="mb-2 block">Image de couverture</FormLabel>
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt=""
              width={240}
              height={160}
              className="mb-2 h-40 w-60 rounded object-cover"
              unoptimized
            />
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverSelected}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Envoi…' : 'Téléverser une image'}
          </Button>
          {!pack ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Enregistrez le pack pour activer le téléversement d&apos;image.
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={saveMutation.isPending} className="md:col-span-2">
          {saveMutation.isPending
            ? 'Enregistrement…'
            : pack
              ? 'Enregistrer les modifications'
              : 'Créer le pack'}
        </Button>
      </form>
    </Form>
  );
}
