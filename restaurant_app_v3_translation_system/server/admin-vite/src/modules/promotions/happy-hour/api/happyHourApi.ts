import { httpClient } from '@/shared/api/httpClient';

export interface HappyHour {
  id?: number;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: string; // JSON string sau array
  discount_percentage?: number;
  discount_fixed?: number;
  applicable_categories?: string; // JSON string sau array
  applicable_products?: string; // JSON string sau array
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HappyHourStats {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: string;
  discount_percentage: number;
  discount_fixed: number;
  usage_count: number;
  total_discount: number;
  total_revenue: number;
  avg_discount: number;
}

export const happyHourApi = {
  // Listă Happy Hour-uri
  async getAll(): Promise<HappyHour[]> {
    const response = await httpClient.get<HappyHour[]>('/api/admin/happy-hour');
    return response.data;
  },

  // Detalii Happy Hour
  async getById(id: number): Promise<HappyHour> {
    const response = await httpClient.get<HappyHour>(`/api/admin/happy-hour/${id}`);
    return response.data;
  },

  // Statistici Happy Hour
  async getStats(): Promise<HappyHourStats[]> {
    const response = await httpClient.get<HappyHourStats[]>('/api/admin/happy-hour/stats');
    return response.data;
  },

  // Happy Hour active
  async getActive(): Promise<HappyHour[]> {
    const response = await httpClient.get<HappyHour[]>('/api/happy-hour/active');
    return response.data;
  },

  // Creare Happy Hour
  async create(data: Omit<HappyHour, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: number; message: string }> {
    const response = await httpClient.post<{ id: number; message: string }>('/api/admin/happy-hour', data);
    return response.data;
  },

  // Actualizare Happy Hour
  async update(id: number, data: Partial<HappyHour>): Promise<{ message: string }> {
    const response = await httpClient.put<{ message: string }>(`/api/admin/happy-hour/${id}`, data);
    return response.data;
  },

  // Ștergere Happy Hour
  async delete(id: number): Promise<{ message: string }> {
    const response = await httpClient.delete<{ message: string }>(`/api/admin/happy-hour/${id}`);
    return response.data;
  },

  // Toggle status Happy Hour
  async toggleStatus(id: number): Promise<{ message: string; is_active: boolean }> {
    const response = await httpClient.put<{ message: string; is_active: boolean }>(`/api/admin/happy-hour/${id}/toggle`);
    return response.data;
  },
};

