'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import {
  eventSchema,
  type EventFormValues,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
} from '../schemas/event.schema';
import type { EventRow } from '@dakareaseu/types';
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
import { useSaveEvent, useUploadEventCoverImage } from '../hooks/use-events';

const DEFAULT_VALUES: EventFormValues = {
  title: '',
  category: 'concert',
  event_date: '',
  event_time: '',
  venue: '',
  partner: '',
  price_label: '',
  price_value: 0,
  is_featured: false,
  description: '',
};

export function EventForm({
  event,
  onSaved,
}: {
  event?: EventRow;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveEvent(event?.id);
  const uploadMutation = useUploadEventCoverImage(event?.id ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          category: event.category,
          event_date: event.event_date,
          event_time: event.event_time ?? '',
          venue: event.venue ?? '',
          partner: event.partner ?? '',
          price_label: event.price_label ?? '',
          price_value: event.price_value,
          is_featured: event.is_featured,
          description: event.description ?? '',
        }
      : DEFAULT_VALUES,
  });

  async function onSubmit(values: EventFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!event && result) onSaved?.(result.id);
  }

  function handleCoverFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && event) uploadMutation.mutate(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6">
      {event && (
        <div className="flex items-center gap-4">
          {event.cover_image_url && (
            <Image
              src={event.cover_image_url}
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {EVENT_CATEGORY_LABELS[category]}
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
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="event_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partenaire</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (libellé affiché)</FormLabel>
                <FormControl>
                  <Input placeholder="Gratuit / 5 000 CFA" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (valeur numérique)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? 0} />
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
          <Button type="submit" disabled={saveMutation.isPending} className="md:col-span-2">
            {saveMutation.isPending
              ? 'Enregistrement…'
              : event
                ? 'Enregistrer les modifications'
                : "Créer l'événement"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
