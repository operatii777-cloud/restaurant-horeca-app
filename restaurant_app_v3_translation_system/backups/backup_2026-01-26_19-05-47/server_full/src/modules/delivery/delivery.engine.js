/**
 * PHASE S9.3 - Delivery Engine V2
 * 
 * Unified delivery order management engine.
 * Provides clean status machine and business logic for delivery orders.
 * 
 * Status flow:
 * pending -> preparing -> ready -> delivered -> paid
 * Any status can transition to cancelled
 */

const { dbPromise } = require('../../../database');
const { normalizeOrderStatus } = require('../orders/order.mapper');
const { emitOrderEventWithLoad } = require('../orders/order.service');

/**
 * Create a new delivery order
 * 
 * @param {Object} payload - Order payload
 * @returns {Promise<number>} Order ID
 */
async function createDeliveryOrder(payload) {
  const db = await dbPromise;
  
  const {
    customer_name,
    customer_phone,
    delivery_address,
    delivery_zone_id,
    items,
    total,
    payment_method,
    platform,
    pickup_type,
    notes,
    delivery_fee,
  } = payload;
  
  // Validate required fields
  if (!customer_phone || !items || items.length === 0) {
    throw new Error('Telefon și produse sunt obligatorii');
  }
  
  // Create order
  const orderId = await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO orders (
        type, order_source,
        customer_name, customer_phone, delivery_address, delivery_zone_id,
        items, total, payment_method, delivery_fee_charged,
        status, general_notes, timestamp, is_paid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `, [
      'delivery', 'DELIVERY',
      customer_name || 'Client', customer_phone, delivery_address || 'Ridicare personală', delivery_zone_id || null,
      JSON.stringify(items), total, payment_method || 'cash', delivery_fee || 0,
      'pending', notes || null, payment_method === 'card' || payment_method === 'online' ? 1 : 0
    ], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
  
  // Emit event
  emitOrderEventWithLoad('order:created', orderId, {
    type: 'delivery',
    platform: platform || 'phone',
  }).catch(err => console.error('Failed to emit order:created', err));
  
  return orderId;
}

/**
 * Check if status transition is allowed
 * 
 * @param {string} from - Current status
 * @param {string} to - Target status
 * @returns {boolean} True if transition is allowed
 */
function canTransition(from, to) {
  if (from === to) return true;
  
  const allowed = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivered', 'cancelled'],
    delivered: ['paid'],
    paid: [],
    cancelled: [],
  };
  
  const possible = allowed[from] || [];
  return possible.includes(to);
}

/**
 * Map status to event type
 * 
 * @param {string} status - Order status
 * @returns {string|null} Event type or null
 */
function mapStatusToEvent(status) {
  switch (status) {
    case 'pending': return 'order:created';
    case 'preparing': return 'order:updated';
    case 'ready': return 'order:ready';
    case 'delivered': return 'order:delivered';
    case 'paid': return 'order:paid';
    case 'cancelled': return 'order:cancelled';
    default: return 'order:updated';
  }
}

/**
 * Update delivery order status
 * 
 * @param {number} orderId - Order ID
 * @param {string} newStatus - New status
 * @param {Object} actor - Actor info (optional)
 * @returns {Promise<void>}
 */
async function updateDeliveryStatus(orderId, newStatus, actor = {}) {
  const db = await dbPromise;
  
  // Get current order
  const order = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  const current = normalizeOrderStatus(order.status);
  const next = normalizeOrderStatus(newStatus);
  
  // Validate transition
  if (!canTransition(current, next)) {
    throw new Error(`Invalid status transition: ${current} -> ${next}`);
  }
  
  // Update status
  const updates = ['status = ?'];
  const values = [next];
  
  // Update timestamps based on status
  if (next === 'preparing') {
    updates.push('prep_started_at = datetime(\'now\')');
  }
  
  if (next === 'ready') {
    updates.push('completed_timestamp = datetime(\'now\')');
    updates.push('ready_timestamp = datetime(\'now\')');
  }
  
  if (next === 'delivered') {
    updates.push('delivered_timestamp = datetime(\'now\')');
  }
  
  if (next === 'paid') {
    updates.push('paid_timestamp = datetime(\'now\')');
    updates.push('is_paid = 1');
  }
  
  if (next === 'cancelled') {
    updates.push('cancelled_timestamp = datetime(\'now\')');
    if (actor.reason) {
      updates.push('cancelled_reason = ?');
      values.push(actor.reason);
    }
  }
  
  values.push(orderId);
  
  await new Promise((resolve, reject) => {
    db.run(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      values,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
  
  // Emit event
  const eventType = mapStatusToEvent(next);
  if (eventType) {
    emitOrderEventWithLoad(eventType, orderId, { actor })
      .catch(err => console.error('Failed to emit event', err));
  }
}

module.exports = {
  createDeliveryOrder,
  updateDeliveryStatus,
  canTransition,
  mapStatusToEvent,
};

