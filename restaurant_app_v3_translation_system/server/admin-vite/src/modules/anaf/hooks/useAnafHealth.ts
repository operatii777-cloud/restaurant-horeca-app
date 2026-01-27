/**
 * FAZA 1.7 - ANAF Health Hook
 * 
 * React Query hook for fetching ANAF health dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAnafHealth } from '../api/anaf.api';

export function useAnafHealth() {
  return useQuery({
    queryKey: ['anaf', 'health'],
    queryFn: fetchAnafHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

