/**
 * FAZA 2.C - Delivery SLA Engine
 * 
 * Calculates SLA metrics for delivery orders:
 * - Pickup time (ready -> picked_up)
 * - Delivery time (picked_up -> delivered)
 * - Total time (ready -> delivered)
 * - SLA violations
 */

const { dbPromise } = require('../../../database');

// SLA Configuration
const SLA_CONFIG = {
  TARGET_PICKUP_MINUTES: 5, // Target time from ready to pickup
  TARGET_DELIVERY_MINUTES: 30, // Target time from ready to delivered
  TARGET_TOTAL_MINUTES: 45, // Total target time
};

/**
 * Calculate SLA metrics for an order
 */
async function calculateOrderSLA(orderId) {
  const db = await dbPromise;
  
  const order = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!order || order.type !== 'delivery') {
    return null;
  }
  
  const assignment = await new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM delivery_assignments WHERE order_id = ? ORDER BY assigned_at DESC LIMIT 1`,
      [orderId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  // Calculate times
  const readyAt = order.ready_at || order.completed_timestamp || order.timestamp;
  const pickedUpAt = assignment?.picked_up_at || null;
  const deliveredAt = assignment?.delivered_at || order.delivered_timestamp || null;
  
  let pickupTimeMinutes = null;
  let deliveryTimeMinutes = null;
  let totalTimeMinutes = null;
  
  if (readyAt) {
    if (pickedUpAt) {
      pickupTimeMinutes = Math.round(
        (new Date(pickedUpAt).getTime() - new Date(readyAt).getTime()) / (1000 * 60)
      );
    }
    
    if (deliveredAt) {
      totalTimeMinutes = Math.round(
        (new Date(deliveredAt).getTime() - new Date(readyAt).getTime()) / (1000 * 60)
      );
      
      if (pickedUpAt) {
        deliveryTimeMinutes = Math.round(
          (new Date(deliveredAt).getTime() - new Date(pickedUpAt).getTime()) / (1000 * 60)
        );
      }
    }
  }
  
  // Check SLA violations
  const slaStatus = {
    pickup: {
      time: pickupTimeMinutes,
      target: SLA_CONFIG.TARGET_PICKUP_MINUTES,
      breached: pickupTimeMinutes !== null && pickupTimeMinutes > SLA_CONFIG.TARGET_PICKUP_MINUTES,
    },
    delivery: {
      time: deliveryTimeMinutes,
      target: SLA_CONFIG.TARGET_DELIVERY_MINUTES,
      breached: deliveryTimeMinutes !== null && deliveryTimeMinutes > SLA_CONFIG.TARGET_DELIVERY_MINUTES,
    },
    total: {
      time: totalTimeMinutes,
      target: SLA_CONFIG.TARGET_TOTAL_MINUTES,
      breached: totalTimeMinutes !== null && totalTimeMinutes > SLA_CONFIG.TARGET_TOTAL_MINUTES,
    },
  };
  
  return {
    orderId,
    readyAt,
    pickedUpAt,
    deliveredAt,
    pickupTimeMinutes,
    deliveryTimeMinutes,
    totalTimeMinutes,
    slaStatus,
    isBreached: slaStatus.total.breached || slaStatus.pickup.breached || slaStatus.delivery.breached,
  };
}

/**
 * Get SLA statistics for a date range
 */
async function getSLAStatistics({ dateFrom, dateTo } = {}) {
  const db = await dbPromise;
  
  let dateFilter = '';
  const params = [];
  
  if (dateFrom && dateTo) {
    dateFilter = 'AND o.timestamp >= ? AND o.timestamp <= ?';
    params.push(dateFrom, dateTo);
  }
  
  // Get all delivered orders
  const orders = await new Promise((resolve, reject) => {
    db.all(`
      SELECT o.id, o.ready_at, o.delivered_timestamp, o.timestamp
      FROM orders o
      LEFT JOIN delivery_assignments da ON o.id = da.order_id
      WHERE o.type = 'delivery'
        AND (o.delivered_timestamp IS NOT NULL OR da.delivered_at IS NOT NULL)
        ${dateFilter}
    `, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  let totalOrders = 0;
  let onTimeOrders = 0;
  let lateOrders = 0;
  let totalTimeSum = 0;
  let lateTimeSum = 0;
  
  for (const order of orders) {
    const sla = await calculateOrderSLA(order.id);
    if (sla && sla.totalTimeMinutes !== null) {
      totalOrders++;
      totalTimeSum += sla.totalTimeMinutes;
      
      if (sla.isBreached) {
        lateOrders++;
        lateTimeSum += sla.totalTimeMinutes;
      } else {
        onTimeOrders++;
      }
    }
  }
  
  return {
    totalOrders,
    onTimeOrders,
    lateOrders,
    onTimeRate: totalOrders > 0 ? onTimeOrders / totalOrders : 0,
    avgDeliveryMinutes: totalOrders > 0 ? Math.round(totalTimeSum / totalOrders) : 0,
    avgLateMinutes: lateOrders > 0 ? Math.round(lateTimeSum / lateOrders) : 0,
  };
}

/**
 * Check for SLA violations and emit alerts
 */
async function checkSLAViolations() {
  const db = await dbPromise;
  
  // Get active orders that might breach SLA
  const activeOrders = await new Promise((resolve, reject) => {
    db.all(`
      SELECT o.id, o.ready_at, o.timestamp
      FROM orders o
      WHERE o.type = 'delivery'
        AND o.status IN ('ready', 'assigned', 'picked_up', 'in_transit')
        AND o.ready_at IS NOT NULL
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  const violations = [];
  
  for (const order of activeOrders) {
    const sla = await calculateOrderSLA(order.id);
    if (sla && sla.isBreached) {
      violations.push({
        orderId: order.id,
        sla,
        severity: sla.totalTimeMinutes > SLA_CONFIG.TARGET_TOTAL_MINUTES * 1.5 ? 'critical' : 'warning',
      });
    }
  }
  
  return violations;
}

module.exports = {
  calculateOrderSLA,
  getSLAStatistics,
  checkSLAViolations,
  SLA_CONFIG,
};

