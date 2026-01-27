import { httpClient } from '@/shared/api/httpClient';

export interface LabelProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  barcode?: string;
}

export interface LabelData {
  product_id?: number;
  product_name: string;
  price: number;
  barcode?: string;
  additional_info?: string;
}

export interface GenerateLabelResponse {
  product_id?: number;
  product_name: string;
  price: number;
  barcode?: string;
  additional_info?: string;
  generated_at: string;
}

export interface PrintBatchResponse {
  product: LabelProduct;
  count: number;
  message: string;
}

export const labelsApi = {
  async fetchProducts(): Promise<LabelProduct[]> {
    const response = await httpClient.get<LabelProduct[]>('/api/labels/products');
    return response.data;
  },

  async generateLabel(data: LabelData): Promise<GenerateLabelResponse> {
    const response = await httpClient.post<GenerateLabelResponse>('/api/labels/generate', data);
    return response.data;
  },

  async printBatch(productId: number, count: number): Promise<PrintBatchResponse> {
    const response = await httpClient.post<PrintBatchResponse>('/api/labels/print-batch', {
      product_id: productId,
      count,
    });
    return response.data;
  },
};

