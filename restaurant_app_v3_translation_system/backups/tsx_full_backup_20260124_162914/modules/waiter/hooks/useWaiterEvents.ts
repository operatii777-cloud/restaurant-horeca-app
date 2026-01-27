// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Waiter Events Hook
 * 
 * Hook to sync Waiter with order events.
 * Filters orders to show only unpaid dine_in orders.
 */

import { useEffect } from 'react';
import { subscribeOrderEvent, unsubscribeOrderEvent } from '@/core/sockets/orderEvents';
import { useOrderStore } from '@/core/store/orderStore';

/**
 * Hook to sync Waiter with order events
 * Only processes unpaid dine_in orders
 */
export function useWaiterEvents() {
  const setOrder = useOrderStore((state) => state.setOrder);
  
  useEffect(() => {
    const handleOrderEvent = ({ order }: { order: any }) => {
      // Only process dine_in orders
      if (order.type === 'dine_in') {
        setOrder(order);
      }
    };
    
    const unsubscribeCreated = subscribeOrderEvent('order:created', handleOrderEvent);
    const unsubscribeUpdated = subscribeOrderEvent('order:updated', handleOrderEvent);
    const unsubscribePaid = subscribeOrderEvent('order:paid', handleOrderEvent);
    const unsubscribeCancelled = subscribeOrderEvent('order:cancelled', handleOrderEvent);
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribePaid();
      unsubscribeCancelled();
    };
  }, [setOrder]);
}


