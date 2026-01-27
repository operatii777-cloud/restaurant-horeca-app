/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXTERNAL DELIVERY API CLIENT
 * 
 * API client pentru gestionare sincronizare platforme externe (Glovo, Wolt, etc.)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { httpClient } from '@/shared/api/httpClient';

export interface ExternalDeliveryConnector {
  id: number;
  provider: 'GLOVO' | 'WOLT' | 'BOLT_FOOD' | 'TAZZ' | 'UBER_EATS';
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  is_enabled: boolean;
  last_sync_at?: string;
  last_sync_status?: 'success' | 'failed' | "Pending:";
  last_sync_error?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  error?: string;
}

export const externalDeliveryApi = {
  /**
   * GET /api/external-delivery/connectors
   * Obține lista conectărilor platforme externe
   */
  getConnectors: () => {
    return httpClient.get<{ success: boolean; connectors: ExternalDeliveryConnector[] }>(
      '/api/external-delivery/connectors'
    );
  },

  /**
   * POST /api/external-delivery/connectors
   * Creează o nouă conectare
   */
  createConnector: (data: Partial<ExternalDeliveryConnector>) => {
    return httpClient.post<{ success: boolean; connector: ExternalDeliveryConnector }>(
      '/api/external-delivery/connectors',
      data
    );
  },

  /**
   * PUT /api/external-delivery/connectors/:id
   * Actualizează o conectare
   */
  updateConnector: (id: number, data: Partial<ExternalDeliveryConnector>) => {
    return httpClient.put<{ success: boolean; connector: ExternalDeliveryConnector }>(
      `/api/external-delivery/connectors/"Id"`,
      data
    );
  },

  /**
   * POST /api/external-delivery/sync/:platform/menu
   * Sincronizează meniul cu o platformă specifică
   */
  syncMenu: (platform: string) => {
    return httpClient.post<{ success: boolean; result: SyncResult }>(
      `/api/external-delivery/sync/"Platform"/menu`
    );
  },

  /**
   * POST /api/external-delivery/sync/all
   * Sincronizează meniul cu toate platformele
   */
  syncAllPlatforms: () => {
    return httpClient.post<{ success: boolean; results: Record<string, SyncResult> }>(
      '/api/external-delivery/sync/all'
    );
  },
};
