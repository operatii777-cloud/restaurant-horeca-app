/**
 * PHASE S10 - Global Order Store
 * 
 * Zustand store for managing orders across all React modules.
 * Provides centralized cache for active orders.
 */

import { create } from 'zustand';
import type { CanonicalOrder } from '../../types/order';

interface OrderStore {
  // Orders cache
  orders: Map<string | number, CanonicalOrder>;
  
  // Actions
  setOrder: (order: CanonicalOrder) => void;
  setOrders: (orders: CanonicalOrder[]) => void;
  removeOrder: (orderId: string | number) => void;
  getOrder: (orderId: string | number) => CanonicalOrder | undefined;
  getOrders: () => CanonicalOrder[];
  getOrdersByStatus: (status: CanonicalOrder['status']) => CanonicalOrder[];
  getOrdersByType: (type: CanonicalOrder['type']) => CanonicalOrder[];
  clearOrders: () => void;
  
  // Stats
  getOrderCount: () => number;
  getOrderCountByStatus: (status: CanonicalOrder['status']) => number;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: new Map(),
  
  setOrder: (order) => {
    set((state) => {
      const newOrders = new Map(state.orders);
      newOrders.set(order.id, order);
      return { orders: newOrders };
    });
  },
  
  setOrders: (orders) => {
    set(() => {
      const newOrders = new Map<string | number, CanonicalOrder>();
      orders.forEach((order) => {
        newOrders.set(order.id, order);
      });
      return { orders: newOrders };
    });
  },
  
  removeOrder: (orderId) => {
    set((state) => {
      const newOrders = new Map(state.orders);
      newOrders.delete(orderId);
      return { orders: newOrders };
    });
  },
  
  getOrder: (orderId) => {
    return get().orders.get(orderId);
  },
  
  getOrders: () => {
    return Array.from(get().orders.values());
  },
  
  getOrdersByStatus: (status) => {
    return Array.from(get().orders.values()).filter(
      (order) => order.status === status
    );
  },
  
  getOrdersByType: (type) => {
    return Array.from(get().orders.values()).filter(
      (order) => order.type === type
    );
  },
  
  clearOrders: () => {
    set({ orders: new Map() });
  },
  
  getOrderCount: () => {
    return get().orders.size;
  },
  
  getOrderCountByStatus: (status) => {
    return get().getOrdersByStatus(status).length;
  },
}));

