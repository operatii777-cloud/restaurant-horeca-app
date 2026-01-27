// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Delivery Events Hook
 * 
 * Hook to sync Delivery with order events.
 * Filters orders to show only delivery orders.
 */

import { useEffect } from 'react';
import { subscribeOrderEvent, unsubscribeOrderEvent } from '@/core/sockets/orderEvents';
import { useOrderStore } from '@/core/store/orderStore';

/**
 * Hook to sync Delivery with order events
 * Only processes delivery orders
 */
export function useDeliveryEvents() {
  const setOrder = useOrderStore((state) => state.setOrder);
  
  useEffect(() => {
    const handleOrderEvent = ({ order }: { order: any }) => {
      // Only process delivery orders
      if (order.type === "Delivery") {
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


