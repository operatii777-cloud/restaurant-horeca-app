/**
 * S17.I - External Delivery Service
 * Orchestrates external delivery platform integrations
 */

const { dbPromise } = require('../../../database');
const glovoProvider = require('./providers/glovo.provider');
const boltProvider = require('./providers/bolt.provider');
const tazzProvider = require('./providers/tazz.provider');
const woltProvider = require('./providers/wolt.provider');
const UberEatsService = require('./uber-eats.service');
const BoltFoodService = require('./bolt-food.service');

const providers = {
  glovo: glovoProvider,
  bolt: boltProvider,
  bolt_food: boltProvider,
  tazz: tazzProvider,
  wolt: woltProvider,
  uber_eats: null, // Will be initialized with service
  bolt_food_service: null, // Will be initialized with service
};

/**
 * Handle order created from external platform
 */
async function handleOrderCreated(providerName, payload) {
  const provider = providers[providerName.toLowerCase()];
  
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`);
  }
  
  // Normalize order
  const internalOrder = provider.normalizeGlovoOrder 
    ? provider.normalizeGlovoOrder(payload)
    : provider.normalizeBoltOrder 
    ? provider.normalizeBoltOrder(payload)
    : provider.normalizeTazzOrder
    ? provider.normalizeTazzOrder(payload)
    : provider.normalizeWoltOrder
    ? provider.normalizeWoltOrder(payload)
    : null;
  
  if (!internalOrder) {
    throw new Error(`Provider ${providerName} does not have normalize function`);
  }
  
  const db = await dbPromise;
  
  // Create internal order
  const orderId = await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO orders (
        type, order_source, platform, external_provider, external_order_id,
        customer_name, customer_phone, delivery_address,
        items, total, payment_method, is_paid,
        status, general_notes, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      'delivery',
      'DELIVERY',
      providerName.toUpperCase(),
      providerName.toUpperCase(),
      internalOrder.externalOrderId,
      internalOrder.customerName,
      internalOrder.customerPhone,
      internalOrder.deliveryAddress,
      JSON.stringify(internalOrder.items),
      internalOrder.total,
      internalOrder.paymentMethod,
      internalOrder.alreadyPaid ? 1 : 0,
      'pending',
      internalOrder.notes
    ], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
  
  // Emit Socket.IO events
  if (global.io) {
    global.io.emit('delivery:new-order', {
      orderId,
      platform: providerName.toUpperCase(),
      customerName: internalOrder.customerName,
      deliveryAddress: internalOrder.deliveryAddress,
      total: internalOrder.total,
      timestamp: new Date()
    });
    
    global.io.emit('order:new', {
      orderId,
      type: 'delivery',
      items: internalOrder.items
    });
  }
  
  // Emit alert for external platform order
  const AlertsService = require('../alerts/alerts.service');
  AlertsService.alertExternalPlatformOrder({
    id: orderId,
    total: internalOrder.total,
    customer_name: internalOrder.customerName,
    items: internalOrder.items
  }, providerName.toUpperCase());
  
  // ✅ CRITICAL: Process order through unified pipeline (automatic stock consumption)
  // This ensures ALL external platform orders consume stock automatically
  const orderProcessingPipeline = require('../orders/services/order-processing-pipeline.service');
  orderProcessingPipeline.processOrderAfterCreation(orderId, {
    id: orderId,
    platform: providerName.toUpperCase(),
    order_source: 'DELIVERY',
    items: JSON.stringify(internalOrder.items),
    total: internalOrder.total,
    is_paid: internalOrder.alreadyPaid ? 1 : 0,
    status: 'pending'
  }).catch(error => {
    console.error(`[ExternalDelivery] Failed to process order ${orderId} through pipeline:`, error);
    // Don't fail order creation if pipeline processing fails
  });
  
  return {
    orderId,
    externalOrderId: internalOrder.externalOrderId,
    success: true
  };
}

/**
 * Handle order status update from external platform
 */
async function handleOrderStatus(providerName, payload) {
  const provider = providers[providerName.toLowerCase()];
  
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`);
  }
  
  const externalOrderId = payload.order_id || payload.orderId || payload.id;
  const externalStatus = payload.status || payload.order_status;
  
  if (!externalOrderId || !externalStatus) {
    throw new Error('Missing order_id or status in payload');
  }
  
  const db = await dbPromise;
  
  // Find internal order
  const order = await new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM orders 
      WHERE external_provider = ? AND external_order_id = ?
    `, [providerName.toUpperCase(), externalOrderId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!order) {
    throw new Error(`Order not found for external_order_id: ${externalOrderId}`);
  }
  
  // Normalize status
  const internalStatus = provider.normalizeGlovoStatus
    ? provider.normalizeGlovoStatus(externalStatus)
    : provider.normalizeBoltStatus
    ? provider.normalizeBoltStatus(externalStatus)
    : provider.normalizeTazzStatus
    ? provider.normalizeTazzStatus(externalStatus)
    : provider.normalizeWoltStatus
    ? provider.normalizeWoltStatus(externalStatus)
    : null;
  
  if (!internalStatus) {
    throw new Error(`Provider ${providerName} does not have normalizeStatus function`);
  }
  
  // Update order status
  const updateFields = ['status = ?'];
  const updateValues = [internalStatus];
  
  if (internalStatus === 'delivered') {
    updateFields.push('delivered_timestamp = datetime("now")');
  } else if (internalStatus === 'cancelled') {
    updateFields.push('status = "cancelled"');
  }
  
  await new Promise((resolve, reject) => {
    db.run(`
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, [...updateValues, order.id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Update assignment if exists
  const assignment = await new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM delivery_assignments 
      WHERE order_id = ? AND status NOT IN ('cancelled')
      ORDER BY assigned_at DESC LIMIT 1
    `, [order.id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (assignment) {
    let assignmentUpdate = 'status = ?';
    const assignmentValues = [internalStatus];
    
    if (internalStatus === 'picked_up') {
      assignmentUpdate += ', picked_up_at = datetime("now")';
    } else if (internalStatus === 'delivered') {
      assignmentUpdate += ', delivered_at = datetime("now")';
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_assignments 
        SET ${assignmentUpdate}
        WHERE id = ?
      `, [...assignmentValues, assignment.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  // Emit Socket.IO events
  if (global.io) {
    global.io.emit('order:updated', {
      orderId: order.id,
      status: internalStatus
    });
    
    global.io.emit('delivery:status-changed', {
      orderId: order.id,
      status: internalStatus,
      timestamp: new Date()
    });
  }
  
  // Emit alert if order was cancelled
  if (internalStatus === 'cancelled') {
    const AlertsService = require('../alerts/alerts.service');
    AlertsService.alertOrderCancelled(order, 'Cancelled by external platform', providerName.toUpperCase());
  }
  
  return {
    orderId: order.id,
    status: internalStatus,
    success: true
  };
}

module.exports = {
  handleOrderCreated,
  handleOrderStatus
};

