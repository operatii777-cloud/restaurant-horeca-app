import { useCallback, useEffect, useMemo, useState } from 'react';
import { httpClient } from '@/shared/api/httpClient';

type PaginatedResponse<T> = {
  data?: T[];
  items?: T[];
  total?: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
};

type UsePaginatedQueryOptions<TParams extends Record<string, unknown>> = {
  endpoint: string | null;
  initialPage?: number;
  initialPageSize?: number;
  initialParams?: TParams;
};

type UsePaginatedQueryResult<T, TParams extends Record<string, unknown>> = {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  params: TParams;
  setPage: (nextPage: number) => void;
  setPageSize: (nextSize: number) => void;
  setParams: (updater: (current: TParams) => TParams) => void;
  refresh: () => Promise<void>;
};

const DEFAULT_PAGE_SIZE = 25;

const normalizeData = <T,>(payload: PaginatedResponse<T> | T[] | null | undefined): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.items && Array.isArray(payload.items)) return payload.items;
  return [];
};

export const usePaginatedQuery = <T, TParams extends Record<string, unknown> = Record<string, unknown>>({
  endpoint,
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialParams,
}: UsePaginatedQueryOptions<TParams>): UsePaginatedQueryResult<T, TParams> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [params, setParamsState] = useState<TParams>((initialParams ?? {}) as TParams);

  const normalisedEndpoint = useMemo(() => endpoint?.trim() ?? null, [endpoint]);

  const fetchData = useCallback(async () => {
    if (!normalisedEndpoint) {
      setData([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.get<PaginatedResponse<T> | T[]>(normalisedEndpoint, {
        params: {
          page,
          pageSize,
          ...params,
        },
      });

      const payload = response.data;
      const extracted = normalizeData(payload);

      setData(extracted);
      if (payload && !Array.isArray(payload)) {
        const meta = payload as PaginatedResponse<T>;
        setTotal(typeof meta.total === 'number' ? meta.total : extracted.length);
        setTotalPages(
          typeof meta.totalPages === 'number'
            ? meta.totalPages
            : Math.max(1, Math.ceil((typeof meta.total === 'number' ? meta.total : extracted.length) / pageSize)),
        );
      } else {
        setTotal(extracted.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('[usePaginatedQuery] Request failed:', err);
      const message = err instanceof Error ? err.message : 'Eroare necunoscută';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [normalisedEndpoint, page, pageSize, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const updateParams = useCallback(
    (updater: (current: TParams) => TParams) => {
      setPage(1);
      setParamsState((current) => updater(current));
    },
    [],
  );

  const updatePageSize = useCallback((nextSize: number) => {
    setPage(1);
    setPageSize(nextSize);
  }, []);

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    params,
    setPage,
    setPageSize: updatePageSize,
    setParams: updateParams,
    refresh,
  };
};

