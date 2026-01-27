/**
 * S15 — Financial Reports API
 * 
 * API client pentru rapoarte financiare:
 * - Daily Summary
 * - P&L (Profit & Loss)
 * - Cashflow
 * - Category Mix
 */

import { httpClient } from '@/shared/api/httpClient';

export interface DailySummaryItem {
  day: string;
  revenue: number;
  cogsTotal: number;
  grossProfit: number;
  foodCostPercent: number;
  marginPercent: number;
}

export interface PnlData {
  period: {
    from: string | null;
    to: string | null;
  };
  revenue: number;
  cogsTotal: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  foodCostPercent: number;
  marginPercent: number;
}

export interface CashflowData {
  period: {
    from: string | null;
    to: string | null;
  };
  inflows: {
    cash: number;
    card: number;
    vouchers: number;
    other: number;
    total: number;
  };
  outflows: {
    suppliers: number;
    salaries: number;
    other: number;
    total: number;
  };
  netCashflow: number;
}

export interface CategoryMixItem {
  categoryCode: string;
  categoryName: string;
  revenue: number;
  cogsTotal: number;
  grossProfit: number;
  foodCostPercent: number;
  marginPercent: number;
  shareOfRevenue: number;
}

export interface CategoryMixData {
  categories: CategoryMixItem[];
}

export interface FinancialFilters {
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Fetch daily summary
 */
export async function fetchDailySummary(
  filters: FinancialFilters
): Promise<DailySummaryItem[]> {
  const response = await httpClient.get('/api/financial/daily-summary', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    },
  });
  return response.data || [];
}

/**
 * Fetch P&L data
 */
export async function fetchPnl(filters: FinancialFilters): Promise<PnlData> {
  const response = await httpClient.get('/api/financial/pnl', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    },
  });
  return response.data;
}

/**
 * Fetch cashflow data
 */
export async function fetchCashflow(
  filters: FinancialFilters
): Promise<CashflowData> {
  const response = await httpClient.get('/api/financial/cashflow', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    },
  });
  return response.data;
}

/**
 * Fetch category mix data
 */
export async function fetchCategoryMix(
  filters: FinancialFilters
): Promise<CategoryMixData> {
  const response = await httpClient.get('/api/financial/category-mix', {
    params: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    },
  });
  return response.data;
}

