import { useCallback, useEffect, useMemo, useState } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import type { Reservation, ReservationFilters, ReservationListMeta } from '@/types/reservations';

interface PaginationState {
  limit: number;
  offset: number;
}

interface UseReservationsOptions {
  initialFilters?: ReservationFilters;
  initialLimit?: number;
}

interface UseReservationsResult {
  reservations: Reservation[];
  meta: ReservationListMeta | null;
  loading: boolean;
  error: string | null;
  filters: ReservationFilters;
  pagination: PaginationState;
  refetch: () => Promise<void>;
  setFilters: (next: ReservationFilters | ((prev: ReservationFilters) => ReservationFilters)) => void;
  updateFilters: (partial: Partial<ReservationFilters>) => void;
  setPagination: (next: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
}

interface ReservationListResponse {
  success?: boolean;
  data: Reservation[];
  meta?: ReservationListMeta;
}

const DEFAULT_LIMIT = 120;

function normaliseFilters(filters: ReservationFilters): ReservationFilters {
  const cleaned: ReservationFilters = { ...filters };
  if (cleaned.search) {
    cleaned.search = cleaned.search.trim();
  }
  cleaned.statuses = cleaned.statuses?.filter(Boolean);
  if (cleaned.statuses && cleaned.statuses.length === 0) {
    delete cleaned.statuses;
  }
  if (!cleaned.tableId) {
    delete cleaned.tableId;
  }
  return cleaned;
}

function buildQueryParams(filters: ReservationFilters, pagination: PaginationState) {
  const params: Record<string, string | number | boolean> = {
    limit: pagination.limit,
    offset: pagination.offset,
  };

  const normalised = normaliseFilters(filters);

  if (normalised.startDate) {
    params.startDate = normalised.startDate;
  }
  if (normalised.endDate) {
    params.endDate = normalised.endDate;
  }
  if (normalised.statuses && normalised.statuses.length > 0) {
    params.status = normalised.statuses.join(',');
  }
  if (normalised.includeCancelled) {
    params.includeCancelled = true;
  }
  if (normalised.tableId) {
    params.tableId = normalised.tableId;
  }
  if (normalised.search) {
    params.search = normalised.search;
  }

  return params;
}

function getDefaultFilters(): ReservationFilters {
  const today = new Date().toISOString().split('T')[0];
  return {
    startDate: today,
    endDate: today,
    includeCancelled: false,
    statuses: ['pending', 'confirmed'],
  };
}

export function useReservations(options: UseReservationsOptions = {}): UseReservationsResult {
  const [filters, setFiltersState] = useState<ReservationFilters>(() => ({
    ...getDefaultFilters(),
    ...options.initialFilters,
  }));
  const [pagination, setPaginationState] = useState<PaginationState>({
    limit: options.initialLimit ?? DEFAULT_LIMIT,
    offset: 0,
  });

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [meta, setMeta] = useState<ReservationListMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo(() => buildQueryParams(filters, pagination), [filters, pagination]);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.get<ReservationListResponse>('/api/admin/reservations', {
        params: queryParams,
      });

      const payload = response.data;

      setReservations(payload.data ?? []);
      setMeta(payload.meta ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eroare necunoscută la încărcarea rezervărilor.';
      setError(message);
      console.error('[useReservations] Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const setFilters = useCallback(
    (next: ReservationFilters | ((prev: ReservationFilters) => ReservationFilters)) => {
      setFiltersState((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: ReservationFilters) => ReservationFilters)(prev) : next;
        return normaliseFilters(resolved);
      });
      setPaginationState((prev) => ({ ...prev, offset: 0 }));
    },
    [],
  );

  const updateFilters = useCallback(
    (partial: Partial<ReservationFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...partial,
      }));
    },
    [setFilters],
  );

  const setPagination = useCallback(
    (next: PaginationState | ((prev: PaginationState) => PaginationState)) => {
      setPaginationState(next);
    },
    [],
  );

  return {
    reservations,
    meta,
    loading,
    error,
    filters,
    pagination,
    refetch: fetchReservations,
    setFilters,
    updateFilters,
    setPagination,
  };
}


