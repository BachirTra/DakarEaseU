'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useAddBonPlanVideoUrl,
  useBonPlanMedia,
  useDeleteBonPlanMedia,
  useUploadBonPlanMediaFile,
} from '../hooks/use-bon-plans';
import type { BonPlanMedia } from '@dakareaseu/types';

function MediaItem({
  media,
  bonPlanId,
}: {
  media: BonPlanMedia;
  bonPlanId: string;
}) {
  const deleteMutation = useDeleteBonPlanMedia(bonPlanId);

  return (
    <div className="flex items-center gap-3 rounded-md border p-2">
      {media.type === 'image' ? (
        <Image
          src={media.url}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
          {media.type === 'video_url' ? 'Lien' : 'Vidéo'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <Badge variant="secondary" className="mb-1">
          {media.type === 'image' ? 'Image' : media.type === 'video_url' ? 'Lien vidéo' : 'Vidéo'}
        </Badge>
        <p className="truncate text-xs text-muted-foreground">{media.url}</p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        disabled={deleteMutation.isPending}
        onClick={() => {
          if (confirm('Supprimer ce média ?')) deleteMutation.mutate(media.id);
        }}
      >
        Supprimer
      </Button>
    </div>
  );
}

export function BonPlanMediaManager({ bonPlanId }: { bonPlanId: string }) {
  const { data: mediaList = [], isLoading } = useBonPlanMedia(bonPlanId);
  const uploadMutation = useUploadBonPlanMediaFile(bonPlanId);
  const addUrlMutation = useAddBonPlanVideoUrl(bonPlanId);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState('');

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate({ file, type: 'image' });
    e.target.value = '';
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate({ file, type: 'video_upload' });
    e.target.value = '';
  }

  function handleAddVideoUrl() {
    if (!videoUrl.trim()) return;
    addUrlMutation.mutate(videoUrl.trim());
    setVideoUrl('');
  }

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {mediaList.map((media) => (
          <MediaItem key={media.id} media={media} bonPlanId={bonPlanId} />
        ))}
        {mediaList.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun média secondaire.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadMutation.isPending}
          onClick={() => imageInputRef.current?.click()}
        >
          + Image
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadMutation.isPending}
          onClick={() => videoInputRef.current?.click()}
        >
          + Vidéo (upload)
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="URL YouTube / Vimeo (https://...)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={addUrlMutation.isPending || !videoUrl.trim()}
          onClick={handleAddVideoUrl}
        >
          Ajouter lien vidéo
        </Button>
      </div>
    </div>
  );
}
