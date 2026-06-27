'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchListingDetail,
  fetchAllSchools,
  createListing,
  updateListing,
  addListingMedia,
  deleteListingMedia,
  upsertColivingRoom,
  deleteColivingRoom,
  setNearbySchools,
  uploadListingMediaFile,
} from '../services/listing-detail.service';
import type { ListingFormValues, ColivingRoomFormValues } from '@dakareaseu/shared';
import type { Listing, ListingMedia } from '@dakareaseu/types';

export function useListingDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['listings', 'detail', id],
    queryFn: () => fetchListingDetail(id!),
    enabled: !!id,
  });
}

export function useSchoolsForSelection() {
  return useQuery({
    queryKey: ['schools', 'selection'],
    queryFn: fetchAllSchools,
    staleTime: 5 * 60_000,
  });
}

function useInvalidateListing(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['listings', 'detail', id] });
  };
}

export function useSaveListing(id?: string) {
  const invalidate = useInvalidateListing(id);

  return useMutation<Listing | undefined, Error, ListingFormValues>({
    mutationFn: async (values) => {
      if (id) {
        await updateListing(id, values);
        return undefined;
      }
      return createListing(values);
    },
    onSuccess: () => {
      toast.success(id ? 'Annonce mise à jour.' : 'Annonce créée.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadAndAttachMedia(listingId: string) {
  const invalidate = useInvalidateListing(listingId);

  return useMutation({
    mutationFn: async ({
      file,
      mediaType,
      position,
      roomLabel,
    }: {
      file: File;
      mediaType: ListingMedia['media_type'];
      position: number;
      roomLabel?: string | null;
    }) => {
      const isHdr = file.name.toLowerCase().endsWith('.hdr');
      const url = await uploadListingMediaFile(listingId, file);
      await addListingMedia(listingId, mediaType, url, position, roomLabel, isHdr);
    },
    onSuccess: () => {
      toast.success('Média ajouté.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteListingMedia(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: deleteListingMedia,
    onSuccess: () => {
      toast.success('Média supprimé.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpsertColivingRoom(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: ({ room, id }: { room: ColivingRoomFormValues; id?: string }) =>
      upsertColivingRoom(listingId, room, id),
    onSuccess: () => {
      toast.success('Chambre enregistrée.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteColivingRoom(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: deleteColivingRoom,
    onSuccess: () => {
      toast.success('Chambre supprimée.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSetNearbySchools(listingId: string) {
  const invalidate = useInvalidateListing(listingId);
  return useMutation({
    mutationFn: (schoolIds: string[]) => setNearbySchools(listingId, schoolIds),
    onSuccess: () => {
      toast.success('Écoles à proximité mises à jour.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
