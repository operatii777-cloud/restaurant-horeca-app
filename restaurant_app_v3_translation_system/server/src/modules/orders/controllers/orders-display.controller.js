/**
 * Orders Display Controller
 * Handles orders display endpoints for kitchen, bar, and variants
 */

const { dbPromise } = require('../../../../database');

// BAR_CATEGORIES constant
const BAR_CATEGORIES = [
  'Cafea/Ciocolată/Ceai', 'Cafea/Ciocolata/Ceai',
  'Răcoritoare', 'Racoritoare',
  'Băuturi și Coctailuri', 'Bauturi si Coctailuri',
  'Vinuri', 'Bere',
  'Băuturi Spirtoase', 'Bauturi Spirtoase',
  'Coctailuri Non-Alcoolice', 'Cocktailuri Non-Alcoolice'
];

/**
 * Helper function to filter orders by category
 */
async function filterOrdersByCategory(orders, includeBar = false) {
  const filteredOrders = [];

  if (!Array.isArray(orders)) {
    return filteredOrders;
  }

  const db = await dbPromise;

  for (const order of orders) {
    try {
      if (!order) continue;

      let items = [];
      if (order.items) {
        if (typeof order.items === 'string') {
          try {
            items = JSON.parse(order.items);
          } catch (e) {
            items = [];
          }
        } else if (Array.isArray(order.items)) {
          items = order.items;
        }
      }

      // 🔴 FIX: Populează name și category pentru items-urile care nu le au
      const enrichedItems = await Promise.all((items || []).map(async (item) => {
        if (!item) return item;

        let productName = item.name || item.product_name || '';
        let productCategory = item.category || item.category_name || '';
        const productId = item.product_id || item.id || item.productId;

        // Dacă name sau category lipsește dar avem product_id, obține-le din baza de date
        if (productId && ((!productName || productName.trim() === '') || (!productCategory || productCategory.trim() === ''))) {
          try {
            const product = await new Promise((resolve, reject) => {
              db.get('SELECT name, category FROM menu WHERE id = ?', [productId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });

            if (product) {
              if (!productName || productName.trim() === '') {
                productName = product.name || '';
              }
              if (!productCategory || productCategory.trim() === '') {
                productCategory = product.category || '';
              }
            }
          } catch (productErr) {
            // Ignoră eroarea și continuă
          }
        }

        // Dacă tot nu avem name, folosește un fallback
        if (!productName || productName.trim() === '') {
          productName = `Produs ${productId || 'N/A'}`;
        }

        // Setează itemId (pentru bar interface să poată marca items ca gata)
        const itemId = item.itemId || item.item_id || item.id || item.line_id || null;

        // Setează status implicit 'pending' dacă nu există (pentru ca bar-ul să poată marca items ca gata)
        const itemStatus = item.status || item.item_status || 'pending';

        return {
          ...item,
          name: productName,
          category: productCategory,
          category_name: productCategory,
          product_id: productId || item.product_id || item.id || item.productId,
          itemId: itemId, // Adaugă itemId pentru bar interface
          status: itemStatus // Setează status implicit 'pending' pentru procesare în bar
        };
      }));

      // Filter items based on category
      const filteredItems = enrichedItems.filter(item => {
        if (!item) return false;
        const category = item.category || item.category_name || '';
        const isBar = BAR_CATEGORIES.some(bc => category.toLowerCase().includes(bc.toLowerCase()));
        return includeBar ? isBar : !isBar;
      });

      // Return order only if it has matching items
      if (filteredItems.length > 0) {
        filteredOrders.push({
          ...order,
          items: filteredItems
        });
      }
    } catch (orderError) {
      continue;
    }
  }

  return filteredOrders;
}

/**
 * GET /api/orders-display/bar/recent-completed
 * Get recently completed bar orders
 */
async function getBarRecentCompleted(req, res, next) {
  try {
    const db = await dbPromise;
    const { lang = 'ro' } = req.query;

    // ✅ FIX: Include toate comenzile finalizate (completed, delivered, paid, ready) - inclusiv MOBILE_APP și TAKEAWAY
    // Include și comenzile takeaway procesate (status 'ready' sau 'completed')
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE status IN ('completed', 'delivered', 'paid', 'ready')
          AND status != 'cancelled'
          AND timestamp >= datetime('now', '-24 hours')
        ORDER BY COALESCE(completed_timestamp, delivered_at, timestamp) DESC
        LIMIT 50
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const filteredOrders = await filterOrdersByCategory(orders, true);

    res.json({
      success: true,
      orders: filteredOrders
    });
  } catch (error) {
    console.error('❌ Error in getBarRecentCompleted:', error);
    res.json({
      success: true,
      orders: []
    });
  }
}

/**
 * GET /api/orders-display/bar/all-daily
 * Get all daily bar orders
 */
async function getBarAllDaily(req, res, next) {
  try {
    const db = await dbPromise;
    const { lang = 'ro' } = req.query;

    // ✅ FIX: Include toate comenzile finalizate (completed, delivered, paid, ready) din ziua curentă - inclusiv MOBILE_APP și TAKEAWAY
    // Include și comenzile takeaway procesate (status 'ready' sau 'completed')
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE DATE(timestamp) = DATE('now')
          AND status IN ('completed', 'delivered', 'paid', 'ready')
          AND status != 'cancelled'
        ORDER BY timestamp DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const filteredOrders = await filterOrdersByCategory(orders, true);

    res.json({
      success: true,
      orders: filteredOrders
    });
  } catch (error) {
    console.error('❌ Error in getBarAllDaily:', error);
    res.json({
      success: true,
      orders: []
    });
  }
}

/**
 * GET /api/orders-display/bar/pending
 * Get pending bar orders
 */
async function getBarPending(req, res, next) {
  try {
    const db = await dbPromise;
    const { lang = 'ro' } = req.query;

    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE status IN ('pending', 'preparing', 'confirmed', 'paid', 'Pending:')
          AND DATE(timestamp) = DATE('now')
        ORDER BY timestamp ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const filteredOrders = await filterOrdersByCategory(orders, true);

    res.json({
      success: true,
      orders: filteredOrders
    });
  } catch (error) {
    console.error('❌ Error in getBarPending:', error);
    res.json({
      success: true,
      orders: []
    });
  }
}

/**
 * GET /api/orders-display/bar/unfinished
 * Get unfinished bar orders
 */
async function getBarUnfinished(req, res, next) {
  try {
    const db = await dbPromise;
    const { lang = 'ro' } = req.query;

    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE status IN ('pending', 'preparing', 'confirmed', 'paid', 'Pending:')
          AND DATE(timestamp) = DATE('now')
        ORDER BY timestamp ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const filteredOrders = await filterOrdersByCategory(orders, true);

    res.json({
      success: true,
      orders: filteredOrders
    });
  } catch (error) {
    console.error('❌ Error in getBarUnfinished:', error);
    res.json({
      success: true,
      orders: []
    });
  }
}

/**
 * GET /api/orders-display/kitchen/unfinished
 * Get unfinished kitchen orders
 */
async function getKitchenUnfinished(req, res, next) {
  try {
    const db = await dbPromise;
    const { lang = 'ro' } = req.query;

    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE status IN ('pending', 'preparing', 'confirmed', 'paid', 'Pending:')
          AND DATE(timestamp) = DATE('now')
        ORDER BY timestamp ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const filteredOrders = await filterOrdersByCategory(orders, false);

    res.json({
      success: true,
      orders: filteredOrders
    });
  } catch (error) {
    console.error('❌ Error in getKitchenUnfinished:', error);
    res.json({
      success: true,
      orders: []
    });
  }
}

module.exports = {
  filterOrdersByCategory,
  getBarRecentCompleted,
  getBarAllDaily,
  getBarPending,
  getBarUnfinished,
  getKitchenUnfinished
};

