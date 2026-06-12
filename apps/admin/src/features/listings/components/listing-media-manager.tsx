'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { ListingMedia } from '@dakareaseu/types';
import { MEDIA_TYPES } from '@dakareaseu/shared';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeleteListingMedia, useUploadAndAttachMedia } from '../hooks/use-listing-detail';

const MEDIA_TYPE_LABELS: Record<string, string> = {
  photo: 'Photo',
  video: 'Vidéo',
  tour_3d: 'Visite 3D / 360°',
};

export function ListingMediaManager({
  listingId,
  media,
}: {
  listingId: string;
  media: ListingMedia[];
}) {
  const [mediaType, setMediaType] = useState<(typeof MEDIA_TYPES)[number]>('photo');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAndAttachMedia(listingId);
  const deleteMutation = useDeleteListingMedia(listingId);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, mediaType, position: media.length });
    event.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={mediaType}
          onValueChange={(value) => setMediaType(value as (typeof MEDIA_TYPES)[number])}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEDIA_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {MEDIA_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.glb,.gltf"
          className="hidden"
          onChange={handleFileSelected}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Envoi…' : 'Téléverser un fichier'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Limite recommandée : photos &lt; 10 Mo, vidéos &lt; 50 Mo (compresser en H.264/MP4 avant
          envoi).
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((item) => (
          <li key={item.id} className="space-y-2 rounded-md border p-2">
            {item.media_type === 'photo' ? (
              <Image
                src={item.url}
                alt=""
                width={200}
                height={140}
                className="h-28 w-full rounded object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-28 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                {MEDIA_TYPE_LABELS[item.media_type]}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {MEDIA_TYPE_LABELS[item.media_type]} · #{item.position}
              </span>
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
