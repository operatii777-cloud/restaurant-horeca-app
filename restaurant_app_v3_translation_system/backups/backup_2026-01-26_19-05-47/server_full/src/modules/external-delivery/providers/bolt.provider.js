/**
 * S17.I - Bolt Food Provider
 * Handles Bolt Food-specific order format
 */

const { normalizeOrder, normalizeStatus } = require('../externalDelivery.mappers');

/**
 * Normalize Bolt Food order payload
 */
function normalizeBoltOrder(payload) {
  const order = payload.order || payload;
  
  return normalizeOrder({
    id: order.id || order.order_id,
    restaurant_id: order.restaurant?.id || order.restaurant_id,
    customer_name: order.customer?.name || order.customer_name,
    customer_phone: order.customer?.phone || order.customer_phone,
    address: order.delivery_address || order.address,
    coordinates: order.delivery_coordinates || {
      lat: order.delivery_lat,
      lng: order.delivery_lng
    },
    items: order.items || order.products || [],
    total: order.total || order.total_amount,
    payment_method: order.payment_method,
    is_paid: order.is_paid || order.payment?.status === 'paid',
    notes: order.notes || order.special_instructions
  }, 'BOLT_FOOD');
}

/**
 * Normalize Bolt Food status
 */
function normalizeBoltStatus(status) {
  return normalizeStatus(status, 'BOLT_FOOD');
}

module.exports = {
  normalizeBoltOrder,
  normalizeBoltStatus
};

