'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { schoolSchema, type SchoolFormValues } from '../schemas/school.schema';
import type { School } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSaveSchool, useUploadSchoolCoverImage } from '../hooks/use-schools';
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

const DEFAULT_VALUES: SchoolFormValues = {
  name: '',
  full_name: '',
  district: '',
  students_count: null,
  founded_year: null,
  address: '',
  website: '',
  email: '',
  phone: '',
  whatsapp: '',
  fees_text: '',
  programs: [],
  admission_steps: [],
  scholarships: [],
  latitude: null,
  longitude: null,
};

export function SchoolForm({
  school,
  onSaved,
}: {
  school?: School;
  onSaved?: (id: string) => void;
}) {
  const saveMutation = useSaveSchool(school?.id);
  const uploadMutation = useUploadSchoolCoverImage(school?.id ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: school
      ? {
          name: school.name,
          full_name: school.full_name ?? '',
          district: school.district,
          students_count: school.students_count,
          founded_year: school.founded_year,
          address: school.address ?? '',
          website: school.website ?? '',
          email: school.email ?? '',
          phone: school.phone ?? '',
          whatsapp: school.whatsapp ?? '',
          fees_text: school.fees_text ?? '',
          programs: school.programs,
          admission_steps: school.admission_steps,
          scholarships: school.scholarships,
          latitude: school.latitude ?? null,
          longitude: school.longitude ?? null,
        }
      : DEFAULT_VALUES,
  });

  const lat = form.watch('latitude');
  const lng = form.watch('longitude');

  async function onSubmit(values: SchoolFormValues) {
    const result = await saveMutation.mutateAsync(values);
    if (!school && result) onSaved?.(result.id);
  }

  function handleCoverFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && school) uploadMutation.mutate(file);
    event.target.value = '';
  }

  return (
    <div className="space-y-6">
      {school && (
        <div className="flex items-center gap-4">
          {school.cover_image_url && (
            <Image
              src={school.cover_image_url}
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom (sigle)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
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
            name="founded_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année de fondation</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="students_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre d&apos;étudiants</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} value={field.value ?? ''} />
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
            name="fees_text"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Frais (texte libre)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {(['programs', 'admission_steps', 'scholarships'] as const).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    {fieldName === 'programs' && 'Filières (une par ligne)'}
                    {fieldName === 'admission_steps' && "Étapes d'admission (une par ligne)"}
                    {fieldName === 'scholarships' && 'Bourses (une par ligne)'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      value={arrayToLines(field.value)}
                      onChange={(event) => field.onChange(linesToArray(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
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
              : school
                ? 'Enregistrer les modifications'
                : "Créer l'école"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
