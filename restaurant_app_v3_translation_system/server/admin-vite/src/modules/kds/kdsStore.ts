// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - KDS Store
 * 
 * Zustand store for KDS (Kitchen Display System).
 * Filters orders to show only kitchen items.
 */

import { create } from 'zustand';
import { useOrderStore } from '../../core/store/orderStore';
import type { CanonicalOrder } from '../../types/order';

interface KdsState {
  // Filtered orders (only kitchen items)
  getKitchenOrders: () => CanonicalOrder[];

  // Stats
  getPendingCount: () => number;
  getPreparingCount: () => number;
  getReadyCount: () => number;

  // Helpers
  getElapsedSeconds: (order: CanonicalOrder) => number;
  isOrderUrgent: (order: CanonicalOrder) => boolean;
}

export const useKdsStore = create<KdsState>((_set, get) => ({
  getKitchenOrders: () => {
    const allOrders = useOrderStore.getState().getOrders();

    // DIRECT MAPPING: Rely on server-side filtering and just check for kitchen items
    // This matches legacy KDS behavior exactly
    return allOrders.filter((order) => {
      // Check if order has kitchen items
      return order.items.some((item) => item.station === 'kitchen');
    });
  },

  getPendingCount: () => {
    const orders = get().getKitchenOrders();
    return orders.filter((o) => o.status === "Pending:").length;
  },

  getPreparingCount: () => {
    const orders = get().getKitchenOrders();
    return orders.filter((o) => o.status === 'preparing').length;
  },

  getReadyCount: () => {
    const orders = get().getKitchenOrders();
    return orders.filter((o) => o.status === 'ready').length;
  },

  getElapsedSeconds: (order) => {
    if (!order.timestamps?.created_at) return 0;
    const created = new Date(order.timestamps.created_at).getTime();
    return Math.floor((Date.now() - created) / 1000);
  },

  isOrderUrgent: (order) => {
    const elapsed = get().getElapsedSeconds(order);
    // Urgent if more than 20 minutes
    return elapsed > 20 * 60;
  },
}));

