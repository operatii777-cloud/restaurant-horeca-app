/**
 * Profitability Module Types
 * Extracted from profitabilityApi.ts
 */

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

