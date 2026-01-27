// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Bar Events Hook
 * 
 * Hook to sync Bar with order events.
 * Filters orders to show only bar items.
 */

import { useEffect } from 'react';
import { subscribeOrderEvent, unsubscribeOrderEvent } from '@/core/sockets/orderEvents';
import { useOrderStore } from '@/core/store/orderStore';

/**
 * Hook to sync Bar with order events
 * Only processes orders that have bar items
 */
export function useBarEvents() {
  const setOrder = useOrderStore((state) => state.setOrder);
  
  useEffect(() => {
    const handleOrderEvent = ({ order }: { order: any }) => {
      // Only process orders that have bar items
      const hasBarItems = order.items?.some(
        (item: any) => item.station === 'bar'
      );
      
      if (hasBarItems) {
        setOrder(order);
      }
    };
    
    const unsubscribeCreated = subscribeOrderEvent('order:created', handleOrderEvent);
    const unsubscribeUpdated = subscribeOrderEvent('order:updated', handleOrderEvent);
    const unsubscribeItemReady = subscribeOrderEvent('order:item_ready', handleOrderEvent);
    const unsubscribeReady = subscribeOrderEvent('order:ready', handleOrderEvent);
    const unsubscribeCancelled = subscribeOrderEvent('order:cancelled', handleOrderEvent);
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeItemReady();
      unsubscribeReady();
      unsubscribeCancelled();
    };
  }, [setOrder]);
}


