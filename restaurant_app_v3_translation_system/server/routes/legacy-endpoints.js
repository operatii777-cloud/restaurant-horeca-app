/**
 * LEGACY ENDPOINTS
 * 
 * Centralized routes for legacy HTML pages
 * These endpoints are used by legacy admin.html, admin-advanced.html, 
 * comanda.html, livrare1.html, kds.html, etc.
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const adminController = require('../src/modules/admin/controllers/admin.controller');

// ========================================
// ADMIN ENDPOINTS (Legacy admin.html, admin-advanced.html)
// ========================================

// Categories
router.get('/admin/categories', async (req, res) => {
  try {
    const db = await dbPromise;
    const categories = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM catalog_categories
        WHERE is_active = 1
        ORDER BY display_order, name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ Error in /api/admin/categories:', error);
    res.json({ success: true, categories: [] });
  }
});

// Products (alias for /api/admin/products)
router.get('/admin/products', async (req, res) => {
  try {
    // Try to use adminController.getProducts if available
    if (adminController.getProducts && typeof adminController.getProducts === 'function') {
      return adminController.getProducts(req, res, () => { });
    }

    // Fallback to direct query
    const db = await dbPromise;
    const products = await new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, c.name as category_name
        FROM catalog_products p
        LEFT JOIN catalog_categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        ORDER BY c.display_order, p.display_order, p.name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Error in /api/admin/products:', error);
    res.json({ success: true, products: [] });
  }
});

// GET /api/admin/products/:id/customizations
router.get('/admin/products/:id/customizations', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Check if customization_options table exists
    const tableExists = await new Promise((resolve, reject) => {
      db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='customization_options'
      `, (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });

    if (!tableExists) {
      return res.json({
        success: true,
        customizations: []
      });
    }

    // Get customizations for this product
    // Try both menu_item_id and product_id columns
    const customizations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          option_name,
          option_name_en,
          option_type,
          extra_price,
          is_active,
          display_order
        FROM customization_options
        WHERE (menu_item_id = ? OR product_id = ?)
          AND is_active = 1
        ORDER BY display_order, option_name
      `, [id, id], (err, rows) => {
        if (err) {
          // If column doesn't exist, try alternative query
          db.all(`
            SELECT 
              id,
              option_name,
              option_name_en,
              option_type,
              extra_price,
              is_active,
              display_order
            FROM customization_options
            WHERE menu_item_id = ?
              AND is_active = 1
            ORDER BY display_order, option_name
          `, [id], (err2, rows2) => {
            if (err2) reject(err2);
            else resolve(rows2 || []);
          });
        } else {
          resolve(rows || []);
        }
      });
    });

    res.json({
      success: true,
      customizations: customizations || []
    });
  } catch (error) {
    console.error('❌ Error in /api/admin/products/:id/customizations:', error);
    res.json({
      success: true,
      customizations: []
    });
  }
});

// Waiters
router.get('/admin/waiters', async (req, res) => {
  try {
    const db = await dbPromise;
    const waiters = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.*, ur.role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.role_id = ur.id
        WHERE ur.role_name = 'waiter' OR ur.role_name = 'supervisor'
        ORDER BY u.username
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, waiters });
  } catch (error) {
    console.error('❌ Error in /api/admin/waiters:', error);
    res.json({ success: true, waiters: [] });
  }
});

// Top Products
router.get('/admin/top-products', async (req, res) => {
  try {
    const db = await dbPromise;
    const { startDate, endDate, days = 30 } = req.query;

    // Folosim json_each ca în getProfitabilityReport
    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'DATE(o.timestamp) BETWEEN ? AND ?';
      params = [startDate, endDate];
    } else {
      dateFilter = 'o.timestamp >= datetime(\'now\', \'-\' || ? || \' days\')';
      params = [days];
    }

    const topProducts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(json_extract(item.value, '$.productName'), json_extract(item.value, '$.name')) as name,
          COALESCE(json_extract(item.value, '$.category'), m.category, 'Fără categorie') as category,
          COUNT(DISTINCT o.id) as times_ordered,
          SUM(CAST(COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1) AS REAL)) as total_quantity,
          SUM(CAST(COALESCE(json_extract(item.value, '$.finalPrice'), json_extract(item.value, '$.total'), json_extract(item.value, '$.price') * COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1)) AS REAL)) as total_value
        FROM orders o
        JOIN json_each(o.items) item
        LEFT JOIN menu m ON json_extract(item.value, '$.productId') = m.id OR json_extract(item.value, '$.id') = m.id
        WHERE ${dateFilter}
          AND o.status IN ('paid', 'completed', 'delivered')
          AND (json_extract(item.value, '$.productName') IS NOT NULL OR json_extract(item.value, '$.name') IS NOT NULL)
        GROUP BY 
          COALESCE(json_extract(item.value, '$.productName'), json_extract(item.value, '$.name')),
          COALESCE(json_extract(item.value, '$.category'), m.category, 'Fără categorie')
        ORDER BY total_value DESC
        LIMIT 20
      `, params, (err, rows) => {
        if (err) {
          console.error('❌ Error querying top products:', err);
          resolve([]);
        } else {
          // Transformăm pentru compatibilitate cu frontend
          const transformed = (rows || []).map(row => ({
            name: row.name || 'Produs necunoscut',
            category: row.category || 'Fără categorie',
            total_quantity: Number(row.total_quantity) || 0,
            total_value: Number(row.total_value) || 0,
            times_ordered: Number(row.times_ordered) || 0
          }));
          resolve(transformed);
        }
      });
    });

    // Calculează statistici
    const stats = {
      total_quantity: topProducts.reduce((sum, p) => sum + (p.total_quantity || 0), 0),
      total_value: topProducts.reduce((sum, p) => sum + (p.total_value || 0), 0)
    };

    res.json({ success: true, products: topProducts, stats });
  } catch (error) {
    console.error('❌ Error in /api/admin/top-products:', error);
    res.json({ success: true, products: [], stats: { total_quantity: 0, total_value: 0 } });
  }
});

// ========================================
// ORDERS ENDPOINTS (Legacy comanda.html, livrare1.html, kds.html)
// ========================================

// Orders Cancelled
// Modified to return only today's cancelled orders
router.get('/orders-cancelled', async (req, res) => {
  try {
    const db = await dbPromise;
    const { lang = 'ro' } = req.query;

    // Obține doar comenzile anulate din ziua curentă
    // Folosesc strftime pentru filtrare precisă pe ziua curentă
    const cancelledOrders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders
        WHERE status = 'cancelled'
          AND cancelled_timestamp IS NOT NULL
          AND strftime('%Y-%m-%d', cancelled_timestamp) = strftime('%Y-%m-%d', 'now')
        ORDER BY cancelled_timestamp DESC
        LIMIT 500
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const processedOrders = cancelledOrders.map(order => {
      let items = [];
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      } catch (e) {
        items = [];
      }
      return { ...order, items };
    });

    const today = new Date().toLocaleDateString('ro-RO');
    console.log(`✅ [legacy-endpoints] Returnat ${processedOrders.length} comenzi anulate din ziua curentă (${today})`);
    res.json({ success: true, orders: processedOrders });
  } catch (error) {
    console.error('❌ Error in /api/orders-cancelled:', error);
    res.json({ success: true, orders: [] });
  }
});

// Orders Display - Kitchen Unfinished
router.get('/orders-display/kitchen/unfinished', async (req, res) => {
  try {
    const db = await dbPromise;
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, 
          GROUP_CONCAT(oi.name || ' x' || oi.quantity) as items_summary
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status IN ('pending', 'preparing', 'confirmed')
          AND o.order_source != 'DELIVERY'
          AND DATE(o.timestamp) = DATE('now')
        GROUP BY o.id
        ORDER BY o.timestamp ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error in /api/orders-display/kitchen/unfinished:', error);
    res.json({ success: true, orders: [] });
  }
});

// ✅ FIX: Main /orders-display/bar endpoint (called by comenzi bar.html)
router.get('/orders-display/bar', adminController.getOrdersDisplayBar);

// ✅ FIX: Main /orders-display/kitchen endpoint (called by kds.html)
router.get('/orders-display/kitchen', adminController.getOrdersDisplayKitchen);

// Orders Display - Bar
router.get('/orders-display/bar/pending', async (req, res) => {
  try {
    const db = await dbPromise;
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN menu m ON oi.product_id = m.id
        WHERE o.status = 'pending'
          AND m.category LIKE '%Băuturi%'
          AND DATE(o.timestamp) = DATE('now')
        GROUP BY o.id
        ORDER BY o.timestamp ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error in /api/orders-display/bar/pending:', error);
    res.json({ success: true, orders: [] });
  }
});

router.get('/orders-display/bar/unfinished', async (req, res) => {
  try {
    const db = await dbPromise;
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN menu m ON oi.product_id = m.id
        WHERE o.status IN ('pending', 'preparing', 'confirmed')
          AND m.category LIKE '%Băuturi%'
          AND DATE(o.timestamp) = DATE('now')
        GROUP BY o.id
        ORDER BY o.timestamp ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error in /api/orders-display/bar/unfinished:', error);
    res.json({ success: true, orders: [] });
  }
});

router.get('/orders-display/bar/recent-completed', async (req, res) => {
  try {
    const db = await dbPromise;
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN menu m ON oi.product_id = m.id
        WHERE o.status = 'completed'
          AND m.category LIKE '%Băuturi%'
          AND DATE(o.timestamp) = DATE('now')
        GROUP BY o.id
        ORDER BY o.timestamp DESC
        LIMIT 50
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error in /api/orders-display/bar/recent-completed:', error);
    res.json({ success: true, orders: [] });
  }
});

router.get('/orders-display/bar/all-daily', async (req, res) => {
  try {
    const db = await dbPromise;
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN menu m ON oi.product_id = m.id
        WHERE m.category LIKE '%Băuturi%'
          AND DATE(o.timestamp) = DATE('now')
        GROUP BY o.id
        ORDER BY o.timestamp DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error in /api/orders-display/bar/all-daily:', error);
    res.json({ success: true, orders: [] });
  }
});

// Daily History
router.get('/daily-history/kitchen', async (req, res) => {
  try {
    const db = await dbPromise;
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*
        FROM orders o
        WHERE DATE(o.timestamp) = DATE('now')
          AND o.order_source != 'DELIVERY'
        ORDER BY o.timestamp DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // ✅ FIX: Filter items WITHIN each order to show only KITCHEN items
    const kitchenOrders = orders.map(order => {
      try {
        let items = [];
        if (order.items) {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        }

        // Filter to only include kitchen items (based on station or category)
        const kitchenItems = items.filter(item => {
          // Check station field first (most reliable)
          if (item.station) {
            return item.station.toLowerCase() === 'kitchen';
          }
          // Fallback: check category - exclude bar categories
          const barCategories = ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri',
            'Băuturi Spirtoase', 'Coctailuri Non-Alcoolice', 'Vinuri',
            'Cafea/Ciocolata/Ceai', 'Racoritoare', 'Bauturi si Coctailuri',
            'Bauturi Spirtoase'];
          const itemCategory = item.category || item.category_name || '';
          return !barCategories.some(bc => itemCategory.toLowerCase().includes(bc.toLowerCase()));
        });

        // Only include orders that have at least one kitchen item
        if (kitchenItems.length === 0) return null;

        return {
          ...order,
          items: JSON.stringify(kitchenItems),
          items_count: kitchenItems.length
        };
      } catch (e) {
        return order;
      }
    }).filter(order => order !== null);

    res.json({ success: true, orders: kitchenOrders });
  } catch (error) {
    console.error('❌ Error in /api/daily-history/kitchen:', error);
    res.json({ success: true, orders: [] });
  }
});

router.get('/daily-history/bar', async (req, res) => {
  try {
    const db = await dbPromise;
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*
        FROM orders o
        WHERE DATE(o.timestamp) = DATE('now')
        ORDER BY o.timestamp DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // ✅ FIX: Filter items WITHIN each order to show only BAR items
    const barOrders = orders.map(order => {
      try {
        let items = [];
        if (order.items) {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        }

        // Filter to only include bar items (based on station or category)
        const barItems = items.filter(item => {
          // Check station field first (most reliable)
          if (item.station) {
            return item.station.toLowerCase() === 'bar';
          }
          // Fallback: check category for bar categories
          const barCategories = ['Cafea/Ciocolată/Ceai', 'Răcoritoare', 'Băuturi și Coctailuri',
            'Băuturi Spirtoase', 'Coctailuri Non-Alcoolice', 'Vinuri',
            'Cafea/Ciocolata/Ceai', 'Racoritoare', 'Bauturi si Coctailuri',
            'Bauturi Spirtoase'];
          const itemCategory = item.category || item.category_name || '';
          return barCategories.some(bc => itemCategory.toLowerCase().includes(bc.toLowerCase())) ||
            itemCategory.toLowerCase().includes('băuturi') ||
            itemCategory.toLowerCase().includes('bauturi');
        });

        // Only include orders that have at least one bar item
        if (barItems.length === 0) return null;

        return {
          ...order,
          items: JSON.stringify(barItems),
          items_count: barItems.length
        };
      } catch (e) {
        return order;
      }
    }).filter(order => order !== null);

    res.json({ success: true, orders: barOrders });
  } catch (error) {
    console.error('❌ Error in /api/daily-history/bar:', error);
    res.json({ success: true, orders: [] });
  }
});

// ========================================
// VERIFY PIN ENDPOINTS
// ========================================

router.post('/verify-pin', async (req, res) => {
  try {
    const { pin, role } = req.body;
    const db = await dbPromise;

    if (!pin || pin.length !== 4) {
      return res.json({ success: false, valid: false, error: 'PIN-ul trebuie să aibă 4 cifre' });
    }

    // Fallback: PIN-ul default 5555 pentru admin (acceptat direct)
    if (pin === '5555') {
      return res.json({
        success: true,
        valid: true,
        user: { id: 1, username: 'admin', role: 'admin' }
      });
    }

    // Verifică în tabelul users după coloana pin
    let user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE pin = ?', [pin], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Dacă nu găsește în users, verifică în waiters
    if (!user) {
      user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM waiters WHERE pin = ?', [pin], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }

    // Verifică în user_pins (legacy)
    if (!user) {
      user = await new Promise((resolve, reject) => {
        db.get(`
          SELECT u.*, up.pin
          FROM users u
          INNER JOIN user_pins up ON u.id = up.user_id
          WHERE up.pin = ? AND (up.role = ? OR ? IS NULL)
        `, [pin, role, role], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }

    if (user) {
      res.json({
        success: true,
        valid: true,
        user: {
          id: user.id,
          username: user.username || user.name,
          role: user.role || 'staff'
        }
      });
    } else {
      res.json({ success: true, valid: false, error: 'PIN incorect' });
    }
  } catch (error) {
    console.error('❌ Error in /api/verify-pin:', error);
    res.json({ success: false, valid: false, error: error.message });
  }
});

router.post('/verify-supervisor-pin', async (req, res) => {
  try {
    const { pin } = req.body;
    const db = await dbPromise;

    const user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.*, up.pin
        FROM users u
        INNER JOIN user_pins up ON u.id = up.user_id
        WHERE up.pin = ? AND (u.role = 'supervisor' OR u.role = 'admin')
      `, [pin], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.json({ success: false, error: 'Invalid supervisor PIN' });
    }
  } catch (error) {
    console.error('❌ Error in /api/verify-supervisor-pin:', error);
    res.json({ success: false, error: error.message });
  }
});

// ========================================
// ORDERS CREATION (Legacy comanda.html, comanda-supervisor.html)
// ========================================

// POST /api/orders - Alias pentru /api/orders/create
router.post('/orders', async (req, res) => {
  try {
    // Redirect to orders module createOrder
    const ordersController = require('../src/modules/orders/controllers/orders.controller');
    return ordersController.createOrder(req, res, () => { });
  } catch (error) {
    console.error('❌ Error in /api/orders (POST):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/supervisor/unpaid-orders - Comenzi supervisor neachitate (doar din ziua curentă)
router.get('/supervisor/unpaid-orders', async (req, res) => {
  try {
    const db = await dbPromise;

    // Obține toate comenzile supervisor neachitate din ziua curentă
    const orders = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM orders 
              WHERE client_identifier LIKE 'Client %' 
                AND status IN ('pending', 'preparing', 'completed', 'delivered')
                AND is_paid = 0
                AND DATE(timestamp) = DATE('now')
              ORDER BY timestamp DESC`,
        [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
    });

    // Procesează comenzile
    const processedOrders = orders.map(order => {
      let items = [];
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      } catch (e) {
        items = [];
      }

      return {
        id: order.id,
        table_number: order.table_number,
        client_identifier: order.client_identifier,
        status: order.status,
        timestamp: order.timestamp,
        total: order.total,
        items: items
      };
    });

    res.json({ success: true, orders: processedOrders });
  } catch (error) {
    console.error('❌ Error in /api/supervisor/unpaid-orders:', error);
    res.json({ success: true, orders: [] });
  }
});

// GET /api/orders/unpaid/:tableNumber/:clientIdentifier - Comenzi neachitate pentru masă (doar din ziua curentă)
router.get('/orders/unpaid/:tableNumber/:clientIdentifier', async (req, res) => {
  try {
    const db = await dbPromise;
    const { tableNumber, clientIdentifier } = req.params;

    const orders = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM orders 
              WHERE table_number = ? 
                AND client_identifier = ? 
                AND is_paid = 0
                AND DATE(timestamp) = DATE('now')
              ORDER BY timestamp ASC`,
        [tableNumber, clientIdentifier], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
    });

    const processedOrders = orders.map(order => {
      let items = [];
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      } catch (e) {
        items = [];
      }
      return { ...order, items };
    });

    res.json({ success: true, orders: processedOrders });
  } catch (error) {
    console.error('❌ Error in /api/orders/unpaid/:tableNumber/:clientIdentifier:', error);
    res.json({ success: true, orders: [] });
  }
});

// POST /api/supervisor/orders - Comenzi supervisor
router.post('/supervisor/orders', async (req, res) => {
  try {
    const db = await dbPromise;
    const {
      items = [],
      table,
      customer,
      notes,
      total,
      payment_method,
      waiter_id
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Produse sunt obligatorii' });
    }

    // Calculează totalul dacă nu este furnizat
    let calculatedTotal = total;
    if (!calculatedTotal || calculatedTotal <= 0) {
      calculatedTotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
      }, 0);
    }

    // Inserează comanda cu order_source = 'supervisor'
    const orderId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO orders (
          type, order_source, table_number, items, total, payment_method,
          status, general_notes, timestamp, is_paid, waiter_id
        ) VALUES (?, 'supervisor', ?, ?, ?, ?, 'pending', ?, datetime('now'), ?, ?)
      `, [
        'dine_in',
        table || null,
        JSON.stringify(items),
        calculatedTotal,
        payment_method || null,
        notes || null,
        payment_method ? 1 : 0,
        waiter_id || null
      ], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    // Inserează order_items
    try {
      const orderItemsExists = await db.get(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='order_items'
      `);

      if (orderItemsExists) {
        for (const item of items) {
          await new Promise((resolve, reject) => {
            db.run(`
              INSERT INTO order_items (
                order_id, product_id, name, quantity, price, total, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              orderId,
              item.product_id || item.id || null,
              item.name || '',
              item.quantity || 1,
              item.price || 0,
              (item.price || 0) * (item.quantity || 1),
              item.notes || null
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error inserting order_items:', error.message);
    }

    // Emit Socket.io event
    if (global.io) {
      global.io.emit('order:new', {
        orderId,
        type: 'dine_in',
        items,
        table,
        total: calculatedTotal,
        order_source: 'supervisor'
      });
    }

    res.json({
      success: true,
      orderId: orderId
    });
  } catch (error) {
    console.error('❌ Error in /api/supervisor/orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// PROMOTIONS ENDPOINTS (Legacy comanda.html)
// ========================================

// GET /api/daily-offer/check - Verifică ofertă zilnică
router.get('/daily-offer/check', async (req, res) => {
  try {
    const db = await dbPromise;
    const today = new Date().toISOString().split('T')[0];

    const offer = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM daily_offers
        WHERE date = ? AND is_active = 1
        ORDER BY id DESC
        LIMIT 1
      `, [today], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (offer) {
      res.json({ success: true, offer });
    } else {
      res.json({ success: true, offer: null });
    }
  } catch (error) {
    console.error('❌ Error in /api/daily-offer/check:', error);
    res.json({ success: true, offer: null });
  }
});

// GET /api/daily-menu - Meniu zilnic
router.get('/daily-menu', async (req, res) => {
  try {
    const db = await dbPromise;
    const today = new Date().toISOString().split('T')[0];

    // Query pentru daily menu din tabela daily_menu (nu daily_menu_items)
    const dailyMenuRow = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM daily_menu
        WHERE date = ? AND is_active = 1
        ORDER BY created_at DESC
        LIMIT 1
      `, [today], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!dailyMenuRow) {
      return res.json({ success: true, menu: null, soup: null, main_course: null, discount: 0, total: 0 });
    }

    // Obține produsele din menu
    const soup = dailyMenuRow.soup_id ? await new Promise((resolve, reject) => {
      db.get(`SELECT id, name, price, description, image_url, category FROM menu WHERE id = ?`, [dailyMenuRow.soup_id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    }) : null;

    const mainCourse = dailyMenuRow.main_course_id ? await new Promise((resolve, reject) => {
      db.get(`SELECT id, name, price, description, image_url, category FROM menu WHERE id = ?`, [dailyMenuRow.main_course_id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    }) : null;

    const discount = dailyMenuRow.discount || 0;
    const total = (soup ? soup.price : 0) + (mainCourse ? mainCourse.price : 0) - discount;

    res.json({
      success: true,
      menu: dailyMenuRow,
      soup: soup,
      main_course: mainCourse,
      discount: discount,
      total: total
    });
  } catch (error) {
    console.error('❌ Error in /api/daily-menu:', error);
    res.json({ success: true, menu: null, soup: null, main_course: null, discount: 0, total: 0 });
  }
});

// GET /api/happy-hour/active - Happy Hour activ
router.get('/happy-hour/active', async (req, res) => {
  try {
    const db = await dbPromise;
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    const happyHour = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM happy_hour_settings
        WHERE day_of_week = ? 
          AND start_hour <= ? 
          AND end_hour > ?
          AND is_active = 1
        ORDER BY id DESC
        LIMIT 1
      `, [currentDay, currentHour, currentHour], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (happyHour) {
      res.json({ success: true, active: true, settings: happyHour });
    } else {
      res.json({ success: true, active: false, settings: null });
    }
  } catch (error) {
    console.error('❌ Error in /api/happy-hour/active:', error);
    res.json({ success: true, active: false, settings: null });
  }
});

// ========================================
// 🌐 MISSING TRANSLATIONS ENDPOINTS
// ========================================

const fs = require('fs');
const path = require('path');

// Path pentru fișierul de missing translations
const missingTranslationsPath = path.join(__dirname, '..', 'missing-translations.json');

// Funcție helper pentru a citi missing translations
function readMissingTranslations() {
  try {
    if (fs.existsSync(missingTranslationsPath)) {
      const content = fs.readFileSync(missingTranslationsPath, 'utf8');
      return JSON.parse(content);
    }
    return [];
  } catch (error) {
    console.error('❌ Error reading missing translations:', error);
    return [];
  }
}

// Funcție helper pentru a scrie missing translations
function writeMissingTranslations(translations) {
  try {
    fs.writeFileSync(missingTranslationsPath, JSON.stringify(translations, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('❌ Error writing missing translations:', error);
    return false;
  }
}

/**
 * POST /api/missing-translations
 * 
 * Raportează traduceri lipsă de la client
 * Body: { keys: string[] }
 */
