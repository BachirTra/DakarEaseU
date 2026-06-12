'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  transportProviderSchema,
  type TransportProviderFormValues,
  TRANSPORT_CATEGORIES,
  TRANSPORT_CATEGORY_LABELS,
} from '../schemas/transport-provider.schema';
import type { TransportProvider } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveTransportProvider } from '../hooks/use-transport-providers';

const DEFAULT_VALUES: TransportProviderFormValues = {
  name: '',
  category: 'taxi',
  rating: null,
  eta_label: '',
  price_label: '',
  phone: '',
  whatsapp: '',
};

export function TransportProviderDialog({
  open,
  onOpenChange,
  provider,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: TransportProvider;
}) {
  const saveMutation = useSaveTransportProvider(provider?.id);

  const form = useForm<TransportProviderFormValues>({
    resolver: zodResolver(transportProviderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        provider
          ? {
              name: provider.name,
              category: provider.category,
              rating: provider.rating,
              eta_label: provider.eta_label ?? '',
              price_label: provider.price_label ?? '',
              phone: provider.phone ?? '',
              whatsapp: provider.whatsapp ?? '',
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, provider, form]);

  async function onSubmit(values: TransportProviderFormValues) {
    await saveMutation.mutateAsync(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider ? 'Modifier le prestataire' : 'Nouveau prestataire'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {TRANSPORT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {TRANSPORT_CATEGORY_LABELS[category]}
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
              name="eta_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Délai indicatif</FormLabel>
                  <FormControl>
                    <Input placeholder="5 min" {...field} value={field.value ?? ''} />
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
                  <FormLabel>Tarif indicatif</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="à partir de 1 500 CFA"
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
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
