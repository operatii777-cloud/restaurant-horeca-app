/**
 * FAZA 2 - Delivery Cart Hook
 * Manages cart state and operations for delivery orders
 */

import { useState, useCallback, useMemo } from 'react';
import { DeliveryCartItem, DeliveryCartState, DeliveryProduct, ProductCustomization } from '../delivery.types';

const DELIVERY_FEE = 0; // Can be made configurable later

export function useDeliveryCart() {
  const [items, setItems] = useState<DeliveryCartItem[]>([]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.isFree) return sum;
      const itemPrice = item.price + item.customizations.reduce((cSum, c) => cSum + c.extra_price, 0);
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [items]);

  const deliveryFee = DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  // Add item to cart
  const addItem = useCallback((product: DeliveryProduct, quantity: number = 1, customizations: ProductCustomization[] = []) => {
    setItems(prev => {
      // Check if item with same productId and customizations already exists
      const existingIndex = prev.findIndex(item => {
        if (item.productId !== product.id) return false;
        if (item.customizations.length !== customizations.length) return false;
        const existingCustomIds = item.customizations.map(c => c.id).sort().join(',');
        const newCustomIds = customizations.map(c => c.id).sort().join(',');
        return existingCustomIds === newCustomIds;
      });

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        // Add new item
        const newItem: DeliveryCartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          customizations: customizations || [],
          isFree: false
        };
        return [...prev, newItem];
      }
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((productId: number, customizations?: ProductCustomization[]) => {
    setItems(prev => {
      if (!customizations || customizations.length === 0) {
        return prev.filter(item => item.productId !== productId);
      }
      // Remove specific item with matching customizations
      const customIds = customizations.map(c => c.id).sort().join(',');
      return prev.filter(item => {
        if (item.productId !== productId) return true;
        const itemCustomIds = item.customizations.map(c => c.id).sort().join(',');
        return itemCustomIds !== customIds;
      });
    });
  }, []);

  // Increase quantity
  const increaseQty = useCallback((productId: number, customizations?: ProductCustomization[]) => {
    setItems(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      if (customizations && customizations.length > 0) {
        const itemCustomIds = item.customizations.map(c => c.id).sort().join(',');
        const targetCustomIds = customizations.map(c => c.id).sort().join(',');
        if (itemCustomIds !== targetCustomIds) return item;
      } else if (item.customizations.length > 0) return item;
      return { ...item, quantity: item.quantity + 1 };
    }));
  }, []);

  // Decrease quantity
  const decreaseQty = useCallback((productId: number, customizations?: ProductCustomization[]) => {
    setItems(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      if (customizations && customizations.length > 0) {
        const itemCustomIds = item.customizations.map(c => c.id).sort().join(',');
        const targetCustomIds = customizations.map(c => c.id).sort().join(',');
        if (itemCustomIds !== targetCustomIds) return item;
      } else if (item.customizations.length > 0) return item;
      
      if (item.quantity <= 1) {
        // Remove item if quantity would be 0
        return null;
      }
      return { ...item, quantity: item.quantity - 1 };
    }).filter(Boolean) as DeliveryCartItem[]);
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartState: DeliveryCartState = {
    items,
    subtotal,
    deliveryFee,
    total
  };

  return {
    ...cartState,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart
  };
}