router.post('/missing-translations', async (req, res) => {
  try {
    const { keys } = req.body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return res.json({
        success: true,
        message: 'No keys provided',
        keys_recorded: 0,
        total_keys: 0
      });
    }

    const existing = readMissingTranslations();
    const existingKeys = new Set(existing.map(t => t.key));
    let newKeysCount = 0;

    // Adaugă chei noi
    for (const key of keys) {
      if (!existingKeys.has(key)) {
        existing.push({
          key,
          status: 'reported',
          reported_at: new Date().toISOString(),
          notes: '',
          translation_ro: '',
          translation_en: ''
        });
        newKeysCount++;
      }
    }

    // Salvează
    writeMissingTranslations(existing);

    console.log(`[Missing Translations] Recorded ${newKeysCount} new keys (${keys.length} total received)`);

    res.json({
      success: true,
      message: `${newKeysCount} new missing keys recorded`,
      keys_recorded: newKeysCount,
      total_keys: existing.length
    });
  } catch (error) {
    console.error('[Missing Translations] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/missing-translations
 * 
 * Returnează toate traducerile lipsă
 * Query params: ?status=reported|in_progress|completed
 */
router.get('/missing-translations', async (req, res) => {
  try {
    const { status } = req.query;

    let translations = readMissingTranslations();

    // Filtrare după status dacă este specificat
    if (status) {
      translations = translations.filter(t => t.status === status);
    }

    res.json({
      success: true,
      translations,
      count: translations.length
    });
  } catch (error) {
    console.error('[Missing Translations] Error fetching:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/missing-translations/:key
 * 
 * Actualizează status/notes pentru o traducere lipsă
 * Body: { status?: string, notes?: string, translation_ro?: string, translation_en?: string }
 */
router.put('/missing-translations/:key', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const { status, notes, translation_ro, translation_en } = req.body;

    let translations = readMissingTranslations();
    const index = translations.findIndex(t => t.key === key);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Translation key not found'
      });
    }

    // Actualizează
    if (status !== undefined) translations[index].status = status;
    if (notes !== undefined) translations[index].notes = notes;
    if (translation_ro !== undefined) translations[index].translation_ro = translation_ro;
    if (translation_en !== undefined) translations[index].translation_en = translation_en;
    translations[index].updated_at = new Date().toISOString();

    // Salvează
    writeMissingTranslations(translations);

    res.json({
      success: true,
      translation: translations[index]
    });
  } catch (error) {
    console.error('[Missing Translations] Error updating:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/missing-translations/:key
 * 
 * Șterge o traducere lipsă (după ce a fost completată)
 */
router.delete('/missing-translations/:key', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    let translations = readMissingTranslations();
    const filtered = translations.filter(t => t.key !== key);

    if (translations.length === filtered.length) {
      return res.status(404).json({
        success: false,
        error: 'Translation key not found'
      });
    }

    // Salvează
    writeMissingTranslations(filtered);

    res.json({
      success: true,
      message: 'Translation key deleted'
    });
  } catch (error) {
    console.error('[Missing Translations] Error deleting:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

