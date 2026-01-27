// =====================================================================
// API ROUTES: DELIVERY ORDERS
// Date: 2025-12-05
// =====================================================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const { ORDER_SOURCE } = require('../orders/unifiedOrderService');
const { PLATFORMS, PICKUP_TYPES } = require('../constants/delivery');

// Middleware
function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// =====================================================================
// COMENZI DELIVERY
// =====================================================================

/**
 * POST /api/orders/delivery - Creare comandă delivery (telefonic)
 */
router.post('/', checkAdminAuth, async (req, res) => {
  try {
    const {
      customer_name, customer_phone, delivery_address, delivery_zone_id,
      items, total, payment_method, platform, pickup_type, notes
    } = req.body;
    
    if (!customer_phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Telefon și produse sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Verifică zona de livrare (dacă e specificată)
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
      
      // Verifică valoare minimă comandă
      if (total < zone.min_order_value) {
        return res.status(400).json({ 
          error: `Valoare minimă comandă pentru zona ${zone.name}: ${zone.min_order_value} RON`,
          min_order_value: zone.min_order_value
        });
      }
    }
    
    // Calculează taxa de livrare
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
        deliveryFee = 10; // Default
      }
    }
    
    // Creează comanda
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
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('delivery:new-order', {
        orderId,
        platform: platform || PLATFORMS.PHONE,
        customerName: customer_name,
        deliveryAddress: delivery_address,
        total,
        timestamp: new Date()
      });
      
      // Emit la KDS
      global.io.emit('order:new', { orderId, type: 'delivery', items });
    }
    
    res.json({ 
      success: true, 
      order_id: orderId, 
      delivery_fee: deliveryFee,
      message: 'Comandă delivery creată cu succes' 
    });
  } catch (err) {
    console.error('Error creating delivery order:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/orders/delivery/active - Comenzi delivery active
 */
router.get('/active', checkAdminAuth, async (req, res) => {
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
    
    // Parse items pentru fiecare comandă
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
  } catch (err) {
    console.error('Error fetching active delivery orders:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/orders/delivery/monitor - Pentru ecranul TV (Monitor Delivery)
 */
router.get('/monitor', async (req, res) => {
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
    
    // Parse items și grupează pe status
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
  } catch (err) {
    console.error('Error fetching delivery monitor:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/orders/:id/delivery-details - Actualizează detalii livrare
 */
router.put('/:id/delivery-details', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_address, customer_name, customer_phone, delivery_zone_id, pickup_type } = req.body;
    const db = await dbPromise;
    
    const fields = [];
    const values = [];
    
    if (delivery_address) { fields.push('delivery_address = ?'); values.push(delivery_address); }
    if (customer_name) { fields.push('customer_name = ?'); values.push(customer_name); }
    if (customer_phone) { fields.push('customer_phone = ?'); values.push(customer_phone); }
    if (delivery_zone_id) { fields.push('delivery_zone_id = ?'); values.push(delivery_zone_id); }
    if (pickup_type) { fields.push('pickup_type = ?'); values.push(pickup_type); }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Niciun câmp de actualizat' });
    }
    
    values.push(id);
    
    await new Promise((resolve, reject) => {
      db.run(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Detalii livrare actualizate' });
  } catch (err) {
    console.error('Error updating delivery details:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/orders/:id/delivery-timeline - Cronologie completă comandă
 */
router.get('/:id/delivery-timeline', checkAdminAuth, async (req, res) => {
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
    
    // Construiește timeline
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
    
    // Verifică assignment
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
  } catch (err) {
    console.error('Error fetching delivery timeline:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

