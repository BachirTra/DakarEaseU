import { Alert, Linking } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as packsService from '@/features/packs/services/packs.service';

const PACKS_STALE_TIME = 5 * 60 * 1000;

export function usePacks() {
  return useQuery({
    queryKey: ['packs'],
    queryFn: packsService.fetchActivePacks,
    staleTime: PACKS_STALE_TIME,
  });
}

export function usePackDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['pack', id],
    queryFn: () => packsService.fetchPackById(id as string),
    enabled: Boolean(id),
    staleTime: PACKS_STALE_TIME,
  });
}

export interface OrderPackParams {
  packId: string;
  userId: string;
  whatsappSnapshot: string;
  packName: string;
  price: number;
}

export function useOrderPack() {
  return useMutation({
    mutationFn: async (params: OrderPackParams) => {
      const order = await packsService.createPackOrder({
        packId: params.packId,
        userId: params.userId,
        whatsappSnapshot: params.whatsappSnapshot,
      });
      const whatsappNumber = await packsService.fetchWhatsAppNumber();
      return { order, whatsappNumber };
    },
    onSuccess: ({ whatsappNumber }, params) => {
      Alert.alert(
        'Commande retenue !',
        'Votre commande est bien notée. La livraison sera effectuée dans les meilleurs délais.',
      );
      const message = `Bonjour ! Je commande le ${params.packName} (DakarEaseU) - ${params.price} FCFA. Mon numéro : ${params.whatsappSnapshot}`;
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      Linking.openURL(url);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
    },
  });
}
