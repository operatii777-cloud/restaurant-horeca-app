import { useCallback, useEffect, useMemo, useState } from 'react';
import { httpClient } from '@/shared/api/httpClient';

interface ApiQueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  [key: string]: unknown;
}

export function useApiQuery<T = unknown>(endpoint: string | null): ApiQueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const normalisedEndpoint = useMemo(() => endpoint?.trim() ?? null, [endpoint]);

  const fetchData = useCallback(async () => {
    if (!normalisedEndpoint) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.get<ApiResponse<T> | T>(normalisedEndpoint);
      const payload = response.data;

      let extracted: unknown;

      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        const payloadObj = payload as ApiResponse<T> & Record<string, unknown>;
        if (payloadObj.data !== undefined) {
          extracted = payloadObj.data;
        } else if (payloadObj.items !== undefined) {
          extracted = payloadObj.items;
        } else if (payloadObj.products !== undefined) {
          extracted = payloadObj.products;
        } else if (payloadObj.orders !== undefined) {
          extracted = payloadObj.orders;
        } else if (payloadObj.ingredients !== undefined) {
          extracted = payloadObj.ingredients;
        } else if (payloadObj.categories !== undefined) {
          extracted = payloadObj.categories;
        } else {
          extracted = payloadObj;
        }
      } else {
        extracted = payload;
      }

      setData(extracted as T);
    } catch (err) {
      console.error('[useApiQuery] Request failed:', err);
      const message = err instanceof Error ? err.message : 'Eroare necunoscută';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [normalisedEndpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
