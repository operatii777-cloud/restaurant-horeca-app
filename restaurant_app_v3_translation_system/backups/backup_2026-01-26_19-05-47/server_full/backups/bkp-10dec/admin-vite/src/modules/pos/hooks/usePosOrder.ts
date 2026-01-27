/**
 * PHASE S12 - POS Order Hook
 * 
 * Hook for managing POS order operations.
 */

import { useState, useCallback } from 'react';
import { posApi } from '../api/posApi';
import { usePosStore } from '../store/posStore';
import type { CanonicalOrder } from '../../../types/order';
import type { CreateOrderPayload } from '../api/posApi';

export function usePosOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    currentMode,
    draftItems,
    selectedTableId,
    customer,
    resetDraft,
    getDraftTotal,
  } = usePosStore();

  const createOrder = useCallback(async (): Promise<CanonicalOrder | null> => {
    if (draftItems.length === 0) {
      setError('Nu există produse în comandă');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine order type based on mode
      let orderType: 'dine_in' | 'takeout' | 'delivery' | 'drive_thru' = 'dine_in';
      if (currentMode === 'FAST_SALE') orderType = 'takeout';
      else if (currentMode === 'DELIVERY') orderType = 'delivery';
      else if (currentMode === 'KIOSK') orderType = 'dine_in';

      const payload: CreateOrderPayload = {
        type: orderType,
        table: selectedTableId || undefined,
        customer: customer || undefined,
        items: draftItems.map((item) => ({
          product_id: item.productId,
          qty: item.qty,
          unit_price: item.unitPrice,
          notes: item.notes,
          options: item.options,
        })),
      };

      const order = await posApi.createOrder(payload);
      resetDraft();
      return order;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Eroare la crearea comenzii';
      setError(errorMessage);
      console.error('[usePosOrder] Error creating order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentMode, draftItems, selectedTableId, customer, resetDraft]);

  const updateOrder = useCallback(
    async (orderId: number, updates: Partial<CreateOrderPayload>): Promise<CanonicalOrder | null> => {
      setLoading(true);
      setError(null);

      try {
        const order = await posApi.updateOrder(orderId, updates);
        return order;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Eroare la actualizarea comenzii';
        setError(errorMessage);
        console.error('[usePosOrder] Error updating order:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadOrder = useCallback(async (orderId: number): Promise<CanonicalOrder | null> => {
    setLoading(true);
    setError(null);

    try {
      const order = await posApi.getOrder(orderId);
      return order;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Eroare la încărcarea comenzii';
      setError(errorMessage);
      console.error('[usePosOrder] Error loading order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder,
    updateOrder,
    loadOrder,
    loading,
    error,
    draftTotal: getDraftTotal(),
  };
}

