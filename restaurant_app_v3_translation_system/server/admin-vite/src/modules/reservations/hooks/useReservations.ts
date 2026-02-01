import { useCallback, useEffect, useState } from 'react';
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
  data?: Reservation[];
  meta?: ReservationListMeta;
}

const DEFAULT_LIMIT = 5000;

function normaliseFilters(filters: ReservationFilters): ReservationFilters {
  const cleaned: ReservationFilters = { ...filters };

  if (cleaned.search) {
    cleaned.search = cleaned.search.trim();
  }

  // Elimină statuses dacă este undefined, null sau array gol
  if (!cleaned.statuses || (Array.isArray(cleaned.statuses) && cleaned.statuses.length === 0)) {
    delete cleaned.statuses;
  } else if (Array.isArray(cleaned.statuses)) {
    cleaned.statuses = cleaned.statuses.filter(Boolean);
    if (cleaned.statuses.length === 0) {
      delete cleaned.statuses;
    }
  }

  if (!cleaned.tableId) {
    delete cleaned.tableId;
  }

  // Elimină datele goale
  if (!cleaned.startDate) {
    delete cleaned.startDate;
  }
  if (!cleaned.endDate) {
    delete cleaned.endDate;
  }

  return cleaned;
}

function getDefaultFilters(): ReservationFilters {
  // ✅ Implicit, includem TOATE rezervările (inclusiv cancelled și no_show)
  return {
    includeCancelled: true,
    // NU setăm statuses, startDate sau endDate pentru a vedea TOTUL
  };
}

export function useReservations(options: UseReservationsOptions = {}): UseReservationsResult {
  const [filters, setFiltersState] = useState<ReservationFilters>(() => {
    const defaultFilters = getDefaultFilters();
    return {
      ...defaultFilters,
      ...options.initialFilters,
    };
  });

  const [pagination, setPaginationState] = useState<PaginationState>({
    limit: options.initialLimit ?? DEFAULT_LIMIT,
    offset: 0,
  });

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [meta, setMeta] = useState<ReservationListMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ FOLOSIM ACELAȘI ENDPOINT CA ADMIN.HTML LEGACY
      let url = '/api/reservations';
      const params = new URLSearchParams();

      // Adaugă filtre doar dacă sunt explicit setate (identic cu admin.html)
      if (filters.startDate) {
        params.append('date', filters.startDate);
      }

      // Adaugă status doar dacă este explicit setat
      if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
        params.append('status', filters.statuses.join(','));
      }

      if (filters.search) params.append('search', filters.search);
      if (filters.tableId) params.append('tableId', String(filters.tableId));
      if (filters.customerPhone) params.append('customerPhone', filters.customerPhone);

      // ✅ CRITICAL FIX: Trimite parametrii necesari pentru a obține TOATE rezervările
      // 1. includeCancelled=true → Include cancelled și no_show
      // 2. includeAllLocations=true → Ignoră filtrul pe locație (header x-location-id)
      // 3. limit=5000 → Obține toate rezervările (backend default este 1000, max este 5000)
      const shouldIncludeCancelled = filters.includeCancelled !== undefined ? filters.includeCancelled : true;
      params.append('includeCancelled', shouldIncludeCancelled ? 'true' : 'false');
      params.append('includeAllLocations', 'true');
      params.append('limit', String(pagination.limit));
      params.append('offset', String(pagination.offset));

      console.log('useReservations Parametri pentru TOATE rezervările:', {
        includeCancelled: shouldIncludeCancelled,
        includeAllLocations: true,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
      console.log('useReservations Fetching (legacy endpoint):', fullUrl);

      const response = await httpClient.get<Reservation[]>(fullUrl);
      const payload = response.data;

      // Legacy endpoint returnează întotdeauna un array direct
      const reservations: Reservation[] = Array.isArray(payload) ? payload : [];

      console.log('useReservations Loaded reservations (legacy):', reservations.length);

      // Afișează distribuția statusurilor
      const statusCounts = reservations.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Status distribution:', statusCounts);

      // 🔍 DEBUG: Afișează TOATE rezervările pentru a vedea ce lipsește
      console.log('DEBUG Toate rezervările primite:');
      reservations.forEach((r, idx) => {
        console.log(`  ${idx + 1}. ID: ${r.id}, Nume: ${r.customer_name}, Status: ${r.status}, Data: ${r.reservation_date}`);
      });

      // 🔍 Verifică dacă există rezervări cancelled sau no_show
      const cancelledOrNoShow = reservations.filter(r => r.status === 'cancelled' || r.status === 'no_show');
      console.log(`🔍 Rezervări cancelled/no_show: ${cancelledOrNoShow.length}`);
      if (cancelledOrNoShow.length > 0) {
        cancelledOrNoShow.forEach(r => {
          console.log(`  - ID: ${r.id}, Nume: ${r.customer_name}, Status: ${r.status}`);
        });
      }

      setReservations(reservations);

      // Legacy endpoint nu returnează meta, deci setăm null
      setMeta(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eroare la încărcarea rezervărilor.';
      setError(message);
      console.error('useReservations Error:', err);
      setReservations([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    void fetchReservations();
  }, [fetchReservations]);

  const setFilters = useCallback(
    (next: ReservationFilters | ((prev: ReservationFilters) => ReservationFilters)) => {
      setFiltersState((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
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



