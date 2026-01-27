/**
 * S17.I - Tazz Provider
 * Handles Tazz-specific order format
 */

const { normalizeOrder, normalizeStatus } = require('../externalDelivery.mappers');

/**
 * Normalize Tazz order payload
 */
function normalizeTazzOrder(payload) {
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
  }, 'TAZZ');
}

/**
 * Normalize Tazz status
 */
function normalizeTazzStatus(status) {
  return normalizeStatus(status, 'TAZZ');
}

module.exports = {
  normalizeTazzOrder,
  normalizeTazzStatus
};

