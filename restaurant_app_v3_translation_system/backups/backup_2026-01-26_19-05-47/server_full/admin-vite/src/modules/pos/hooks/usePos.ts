// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2.D - POS Hook
 * 
 * Main hook for POS operations, exposing payment sheet controls and order management
 */

import { useCallback, useState } from 'react';
import { usePosStore } from '../store/posStore';
import { posApi } from '../api/posApi';

export function usePos() {
  const {
    currentOrderId,
    draftItems,
    payments,
    order,
    splitBill,
    areAllGroupsPaid,
    isFiscalized,
    isStockConsumed,
    fiscalReceiptNumber,
    fiscalReceiptDate,
    getTotal,
    getTotalPaid,
    getRemaining,
    getSubtotal,
    getTax,
    getDraftTotal,
    getDraftItemCount,
    loadOrderFromServer,
    resetDraft,
    setFiscalData,
    markFiscalized,
    markStockConsumed,
  } = usePosStore();
  
  const [fiscalizing, setFiscalizing] = useState(false);
  const [consumingStock, setConsumingStock] = useState(false);

  const getOrder = useCallback(() => {
    if (!currentOrderId) return null;
    return order || {
      id: currentOrderId,
      items: draftItems,
      payments,
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getTotal(),
    };
  }, [currentOrderId, order, draftItems, payments, getSubtotal, getTax, getTotal]);

  const getRemainingToPay = useCallback(() => {
    return getRemaining();
  }, [getRemaining]);

  const openPaymentSheet = useCallback(() => {
    // Payment sheet is controlled by parent component (PosPage)
    // This hook just provides the state
    return true;
  }, []);

  const closePaymentSheet = useCallback(() => {
    // Payment sheet is controlled by parent component (PosPage)
    return true;
  }, []);

  const handlePaymentCompleted = useCallback(async (orderAfterPayment?: any) => {
    // Reload order from server to get latest state
    if (currentOrderId) {
      try {
        await loadOrderFromServer(currentOrderId);
      } catch (error) {
        console.error('usePos Error reloading order after payment:', error);
      }
    }
    return orderAfterPayment;
  }, [currentOrderId, loadOrderFromServer]);

  const isReadyForFiscalization = useCallback(() => {
    if (isFiscalized) return false; // Already fiscalized
    if (splitBill) {
      return areAllGroupsPaid();
    }
    return getRemainingToPay() <= 0.01;
  }, [isFiscalized, splitBill, areAllGroupsPaid, getRemainingToPay]);
  
  const hasAllGroupsPaid = useCallback(() => {
    if (!splitBill) return false;
    return areAllGroupsPaid();
  }, [splitBill, areAllGroupsPaid]);
  
  const fiscalize = useCallback(async (orderId: number) => {
    if (fiscalizing || isFiscalized) {
      throw new Error('Comanda este deja fiscalizată sau se procesează');
    }
    
    setFiscalizing(true);
    try {
      // Step 1: Fiscalize order
      const fiscalResult = await posApi.fiscalizeOrder(orderId);
      
      if (!fiscalResult.success) {
        throw new Error(fiscalResult.error || 'Eroare la fiscalizare');
      }
      
      // Step 2: Store fiscal data
      setFiscalData({
        fiscalReceiptNumber: fiscalResult.fiscalReceiptNumber,
        fiscalReceiptDate: fiscalResult.fiscalReceiptDate,
      });
      markFiscalized();
      
      // Step 3: Consume stock
      setConsumingStock(true);
      try {
        await posApi.consumeStock(orderId);
        markStockConsumed();
      } catch (stockError: any) {
        console.error('usePos Stock consumption error:', stockError);
        // Don't fail fiscalization if stock consumption fails
        // But log it for manual intervention
      } finally {
        setConsumingStock(false);
      }
      
      return fiscalResult;
    } catch (error: any) {
      console.error('usePos Fiscalization error:', error);
      throw error;
    } finally {
      setFiscalizing(false);
    }
  }, [fiscalizing, isFiscalized, setFiscalData, markFiscalized, markStockConsumed]);
  
  return {
    // Order state
    order: getOrder(),
    currentOrderId,
    draftItems,
    payments,
    splitBill,
    
    // Computed values
    orderTotal: getTotal(),
    subtotal: getSubtotal(),
    tax: getTax(),
    totalPaid: getTotalPaid(),
    remainingToPay: getRemainingToPay(),
    draftTotal: getDraftTotal(),
    draftItemCount: getDraftItemCount(),
    
    // Fiscalization state
    isFiscalized,
    isStockConsumed,
    fiscalReceiptNumber,
    fiscalReceiptDate,
    fiscalizing,
    consumingStock,
    
    // Actions
    openPaymentSheet,
    closePaymentSheet,
    handlePaymentCompleted,
    loadOrder: loadOrderFromServer,
    resetDraft,
    fiscalize,
    
    // Helpers
    isOrderFullyPaid: getRemainingToPay() <= 0.01,
    hasItems: draftItems.length > 0,
    isReadyForFiscalization: isReadyForFiscalization(),
    hasAllGroupsPaid: hasAllGroupsPaid(),
  };
}



