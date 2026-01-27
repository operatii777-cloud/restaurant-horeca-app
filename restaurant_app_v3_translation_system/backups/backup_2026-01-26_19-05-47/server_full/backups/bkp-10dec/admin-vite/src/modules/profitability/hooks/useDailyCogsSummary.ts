/**
 * S14 - Hook pentru Daily COGS Summary
 * Fetch și transformă datele din /api/cogs/daily-summary
 */

import { useState, useEffect, useCallback } from 'react';
import { getDailySummary, DailyCogsSummary } from '../api/profitabilityApi';
import { mapDailySummaryToChartData, computeKpiBlocks, ChartDataPoint } from '../utils/profitabilityMappers';
import type { ProfitabilityFilters } from '../api/profitabilityApi';

export interface UseDailyCogsSummaryReturn {
  data: DailyCogsSummary[];
  chartData: ChartDataPoint[];
  kpiBlocks: ReturnType<typeof computeKpiBlocks>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDailyCogsSummary = (
  filters: ProfitabilityFilters = {}
): UseDailyCogsSummaryReturn => {
  const [data, setData] = useState<DailyCogsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getDailySummary(filters);
      setData(summary);
    } catch (err: any) {
      console.error('Error fetching daily COGS summary:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = mapDailySummaryToChartData(data);
  const kpiBlocks = computeKpiBlocks(data);

  return {
    data,
    chartData,
    kpiBlocks,
    loading,
    error,
    refetch: fetchData,
  };
};

