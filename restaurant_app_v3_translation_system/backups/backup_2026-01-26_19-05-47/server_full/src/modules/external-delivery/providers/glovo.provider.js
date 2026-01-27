/**
 * S17.I - Glovo Provider
 * Handles Glovo-specific order format
 */

const { normalizeOrder, normalizeStatus } = require('../externalDelivery.mappers');

/**
 * Normalize Glovo order payload
 */
function normalizeGlovoOrder(payload) {
  // Glovo webhook format (example)
  const order = payload.order || payload;
  
  return normalizeOrder({
    id: order.id || order.order_id,
    restaurant_id: order.store?.id || order.store_id,
    customer: {
      name: order.customer?.name || order.customer_name,
      phone: order.customer?.phone || order.customer_phone
    },
    delivery_address: {
      address: order.delivery_address?.address || order.address,
      coordinates: order.delivery_address?.coordinates || {
        lat: order.delivery_address?.lat,
        lng: order.delivery_address?.lng
      }
    },
    items: order.items || order.products || [],
    total: order.total || order.total_amount,
    payment_method: order.payment?.method || order.payment_method,
    payment: {
      method: order.payment?.method || order.payment_method,
      status: order.payment?.status || (order.is_paid ? 'paid' : 'pending')
    },
    notes: order.notes || order.special_instructions
  }, 'GLOVO');
}

/**
 * Normalize Glovo status
 */
function normalizeGlovoStatus(status) {
  return normalizeStatus(status, 'GLOVO');
}

module.exports = {
  normalizeGlovoOrder,
  normalizeGlovoStatus
};

