/**
 * S14 - Hook pentru Product Profitability
 * Fetch și transformă datele din /api/cogs/product-profitability
 */

import { useState, useEffect, useCallback } from 'react';
import { getProductProfitability, ProductProfitability } from '../api/profitabilityApi';
import {
  mapProductProfitabilityToTable,
  mapProductProfitabilityToBarChart,
  ProductTableRow,
  BarChartDataPoint,
} from '../utils/profitabilityMappers';
import type { ProfitabilityFilters } from '../api/profitabilityApi';

export interface UseProductProfitabilityReturn {
  data: ProductProfitability[];
  tableRows: ProductTableRow[];
  barChartData: BarChartDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Statistici calculate
  stats: {
    totalProducts: number;
    avgFoodCostPercent: number;
    avgMarginPercent: number;
    totalRevenue: number;
    totalProfit: number;
    alertsCount: number;
  };
}

export const useProductProfitability = (
  filters: ProfitabilityFilters = {}
): UseProductProfitabilityReturn => {
  const [data, setData] = useState<ProductProfitability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await getProductProfitability(filters);
      setData(products);
    } catch (err: any) {
      console.error('Error fetching product profitability:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la încărcarea datelor');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, filters.productId, filters.categoryCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tableRows = mapProductProfitabilityToTable(data);
  const barChartData = mapProductProfitabilityToBarChart(data, 10);

  // Calculează statistici
  const stats = {
    totalProducts: data.length,
    avgFoodCostPercent:
      data.length > 0
        ? data.reduce((sum, p) => sum + (p.foodCostPercent || 0), 0) / data.length
        : 0,
    avgMarginPercent:
      data.length > 0
        ? data.reduce((sum, p) => sum + (p.marginPercent || 0), 0) / data.length
        : 0,
    totalRevenue: data.reduce((sum, p) => sum + (p.revenue || 0), 0),
    totalProfit: data.reduce((sum, p) => sum + (p.profit || 0), 0),
    alertsCount: data.filter((p) => (p.foodCostPercent || 0) > 35).length,
  };

  return {
    data,
    tableRows,
    barChartData,
    loading,
    error,
    refetch: fetchData,
    stats,
  };
};


