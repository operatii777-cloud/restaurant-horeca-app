/**
 * PHASE S9.1 - Order Service
 * 
 * Helper service for loading orders and emitting events.
 * Provides clean, reusable functions for controllers.
 */

const { dbPromise } = require('../../../database');
const { mapDbOrderToCanonical } = require('./order.mapper');
const { emitOrderEvent } = require('./order.events');

/**
 * Load order with items from database
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<Object|null>} Canonical order object or null if not found
 */
async function loadOrderWithItems(orderId) {
  if (!orderId) {
    return null;
  }
  
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId],
      async (err, row) => {
        if (err) {
          console.error(`[OrderService] Error loading order ${orderId}:`, err);
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }
        
        // Parse items from JSON
        let items = [];
        if (row.items) {
          try {
            items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
            if (!Array.isArray(items)) items = [];
          } catch (e) {
            console.warn(`[OrderService] Failed to parse items for order ${orderId}:`, e.message);
            items = [];
          }
        }
        
        // Map to canonical structure
        const canonical = mapDbOrderToCanonical(row, items);
        resolve(canonical);
      }
    );
  });
}

/**
 * Emit order event after loading order
 * 
 * @param {string} eventType - Event type (e.g., 'order:created')
 * @param {number} orderId - Order ID
 * @param {Object} extra - Extra metadata to include in payload
 * @returns {Promise<void>}
 */
async function emitOrderEventWithLoad(eventType, orderId, extra = {}) {
  if (!orderId) {
    console.warn('[OrderService] emitOrderEventWithLoad: orderId is required');
    return;
  }
  
  try {
    const order = await loadOrderWithItems(orderId);
    
    if (!order) {
      console.warn(`[OrderService] emitOrderEventWithLoad: order ${orderId} not found`);
      return;
    }
    
    emitOrderEvent(eventType, {
      order,
      ...extra,
    });
  } catch (err) {
    console.error(`[OrderService] Error in emitOrderEventWithLoad for order ${orderId}:`, err);
    // Don't throw - event emission should not break the flow
  }
}

/**
 * Load multiple orders with items
 * 
 * @param {Array<number>} orderIds - Array of order IDs
 * @returns {Promise<Array<Object>>} Array of canonical order objects
 */
async function loadOrdersWithItems(orderIds) {
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return [];
  }
  
  const db = await dbPromise;
  const placeholders = orderIds.map(() => '?').join(',');
  
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM orders WHERE id IN (${placeholders})`,
      orderIds,
      async (err, rows) => {
        if (err) {
          console.error('[OrderService] Error loading orders:', err);
          reject(err);
          return;
        }
        
        if (!rows || rows.length === 0) {
          resolve([]);
          return;
        }
        
        // Map each row to canonical structure
        const canonicalOrders = rows.map(row => {
          let items = [];
          if (row.items) {
            try {
              items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
              if (!Array.isArray(items)) items = [];
            } catch (e) {
              items = [];
            }
          }
          return mapDbOrderToCanonical(row, items);
        }).filter(Boolean);
        
        resolve(canonicalOrders);
      }
    );
  });
}

module.exports = {
  loadOrderWithItems,
  emitOrderEventWithLoad,
  loadOrdersWithItems,
};

