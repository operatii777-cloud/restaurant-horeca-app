/**
 * S14 - Profitability Mappers
 * Transformă datele S13 API în formate pentru UI (charts, tables, KPI cards)
 */

import {
  DailyCogsSummary,
  CategoryProfitability,
  ProductProfitability,
} from '../api/profitabilityApi';

// ============================================
// CHART DATA MAPPERS
// ============================================

export interface ChartDataPoint {
  label: string;
  revenue: number;
  cogs: number;
  profit: number;
  foodCostPercent: number;
  marginPercent: number;
}

/**
 * Mapează daily summary în format pentru line chart
 */
export const mapDailySummaryToChartData = (
  summary: DailyCogsSummary[]
): ChartDataPoint[] => {
  return summary.map((item) => ({
    label: new Date(item.day).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
    }),
    revenue: item.revenue || 0,
    cogs: item.cogsTotal || 0,
    profit: item.profit || 0,
    foodCostPercent: item.foodCostPercent || 0,
    marginPercent: item.marginPercent || 0,
  }));
};

/**
 * Mapează category profitability în format pentru pie chart
 */
export interface PieChartDataPoint {
  name: string;
  value: number;
  revenue: number;
  cogs: number;
  profit: number;
  foodCostPercent: number;
}

export const mapCategoryProfitabilityToPie = (
  categories: CategoryProfitability[]
): PieChartDataPoint[] => {
  return categories.map((cat) => ({
    name: cat.categoryName || cat.categoryCode || 'Necategorizat',
    value: cat.revenue || 0,
    revenue: cat.revenue || 0,
    cogs: cat.cogsTotal || 0,
    profit: cat.profit || 0,
    foodCostPercent: cat.foodCostPercent || 0,
  }));
};

/**
 * Mapează product profitability în format pentru bar chart (top products)
 */
export interface BarChartDataPoint {
  name: string;
  revenue: number;
  profit: number;
  foodCostPercent: number;
}

export const mapProductProfitabilityToBarChart = (
  products: ProductProfitability[],
  limit: number = 10
): BarChartDataPoint[] => {
  return products
    .sort((a, b) => (b.profit || 0) - (a.profit || 0))
    .slice(0, limit)
    .map((product) => ({
      name: product.productName,
      revenue: product.revenue || 0,
      profit: product.profit || 0,
      foodCostPercent: product.foodCostPercent || 0,
    }));
};

// ============================================
// TABLE ROW MAPPERS
// ============================================

export interface ProductTableRow {
  productId: number;
  productName: string;
  category: string;
  quantity: number;
  revenue: number;
  cogsTotal: number;
  profit: number;
  foodCostPercent: number;
  marginPercent: number;
}

/**
 * Mapează product profitability în format pentru AG Grid
 */
export const mapProductProfitabilityToTable = (
  products: ProductProfitability[]
): ProductTableRow[] => {
  return products.map((product) => ({
    productId: product.productId,
    productName: product.productName,
    category: product.category || 'Necategorizat',
    quantity: product.quantity || 0,
    revenue: product.revenue || 0,
    cogsTotal: product.cogsTotal || 0,
    profit: product.profit || 0,
    foodCostPercent: product.foodCostPercent || 0,
    marginPercent: product.marginPercent || 0,
  }));
};

// ============================================
// KPI BLOCKS COMPUTATION
// ============================================

export interface KpiBlock {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

/**
 * Calculează KPI blocks din daily summary
 */
export const computeKpiBlocks = (
  summary: DailyCogsSummary[]
): {
  totalRevenue: KpiBlock;
  totalCogs: KpiBlock;
  grossProfit: KpiBlock;
  avgFoodCostPercent: KpiBlock;
  avgMarginPercent: KpiBlock;
} => {
  const totalRevenue = summary.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalCogs = summary.reduce((sum, item) => sum + (item.cogsTotal || 0), 0);
  const grossProfit = totalRevenue - totalCogs;
  const avgFoodCostPercent =
    summary.length > 0
      ? summary.reduce((sum, item) => sum + (item.foodCostPercent || 0), 0) / summary.length
      : 0;
  const avgMarginPercent =
    summary.length > 0
      ? summary.reduce((sum, item) => sum + (item.marginPercent || 0), 0) / summary.length
      : 0;

  // Compară cu perioada anterioară (simplificat - ar putea fi îmbunătățit)
  const prevPeriodRevenue = summary.length > 7 ? summary.slice(0, -7).reduce((sum, item) => sum + (item.revenue || 0), 0) : 0;
  const revenueTrend = prevPeriodRevenue > 0 
    ? ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue * 100).toFixed(1)
    : '0';

