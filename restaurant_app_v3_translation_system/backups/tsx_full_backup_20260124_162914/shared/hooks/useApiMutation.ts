import { useCallback, useState } from 'react';
import type { AxiosRequestConfig, Method } from 'axios';
import { httpClient } from '@/shared/api/httpClient';

export interface ApiMutationOptions<TBody = unknown> {
  url: string;
  method?: Method;
  data?: TBody;
  config?: AxiosRequestConfig<TBody>;
}

export interface ApiMutationResult<TResponse = unknown> {
  mutate: (options: ApiMutationOptions) => Promise<TResponse | null>;
  loading: boolean;
  error: string | null;
  data: TResponse | null;
  reset: () => void;
}

export function useApiMutation<TResponse = unknown>(): ApiMutationResult<TResponse> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  const mutate = useCallback(async (options: ApiMutationOptions) => {
    const { url, method = 'post', data: body, config } = options;

    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.request<TResponse>({
        url,
        method,
        data: body,
        ...config,
      });

      const payload = response.data as unknown as { data?: TResponse } & TResponse;
      const extracted = typeof payload === 'object' && payload && "Dată:" in payload ? payload.data : payload;

      setData(extracted as TResponse);
      return extracted as TResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eroare necunoscută';
      setError(message);
      console.error('useApiMutation Request failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
}


