import { httpClient } from '@/shared/api/httpClient';

export interface SupplierOrderItem {
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  ingredient_id?: number | null;
  notes?: string;
}

export interface SupplierOrder {
  id?: number;
  supplier_id: number;
  supplier_name?: string;
  order_number?: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  total_amount?: number;
  notes?: string;
  items?: SupplierOrderItem[];
  items_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const supplierOrdersApi = {
  async fetchOrders(supplierId?: number, status?: string, limit?: number): Promise<SupplierOrder[]> {
    const response = await httpClient.get<{ success: boolean; data: SupplierOrder[] } | SupplierOrder[]>('/api/supplier-orders', {
      params: {
        supplier_id: supplierId,
        status,
        limit,
      },
    });
    const body = response.data as any;
    if (Array.isArray(body)) return body;
    return body?.data || [];
  },

  async fetchOrder(id: number): Promise<SupplierOrder> {
    const response = await httpClient.get<{ success: boolean; data: SupplierOrder & { items?: any[] } }>(`/api/supplier-orders/${id}`);
    return response.data.data;
  },

  async createOrder(order: Omit<SupplierOrder, 'id' | 'created_at' | 'updated_at'> & { items: SupplierOrderItem[] }): Promise<SupplierOrder> {
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
