/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXECUTIVE DASHBOARD API CLIENT
 * 
 * API client pentru dashboard executive cu KPI-uri critice
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { httpClient } from '@/shared/api/httpClient';

export interface ExecutiveMetrics {
  today: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    revenue_change_percent: number;
    orders_change_percent: number;
  };
  yesterday: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
  };
  platform_sales: Array<{
    platform: string;
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
  }>;
  critical_stock: {
    count: number;
    items: Array<{
      id: number;
      name: string;
      current_stock: number;
      min_stock: number;
      unit: string;
    }>;
  };
  warning_stock: {
    count: number;
    items: Array<{
      id: number;
      name: string;
      current_stock: number;
      min_stock: number;
      unit: string;
    }>;
  };
  pending_orders: {
    count: number;
    orders: Array<{
      id: number;
      status: string;
      timestamp: string;
      total: number;
      platform: string;
      customer_name?: string;
      table_number?: number;
      wait_minutes: number;
    }>;
  };
  cancellation_rates: Array<{
    platform: string;
    total_orders: number;
    cancelled_orders: number;
    cancellation_rate: number;
  }>;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
  }>;
  profitability: {
    total_revenue: number;
    estimated_food_cost: number;
    estimated_gross_profit: number;
    profit_margin_percent: number;
    total_orders: number;
    avg_order_value: number;
  };
  daily_sales: Array<{
    date: string;
    platform: string;
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
  }>;
}

export interface StockValue {
  total_value: number;
  items: Array<{
    id: number;
    name: string;
    current_stock: number;
    unit: string;
    cost_per_unit: number;
    total_value: number;
  }>;
}

export const executiveDashboardApi = {
  /**
   * GET /api/executive-dashboard/metrics
   * Obține KPI-uri principale pentru dashboard executive
   */
  getMetrics: (params?: { startDate?: string; endDate?: string }) => {
    return httpClient.get<{ success: boolean; metrics: ExecutiveMetrics; period: { from: string; to: string } }>(
      '/api/executive-dashboard/metrics',
      { params }
    );
  },

  /**
   * GET /api/executive-dashboard/stock-value
   * Obține valoarea stocului actual
   */
  getStockValue: () => {
    return httpClient.get<{ success: boolean; data: StockValue }>(
      '/api/executive-dashboard/stock-value'
    );
  },
};
