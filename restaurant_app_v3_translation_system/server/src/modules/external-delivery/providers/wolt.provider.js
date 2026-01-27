/**
 * S17.I - Wolt Provider
 * Handles Wolt-specific order format
 */

const { normalizeOrder, normalizeStatus } = require('../externalDelivery.mappers');

/**
 * Normalize Wolt order payload
 */
function normalizeWoltOrder(payload) {
  const order = payload.order || payload;
  
  return normalizeOrder({
    id: order.id || order.order_id,
    restaurant_id: order.venue?.id || order.restaurant_id,
    customer_name: order.customer?.name || order.customer_name,
    customer_phone: order.customer?.phone || order.customer_phone,
    address: order.delivery?.address || order.delivery_address,
    coordinates: order.delivery?.location || {
      lat: order.delivery_lat,
      lng: order.delivery_lng
    },
    items: order.items || order.products || [],
    total: order.total || order.total_amount,
    payment_method: order.payment_method,
    is_paid: order.is_paid || order.payment?.status === 'paid',
    notes: order.notes || order.special_instructions
  }, 'WOLT');
}

/**
 * Normalize Wolt status
 */
function normalizeWoltStatus(status) {
  return normalizeStatus(status, 'WOLT');
}

module.exports = {
  normalizeWoltOrder,
  normalizeWoltStatus
};

