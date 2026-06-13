'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { restaurantSchema, type RestaurantFormValues } from '../schemas/restaurant.schema';
import type { Restaurant } from '@dakareaseu/types';
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
import { useSaveRestaurant } from '../hooks/use-restaurants';
import { LocationPicker } from '@/components/location-picker';

function arrayToLines(values: string[]): string {
  return values.join('\n');
}

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const DEFAULT_VALUES: RestaurantFormValues = {
  name: '',
  cuisine_type: '',
  district: '',
  distance_label: '',
  price_range: '',
  phone: '',
  whatsapp: '',
  opening_hours: '',
  specialties: [],
  description: '',
  has_delivery: false,
  latitude: null,
  longitude: null,
};

export function RestaurantForm({
  restaurant,
  onSaved,
}: {
  restaurant?: Restaurant;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveRestaurant(restaurant?.id);

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: restaurant
      ? {
          name: restaurant.name,
          cuisine_type: restaurant.cuisine_type,
          district: restaurant.district,
          distance_label: restaurant.distance_label ?? '',
          price_range: restaurant.price_range ?? '',
          phone: restaurant.phone ?? '',
          whatsapp: restaurant.whatsapp ?? '',
          opening_hours: restaurant.opening_hours ?? '',
          specialties: restaurant.specialties,
          description: restaurant.description ?? '',
          has_delivery: restaurant.has_delivery,
          latitude: restaurant.latitude ?? null,
          longitude: restaurant.longitude ?? null,
        }
      : DEFAULT_VALUES,
  });

  const lat = form.watch('latitude');
  const lng = form.watch('longitude');

  async function onSubmit(values: RestaurantFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!restaurant && result) onSaved?.(result.id);
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
          name="cuisine_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de cuisine</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
          name="distance_label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repère de distance</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fourchette de prix</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="opening_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horaires</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
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
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="has_delivery"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
              <FormLabel className="!mt-0">Livraison disponible</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
          name="specialties"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Spécialités (une par ligne)</FormLabel>
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
            : restaurant
              ? 'Enregistrer les modifications'
              : 'Créer le restaurant'}
        </Button>
      </form>
    </Form>
  );
}
