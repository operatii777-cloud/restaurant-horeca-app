// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 3.C - Sync Engine for Offline POS
 * 
 * Handles syncing of offline orders and payments to server
 * Conflict resolution
 */

import { getUnsyncedOrders, markOrderSynced, getPendingSyncItems, markSyncItemSynced } from '../db/indexeddb';
import { httpClient } from '@/shared/api/httpClient';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Sync all pending items
 */
export async function syncAll(): Promise<SyncResult> {
  if (!isOnline()) {
    return { success: false, synced: 0, failed: 0, conflicts: 0 };
  }

  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    conflicts: 0,
  };

  try {
    // Sync orders
    const unsyncedOrders = await getUnsyncedOrders();
    
    for (const order of unsyncedOrders) {
      try {
        const response = await httpClient.post('/api/orders', {
          type: order.type,
          items: JSON.parse(order.items),
          table_number: order.table_number,
          total: order.total,
        });

        if (response.data && response.data.id) {
          await markOrderSynced(order.localId!, response.data.id);
          result.synced++;
        } else {
          result.failed++;
        }
      } catch (error: any) {
        // Check for conflicts (e.g., table already occupied)
        if (error.response?.status === 409) {
          result.conflicts++;
        } else {
          result.failed++;
        }
      }
    }

    // Sync queue items
    const pendingItems = await getPendingSyncItems();
    
    for (const item of pendingItems) {
      try {
        const data = JSON.parse(item.data);
        
        let response;
        if (item.action === 'create') {
          response = await httpClient.post(`/api/${item.type}s`, data);
        } else if (item.action === 'update') {
          response = await httpClient.put(`/api/${item.type}s/${item.entityId}`, data);
        } else {
          response = await httpClient.delete(`/api/${item.type}s/${item.entityId}`);
        }

        if (response.data) {
          await markSyncItemSynced(item.id!);
          result.synced++;
        } else {
          result.failed++;
        }
      } catch (error: any) {
        if (error.response?.status === 409) {
          result.conflicts++;
        } else {
          result.failed++;
        }
      }
    }
  } catch (error) {
    console.error('Sync error:', error);
    result.success = false;
  }

  return result;
}

/**
 * Auto-sync when online
 */
export function startAutoSync(intervalMs: number = 30000) {
  if (!isOnline()) {
    return;
  }

  const interval = setInterval(async () => {
    if (isOnline()) {
      await syncAll();
    } else {
      clearInterval(interval);
    }
  }, intervalMs);

  // Also sync on online event
  window.addEventListener('online', async () => {
    await syncAll();
  });

  return interval;
}

