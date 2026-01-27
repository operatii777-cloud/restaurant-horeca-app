import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { ReservationTableOption } from '@/types/reservations';

interface UseReservationTablesParams {
  date: string | null | undefined;
  time: string | null | undefined;
  partySize: number | null | undefined;
  enabled?: boolean;
}

interface UseReservationTablesResult {
  tables: ReservationTableOption[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function buildEndpoint({ date, time, partySize, enabled }: UseReservationTablesParams): string | null {
  if (!enabled) {
    return null;
  }
  if (!date || !time || !partySize) {
    return null;
  }

  const params = new URLSearchParams({
    date,
    time,
    partySize: String(partySize),
  });

  return `/api/admin/reservations/tables/availability?${params.toString()}`;
}

export function useReservationTables(params: UseReservationTablesParams): UseReservationTablesResult {
  const endpoint = useMemo(() => buildEndpoint(params), [params]);
  const { data, loading, error, refetch } = useApiQuery<ReservationTableOption[] | { data: ReservationTableOption[] }>(
    endpoint,
  );

  let tables: ReservationTableOption[] | null = null;

  if (Array.isArray(data)) {
    tables = data;
  } else if (data && typeof data === 'object' && 'data' in data) {
    const casted = data as { data?: ReservationTableOption[] };
    tables = casted.data ?? null;
  }

  return {
    tables,
    loading,
    error,
    refetch,
  };
}


