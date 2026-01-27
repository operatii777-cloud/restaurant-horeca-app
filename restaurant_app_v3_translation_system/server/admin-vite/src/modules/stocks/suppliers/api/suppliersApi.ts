import { httpClient } from '@/shared/api/httpClient';

export interface Supplier {
  id?: number;
  company_name: string;
  name?: string; // Alias pentru company_name
  cui?: string;
  reg_com?: string;
  phone?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_city?: string;
  address_county?: string;
  address_postal_code?: string;
  address_country?: string;
  website?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  iban?: string;
  bank_name?: string;
  payment_terms?: number;
  categories?: string;
  is_active?: number | boolean;
  is_preferred?: number | boolean;
  rating_quality?: number;
  rating_delivery?: number;
  rating_price?: number;
  rating_service?: number;
  rating_avg?: number;
  total_reviews?: number;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierStats {
  total: number;
  active: number;
  categories: number;
  avg_rating: number;
}

export const suppliersApi = {
  async fetchSuppliers(activeOnly?: boolean, category?: string): Promise<Supplier[]> {
    const response = await httpClient.get<{ success: boolean; data: Supplier[] }>('/api/suppliers', {
      params: {
        activeOnly: activeOnly ? 'true' : undefined,
        active_only: activeOnly ? 'true' : undefined,
        category,
      },
    });
    return response.data.data || [];
  },

  async fetchSupplier(id: number): Promise<Supplier> {
    const response = await httpClient.get<{ success: boolean; data: Supplier }>(`/api/suppliers/${id}`);
    return response.data.data;
  },

  async fetchStats(): Promise<SupplierStats> {
    const response = await httpClient.get<{ success: boolean; data: SupplierStats }>('/api/suppliers/stats/summary');
    return response.data.data || { total: 0, active: 0, categories: 0, avg_rating: 0 };
  },

  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const response = await httpClient.post<{ success: boolean; data: Supplier }>('/api/suppliers', supplier);
    return response.data.data;
  },

  async updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    const response = await httpClient.put<{ success: boolean; data: Supplier }>(`/api/suppliers/${id}`, supplier);
    return response.data.data;
  },

  async deleteSupplier(id: number): Promise<void> {
    await httpClient.delete(`/api/suppliers/${id}`);
  },
};

