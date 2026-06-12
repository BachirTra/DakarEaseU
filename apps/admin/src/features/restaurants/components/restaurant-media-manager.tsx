'use client';

import { useRef } from 'react';
import Image from 'next/image';
import type { RestaurantMedia } from '@dakareaseu/types';
import { Button } from '@/components/ui/button';
import { useDeleteRestaurantMedia, useUploadRestaurantMedia } from '../hooks/use-restaurants';

export function RestaurantMediaManager({
  restaurantId,
  media,
}: {
  restaurantId: string;
  media: RestaurantMedia[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadRestaurantMedia(restaurantId, media.length);
  const deleteMutation = useDeleteRestaurantMedia(restaurantId);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    event.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
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
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Envoi…' : 'Téléverser une photo'}
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((item) => (
          <li key={item.id} className="space-y-2 rounded-md border p-2">
            <Image
              src={item.url}
              alt=""
              width={200}
              height={140}
              className="h-28 w-full rounded object-cover"
              unoptimized
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>#{item.position}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(item.id)}
              >
                Supprimer
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
