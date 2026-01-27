/**
 * PHASE S9.4 - Drive-Thru Engine V2
 * 
 * Unified drive-thru order management engine.
 * Provides clean status machine and business logic for drive-thru orders.
 * 
 * Status flow:
 * pending -> preparing -> ready_for_pickup -> served -> paid
 * Any status can transition to cancelled
 */

const { dbPromise } = require('../../../database');
const { normalizeOrderStatus } = require('../orders/order.mapper');
const { emitOrderEventWithLoad } = require('../orders/order.service');

/**
 * Create a new drive-thru order
 * 
 * @param {Object} payload - Order payload
 * @returns {Promise<number>} Order ID
 */
async function createDriveThruOrder(payload) {
  const db = await dbPromise;
  
  const {
    items,
    total,
    payment_method,
    lane_number,
    car_plate,
    notes,
  } = payload;
  
  // Validate required fields
  if (!items || items.length === 0) {
    throw new Error('Produsele sunt obligatorii');
  }
  
  // Create order
  const orderId = await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO orders (
        type, order_source,
        items, total, payment_method,
        lane_number, car_plate,
        status, general_notes, timestamp, is_paid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `, [
      'drive_thru', 'DRIVE_THRU',
      JSON.stringify(items), total, payment_method || 'cash',
      lane_number || null, car_plate || null,
      'pending', notes || null, payment_method === 'card' ? 1 : 0
    ], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
  
  // Emit event
  emitOrderEventWithLoad('order:created', orderId, {
    type: 'drive_thru',
    lane_number,
    car_plate,
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
    preparing: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['served', 'cancelled'],
    served: ['paid'],
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
function mapDriveThruEvent(status) {
  switch (status) {
    case 'pending': return 'order:created';
    case 'preparing': return 'order:updated';
    case 'ready_for_pickup': return 'order:ready';
    case 'served': return 'order:delivered';
    case 'paid': return 'order:paid';
    case 'cancelled': return 'order:cancelled';
    default: return 'order:updated';
  }
}

/**
 * Update drive-thru order status
 * 
 * @param {number} orderId - Order ID
 * @param {string} newStatus - New status
 * @param {Object} actor - Actor info (optional)
 * @returns {Promise<void>}
 */
async function updateDriveThruStatus(orderId, newStatus, actor = {}) {
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
    throw new Error(`Invalid drive-thru status transition: ${current} -> ${next}`);
  }
  
  // Update status
  const updates = ['status = ?'];
  const values = [next];
  
  // Update timestamps based on status
  if (next === 'preparing') {
    updates.push('prep_started_at = datetime(\'now\')');
  }
  
  if (next === 'ready_for_pickup') {
    updates.push('ready_timestamp = datetime(\'now\')');
    updates.push('completed_timestamp = datetime(\'now\')');
  }
  
  if (next === 'served') {
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
  const eventType = mapDriveThruEvent(next);
  if (eventType) {
    emitOrderEventWithLoad(eventType, orderId, { actor })
      .catch(err => console.error('Failed to emit event', err));
  }
}

/**
 * Update drive-thru lane and car plate
 * 
 * @param {number} orderId - Order ID
 * @param {string} laneNumber - Lane number
 * @param {string} carPlate - Car plate (optional)
 * @returns {Promise<void>}
 */
async function updateDriveThruLane(orderId, laneNumber, carPlate = null) {
  const db = await dbPromise;
  
  const updates = [];
  const values = [];
  
  if (laneNumber !== undefined && laneNumber !== null) {
    updates.push('lane_number = ?');
    values.push(laneNumber);
  }
  
  if (carPlate !== undefined && carPlate !== null) {
    updates.push('car_plate = ?');
    values.push(carPlate);
  }
  
  if (updates.length === 0) {
    return; // Nothing to update
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
  
  // Emit update event
  emitOrderEventWithLoad('order:updated', orderId, {
    lane_number: laneNumber,
    car_plate: carPlate,
  }).catch(err => console.error('Failed to emit order:updated', err));
}

module.exports = {
  createDriveThruOrder,
  updateDriveThruStatus,
  updateDriveThruLane,
  canTransition,
  mapDriveThruEvent,
};

