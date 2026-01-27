import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { ReservationFilters, ReservationMetrics } from '@/types/reservations';

interface UseReservationMetricsResult {
  metrics: ReservationMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function buildMetricsEndpoint(filters: ReservationFilters): string {
  const params = new URLSearchParams();

  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }

  const query = params.toString();
  return `/api/admin/reservations/metrics${query ? `?${query}` : ''}`;
}

export function useReservationMetrics(filters: ReservationFilters): UseReservationMetricsResult {
  const endpoint = useMemo(() => buildMetricsEndpoint(filters), [filters]);
  const { data, loading, error, refetch } = useApiQuery<ReservationMetrics>(endpoint);

  return {
    metrics: data,
    loading,
    error,
    refetch,
  };
}


