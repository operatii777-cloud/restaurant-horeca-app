/**
 * PHASE S10 - Drive-Thru Events Hook
 * 
 * Hook to sync Drive-Thru with order events.
 * Filters orders to show only drive-thru orders.
 */

import { useEffect } from 'react';
import { subscribeOrderEvent, unsubscribeOrderEvent } from '../../../core/sockets/orderEvents';
import { useOrderStore } from '../../../core/store/orderStore';

/**
 * Hook to sync Drive-Thru with order events
 * Only processes drive-thru orders
 */
export function useDriveThruEvents() {
  const setOrder = useOrderStore((state) => state.setOrder);
  
  useEffect(() => {
    const handleOrderEvent = ({ order }: { order: any }) => {
      // Only process drive-thru orders
      if (order.type === 'drive_thru') {
        setOrder(order);
      }
    };
    
    const unsubscribeCreated = subscribeOrderEvent('order:created', handleOrderEvent);
    const unsubscribeUpdated = subscribeOrderEvent('order:updated', handleOrderEvent);
    const unsubscribeReady = subscribeOrderEvent('order:ready', handleOrderEvent);
    const unsubscribeDelivered = subscribeOrderEvent('order:delivered', handleOrderEvent);
    const unsubscribePaid = subscribeOrderEvent('order:paid', handleOrderEvent);
    const unsubscribeCancelled = subscribeOrderEvent('order:cancelled', handleOrderEvent);
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeReady();
      unsubscribeDelivered();
      unsubscribePaid();
      unsubscribeCancelled();
    };
  }, [setOrder]);
}

