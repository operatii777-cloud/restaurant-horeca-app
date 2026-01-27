import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

export function useMenuCategories() {
  const { data, loading, error, refetch } = useApiQuery<string[]>('/api/admin/categories');

  const categories = useMemo<string[]>(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.filter((item): item is string => typeof item === 'string');
  }, [data]);

  return {
    categories,
    loading,
    error,
    refetch,
  };
}

