'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { signInWithPassword, fetchCurrentProfileRole } from '../services/auth.service';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      const { user } = await signInWithPassword(values);
      if (!user) throw new Error('Connexion impossible.');

      const role = await fetchCurrentProfileRole(user.id);
      if (role !== 'admin') {
        await import('@/lib/supabase/browser-client').then(({ createSupabaseBrowserClient }) =>
          createSupabaseBrowserClient().auth.signOut(),
        );
        toast.error('Ce compte ne dispose pas des droits administrateur.');
        return;
      }

      const redirectedFrom = searchParams.get('redirectedFrom') ?? '/dashboard';
      toast.success('Connexion réussie.');
      router.replace(redirectedFrom);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>DakarEaseU — Espace admin</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@dakareaseu.test" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
