/**
 * PHASE S10 - Waiter Store
 * 
 * Zustand store for Waiter/Supervisor interface.
 * Filters orders to show unpaid orders for tables.
 */

import { create } from 'zustand';
import { useOrderStore } from '../../core/store/orderStore';
import type { CanonicalOrder } from '../../types/order';

interface WaiterState {
  // Filtered orders (unpaid, dine_in)
  getUnpaidOrders: () => CanonicalOrder[];
  
  // Filter by table
  getOrdersByTable: (tableNumber: string | number) => CanonicalOrder[];
  
  // Filter by waiter
  getOrdersByWaiter: (waiterId: number) => CanonicalOrder[];
  
  // Stats
  getUnpaidCount: () => number;
  getTotalUnpaid: () => number;
  
  // Helpers
  getElapsedSeconds: (order: CanonicalOrder) => number;
}

export const useWaiterStore = create<WaiterState>((get) => ({
  getUnpaidOrders: () => {
    const allOrders = useOrderStore.getState().getOrders();
    
    // Filter unpaid dine_in orders
    return allOrders.filter((order) => 
      order.type === 'dine_in' && !order.is_paid
    );
  },
  
  getOrdersByTable: (tableNumber) => {
    return get().getUnpaidOrders().filter(
      (order) => String(order.table) === String(tableNumber)
    );
  },
  
  getOrdersByWaiter: (waiterId) => {
    return get().getUnpaidOrders().filter(
      (order) => order.waiter_id === waiterId
    );
  },
  
  getUnpaidCount: () => {
    return get().getUnpaidOrders().length;
  },
  
  getTotalUnpaid: () => {
    return get().getUnpaidOrders().reduce(
      (sum, order) => sum + order.totals.total,
      0
    );
  },
  
  getElapsedSeconds: (order) => {
    if (!order.timestamps?.created_at) return 0;
    const created = new Date(order.timestamps.created_at).getTime();
    return Math.floor((Date.now() - created) / 1000);
  },
}));

