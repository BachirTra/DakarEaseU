'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { ListingMedia } from '@dakareaseu/types';
import { MEDIA_TYPES } from '@dakareaseu/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  tour_3d: 'Modèle 3D (.glb/.gltf)',
  pano_360: 'Visite 360° (photo-sphère)',
};

export function ListingMediaManager({
  listingId,
  media,
}: {
  listingId: string;
  media: ListingMedia[];
}) {
  const [mediaType, setMediaType] = useState<(typeof MEDIA_TYPES)[number]>('photo');
  const [roomLabel, setRoomLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAndAttachMedia(listingId);
  const deleteMutation = useDeleteListingMedia(listingId);

  const isPano = mediaType === 'pano_360';

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(
      {
        file,
        mediaType,
        position: media.length,
        roomLabel: isPano ? roomLabel.trim() || null : null,
      },
      { onSuccess: () => setRoomLabel('') },
    );
    event.target.value = '';
  }

  // Accept : images + .hdr pour photo/pano_360, vidéos, modèles 3D.
  const accept = isPano ? 'image/*,.hdr' : 'image/*,video/*,.glb,.gltf';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={mediaType}
          onValueChange={(value) => setMediaType(value as (typeof MEDIA_TYPES)[number])}
        >
          <SelectTrigger className="w-56">
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

        {isPano && (
          <Input
            value={roomLabel}
            onChange={(e) => setRoomLabel(e.target.value)}
            placeholder="Nom de la pièce (ex. Salon)"
            className="w-56"
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileSelected}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending || (isPano && !roomLabel.trim())}
        >
          {uploadMutation.isPending ? 'Envoi…' : 'Téléverser un fichier'}
        </Button>
      </div>

      {isPano ? (
        <p className="text-xs text-muted-foreground">
          Formats acceptés : JPG/PNG (photo-sphère standard) ou{' '}
          <strong className="font-semibold">.hdr</strong> (Radiance RGBE — qualité optimale, rendu
          HDR dans l&apos;app). Capturez avec Google Street View (JPG) ou une caméra 360° HDR.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Limite recommandée : photos &lt; 10 Mo, vidéos &lt; 50 Mo (compresser en H.264/MP4 avant
          envoi).
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((item) => (
          <li key={item.id} className="space-y-2 rounded-md border p-2">
            {item.media_type === 'photo' || item.media_type === 'pano_360' ? (
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
                {item.media_type === 'pano_360' && item.room_label
                  ? `${item.is_hdr ? 'HDR ' : ''}360° · ${item.room_label}`
                  : `${MEDIA_TYPE_LABELS[item.media_type]} · #${item.position}`}
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
