import { httpClient } from '@/shared/api/httpClient';

export interface WasteRecord {
  id?: number;
  waste_type: 'food' | 'beverage' | "Operațional";
  waste_reason: string;
  item_type: 'ingredient' | 'menu_product' | 'packaging';
  item_id?: number;
  item_name: string;
  quantity: number;
  unit_of_measure: string;
  unit_cost: number;
  total_cost: number;
  location_id?: number;
  description?: string;
  reported_by?: string;
  responsible_person?: string;
  waste_date: string;
  reported_at?: string;
  photo_url?: string;
}

export interface WasteDashboard {
  total_waste: number;
  by_type: Array<{
    waste_type: string;
    count: number;
    total: number;
  }>;
  top_products: Array<{
    item_name: string;
    total_quantity: number;
    total_cost: number;
    incidents: number;
  }>;
}

export interface WasteListParams {
  startDate?: string;
  endDate?: string;
  waste_type?: string;
  location_id?: number;
  limit?: number;
}

export const wasteApi = {
  async fetchWaste(params?: WasteListParams): Promise<WasteRecord[]> {
    const response = await httpClient.get<{ success: boolean; data: WasteRecord[] }>('/api/waste', { params });
    return response.data.data || [];
  },

  async fetchDashboard(period?: 'today' | 'week' | 'month'): Promise<WasteDashboard> {
    const response = await httpClient.get<{ success: boolean; data: WasteDashboard }>('/api/waste/dashboard', {
      params: period ? { period } : undefined,
    });
    return response.data.data || { total_waste: 0, by_type: [], top_products: [] };
  },

  async createWaste(waste: Omit<WasteRecord, 'id' | 'reported_at' | 'total_cost'>): Promise<WasteRecord> {
    const total_cost = waste.quantity * waste.unit_cost;
    const response = await httpClient.post<{ success: boolean; data: WasteRecord }>('/api/waste', {
      ...waste,
      total_cost,
    });
    return response.data.data;
  },

  async updateWaste(id: number, waste: Partial<WasteRecord>): Promise<WasteRecord> {
    const total_cost = waste.quantity && waste.unit_cost ? waste.quantity * waste.unit_cost : 0;
    const response = await httpClient.put<{ success: boolean; id: number }>(`/api/waste/${id}`, {
      ...waste,
      total_cost,
    });
    // Backend returnează doar { success: true, id }, deci trebuie să refetch
    const updated = await this.fetchWaste();
    const found = updated.find(w => w.id === id);
    if (!found) throw new Error('Waste record not found after update');
    return found;
  },

  async deleteWaste(id: number): Promise<void> {
    await httpClient.delete(`/api/waste/${id}`);
  },
};

