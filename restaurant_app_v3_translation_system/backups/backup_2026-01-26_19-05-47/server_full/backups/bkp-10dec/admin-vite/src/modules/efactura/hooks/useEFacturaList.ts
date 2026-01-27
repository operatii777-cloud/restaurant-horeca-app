/**
 * PHASE S11 - e-Factura List Hook
 * 
 * Hook to load and manage e-Factura invoice list.
 */

import { useEffect } from 'react';
import { efacturaApi } from '../../../core/api/efacturaApi';
import { useEFacturaStore } from '../store/efacturaStore';

export function useEFacturaList() {
  const { filter, page, pageSize, setList, setLoading, list, total } = useEFacturaStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await efacturaApi.getInvoices(filter, page, pageSize);
        if (!cancelled) {
          setList(res);
        }
      } catch (error) {
        console.error('[useEFacturaList] Error loading invoices:', error);
        if (!cancelled) {
          setList({ items: [], total: 0, page: 1, pageSize: 50 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filter, page, pageSize, setList, setLoading]);

  return { list, total, page, pageSize };
}

