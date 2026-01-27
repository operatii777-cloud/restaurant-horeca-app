/**
 * PHASE S9.6 - Order Engine V2 Integration Examples
 * 
 * This file shows how to integrate Order Engine V2 into existing controllers.
 * DO NOT import this file - it's just documentation/examples.
 * 
 * Copy the patterns from here into your actual controllers.
 */

// ========================================
// EXAMPLE 1: Create Order (with feature flags)
// ========================================

const { ENABLE_ORDER_EVENTS_V2, ENABLE_DELIVERY_ENGINE_V2 } = require('../../config/orderEngine.config');
const { emitOrderEventWithLoad } = require('./order.service');
const { createDeliveryOrder } = require('../delivery/delivery.engine');

async function createOrderExample(req, res, next) {
  try {
    const payload = req.body;
    
    let orderId;
    
    // 1️⃣ Delivery via Delivery Engine V2 (if enabled)
    if (payload.type === 'delivery') {
      if (ENABLE_DELIVERY_ENGINE_V2) {
        // Use new Delivery Engine V2
        orderId = await createDeliveryOrder(payload);
      } else {
        // Fallback: legacy delivery creation
        orderId = await createDeliveryOrderLegacy(payload);
      }
    } else {
      // 2️⃣ Other order types: dine_in, takeout, drive_thru, etc.
      // Use your existing logic
      orderId = await createOrderLegacy(payload);
    }
    
    // 3️⃣ Event bus V2 (only if enabled)
    if (ENABLE_ORDER_EVENTS_V2) {
      emitOrderEventWithLoad('order:created', orderId)
        .catch(err => console.error('[OrderEngine] order:created emit error', err));
    }
    
    // 4️⃣ Return response (unchanged)
    return res.json({ success: true, orderId });
  } catch (err) {
    console.error('createOrder error', err);
    next(err);
  }
}

// ========================================
// EXAMPLE 2: Mark Order Ready (with Stock Engine V2)
// ========================================

const { ENABLE_STOCK_ENGINE_V2 } = require('../../config/orderEngine.config');
const StockConsumptionService = require('../stocks/services/stockConsumption.service');
const { loadOrderWithItems } = require('./order.service');

