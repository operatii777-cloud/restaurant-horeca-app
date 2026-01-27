/**
 * S14 - Hook pentru Category Profitability
 * Fetch și transformă datele din /api/cogs/category-profitability
 */

import { useState, useEffect, useCallback } from 'react';
import { getCategoryProfitability, CategoryProfitability } from '../api/profitabilityApi';
import { mapCategoryProfitabilityToPie, PieChartDataPoint } from '../utils/profitabilityMappers';
import type { ProfitabilityFilters } from '../api/profitabilityApi';

export interface UseCategoryProfitabilityReturn {
  data: CategoryProfitability[];
  pieChartData: PieChartDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategoryProfitability = (
  filters: ProfitabilityFilters = {}
): UseCategoryProfitabilityReturn => {
  const [data, setData] = useState<CategoryProfitability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const categories = await getCategoryProfitability(filters);
      setData(categories);
    } catch (err: any) {
      console.error('Error fetching category profitability:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, filters.categoryCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pieChartData = mapCategoryProfitabilityToPie(data);

  return {
    data,
    pieChartData,
    loading,
    error,
    refetch: fetchData,
  };
};


