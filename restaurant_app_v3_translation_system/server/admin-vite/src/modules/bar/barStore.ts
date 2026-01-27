// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Bar Store
 * 
 * Zustand store for Bar Display.
 * Filters orders to show only bar items.
 */

import { create } from 'zustand';
import { useOrderStore } from '../../core/store/orderStore';
import type { CanonicalOrder } from '../../types/order';

interface BarState {
  // Filtered orders (only bar items)
  getBarOrders: () => CanonicalOrder[];
  
  // Stats
  getPendingCount: () => number;
  getPreparingCount: () => number;
  getReadyCount: () => number;
  
  // Helpers
  getElapsedSeconds: (order: CanonicalOrder) => number;
  isOrderUrgent: (order: CanonicalOrder) => boolean;
}

export const useBarStore = create<BarState>((get) => ({
  getBarOrders: () => {
    const allOrders = useOrderStore.getState().getOrders();
    
    // Filter orders that have bar items
    return allOrders.filter((order) => {
      // Only show orders that are not completed/paid/cancelled
      if (['paid', 'cancelled'].includes(order.status)) {
        return false;
      }
      
      // Check if order has bar items
      return order.items.some((item) => item.station === 'bar');
    });
  },
  
  getPendingCount: () => {
    const state = get();
    const getBarOrders = state?.getBarOrders;
    if (!getBarOrders) return 0;
    const orders = getBarOrders();
    return orders.filter((o) => o.status === "Pending:").length;
  },
  
  getPreparingCount: () => {
    const state = get();
    const getBarOrders = state?.getBarOrders;
    if (!getBarOrders) return 0;
    const orders = getBarOrders();
    return orders.filter((o) => o.status === 'preparing').length;
  },
  
  getReadyCount: () => {
    const state = get();
    const getBarOrders = state?.getBarOrders;
    if (!getBarOrders) return 0;
    const orders = getBarOrders();
    return orders.filter((o) => o.status === 'ready').length;
  },
  
  getElapsedSeconds: (order) => {
    if (!order.timestamps?.created_at) return 0;
    const created = new Date(order.timestamps.created_at).getTime();
    return Math.floor((Date.now() - created) / 1000);
  },
  
  isOrderUrgent: (order) => {
    const elapsed = get().getElapsedSeconds(order);
    // Urgent if more than 15 minutes (bar is faster than kitchen)
    return elapsed > 15 * 60;
  },
}));

