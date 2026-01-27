/**
 * S14 - Profitability API Layer
 * Conectare la S13 COGS Engine APIs
 */

import { httpClient } from '@/shared/api/httpClient';

// ============================================
// TYPES
// ============================================

export interface DailyCogsSummary {
  day: string;
  revenue: number;
  cogsTotal: number;
  profit: number;
  foodCostPercent: number | null;
  marginPercent: number | null;
}

export interface CategoryProfitability {
  categoryCode: string;
  categoryName: string;
  revenue: number;
  cogsTotal: number;
  profit: number;
  foodCostPercent: number | null;
  marginPercent: number | null;
}

export interface ProductProfitability {
  productId: number;
  productName: string;
  category: string;
  quantity: number;
  revenue: number;
  cogsTotal: number;
  profit: number;
  foodCostPercent: number | null;
  marginPercent: number | null;
}

export interface ProfitabilityFilters {
  dateFrom?: string;
  dateTo?: string;
  productId?: number;
  categoryCode?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * GET /api/cogs/daily-summary
 * Returnează sumar zilnic COGS pentru perioada specificată
 */
export const getDailySummary = async (
  filters: ProfitabilityFilters = {}
): Promise<DailyCogsSummary[]> => {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);

  const response = await httpClient.get(`/api/cogs/daily-summary?${params.toString()}`);
  return response.data || [];
};

/**
 * GET /api/cogs/category-profitability
 * Returnează profitabilitate pe categorii
 */
export const getCategoryProfitability = async (
  filters: ProfitabilityFilters = {}
): Promise<CategoryProfitability[]> => {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.categoryCode) params.append('categoryCode', filters.categoryCode);

  const response = await httpClient.get(`/api/cogs/category-profitability?${params.toString()}`);
  return response.data || [];
};

/**
 * GET /api/cogs/product-profitability
 * Returnează profitabilitate pe produse
 */
export const getProductProfitability = async (
  filters: ProfitabilityFilters = {}
): Promise<ProductProfitability[]> => {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.productId) params.append('productId', filters.productId.toString());
  if (filters.categoryCode) params.append('categoryCode', filters.categoryCode);

  const response = await httpClient.get(`/api/cogs/product-profitability?${params.toString()}`);
  return response.data || [];
};

/**
 * POST /api/cogs/sync/:productId
 * Sincronizează COGS pentru un produs specific
 */
export const syncCogs = async (productId: number): Promise<{ success: boolean; message?: string }> => {
  const response = await httpClient.post(`/api/cogs/sync/${productId}`);
  return response.data || { success: false };
};

/**
 * POST /api/cogs/sync-all
 * Sincronizează COGS pentru toate produsele
 */
export const syncAllCogs = async (): Promise<{ success: boolean; message?: string; synced?: number }> => {
  const response = await httpClient.post('/api/cogs/sync-all');
  return response.data || { success: false };
};

