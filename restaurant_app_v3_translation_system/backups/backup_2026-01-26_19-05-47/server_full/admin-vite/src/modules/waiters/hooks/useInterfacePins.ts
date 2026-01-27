import { useMemo } from 'react';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { InterfacePinResponse, InterfacePin } from '@/types/pins';

const PINS_ENDPOINT = '/api/admin/pins';

export const useInterfacePins = () => {
  const { data, loading, error, refetch } = useApiQuery<InterfacePinResponse>(PINS_ENDPOINT);

  const pins = useMemo<InterfacePin[]>(() => {
    if (!data) {
      return [];
    }
    if (Array.isArray((data as InterfacePinResponse).pins)) {
      return (data as InterfacePinResponse).pins;
    }

    return [];
  }, [data]);

  return {
    pins,
    loading,
    error,
    refresh: refetch,
  };
};



