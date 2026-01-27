import { httpClient } from '@/shared/api/httpClient';

export interface StockPrediction {
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  predicted_consumption: number;
  predicted_days_until_min: number;
  predicted_days_until_zero: number;
  recommendation: string;
  unit_cost: number;
  predicted_cost: number;
}

export const stockPredictionApi = {
  // Predicție stocuri
  async getPrediction(daysAhead: number = 14): Promise<StockPrediction[]> {
    const response = await httpClient.get<StockPrediction[]>('/api/reports/stock-prediction', {
      params: { days_ahead: daysAhead },
    });
    return response.data;
  },
};

