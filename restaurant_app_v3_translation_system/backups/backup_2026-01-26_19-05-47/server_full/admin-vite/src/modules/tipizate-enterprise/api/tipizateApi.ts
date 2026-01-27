/**
 * PHASE S4.2 - Tipizate Enterprise API Client
 * Unified API client for all tipizate documents
 */

import { httpClient } from '@/shared/api/httpClient';
import { TipizatType, NirDocument, BonConsumDocument, TransferDocument, InventarDocument } from './types';

export const tipizateApi = {
  /**
   * List documents by type
   */
  list<T>(
    type: TipizatType,
    params?: Record<string, any>
  ) {
    return httpClient.get<T[]>(`/api/tipizate/${typeToPath(type)}`, { params });
  },

  /**
   * Get document by ID
   */
  get<T>(type: TipizatType, id: number) {
    return httpClient.get<T>(`/api/tipizate/${typeToPath(type)}/${id}`);
  },

  /**
   * Create new document
   */
  create<T>(type: TipizatType, payload: T) {
    return httpClient.post(`/api/tipizate/${typeToPath(type)}`, payload);
  },

  /**
   * Update document
   */
  update<T>(type: TipizatType, id: number, payload: Partial<T>) {
    return httpClient.put(`/api/tipizate/${typeToPath(type)}/${id}`, payload);
  },

  /**
   * Sign document
   */
  sign(type: TipizatType, id: number) {
    return httpClient.post(`/api/tipizate/${typeToPath(type)}/${id}/sign`, {});
  },

  /**
   * Lock document
   */
  lock(type: TipizatType, id: number) {
    return httpClient.post(`/api/tipizate/${typeToPath(type)}/${id}/lock`, {});
  },

  /**
   * Get PDF
   * PHASE S5.6 - Extended with print options
   */
  async pdf(
    id: number,
    type: TipizatType,
    options?: {
      format?: 'A4' | 'A5';
      printerFriendly?: boolean;
      monochrome?: boolean;
    }
  ): Promise<Blob> {
    const path = typeToPath(type);
    const params = new URLSearchParams();
    if (options?.format) params.append('format', options.format);
    if (options?.printerFriendly) params.append('printerFriendly', 'true');
    if (options?.monochrome) params.append('monochrome', 'true');
    
    const queryString = params.toString();
    const url = `/api/tipizate/${path}/${id}/pdf${queryString ? `?${queryString}` : ''}`;
    const response = await httpClient.get(url, {
      responseType: 'blob',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },
};

/**
 * Convert TipizatType to API path
 */
function typeToPath(type: TipizatType): string {
  switch (type) {
    case 'NIR':
      return 'nir';
    case 'BON_CONSUM':
      return 'bon-consum';
    case 'TRANSFER':
      return 'transfer';
    case 'INVENTAR':
      return 'inventar';
    case 'FACTURA':
      return "Factură";
    case 'CHITANTA':
      return "Chitanță";
    case 'REGISTRU_CASA':
      return 'registru-casa';
    case 'RAPORT_GESTIUNE':
      return 'raport-gestiune';
    case 'AVIZ':
      return 'aviz';
    case 'PROCES_VERBAL':
      return 'proces-verbal';
    case 'RETUR':
      return 'retur';
    case 'RAPORT_Z':
      return 'raport-z';
    case 'RAPORT_X':
      return 'raport-x';
    case 'RAPORT_LUNAR':
      return 'raport-lunar';
    default:
      return type.toLowerCase().replace('_', '-');
  }
}

