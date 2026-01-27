/**
 * PHASE S10 - Order Events Hook
 * 
 * React hook for subscribing to order events.
 * Automatically syncs with orderStore.
 */

import { useEffect } from 'react';
import { subscribeOrderEvent, unsubscribeOrderEvent } from '../sockets/orderEvents';
import { useOrderStore } from '../store/orderStore';
import type { OrderEventType } from '../../types/order';

/**
 * Hook to sync order events with orderStore
 */
export function useOrderEvents() {
  const setOrder = useOrderStore((state) => state.setOrder);
  const removeOrder = useOrderStore((state) => state.removeOrder);
  
  useEffect(() => {
    // Subscribe to all order events
    const unsubscribeCreated = subscribeOrderEvent('order:created', ({ order }) => {
      setOrder(order);
    });
    
    const unsubscribeUpdated = subscribeOrderEvent('order:updated', ({ order }) => {
      setOrder(order);
    });
    
    const unsubscribeReady = subscribeOrderEvent('order:ready', ({ order }) => {
      setOrder(order);
    });
    
    const unsubscribeDelivered = subscribeOrderEvent('order:delivered', ({ order }) => {
      setOrder(order);
    });
    
    const unsubscribePaid = subscribeOrderEvent('order:paid', ({ order }) => {
      setOrder(order);
    });
    
    const unsubscribeCancelled = subscribeOrderEvent('order:cancelled', ({ order }) => {
      // Remove cancelled orders from active view (or keep them, depending on UI needs)
      // For now, we update them so they show as cancelled
      setOrder(order);
    });
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeReady();
      unsubscribeDelivered();
      unsubscribePaid();
      unsubscribeCancelled();
    };
  }, [setOrder, removeOrder]);
}

/**
 * Hook to subscribe to specific order events
 */
export function useOrderEvent(
  eventType: OrderEventType,
  handler: (payload: { order: any }) => void
) {
  useEffect(() => {
    const unsubscribe = subscribeOrderEvent(eventType, handler);
    return unsubscribe;
  }, [eventType, handler]);
}

