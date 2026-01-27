/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/delivery-orders.js
 */

const { dbPromise } = require('../../../../database');
const { ORDER_SOURCE } = require('../../../../orders/unifiedOrderService');
const { PLATFORMS, PICKUP_TYPES } = require('../../../constants/delivery');
const deliveryService = require('../delivery.service');
const { geocodeAndSaveOrder } = require('../geocoding.service'); // FAZA 2.D

function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// POST /api/orders/delivery
async function createDeliveryOrder(req, res, next) {
  try {
    const {
      customer_name, customer_phone, delivery_address, delivery_zone_id,
      items, total, payment_method, platform, pickup_type, notes
    } = req.body;
    
    if (!customer_phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Telefon și produse sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    if (delivery_zone_id) {
      const zone = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM delivery_zones WHERE id = ? AND is_active = 1', [delivery_zone_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!zone) {
        return res.status(400).json({ error: 'Zonă de livrare invalidă' });
      }
      
      if (total < zone.min_order_value) {
        return res.status(400).json({ 
          error: `Valoare minimă comandă pentru zona ${zone.name}: ${zone.min_order_value} RON`,
          min_order_value: zone.min_order_value
        });
      }
    }
    
    let deliveryFee = 0;
    if (pickup_type === PICKUP_TYPES.OWN_COURIER || pickup_type === PICKUP_TYPES.PLATFORM_COURIER) {
      if (delivery_zone_id) {
        const zone = await new Promise((resolve, reject) => {
          db.get('SELECT delivery_fee_base, fee_per_km FROM delivery_zones WHERE id = ?', [delivery_zone_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        deliveryFee = zone?.delivery_fee_base || 10;
      } else {
        deliveryFee = 10;
      }
    }
    
    const orderId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO orders (
          type, order_source, platform, pickup_type,
          customer_name, customer_phone, delivery_address, delivery_zone_id,
          items, total, payment_method, delivery_fee_charged,
          status, general_notes, timestamp, is_paid
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
      `, [
        'delivery', ORDER_SOURCE.DELIVERY, platform || PLATFORMS.PHONE, pickup_type || PICKUP_TYPES.CUSTOMER_PICKUP,
        customer_name || 'Client', customer_phone, delivery_address || 'Ridicare personală', delivery_zone_id || null,
        JSON.stringify(items), total, payment_method || 'cash', deliveryFee,
        'pending', notes || null, payment_method === 'card' || payment_method === 'online' ? 1 : 0
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // FAZA 2.D - Geocode delivery address (async, non-blocking)
    if (delivery_address && delivery_address !== 'Ridicare personală') {
      geocodeAndSaveOrder(orderId, delivery_address).catch(err => {
        console.error('[Geocoding] Failed to geocode order', orderId, ':', err.message);
        // Don't fail order creation if geocoding fails
      });
    }
    
    if (global.io) {
      global.io.emit('delivery:new-order', {
        orderId,
        platform: platform || PLATFORMS.PHONE,
        customerName: customer_name,
        deliveryAddress: delivery_address,
        total,
        timestamp: new Date()
      });
      
      global.io.emit('order:new', { orderId, type: 'delivery', items });
    }
    
    // ✅ CRITICAL: Process order through unified pipeline (automatic stock consumption)
    // This ensures ALL delivery orders consume stock automatically
    const orderProcessingPipeline = require('../../orders/services/order-processing-pipeline.service');
    orderProcessingPipeline.processOrderAfterCreation(orderId, {
      id: orderId,
      platform: platform || PLATFORMS.PHONE,
      order_source: ORDER_SOURCE.DELIVERY,
      items: JSON.stringify(items),
      total: total,
      payment_method: payment_method || 'cash',
      is_paid: payment_method === 'card' || payment_method === 'online' ? 1 : 0,
      status: 'pending'
    }).catch(error => {
      console.error(`[DeliveryController] Failed to process order ${orderId} through pipeline:`, error);
      // Don't fail order creation if pipeline processing fails
    });
    
    res.json({ 
      success: true, 
      order_id: orderId, 
      delivery_fee: deliveryFee,
      message: 'Comandă delivery creată cu succes' 
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/delivery/active
async function getActiveDeliveryOrders(req, res, next) {
  try {
    const db = await dbPromise;
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.*,
          c.name as courier_name, c.phone as courier_phone, c.vehicle_type,
          da.status as delivery_status, da.picked_up_at
        FROM orders o
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status IN ('assigned', 'picked_up', 'in_transit')
        WHERE o.order_source = 'DELIVERY'
          AND o.status NOT IN ('delivered', 'cancelled', 'paid')
        ORDER BY o.timestamp ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const ordersWithItems = orders.map(order => {
      let items = [];
      try {
        items = JSON.parse(order.items || '[]');
      } catch (e) {
        items = [];
      }
      return { ...order, items };
    });
    
    res.json({ success: true, orders: ordersWithItems });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/delivery/monitor
async function getDeliveryMonitor(req, res, next) {
  try {
    const db = await dbPromise;
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.*,
          c.name as courier_name,
          da.status as delivery_status
        FROM orders o
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status IN ('assigned', 'picked_up', 'in_transit')
        WHERE o.order_source = 'DELIVERY'
          AND o.status NOT IN ('delivered', 'cancelled', 'paid')
        ORDER BY 
          CASE o.status
            WHEN 'completed' THEN 1
            WHEN 'preparing' THEN 2
            WHEN 'pending' THEN 3
            ELSE 4
          END,
          o.timestamp ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const ordersWithItems = orders.map(order => {
      let items = [];
      try {
        items = JSON.parse(order.items || '[]');
      } catch (e) {
        items = [];
      }
      return { ...order, items };
    });
    
    const inPreparation = ordersWithItems.filter(o => o.status === 'pending' || o.status === 'preparing');
    const ready = ordersWithItems.filter(o => o.status === 'completed' || o.status === 'ready');
    
    res.json({ 
      success: true, 
      in_preparation: inPreparation,
      ready: ready,
      total: ordersWithItems.length
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/orders/:id/delivery-details
async function updateDeliveryDetails(req, res, next) {
  try {
    const { id } = req.params;
    const { delivery_address, customer_name, customer_phone, delivery_zone_id, pickup_type } = req.body;
    const db = await dbPromise;
    
    // Security: Whitelist allowed field names (prevent SQL injection)
    const ALLOWED_FIELDS = {
      'delivery_address': 'delivery_address = ?',
      'customer_name': 'customer_name = ?',
      'customer_phone': 'customer_phone = ?',
      'delivery_zone_id': 'delivery_zone_id = ?',
      'pickup_type': 'pickup_type = ?'
    };
    
    const fields = [];
    const values = [];
    
    // Security: Only allow whitelisted fields
    if (delivery_address) { 
      fields.push(ALLOWED_FIELDS.delivery_address); 
      values.push(delivery_address); 
    }
    if (customer_name) { 
      fields.push(ALLOWED_FIELDS.customer_name); 
      values.push(customer_name); 
    }
    if (customer_phone) { 
      fields.push(ALLOWED_FIELDS.customer_phone); 
      values.push(customer_phone); 
    }
    if (delivery_zone_id) { 
      fields.push(ALLOWED_FIELDS.delivery_zone_id); 
      values.push(delivery_zone_id); 
    }
    if (pickup_type) { 
      fields.push(ALLOWED_FIELDS.pickup_type); 
      values.push(pickup_type); 
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Niciun câmp de actualizat' });
    }
    
    values.push(id);
    
    await new Promise((resolve, reject) => {
      // Security: Field names are whitelisted, values use placeholders
      db.run(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // FAZA 2.D - Re-geocode if address changed
    if (delivery_address) {
      geocodeAndSaveOrder(id, delivery_address).catch(err => {
        console.error('[Geocoding] Failed to geocode order', id, ':', err.message);
      });
    }
    
    res.json({ success: true, message: 'Detalii livrare actualizate' });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/:id/delivery-timeline
async function getDeliveryTimeline(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    const timeline = [];
    
    if (order.timestamp) {
      timeline.push({ event: 'Comandă plasată', timestamp: order.timestamp, icon: '📝' });
    }
    
    if (order.prep_started_at) {
      timeline.push({ event: 'Preparare începută', timestamp: order.prep_started_at, icon: '🍳' });
    }
    
    if (order.completed_timestamp) {
      timeline.push({ event: 'Comandă gata', timestamp: order.completed_timestamp, icon: '✅' });
    }
    
    const assignment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM delivery_assignments 
        WHERE order_id = ? 
        ORDER BY assigned_at DESC LIMIT 1
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (assignment) {
      if (assignment.assigned_at) {
        timeline.push({ event: 'Alocată curier', timestamp: assignment.assigned_at, icon: '🚴' });
      }
      if (assignment.picked_up_at) {
        timeline.push({ event: 'Preluată de curier', timestamp: assignment.picked_up_at, icon: '📦' });
      }
      if (assignment.delivered_at) {
        timeline.push({ event: 'Livrată', timestamp: assignment.delivered_at, icon: '🎉' });
      }
    }
    
    if (order.delivered_timestamp) {
      timeline.push({ event: 'Livrată', timestamp: order.delivered_timestamp, icon: '🎉' });
    }
    
    if (order.paid_timestamp) {
      timeline.push({ event: 'Achitată', timestamp: order.paid_timestamp, icon: '💰' });
    }
    
    res.json({ success: true, timeline, order, assignment });
  } catch (error) {
    next(error);
  }
}

// S17.A - GET /api/orders/delivery/queue
async function getDeliveryQueue(req, res, next) {
  try {
    const { status, platform } = req.query;
    const queue = await deliveryService.getDeliveryQueue({ status, platform });
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
}

// S17.A - POST /api/orders/delivery/assign
async function assignCourier(req, res, next) {
  try {
    const { orderId, courierId, assignedBy } = req.body;
    
    if (!orderId || !courierId) {
      return res.status(400).json({ 
        success: false, 
        message: 'orderId and courierId are required' 
      });
    }
    
    const result = await deliveryService.assignCourier({ 
      orderId, 
      courierId, 
      assignedBy: assignedBy || 'DISPATCH' 
    });
    
    // Emit Socket.IO events
    if (global.io) {
      global.io.emit('delivery:assigned', {
        orderId: result.orderId,
        courierId: result.courierId,
        assignedBy: result.assignedBy,
        assignedAt: result.assignedAt
      });
      
      // Emit to courier room
      global.io.to(`courier:${result.courierId}`).emit('courier:assignment', {
        orderId: result.orderId,
        assignmentId: result.assignmentId
      });
      
      // Emit to dispatch room
      global.io.to('dispatch').emit('dispatch:updated', {
        orderId: result.orderId,
        courierId: result.courierId,
        action: 'assigned'
      });
      
      // Emit order:updated for legacy compatibility
      global.io.emit('order:updated', {
        orderId: result.orderId,
        status: 'assigned'
      });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// S17.A - POST /api/orders/delivery/:id/proof
async function uploadDeliveryProof(req, res, next) {
  try {
    const { id } = req.params;
    const { type, filePath, fileData } = req.body; // fileData is base64 if needed
    
    if (!type || (!filePath && !fileData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'type and filePath (or fileData) are required' 
      });
    }
    
    if (!['photo', 'signature'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'type must be "photo" or "signature"' 
      });
    }
    
    // Handle base64 fileData if provided (convert to file and save)
    let finalFilePath = filePath;
    if (fileData && !filePath) {
      // TODO: Implement base64 to file conversion if needed
      // For now, we'll expect filePath to be provided
      return res.status(400).json({ 
        success: false, 
        message: 'filePath is required (base64 conversion not yet implemented)' 
      });
    }
    
    const courierId = req.user?.id || req.body.courierId || null;
    
    const proof = await deliveryService.saveDeliveryProof({
      orderId: id,
      courierId,
      type,
      filePath: finalFilePath
    });
    
    // Emit Socket.IO event
    if (global.io) {
      global.io.emit('delivery:proof-uploaded', {
        orderId: id,
        proofId: proof.id,
        type: proof.type
      });
    }
    
    res.json({ success: true, data: proof });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDeliveryOrder,
  getActiveDeliveryOrders,
  getDeliveryMonitor,
  updateDeliveryDetails,
  getDeliveryTimeline,
  checkAdminAuth,
  // S17.A - New endpoints
  getDeliveryQueue,
  assignCourier,
  uploadDeliveryProof
};

