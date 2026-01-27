import { httpClient } from '@/shared/api/httpClient';

export interface ExecutiveMetrics {
  total_stock_value: number;
  total_transfers: number;
  compliance_rate: number;
  total_variance: number;
}

export interface LocationComparison {
  location_id: number;
  location_name: string;
  location_type: string;
  stock_value: number;
  transfer_count: number;
  compliance_rate: number;
  variance: number;
}

export interface StockValueByLocation {
  location_id: number;
  location_name: string;
  stock_value: number;
}

export interface TopIngredient {
  ingredient_id: number;
  ingredient_name: string;
  category: string;
  transfer_count: number;
  total_quantity: number;
}

export interface VarianceSummary {
  location_id: number;
  location_name: string;
  total_variance: number;
  variance_count: number;
}

export interface ComplianceSummary {
  location_id: number;
  location_name: string;
  compliance_rate: number;
  total_checks: number;
  compliant_checks: number;
}

export const executiveDashboardApi = {
  // Metrici consolidate
  async getMetrics(params?: { period_start?: string; period_end?: string; locations?: string }): Promise<ExecutiveMetrics> {
    const response = await httpClient.get<ExecutiveMetrics>('/api/executive-dashboard/metrics', { params });
    return response.data;
  },

  // Comparație locații
  async getLocationComparison(params?: { period_start?: string; period_end?: string }): Promise<LocationComparison[]> {
    const response = await httpClient.get<LocationComparison[]>('/api/executive-dashboard/location-comparison', { params });
    return response.data;
  },

  // Valoare stoc per locație
  async getStockValueByLocation(): Promise<StockValueByLocation[]> {
    const response = await httpClient.get<StockValueByLocation[]>('/api/executive-dashboard/stock-value');
    return response.data;
  },

  // Top ingrediente
  async getTopIngredients(params?: { period_start?: string; period_end?: string; locations?: string; limit?: number }): Promise<TopIngredient[]> {
    const response = await httpClient.get<TopIngredient[]>('/api/executive-dashboard/top-ingredients', { params });
    return response.data;
  },

  // Rezumat varianță
  async getVarianceSummary(params?: { period_start?: string; period_end?: string }): Promise<VarianceSummary[]> {
    const response = await httpClient.get<VarianceSummary[]>('/api/executive-dashboard/variance-summary', { params });
    return response.data;
  },

  // Rezumat conformitate
  async getComplianceSummary(params?: { period_start?: string; period_end?: string }): Promise<ComplianceSummary[]> {
    const response = await httpClient.get<ComplianceSummary[]>('/api/executive-dashboard/compliance-summary', { params });
    return response.data;
  },
};

