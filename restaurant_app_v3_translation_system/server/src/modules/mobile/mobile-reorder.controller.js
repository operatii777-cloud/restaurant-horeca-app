/**
 * MOBILE APP QUICK REORDER CONTROLLER
 * 
 * Quick Reorder - reordonează comenzi anterioare
 */

const { dbPromise } = require('../../../database');

/**
 * GET /api/mobile/orders/last
 * Obține ultima comandă a utilizatorului
 */
async function getLastOrder(req, res, next) {
  try {
    const db = await dbPromise;
    const customerEmail = req.body.customer_email || req.user?.email;
    const customerPhone = req.body.customer_phone;
    
    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ success: false, error: 'Customer identifier required' });
    }
    
    let query = `
      SELECT 
        id, items, total, status, timestamp, type,
        customer_name, customer_phone, customer_email,
        delivery_address, payment_method
      FROM orders
      WHERE platform = 'MOBILE_APP'
        AND status != 'cancelled'
    `;
    const params = [];
    
    if (customerEmail) {
      query += ' AND customer_email = ?';
      params.push(customerEmail);
    } else if (customerPhone) {
      query += ' AND customer_phone = ?';
      params.push(customerPhone);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT 1';
    
    const order = await new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.json({
        success: true,
        order: null
      });
    }
    
    // Parse items
    let items = [];
    if (order.items) {
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (e) {
        items = [];
      }
    }
    
    res.json({
      success: true,
      order: {
        id: order.id,
        items: items,
        total: order.total,
        status: order.status,
        timestamp: order.timestamp,
        type: order.type,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email,
        delivery_address: order.delivery_address,
        payment_method: order.payment_method,
      }
    });
  } catch (error) {
    console.error('❌ Error in getLastOrder:', error);
    next(error);
  }
}

/**
 * GET /api/mobile/orders/frequent
 * Obține comenzi frecvente (cele mai comandate combinații)
 */
async function getFrequentOrders(req, res, next) {
  try {
    const db = await dbPromise;
    const customerEmail = req.body.customer_email || req.user?.email;
    const customerPhone = req.body.customer_phone;
    const limit = parseInt(req.query.limit) || 5;
    
    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ success: false, error: 'Customer identifier required' });
    }
    
    // Obține toate comenzile utilizatorului
    let query = `
      SELECT id, items, total, timestamp, type
      FROM orders
      WHERE platform = 'MOBILE_APP'
        AND status != 'cancelled'
    `;
    const params = [];
    
    if (customerEmail) {
      query += ' AND customer_email = ?';
      params.push(customerEmail);
    } else if (customerPhone) {
      query += ' AND customer_phone = ?';
      params.push(customerPhone);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT 50'; // Analizează ultimele 50 comenzi
    
    const orders = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Analizează combinațiile frecvente
    const orderCombinations = {};
    
    orders.forEach(order => {
      try {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        if (!Array.isArray(items) || items.length === 0) return;
        
        // Creează un hash al combinației (sortat după product_id)
        const itemIds = items
          .map(item => item.id || item.product_id || item.menu_item_id)
          .filter(Boolean)
          .sort((a, b) => a - b)
          .join(',');
        
        if (!itemIds) return;
        
        if (!orderCombinations[itemIds]) {
          orderCombinations[itemIds] = {
            items: items,
            count: 0,
            lastOrdered: order.timestamp,
            total: order.total,
            type: order.type,
          };
        }
        
        orderCombinations[itemIds].count++;
        
        // Actualizează data ultimei comenzi dacă e mai recentă
        if (new Date(order.timestamp) > new Date(orderCombinations[itemIds].lastOrdered)) {
          orderCombinations[itemIds].lastOrdered = order.timestamp;
          orderCombinations[itemIds].total = order.total;
          orderCombinations[itemIds].type = order.type;
        }
      } catch (e) {
        // Ignoră erorile de parsing
      }
    });
    
    // Sortează după frecvență și apoi după data ultimei comenzi
    const frequentOrders = Object.values(orderCombinations)
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count; // Mai frecvente primul
        }
        return new Date(b.lastOrdered) - new Date(a.lastOrdered); // Mai recente primul
      })
      .slice(0, limit)
      .map((combo, index) => ({
        id: `frequent_${index + 1}`,
        items: combo.items,
        total: combo.total,
        type: combo.type,
        count: combo.count,
        lastOrdered: combo.lastOrdered,
        label: combo.count === 1 ? 'Ultima comandă' : `Comandat ${combo.count} ori`,
      }));
    
    res.json({
      success: true,
      orders: frequentOrders
    });
  } catch (error) {
    console.error('❌ Error in getFrequentOrders:', error);
    next(error);
  }
}

/**
 * POST /api/mobile/orders/:id/reorder
 * Reordonează o comandă existentă
 */
async function reorderOrder(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const customerEmail = req.body.customer_email || req.user?.email;
    const customerPhone = req.body.customer_phone;
    
    if (!customerEmail && !customerPhone) {
      return res.status(400).json({ success: false, error: 'Customer identifier required' });
    }
    
    // Obține comanda originală
    let query = `
      SELECT * FROM orders
      WHERE id = ? AND platform = 'MOBILE_APP'
    `;
    const params = [id];
    
    if (customerEmail) {
      query += ' AND customer_email = ?';
      params.push(customerEmail);
    } else if (customerPhone) {
      query += ' AND customer_phone = ?';
      params.push(customerPhone);
    }
    
    const originalOrder = await new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!originalOrder) {
      return res.status(404).json({ success: false, error: 'Comandă negăsită' });
    }
    
    // Parse items
    let items = [];
    if (originalOrder.items) {
      try {
        items = typeof originalOrder.items === 'string' 
          ? JSON.parse(originalOrder.items) 
          : originalOrder.items;
      } catch (e) {
        items = [];
      }
    }
    
    if (items.length === 0) {
      return res.status(400).json({ success: false, error: 'Comanda nu are produse' });
    }
    
    // Returnează datele comenzii pentru a fi adăugate în coș
    res.json({
      success: true,
      message: 'Comandă pregătită pentru reordonare',
      order: {
        items: items,
        total: originalOrder.total,
        type: originalOrder.type,
        delivery_address: originalOrder.delivery_address,
        payment_method: originalOrder.payment_method,
        customer_name: originalOrder.customer_name,
        customer_phone: originalOrder.customer_phone,
        customer_email: originalOrder.customer_email,
      }
    });
  } catch (error) {
    console.error('❌ Error in reorderOrder:', error);
    next(error);
  }
}

module.exports = {
  getLastOrder,
  getFrequentOrders,
  reorderOrder,
};
