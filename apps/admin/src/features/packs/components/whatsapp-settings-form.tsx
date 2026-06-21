'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpsertWhatsAppSetting, useWhatsAppSetting } from '../hooks/use-packs';

export function WhatsappSettingsForm() {
  const { data, isLoading } = useWhatsAppSetting();
  const upsertMutation = useUpsertWhatsAppSetting();
  const [edited, setEdited] = useState<string | null>(null);

  const number = edited ?? data ?? '';
  const setNumber = (value: string) => setEdited(value);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Numéro WhatsApp</span>
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Ex. +221770000000"
          disabled={isLoading}
          className="w-64"
        />
      </div>
      <Button
        type="button"
        onClick={() => upsertMutation.mutate(number.trim())}
        disabled={upsertMutation.isPending || isLoading}
      >
        {upsertMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </div>
  );
}
