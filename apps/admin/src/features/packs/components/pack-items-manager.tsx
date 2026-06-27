'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSavePackItems } from '../hooks/use-packs';
import { uploadPackImage, type PackItem } from '../services/packs.service';

interface DraftItem {
  id: string;
  label: string;
  quantity: string;
  image_url: string | null;
  position: number;
}

function toDraft(item: PackItem): DraftItem {
  return {
    id: item.id,
    label: item.label,
    quantity: item.quantity,
    image_url: item.image_url,
    position: item.position,
  };
}

export function PackItemsManager({
  packId,
  initialItems,
}: {
  packId: string;
  initialItems: PackItem[];
}) {
  const [items, setItems] = useState<DraftItem[]>(() => initialItems.map(toDraft));
  const [newLabel, setNewLabel] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const saveMutation = useSavePackItems(packId);

  function persist(nextItems: DraftItem[]) {
    setItems(nextItems);
    saveMutation.mutate(
      nextItems.map((item, index) => ({
        label: item.label,
        quantity: item.quantity,
        image_url: item.image_url,
        position: index,
      })),
    );
  }

  async function uploadItemImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const itemId = crypto.randomUUID();
    return uploadPackImage(file, `items/${packId}/${itemId}.${ext}`);
  }

  async function handleNewImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setIsUploadingNew(true);
    try {
      setNewImageUrl(await uploadItemImage(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec du téléversement.');
    } finally {
      setIsUploadingNew(false);
    }
  }

  function handleAdd() {
    if (!newLabel.trim() || !newQuantity.trim()) {
      toast.error('Le libellé et la quantité sont requis.');
      return;
    }
    persist([
      ...items,
      {
        id: crypto.randomUUID(),
        label: newLabel.trim(),
        quantity: newQuantity.trim(),
        image_url: newImageUrl,
        position: items.length,
      },
    ]);
    setNewLabel('');
    setNewQuantity('');
    setNewImageUrl(null);
  }

  function handleUpdate(id: string, patch: Partial<DraftItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleBlurPersist() {
    persist(items);
  }

  function handleDelete(id: string) {
    persist(items.filter((item) => item.id !== id));
  }

  async function handleRowImageSelected(id: string, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    try {
      const url = await uploadItemImage(file);
      persist(items.map((item) => (item.id === id ? { ...item, image_url: url } : item)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec du téléversement.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.label}
                      onChange={(e) => handleUpdate(item.id, { label: e.target.value })}
                      onBlur={handleBlurPersist}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.quantity}
                      onChange={(e) => handleUpdate(item.id, { quantity: e.target.value })}
                      onBlur={handleBlurPersist}
                    />
                  </TableCell>
                  <TableCell>
                    <RowImage
                      itemId={item.id}
                      url={item.image_url}
                      onSelected={handleRowImageSelected}
                    />
                  </TableCell>
                  <TableCell>{index}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Aucun article. Ajoutez-en un ci-dessous.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-md border p-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Libellé</span>
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Ex. Tomates"
            className="w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Quantité</span>
          <Input
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder="Ex. 4 pots"
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Image</span>
          <input
            ref={newFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleNewImageSelected}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => newFileInputRef.current?.click()}
            disabled={isUploadingNew}
          >
            {isUploadingNew ? 'Envoi…' : newImageUrl ? 'Image ajoutée' : 'Téléverser'}
          </Button>
        </div>
        <Button type="button" onClick={handleAdd}>
          Ajouter un article
        </Button>
      </div>
    </div>
  );
}

function RowImage({
  itemId,
  url,
  onSelected,
}: {
  itemId: string;
  url: string | null;
  onSelected: (id: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      {url ? (
        <Image
          src={url}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
          —
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelected(itemId, e)}
      />
      <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
        Modifier
      </Button>
    </div>
  );
}
