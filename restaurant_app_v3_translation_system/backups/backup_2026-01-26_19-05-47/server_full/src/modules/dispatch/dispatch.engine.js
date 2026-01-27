/**
 * PHASE S9.5 - Dispatch Engine
 * 
 * Courier assignment and tracking engine for delivery orders.
 * Provides:
 * - Auto-assignment of couriers
 * - Live location tracking
 * - ETA calculation
 * - Courier status management
 */

const { dbPromise } = require('../../../database');
const { computeEtaWithFallback } = require('../delivery/delivery.eta');
const { emitOrderEventWithLoad } = require('../orders/order.service');

/**
 * Get available couriers (idle or returning)
 * 
 * @returns {Promise<Array>} Array of available couriers
 */
async function getAvailableCouriers() {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM couriers
      WHERE status IN ('idle', 'returning')
      ORDER BY last_updated_at DESC
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Auto-assign best courier to order
 * 
 * @param {Object} order - Order object (canonical or DB row)
 * @returns {Promise<number|null>} Courier ID or null if none available
 */
async function autoAssignCourier(order) {
  const db = await dbPromise;
  
  // Get available couriers
  const couriers = await getAvailableCouriers();
  
  if (couriers.length === 0) {
    console.log('[DispatchEngine] No available couriers');
    return null;
  }
  
  // Get restaurant location (from env or config)
  const restaurantLat = parseFloat(process.env.RESTAURANT_LAT) || 44.4268; // Default Bucharest
  const restaurantLng = parseFloat(process.env.RESTAURANT_LNG) || 26.1025;
  
  // Calculate ETA for each courier to restaurant
  const couriersWithEta = await Promise.all(
    couriers.map(async (courier) => {
      if (courier.last_lat && courier.last_lng) {
        const eta = await computeEtaWithFallback(
          courier.last_lat,
          courier.last_lng,
          restaurantLat,
          restaurantLng
        );
        return {
          ...courier,
          eta_to_restaurant: eta?.duration_seconds || 0,
        };
      } else {
        // No location, assume far away
        return {
          ...courier,
          eta_to_restaurant: 999999,
        };
      }
    })
  );
  
  // Sort by ETA (fastest first)
  couriersWithEta.sort((a, b) => a.eta_to_restaurant - b.eta_to_restaurant);
  const bestCourier = couriersWithEta[0];
  
  // Assign courier to order
  const assignmentId = await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO courier_assignments (order_id, courier_id, status, assigned_at)
      VALUES (?, ?, 'assigned', datetime('now'))
    `, [order.id, bestCourier.id], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
  
  // Update courier status
  await new Promise((resolve, reject) => {
    db.run(`
      UPDATE couriers
      SET status = 'assigned',
          updated_at = datetime('now')
      WHERE id = ?
    `, [bestCourier.id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Update order with courier_id
  await new Promise((resolve, reject) => {
    db.run(`
      UPDATE orders
      SET courier_id = ?
      WHERE id = ?
    `, [bestCourier.id, order.id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Log tracking event
  await logTrackingEvent({
    order_id: order.id,
    courier_id: bestCourier.id,
    status: 'assigned',
    lat: bestCourier.last_lat,
    lng: bestCourier.last_lng,
  });
  
  // Emit event
  emitOrderEventWithLoad('order:updated', order.id, {
    assignedCourier: bestCourier.id,
    courierName: bestCourier.name,
  }).catch(err => console.error('Failed to emit order:updated', err));
  
  console.log(`[DispatchEngine] Assigned courier ${bestCourier.id} (${bestCourier.name}) to order ${order.id}`);
  
  return bestCourier.id;
}

/**
 * Update courier location
 * 
 * @param {number} courierId - Courier ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<void>}
 */
async function updateCourierLocation(courierId, lat, lng) {
  const db = await dbPromise;
  
  // Update courier location
  await new Promise((resolve, reject) => {
    db.run(`
      UPDATE couriers
      SET last_lat = ?,
          last_lng = ?,
          last_updated_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `, [lat, lng, courierId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Get active assignments for this courier
  const assignments = await new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM courier_assignments
      WHERE courier_id = ?
        AND status IN ('assigned', 'picked_up', 'en_route')
    `, [courierId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  // Log location update for each active assignment
  for (const assignment of assignments) {
    await logTrackingEvent({
      order_id: assignment.order_id,
      courier_id: courierId,
      status: 'location_update',
      lat,
      lng,
    });
    
    // Calculate ETA to customer if order has delivery address
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT delivery_address FROM orders WHERE id = ?', [assignment.order_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // TODO: Geocode delivery_address and calculate ETA
    // For now, just log the location update
  }
}

/**
 * Record courier status change
 * 
 * @param {number} courierId - Courier ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
async function recordCourierStatus(courierId, status) {
  const db = await dbPromise;
  
  const validStatuses = ['idle', 'assigned', 'en_route_to_restaurant', 'picked_up', 'en_route_to_customer', 'delivered', 'returning', 'offline'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid courier status: ${status}`);
  }
  
  await new Promise((resolve, reject) => {
    db.run(`
      UPDATE couriers
      SET status = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `, [status, courierId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Log tracking event for active assignments
  const assignments = await new Promise((resolve, reject) => {
    db.all(`
      SELECT order_id FROM courier_assignments
      WHERE courier_id = ? AND status IN ('assigned', 'picked_up', 'en_route')
    `, [courierId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  for (const assignment of assignments) {
    await logTrackingEvent({
      order_id: assignment.order_id,
      courier_id: courierId,
      status: status,
    });
  }
}

/**
 * Log tracking event
 * 
 * @param {Object} event - Tracking event data
 * @returns {Promise<void>}
 */
async function logTrackingEvent(event) {
  const db = await dbPromise;
  
  await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO delivery_tracking (
        order_id, courier_id, status, lat, lng, eta_seconds, distance_meters, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      event.order_id,
      event.courier_id || null,
      event.status,
      event.lat || null,
      event.lng || null,
      event.eta_seconds || null,
      event.distance_meters || null,
    ], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  getAvailableCouriers,
  autoAssignCourier,
  updateCourierLocation,
  recordCourierStatus,
  logTrackingEvent,
};

