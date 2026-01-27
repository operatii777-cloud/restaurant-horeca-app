// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Drive-Thru Store
 * 
 * Zustand store for Drive-Thru interface.
 * Filters orders to show only drive-thru orders.
 */

import { create } from 'zustand';
import { useOrderStore } from '../../core/store/orderStore';
import type { CanonicalOrder } from '../../types/order';

interface DriveThruState {
  // Filtered orders (only drive-thru)
  getDriveThruOrders: () => CanonicalOrder[];
  
  // Filter by lane
  getOrdersByLane: (laneNumber: string | number) => CanonicalOrder[];
  
  // Filter by status
  getOrdersByStatus: (status: CanonicalOrder['status']) => CanonicalOrder[];
  
  // Stats
  getPendingCount: () => number;
  getReadyCount: () => number;
  getServedCount: () => number;
  
  // Helpers
  getElapsedSeconds: (order: CanonicalOrder) => number;
}

export const useDriveThruStore = create<DriveThruState>((get) => ({
  getDriveThruOrders: () => {
    const allOrders = useOrderStore.getState().getOrders();
    
    // Filter only drive-thru orders
    return allOrders.filter((order) => order.type === 'drive_thru');
  },
  
  getOrdersByLane: (laneNumber) => {
    return get().getDriveThruOrders().filter(
      (order) => order.drive_thru?.lane_number === String(laneNumber)
    );
  },
  
  getOrdersByStatus: (status) => {
    return get().getDriveThruOrders().filter((o) => o.status === status);
  },
  
  getPendingCount: () => {
    return get().getOrdersByStatus("Pending:").length;
  },
  
  getReadyCount: () => {
    return get().getOrdersByStatus('ready_for_pickup').length;
  },
  
  getServedCount: () => {
    return get().getOrdersByStatus('served').length;
  },
  
  getElapsedSeconds: (order) => {
    if (!order.timestamps?.created_at) return 0;
    const created = new Date(order.timestamps.created_at).getTime();
    return Math.floor((Date.now() - created) / 1000);
  },
}));

