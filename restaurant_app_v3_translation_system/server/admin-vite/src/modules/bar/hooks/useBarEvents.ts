// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Bar Events Hook
 * 
 * Hook to sync Bar with order events.
 * Filters orders to show only bar items.
 */

import { useEffect } from 'react';
import axios from 'axios';
import { subscribeOrderEvent } from '@/core/sockets/orderEvents';
import { useOrderStore } from '@/core/store/orderStore';
import { mapRawOrderToCanonical } from '@/core/utils/orderMapper';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook to sync Bar with order events
 * Only processes orders that have bar items
 */
export function useBarEvents() {
  const setOrder = useOrderStore((state) => state.setOrder);
  const setOrders = useOrderStore((state) => state.setOrders);

  // Initial fetch of unfinished bar orders
  useEffect(() => {
    const fetchInitialOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE}/orders-display/bar`);
        if (response.data && Array.isArray(response.data.orders)) {
          const canonicalOrders = response.data.orders.map(mapRawOrderToCanonical);
          setOrders(canonicalOrders);
          console.log(`✅ [Bar] Loaded ${canonicalOrders.length} initial orders`);
        }
      } catch (error) {
        console.error('❌ [Bar] Error fetching initial orders:', error);
      }
    };

    fetchInitialOrders();
  }, [setOrders]);

  useEffect(() => {
    const handleOrderEvent = ({ order }: { order: any }) => {
      // If the order is already canonical (from WebSocket payload S10), use it directly
      // Otherwise map it (if legacy event)
      const canonicalOrder = order.id ? mapRawOrderToCanonical(order) : order;

      // Only process orders that have bar items
      const hasBarItems = canonicalOrder.items?.some(
        (item: any) => item.station === 'bar'
      );

      if (hasBarItems) {
        setOrder(canonicalOrder);
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


