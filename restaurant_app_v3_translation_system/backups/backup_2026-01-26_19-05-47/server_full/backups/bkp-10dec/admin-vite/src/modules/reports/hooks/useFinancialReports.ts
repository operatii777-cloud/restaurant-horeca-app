/**
 * S15 — Financial Reports Hooks
 * 
 * React hooks pentru rapoarte financiare:
 * - useDailyFinancialSummary
 * - usePnl
 * - useCashflow
 * - useCategoryMix
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchDailySummary,
  fetchPnl,
  fetchCashflow,
  fetchCategoryMix,
  type DailySummaryItem,
  type PnlData,
  type CashflowData,
  type CategoryMixData,
  type FinancialFilters,
} from '../api/financialReportsApi';

interface UseFinancialDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for daily financial summary
 */
export function useDailyFinancialSummary(
  filters: FinancialFilters
): UseFinancialDataResult<DailySummaryItem[]> {
  const [data, setData] = useState<DailySummaryItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDailySummary(filters);
      setData(result);
    } catch (err: any) {
      console.error('[useDailyFinancialSummary] Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
  };
}

/**
 * Hook for P&L data
 */
export function usePnl(
  filters: FinancialFilters
): UseFinancialDataResult<PnlData> {
  const [data, setData] = useState<PnlData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPnl(filters);
      setData(result);
    } catch (err: any) {
      console.error('[usePnl] Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor P&L');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
  };
}

/**
 * Hook for cashflow data
 */
export function useCashflow(
  filters: FinancialFilters
): UseFinancialDataResult<CashflowData> {
  const [data, setData] = useState<CashflowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCashflow(filters);
      setData(result);
    } catch (err: any) {
      console.error('[useCashflow] Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor cashflow');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
  };
}

/**
 * Hook for category mix data
 */
export function useCategoryMix(
  filters: FinancialFilters
): UseFinancialDataResult<CategoryMixData> {
  const [data, setData] = useState<CategoryMixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCategoryMix(filters);
      setData(result);
    } catch (err: any) {
      console.error('[useCategoryMix] Error:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor category mix');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
  };
}

