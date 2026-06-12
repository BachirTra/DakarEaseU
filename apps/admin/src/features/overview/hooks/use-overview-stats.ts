'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOverviewStats } from '../services/overview.service';

export function useOverviewStats() {
  return useQuery({
    queryKey: ['overview', 'stats'],
    queryFn: fetchOverviewStats,
    staleTime: 60_000,
  });
}
