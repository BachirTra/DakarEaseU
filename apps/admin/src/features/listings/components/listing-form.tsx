'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  listingSchema,
  type ListingFormValues,
  LISTING_TYPE_LABELS,
  LISTING_VERIFICATION_STATUS_LABELS,
} from '@dakareaseu/shared';
import { LocationPicker } from '@/components/location-picker';
import type { Listing } from '@dakareaseu/types';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveListing } from '../hooks/use-listing-detail';

function arrayToLines(values: string[]): string {
  return values.join('\n');
}

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const DEFAULT_VALUES: ListingFormValues = {
  title: '',
  description: '',
  price: 0,
  currency: 'XOF',
  period: 'mois',
  type: 'studio',
  surface_m2: null,
  bedrooms: null,
  bathrooms: null,
  district: '',
  distance_label: '',
  furnished: false,
  colocation_available: false,
  min_duration_months: 3,
  amenities: [],
  particularities: [],
  requirements: [],
  verification_status: 'pending',
};

export function ListingForm({
  listing,
  onSaved,
}: {
  listing?: Listing;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveListing(listing?.id);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing
      ? {
          title: listing.title,
          description: listing.description ?? '',
          price: listing.price,
          currency: listing.currency,
          period: listing.period,
          type: listing.type,
          surface_m2: listing.surface_m2,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          district: listing.district,
          distance_label: listing.distance_label ?? '',
          furnished: listing.furnished,
          colocation_available: listing.colocation_available,
          min_duration_months: listing.min_duration_months,
          amenities: listing.amenities,
          particularities: listing.particularities,
          requirements: listing.requirements,
          verification_status: listing.verification_status,
          latitude: listing.latitude ?? null,
          longitude: listing.longitude ?? null,
        }
      : DEFAULT_VALUES,
  });

  const lat = form.watch('latitude');
  const lng = form.watch('longitude');

  useEffect(() => {
    if (listing) form.reset(form.getValues());
  }, [listing, form]);

  async function onSubmit(values: ListingFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!listing && result) onSaved?.(result.id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LISTING_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quartier</FormLabel>
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
                <FormLabel>Prix (XOF / mois)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_duration_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée minimum (mois)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={field.value ?? 3} />
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
            name="distance_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repère de distance (ex. &quot;0.5 km de l&apos;UCAD&quot;)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="furnished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                <FormLabel className="!mt-0">Meublé</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colocation_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                <FormLabel className="!mt-0">Colocation disponible</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verification_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut de vérification</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LISTING_VERIFICATION_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  &quot;Publiée&quot; rend l&apos;annonce visible côté mobile (RLS :{' '}
                  <code>verification_status = &apos;published&apos;</code>).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {(['amenities', 'particularities', 'requirements'] as const).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    {fieldName === 'amenities' && 'Équipements (un par ligne)'}
                    {fieldName === 'particularities' && 'Particularités (une par ligne)'}
                    {fieldName === 'requirements' && 'Exigences (une par ligne)'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      value={arrayToLines(field.value)}
                      onChange={(event) => field.onChange(linesToArray(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="mt-2">
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

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending
            ? 'Enregistrement…'
            : listing
              ? 'Enregistrer les modifications'
              : "Créer l'annonce"}
        </Button>
      </form>
    </Form>
  );
}
