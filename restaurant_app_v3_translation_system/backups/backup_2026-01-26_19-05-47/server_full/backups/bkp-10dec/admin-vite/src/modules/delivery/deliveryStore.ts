/**
 * PHASE S10 - Delivery Store
 * 
 * Zustand store for Delivery interface.
 * Filters orders to show only delivery orders.
 */

import { create } from 'zustand';
import { useOrderStore } from '../../core/store/orderStore';
import type { CanonicalOrder } from '../../types/order';

interface DeliveryState {
  // Filtered orders (only delivery)
  getDeliveryOrders: () => CanonicalOrder[];
  
  // Filter by status
  getOrdersByStatus: (status: CanonicalOrder['status']) => CanonicalOrder[];
  
  // Stats
  getReadyCount: () => number;
  getDeliveredCount: () => number;
  getPaidCount: () => number;
  
  // Helpers
  getElapsedSeconds: (order: CanonicalOrder) => number;
}

export const useDeliveryStore = create<DeliveryState>((get) => ({
  getDeliveryOrders: () => {
    const allOrders = useOrderStore.getState().getOrders();
    
    // Filter only delivery orders
    return allOrders.filter((order) => order.type === 'delivery');
  },
  
  getOrdersByStatus: (status) => {
    return get().getDeliveryOrders().filter((o) => o.status === status);
  },
  
  getReadyCount: () => {
    return get().getOrdersByStatus('ready').length;
  },
  
  getDeliveredCount: () => {
    return get().getOrdersByStatus('delivered').length;
  },
  
  getPaidCount: () => {
    return get().getOrdersByStatus('paid').length;
  },
  
  getElapsedSeconds: (order) => {
    if (!order.timestamps?.created_at) return 0;
    const created = new Date(order.timestamps.created_at).getTime();
    return Math.floor((Date.now() - created) / 1000);
  },
}));