  return {
    totalRevenue: {
      title: 'Total Revenue',
      value: `${totalRevenue.toFixed(2)} RON`,
      subtitle: `${summary.length} zile`,
      trend: {
        value: `${revenueTrend}%`,
        isPositive: parseFloat(revenueTrend) >= 0,
      },
      color: 'blue',
    },
    totalCogs: {
      title: 'Total COGS',
      value: `${totalCogs.toFixed(2)} RON`,
      subtitle: 'Costul mărfii vândute',
      color: 'orange',
    },
    grossProfit: {
      title: 'Gross Profit',
      value: `${grossProfit.toFixed(2)} RON`,
      subtitle: 'Profit brut',
      color: 'green',
    },
    avgFoodCostPercent: {
      title: 'Food Cost %',
      value: `${avgFoodCostPercent.toFixed(1)}%`,
      subtitle: 'Medie perioadă',
      color: avgFoodCostPercent > 35 ? 'red' : avgFoodCostPercent > 30 ? 'orange' : 'green',
    },
    avgMarginPercent: {
      title: 'Margin %',
      value: `${avgMarginPercent.toFixed(1)}%`,
      subtitle: 'Medie perioadă',
      color: avgMarginPercent < 50 ? 'orange' : 'green',
    },
  };
};

// ============================================
// ALERT COMPUTATION
// ============================================

export interface ProfitabilityAlert {
  type: 'high_food_cost' | 'low_margin' | 'spike_cogs' | 'category_alert';
  severity: 'warning' | 'danger';
  title: string;
  message: string;
  productId?: number;
  categoryCode?: string;
  day?: string;
}

/**
 * Generează alerts din datele de profitabilitate
 */
export const computeAlerts = (
  products: ProductProfitability[],
  categories: CategoryProfitability[],
  dailySummary: DailyCogsSummary[]
): ProfitabilityAlert[] => {
  const alerts: ProfitabilityAlert[] = [];

  // Alerts pentru produse cu food cost > 40%
  products
    .filter((p) => (p.foodCostPercent || 0) > 40)
    .slice(0, 5)
    .forEach((product) => {
      alerts.push({
        type: 'high_food_cost',
        severity: 'danger',
        title: 'Food Cost Ridicat',
        message: `${product.productName} are food cost ${product.foodCostPercent?.toFixed(1)}%`,
        productId: product.productId,
      });
    });

  // Alerts pentru produse cu marjă < 20%
  products
    .filter((p) => (p.marginPercent || 0) < 20 && (p.revenue || 0) > 0)
    .slice(0, 3)
    .forEach((product) => {
      alerts.push({
        type: 'low_margin',
        severity: 'warning',
        title: 'Marjă Scăzută',
        message: `${product.productName} are marjă ${product.marginPercent?.toFixed(1)}%`,
        productId: product.productId,
      });
    });

  // Alerts pentru categorii cu food cost ridicat
  categories
    .filter((c) => (c.foodCostPercent || 0) > 40)
    .forEach((category) => {
      alerts.push({
        type: 'category_alert',
        severity: 'warning',
        title: 'Categorie cu Food Cost Ridicat',
        message: `${category.categoryName} are food cost ${category.foodCostPercent?.toFixed(1)}%`,
        categoryCode: category.categoryCode,
      });
    });

  // Alerts pentru spike-uri COGS (zile cu food cost > 50%)
  dailySummary
    .filter((d) => (d.foodCostPercent || 0) > 50)
    .forEach((day) => {
      alerts.push({
        type: 'spike_cogs',
        severity: 'danger',
        title: 'Spike COGS',
        message: `Ziua ${day.day} are food cost ${day.foodCostPercent?.toFixed(1)}%`,
        day: day.day,
      });
    });

  return alerts;
};

