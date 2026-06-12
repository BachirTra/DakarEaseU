import { useQuery } from '@tanstack/react-query';
import * as transportService from '@/features/transport/services/transport.service';
import type { TransportCategoryId } from '@/constants/categories';

export function useTransportProviders(category: TransportCategoryId | 'all') {
  return useQuery({
    queryKey: ['transport', 'list', category],
    queryFn: () => transportService.fetchTransportProviders(category),
  });
}
