/**
 * PLATFORM STATISTICS API CLIENT
 * 
 * API client pentru statistici per platformă
 */

import { httpClient } from '@/shared/api/httpClient';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Platform {
  platform: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  unique_customers: number;
  active_days: number;
}

export interface PlatformOverview {
  platform: string;
  stats: {
    total_orders: number;
    unique_customers: number;
    total_revenue: number;
    avg_order_value: number;
    min_order_value: number;
    max_order_value: number;
    active_days: number;
    tables_served: number;
  };
  order_types: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
  order_statuses: Array<{
    status: string;
    count: number;
  }>;
}

export interface PlatformTrend {
  period: string;
  orders: number;
  revenue: number;
  avg_order_value: number;
  unique_customers: number;
}

export interface PlatformTopProduct {
  product_id: number | string;
  product_name: string;
  total_quantity: number;
  order_count: number;
  total_revenue: number;
}

export interface PlatformComparison {
  platform: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  unique_customers: number;
  active_days: number;
  completed_revenue: number;
  completed_orders: number;
  revenue_percentage: string;
  orders_percentage: string;
}

export interface PlatformHourly {
  hour: number;
  orders: number;
  revenue: number;
  avg_order_value: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════════════

export const platformStatsApi = {
  /**
   * GET /api/platform-stats/platforms
   * Obține lista tuturor platformelor cu statistici
   */
  getPlatforms: (params?: { startDate?: string; endDate?: string }) => {
    return httpClient.get<{ success: boolean; platforms: Platform[] }>(
      '/api/platform-stats/platforms',
      { params }
    );
  },

  /**
   * GET /api/platform-stats/:platform/overview
   * Statistici generale pentru o platformă
   */
  getPlatformOverview: (
    platform: string,
    params?: { startDate?: string; endDate?: string }
  ) => {
    return httpClient.get<{ success: boolean; platform: string; stats: PlatformOverview['stats']; order_types: PlatformOverview['order_types']; order_statuses: PlatformOverview['order_statuses'] }>(
      `/api/platform-stats/"Platform"/overview`,
      { params }
    );
  },

  /**
   * GET /api/platform-stats/:platform/trends
   * Trenduri pe perioade de timp
   */
  getPlatformTrends: (
    platform: string,
    params?: { startDate?: string; endDate?: string; period?: 'hour' | 'day' | 'week' | 'month' }
  ) => {
    return httpClient.get<{
      success: boolean;
      platform: string;
      period: string;
      startDate: string;
      endDate: string;
      trends: PlatformTrend[];
    }>(
      `/api/platform-stats/"Platform"/trends`,
      { params }
    );
  },

  /**
   * GET /api/platform-stats/:platform/top-products
   * Top produse pentru o platformă
   */
  getPlatformTopProducts: (
    platform: string,
    params?: { startDate?: string; endDate?: string; limit?: number }
  ) => {
    return httpClient.get<{
      success: boolean;
      platform: string;
      top_products: PlatformTopProduct[];
    }>(
      `/api/platform-stats/"Platform"/top-products`,
      { params }
    );
  },

  /**
   * GET /api/platform-stats/compare
   * Comparație între platforme
   */
  comparePlatforms: (params?: {
    startDate?: string;
    endDate?: string;
    platforms?: string; // Comma-separated list
  }) => {
    return httpClient.get<{
      success: boolean;
      startDate: string | null;
      endDate: string | null;
      comparison: PlatformComparison[];
      totals: {
        total_revenue: number;
        total_orders: number;
      };
    }>(
      '/api/platform-stats/compare',
      { params }
    );
  },

  /**
   * GET /api/platform-stats/:platform/hourly
   * Statistici pe ore
   */
  getPlatformHourly: (
    platform: string,
    params?: { startDate?: string; endDate?: string }
  ) => {
    return httpClient.get<{
      success: boolean;
      platform: string;
      startDate: string;
      endDate: string;
      hourly: PlatformHourly[];
    }>(
      `/api/platform-stats/"Platform"/hourly`,
      { params }
    );
  },
};
