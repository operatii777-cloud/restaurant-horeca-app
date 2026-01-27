/**
 * S17.I - External Delivery Mappers
 * Maps external platform formats to internal order format
 */

/**
 * Normalize external order to internal format
 */
function normalizeOrder(externalOrder, provider) {
  return {
    externalOrderId: externalOrder.id || externalOrder.order_id || externalOrder.external_id,
    restaurantExternalId: externalOrder.restaurant_id || externalOrder.store_id || null,
    customerName: externalOrder.customer?.name || externalOrder.customer_name || 'Client',
    customerPhone: externalOrder.customer?.phone || externalOrder.customer_phone || '',
    deliveryAddress: externalOrder.delivery_address?.address || externalOrder.address || externalOrder.delivery_address || '',
    coords: externalOrder.delivery_address?.coordinates || externalOrder.coordinates || null,
    items: normalizeItems(externalOrder.items || externalOrder.products || []),
    total: parseFloat(externalOrder.total || externalOrder.total_amount || 0),
    paymentMethod: normalizePaymentMethod(externalOrder.payment_method || externalOrder.payment?.method),
    alreadyPaid: externalOrder.payment?.status === 'paid' || externalOrder.is_paid === true || false,
    notes: externalOrder.notes || externalOrder.special_instructions || externalOrder.customer_notes || null
  };
}

/**
 * Normalize items array
 */
function normalizeItems(items) {
  return items.map(item => ({
    name: item.name || item.product_name || item.title || 'Produs',
    sku: item.sku || item.product_id || item.id || null,
    qty: parseInt(item.quantity || item.qty || 1),
    unitPrice: parseFloat(item.price || item.unit_price || 0),
    total: parseFloat(item.total || item.subtotal || (item.price || 0) * (item.quantity || 1))
  }));
}

/**
 * Normalize payment method
 */
function normalizePaymentMethod(method) {
  if (!method) return 'cash';
  
  const methodLower = method.toLowerCase();
  if (methodLower.includes('card') || methodLower.includes('credit') || methodLower.includes('online')) {
    return 'card';
  }
  return 'cash';
}

/**
 * Normalize external status to internal status
 */
function normalizeStatus(externalStatus, provider) {
  const statusLower = (externalStatus || '').toLowerCase();
  
  // Common mappings
  if (statusLower.includes('accepted') || statusLower.includes('confirmed')) {
    return 'assigned';
  }
  if (statusLower.includes('courier_assigned') || statusLower.includes('driver_assigned')) {
    return 'assigned';
  }
  if (statusLower.includes('picked_up') || statusLower.includes('picked') || statusLower.includes('collected')) {
    return 'picked_up';
  }
  if (statusLower.includes('on_the_way') || statusLower.includes('in_transit') || statusLower.includes('on_route')) {
    return 'in_transit';
  }
  if (statusLower.includes('delivered') || statusLower.includes('completed')) {
    return 'delivered';
  }
  if (statusLower.includes('cancelled') || statusLower.includes('canceled')) {
    return 'cancelled';
  }
  
  // Default
  return 'pending';
}

module.exports = {
  normalizeOrder,
  normalizeStatus
};

