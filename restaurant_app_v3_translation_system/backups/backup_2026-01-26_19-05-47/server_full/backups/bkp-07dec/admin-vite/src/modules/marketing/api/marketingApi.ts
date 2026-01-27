import { httpClient } from '@/shared/api/httpClient';

export interface CustomerSegment {
  id: number;
  name: string;
  description: string;
  criteria: any;
  customer_count: number;
  last_calculated: string;
}

export interface SegmentCustomer {
  customer_token: string;
  order_count: number;
  last_order_date: string;
  first_order_date: string;
}

export interface MarketingCampaign {
  id?: number;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  statistics?: any;
}

export const marketingApi = {
  // Segmentare automată clienți
  async autoSegment(): Promise<{
    success: boolean;
    message: string;
    total_customers: number;
    segments: {
      vip_count: number;
      regular_count: number;
      new_count: number;
    };
    avg_orders: string;
  }> {
    const response = await httpClient.post('/api/marketing/auto-segment');
    return response.data;
  },

  // Listă segmente
  async getSegments(): Promise<CustomerSegment[]> {
    const response = await httpClient.get<CustomerSegment[]>('/api/marketing/segments');
    return response.data;
  },

  // Clienți dintr-un segment
  async getSegmentCustomers(segmentId: number): Promise<SegmentCustomer[]> {
    const response = await httpClient.get<SegmentCustomer[]>(`/api/marketing/segments/${segmentId}/customers`);
    return response.data;
  },

  // Listă campanii
  async getCampaigns(): Promise<MarketingCampaign[]> {
    const response = await httpClient.get<MarketingCampaign[]>('/api/marketing/campaigns');
    return response.data;
  },

  // Creare campanie
  async createCampaign(data: Omit<MarketingCampaign, 'id'>): Promise<{ id: number; message: string }> {
    const response = await httpClient.post('/api/marketing/campaigns', data);
    return response.data;
  },
};

