import { httpClient } from '@/shared/api/httpClient';

export interface AllergenProduct {
  id: number;
  name: string;
  category: string;
  ingredient_count: number;
  current_allergens: string | null;
  calculated_allergens: string | null;
  has_difference: boolean;
}

export interface AllergensResponse {
  products: AllergenProduct[];
}

export interface RecalculateResponse {
  message: string;
  success_count: number;
  total_products: number;
}

export const allergensApi = {
  async fetchProducts(): Promise<AllergenProduct[]> {
    const response = await httpClient.get<AllergensResponse>('/api/allergens/products');
    return response.data.products || [];
  },

  async recalculateProduct(productId: number): Promise<void> {
    await httpClient.post(`/api/allergens/recalculate/${productId}`);
  },

  async recalculateAll(): Promise<RecalculateResponse> {
    const response = await httpClient.post<RecalculateResponse>('/api/allergens/recalculate-all');
    return response.data;
  },

  async updateProductAllergens(productId: number, allergens: string, allergensEn: string): Promise<void> {
    await httpClient.put(`/api/menu/${productId}`, {
      allergens,
      allergens_en: allergensEn,
    });
  },
};