async function markOrderReadyExample(req, res, next) {
  try {
    const orderId = req.params.id;
    const db = await dbPromise;
    
    // 1️⃣ Update order status (existing logic)
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET status = ?, completed_timestamp = datetime(\'now\') WHERE id = ?',
        ['ready', orderId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // 2️⃣ Stock consumption V2 (only if enabled)
    if (ENABLE_STOCK_ENGINE_V2) {
      try {
        // StockConsumptionService already uses recipe.expander.js if enabled
        await StockConsumptionService.consumeStockForOrder(orderId, {
          reason: 'ORDER_COMPLETED',
          source: 'KDS',
        });
      } catch (stockErr) {
        console.error('[OrderEngine] Stock consumption error:', stockErr);
        // Don't fail the request if stock consumption fails
      }
    } else {
      // Fallback: legacy stock consumption
      await legacyConsumptionServiceForOrder(orderId);
    }
    
    // 3️⃣ Event bus V2
    if (ENABLE_ORDER_EVENTS_V2) {
      emitOrderEventWithLoad('order:ready', orderId)
        .catch(err => console.error('[OrderEngine] order:ready emit error', err));
    }
    
    // 4️⃣ Return response (unchanged)
    return res.json({ success: true });
  } catch (err) {
    console.error('markOrderReady error', err);
    next(err);
  }
}

// ========================================
// EXAMPLE 3: Update Delivery Status (Delivery Engine V2)
// ========================================

const { updateDeliveryStatus } = require('../delivery/delivery.engine');

async function updateDeliveryStatusExample(req, res, next) {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (ENABLE_DELIVERY_ENGINE_V2) {
      // Use new Delivery Engine V2
      await updateDeliveryStatus(orderId, status, req.user || {});
    } else {
      // Fallback: legacy status update
      await legacyUpdateDeliveryStatus(orderId, status, req.user);
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error('updateDeliveryStatus error', err);
    next(err);
  }
}

// ========================================
// EXAMPLE 4: Update Drive-Thru Status (Drive-Thru Engine V2)
// ========================================

const { ENABLE_DRIVETHRU_ENGINE_V2 } = require('../../config/orderEngine.config');
const { updateDriveThruStatus } = require('../drivethru/driveThru.engine');

async function updateDriveThruStatusExample(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (ENABLE_DRIVETHRU_ENGINE_V2) {
      // Use new Drive-Thru Engine V2
      await updateDriveThruStatus(id, status, req.user || {});
    } else {
      // Fallback: legacy status update
      await legacyDriveThruStatusUpdate(id, status, req.user);
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error('DriveThru status error', err);
    next(err);
  }
}

// ========================================
// EXAMPLE 5: Mark Order Paid (with events)
// ========================================

async function markOrderPaidExample(req, res, next) {
  try {
    const orderId = req.params.id;
    const db = await dbPromise;
    
    // 1️⃣ Update order (existing logic)
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET is_paid = 1, paid_timestamp = datetime(\'now\') WHERE id = ?',
        [orderId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // 2️⃣ Event bus V2
    if (ENABLE_ORDER_EVENTS_V2) {
      emitOrderEventWithLoad('order:paid', orderId)
        .catch(err => console.error('[OrderEngine] order:paid emit error', err));
    }
    
    // 3️⃣ Return response (unchanged)
    return res.json({ success: true });
  } catch (err) {
    console.error('markOrderPaid error', err);
    next(err);
  }
}

// ========================================
// EXAMPLE 6: Cancel Order
// ========================================

async function cancelOrderExample(req, res, next) {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    const db = await dbPromise;
    
    // 1️⃣ Update order (existing logic)
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET status = \'cancelled\', cancelled_timestamp = datetime(\'now\'), cancelled_reason = ? WHERE id = ?',
        [reason || 'Cancelled by user', orderId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // 2️⃣ Event bus V2
    if (ENABLE_ORDER_EVENTS_V2) {
      emitOrderEventWithLoad('order:cancelled', orderId, {
        reason: reason || 'Cancelled by user',
      }).catch(err => console.error('[OrderEngine] order:cancelled emit error', err));
    }
    
    // 3️⃣ Return response (unchanged)
    return res.json({ success: true });
  } catch (err) {
    console.error('cancelOrder error', err);
    next(err);
  }
}

// ========================================
// EXAMPLE 7: Dispatch Engine (auto-assign courier)
// ========================================

const { ENABLE_DISPATCH_ENGINE_V2 } = require('../../config/orderEngine.config');
const { autoAssignCourier } = require('../dispatch/dispatch.engine');

async function createDeliveryOrderWithDispatchExample(req, res, next) {
  try {
    const payload = req.body;
    
    // 1️⃣ Create delivery order
    let orderId;
    if (ENABLE_DELIVERY_ENGINE_V2) {
      orderId = await createDeliveryOrder(payload);
    } else {
      orderId = await createDeliveryOrderLegacy(payload);
    }
    
    // 2️⃣ Auto-assign courier (if dispatch engine enabled)
    if (ENABLE_DISPATCH_ENGINE_V2) {
      try {
        const order = await loadOrderWithItems(orderId);
        if (order && order.type === 'delivery') {
          await autoAssignCourier(order);
          console.log(`[DispatchEngine] Auto-assigned courier to order ${orderId}`);
        }
      } catch (dispatchErr) {
        console.error('[DispatchEngine] Auto-assignment error:', dispatchErr);
        // Don't fail the request if dispatch fails
      }
    }
    
    // 3️⃣ Event bus
    if (ENABLE_ORDER_EVENTS_V2) {
      emitOrderEventWithLoad('order:created', orderId)
        .catch(err => console.error('[OrderEngine] order:created emit error', err));
    }
    
    return res.json({ success: true, orderId });
  } catch (err) {
    console.error('createDeliveryOrder error', err);
    next(err);
  }
}

module.exports = {
  // Export examples for reference (not for direct use)
  createOrderExample,
  markOrderReadyExample,
  updateDeliveryStatusExample,
  updateDriveThruStatusExample,
  markOrderPaidExample,
  cancelOrderExample,
  createDeliveryOrderWithDispatchExample,
};

