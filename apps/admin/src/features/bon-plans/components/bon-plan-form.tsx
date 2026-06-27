'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { LocationPicker } from '@/components/location-picker';
import { bonPlanSchema, type BonPlanFormValues } from '../schemas/bon-plan.schema';
import type { BonPlanRow } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveBonPlan, useUploadBonPlanCoverImage } from '../hooks/use-bon-plans';
import { useCategories } from '../hooks/use-categories';

const DEFAULT_VALUES: BonPlanFormValues = {
  title: '',
  category_id: null,
  address: '',
  latitude: null,
  longitude: null,
  price_min: 0,
  description: '',
  astuce: '',
  website_url: '',
  phone: '',
  is_featured: false,
};

export function BonPlanForm({
  bonPlan,
  onSaved,
}: {
  bonPlan?: BonPlanRow;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveBonPlan(bonPlan?.id);
  const uploadMutation = useUploadBonPlanCoverImage(bonPlan?.id ?? '');
  const { data: categories = [] } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BonPlanFormValues>({
    resolver: zodResolver(bonPlanSchema),
    defaultValues: bonPlan
      ? {
          title: bonPlan.title,
          category_id: bonPlan.category_id ?? null,
          address: bonPlan.address ?? '',
          latitude: bonPlan.latitude ?? null,
          longitude: bonPlan.longitude ?? null,
          price_min: bonPlan.price_min,
          description: bonPlan.description ?? '',
          astuce: bonPlan.astuce ?? '',
          website_url: bonPlan.website_url ?? '',
          phone: bonPlan.phone ?? '',
          is_featured: bonPlan.is_featured,
        }
      : DEFAULT_VALUES,
  });

  const lat = form.watch('latitude');
  const lng = form.watch('longitude');

  async function onSubmit(values: BonPlanFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!bonPlan && result) onSaved?.(result.id);
  }

  function handleCoverFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && bonPlan) uploadMutation.mutate(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6">
      {bonPlan && (
        <div className="flex items-center gap-4">
          {bonPlan.cover_image_url && (
            <Image
              src={bonPlan.cover_image_url}
              alt=""
              width={160}
              height={100}
              className="h-24 w-40 rounded object-cover"
              unoptimized
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Envoi…' : "Changer l'image de couverture"}
          </Button>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Sans catégorie</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix minimum (FCFA)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Route de la Corniche, Dakar" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="+221 77 000 00 00" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} value={field.value ?? ''} />
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
                  <Textarea rows={4} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="astuce"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Astuce</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="Ex: Réservez en semaine pour éviter les files d'attente"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 md:col-span-2">
                <FormLabel className="!mt-0">Mettre à la une</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormLabel className="mb-2 block">Localisation (optionnel)</FormLabel>
            <LocationPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => {
                form.setValue('latitude', newLat);
                form.setValue('longitude', newLng);
              }}
            />
            {lat != null && lng != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={saveMutation.isPending} className="md:col-span-2">
            {saveMutation.isPending
              ? 'Enregistrement…'
              : bonPlan
                ? 'Enregistrer les modifications'
                : 'Créer le bon plan'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
