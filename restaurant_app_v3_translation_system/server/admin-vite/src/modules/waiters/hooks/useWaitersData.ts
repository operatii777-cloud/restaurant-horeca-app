// import { useTranslation } from '@/i18n/I18nContext';
import { useEffect, useState } from 'react';
import type { Waiter } from '@/types/waiters';
import { httpClient } from '@/shared/api/httpClient';

type UseWaitersDataResult = {
  waiters: Waiter[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ENDPOINT = '/api/admin/waiters';

export const useWaitersData = (): UseWaitersDataResult => {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get<{ data?: Waiter[] } | Waiter[]>(ENDPOINT);
      const payload = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      setWaiters(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nu am putut încărca lista de ospătari.';
      setError(message);
      setWaiters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return {
    waiters,
    loading,
    error,
    refresh: fetchData,
  };
};

