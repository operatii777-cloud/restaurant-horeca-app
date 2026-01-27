import type { Ingredient } from '@/types/ingredients';

export interface IngredientStockItem extends Ingredient {
  stock_status?: 'ok' | 'low' | 'out' | 'critical' | string;
  percentage?: number;
  last_updated?: string | null;
}

export interface FinishedProductStock {
  product_id: number;
  product_name?: string;
  name?: string;
  category?: string;
  price?: number;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  is_auto_managed?: number | boolean;
  last_updated?: string | null;
  stock_status?: 'ok' | 'low' | 'out' | string;
}

export interface LowStockAlert {
  product_id?: number;
  ingredient_id?: number;
  name: string;
  category?: string;
  current_stock: number;
  min_stock: number;
  unit?: string;
  alert_level?: 'low' | 'critical' | 'out';
}

export interface StockSummary {
  totalIngredients: number;
  activeIngredients: number;
  hiddenIngredients: number;
  lowStockIngredients: number;
  finishedProductsWithStock: number;
  autoManagedProducts: number;
}
