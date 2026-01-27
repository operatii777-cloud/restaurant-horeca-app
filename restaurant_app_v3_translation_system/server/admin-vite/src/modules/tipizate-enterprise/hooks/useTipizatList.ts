/**
 * PHASE S5.7 - useTipizatList Hook
 * Enterprise list hook for all tipizate documents
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tipizateApi } from '../api/tipizateApi';
import { TipizatType } from '../api/types';
import { nameFor } from '../config/tipizate.config';
import { useTipizateStore } from '../store/tipizateStore';

export interface UseTipizatListParams {
  type: TipizatType;
  initialFilters?: {
    fromDate?: string;
    toDate?: string;
    status?: string;
    locationId?: string;
    supplierName?: string;
    clientName?: string;
    paymentMethod?: string;
    consumptionReason?: string;
    toLocationId?: string;
  };
}

export interface UseTipizatListReturn {
  type: TipizatType;
  name: string;
  filters: {
    fromDate?: string;
    toDate?: string;
    status?: string;
    locationId?: string;
    supplierName?: string;
    clientName?: string;
    paymentMethod?: string;
    consumptionReason?: string;
    toLocationId?: string;
  };
  setFilters: (filters: UseTipizatListParams['initialFilters']) => void;
  rows: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export function useTipizatList({ type, initialFilters = {} }: UseTipizatListParams): UseTipizatListReturn {
  const store = useTipizateStore();
  
  // Load filters from store or use initial
  const storeFilters = store.filters[type] || {};
  const [filters, setFiltersState] = useState(storeFilters || initialFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(store.ui.pageSize || 50);

  // Sync filters with store
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      store.setFilters(type, filters);
    }
  }, [filters, type, store]);

  // Check cache first
  const cachedData = store.listCache[type];
  
  const query = useQuery({
    queryKey: ['tipizate', type, 'list', filters, page, pageSize, store.reloadToken],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: page + 1, // API expects 1-based
        pageSize,
      };

      if (filters.fromDate) {
        params.from = filters.fromDate;
      }
      if (filters.toDate) {
        params.to = filters.toDate;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.locationId) {
        params.locationId = filters.locationId;
      }

      const data = await tipizateApi.list(type, params);
      
      // Cache the result
      store.setListCache(type, { data, timestamp: Date.now() });
      
      return data;
    },
    staleTime: 30000, // 30 seconds
    initialData: cachedData?.data,
  });

  const setFilters = (newFilters: UseTipizatListParams['initialFilters']) => {
    setFiltersState(newFilters || {});
    setPage(0); // Reset to first page when filters change
    store.setFilters(type, newFilters || {});
  };

  const refetch = () => {
    query.refetch();
  };

  // Handle both array and paginated response
  const rows = Array.isArray(query.data) ? query.data : (query.data as any)?.items || (query.data as any)?.data || [];
  const total = (query.data as any)?.total || (query.data as any)?.count || rows.length;

  return {
    type,
    name: nameFor(type),
    filters,
    setFilters,
    rows,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch,
    pagination: {
      page,
      pageSize,
      total,
    },
    setPage,
    setPageSize,
  };
}


