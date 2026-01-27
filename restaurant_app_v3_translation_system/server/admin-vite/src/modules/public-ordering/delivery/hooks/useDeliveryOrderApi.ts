/**
 * FAZA 2 - Delivery Order API Hook
 * Handles API calls for creating delivery orders
 */

import { DeliveryOrderPayload, DeliveryOrderResponse, DeliveryCartState, DeliveryAddressData, PaymentMethod } from '../delivery.types';

export function useDeliveryOrderApi() {
  /**
   * Create delivery order
   */
  const createDeliveryOrder = async (
    cart: DeliveryCartState,
    address: DeliveryAddressData,
    paymentMethod: PaymentMethod
  ): Promise<number> => {
    // Build delivery address string
    let deliveryAddress = `${address.street} ${address.number}`;
    if (address.block) deliveryAddress += `, Bl. ${address.block}`;
    if (address.stairs) deliveryAddress += `, Sc. ${address.stairs}`;
    if (address.floor) deliveryAddress += `, Et. ${address.floor}`;
    if (address.apartment) deliveryAddress += `, Ap. ${address.apartment}`;
    if (address.intercom) deliveryAddress += `, Interfon: ${address.intercom}`;

    // Build items payload
    const items = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      finalPrice: item.price + item.customizations.reduce((sum, custom) => sum + custom.extra_price, 0),
      isFree: item.isFree || false,
      customizations: item.customizations.map(custom => ({
        id: custom.id,
        name: custom.option_name,
        name_ro: custom.option_name_ro || custom.option_name,
        name_en: custom.option_name_en || custom.option_name,
        price_change: custom.extra_price
      }))
    }));

    // Build payload
    const payload: DeliveryOrderPayload = {
      customer_name: address.customerName,
      customer_phone: address.customerPhone,
      delivery_address: deliveryAddress,
      items,
      total: cart.total,
      payment_method: paymentMethod,
      platform: 'PUBLIC_QR',
      pickup_type: 'PLATFORM_COURIER',
      notes: address.notes || null,
      type: "Delivery",
      order_source: 'DELIVERY'
    };

    // Make API call
    const response = await fetch('/api/orders/delivery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result: DeliveryOrderResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Eroare la trimiterea comenzii');
    }

    return result.order_id;
  };

  return {
    createDeliveryOrder
  };
}

