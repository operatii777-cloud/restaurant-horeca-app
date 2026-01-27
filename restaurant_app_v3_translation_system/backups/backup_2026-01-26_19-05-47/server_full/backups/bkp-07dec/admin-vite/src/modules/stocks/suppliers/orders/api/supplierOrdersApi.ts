import { httpClient } from '@/shared/api/httpClient';

export interface SupplierOrder {
  id?: number;
  supplier_id: number;
  supplier_name?: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  total_amount?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const supplierOrdersApi = {
  async fetchOrders(supplierId?: number, status?: string, limit?: number): Promise<SupplierOrder[]> {
    const response = await httpClient.get<{ success: boolean; data: SupplierOrder[] }>('/api/supplier-orders', {
      params: {
        supplier_id: supplierId,
        status,
        limit,
      },
    });
    return response.data.data || [];
  },

  async fetchOrder(id: number): Promise<SupplierOrder> {
    const response = await httpClient.get<{ success: boolean; data: SupplierOrder & { items?: any[] } }>(`/api/supplier-orders/${id}`);
    const { items, ...order } = response.data.data;
    return order;
  },

  async createOrder(order: Omit<SupplierOrder, 'id' | 'created_at' | 'updated_at'>): Promise<SupplierOrder> {
    const response = await httpClient.post<{ success: boolean; data: SupplierOrder }>('/api/supplier-orders', order);
    return response.data.data;
  },

  async updateOrder(id: number, order: Partial<SupplierOrder>): Promise<SupplierOrder> {
    const response = await httpClient.put<{ success: boolean; data: SupplierOrder }>(`/api/supplier-orders/${id}`, order);
    return response.data.data;
  },

  async deleteOrder(id: number): Promise<void> {
    await httpClient.delete(`/api/supplier-orders/${id}`);
  },
};

