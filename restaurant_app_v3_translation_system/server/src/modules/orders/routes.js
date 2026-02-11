/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Orders Routes (logic migrated)
 * Original: routes/delivery-cancellations.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/orders.controller');
const visitsController = require('./controllers/visits.controller');
const ordersExportController = require('./controllers/orders-export.controller');
const displayController = require('./controllers/orders-display.controller');

// Client Monitor endpoint
const dbPromise = require('../../../database').dbPromise;

// GET /api/orders-display/client-monitor
router.get('/display/client-monitor', async (req, res) => {
  try {
    const db = await dbPromise;
    // Get today's orders that are not cancelled or delivered
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders
        WHERE DATE(timestamp) = DATE('now')
          AND status NOT IN ('cancelled')
        ORDER BY timestamp ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Split orders by status
    // Bar categories constant
    const BAR_CATEGORIES = [
      'Cafea/Ciocolată/Ceai', 'Cafea/Ciocolata/Ceai',
      'Răcoritoare', 'Racoritoare',
      'Băuturi și Coctailuri', 'Bauturi si Coctailuri',
      'Vinuri', 'Bere',
      'Băuturi Spirtoase', 'Bauturi Spirtoase',
      'Coctailuri Non-Alcoolice', 'Cocktailuri Non-Alcoolice'
    ];

    // Parse items JSON and create response info with calculated stats
    const parseItems = (itemsStr) => {
      try {
        return typeof itemsStr === 'string' ? JSON.parse(itemsStr) : (itemsStr || []);
      } catch (e) {
        return [];
      }
    };

    const processOrder = (o) => {
      const items = parseItems(o.items);

      let kitchenPending = 0;
      let kitchenDone = 0;
      let barPending = 0;
      let barDone = 0;

      items.forEach(item => {
        const category = item.category || item.category_name || '';
        const isBar = BAR_CATEGORIES.some(bc => category.toLowerCase().includes(bc.toLowerCase()));
        // Status checks: 'ready', 'completed', 'delivered' are considered DONE
        const isDone = ['ready', 'completed', 'delivered'].includes(item.status || 'pending');

        if (isBar) {
          if (isDone) barDone++;
          else barPending++;
        } else {
          if (isDone) kitchenDone++;
          else kitchenPending++;
        }
      });

      return {
        ...o,
        items,
        orderNumber: o.order_number || o.orderNumber || o.id,
        kitchenPending,
        kitchenDone,
        barPending,
        barDone
      };
    };

    const inProgress = orders
      .filter(o => ['pending', 'preparing', 'confirmed', 'paid', 'Pending:'].includes(o.status))
      .map(processOrder);

    const ready = orders
      .filter(o => ['completed', 'ready'].includes(o.status))
      .map(processOrder);

    res.json({
      success: true,
      inProgress,
      ready
    });
  } catch (error) {
    console.error('❌ Error in /api/orders-display/client-monitor:', error);
    res.json({ success: false, inProgress: [], ready: [] });
  }
});

// Apply auth middleware to all routes except receipt and table lookup (public/Kiosk access)
router.use((req, res, next) => {
  // Skip auth for receipt endpoint (public access)
  if (req.path.includes('/receipt')) {
    return next();
  }
  // Skip auth for table lookup (Kiosk needs this without admin auth)
  if (req.path.includes('/table/')) {
    return next();
  }
  // Skip auth for display endpoints (KDS, Bar, Monitor needs public/local access)
  if (req.path.includes('/orders-display/') || req.path.includes('/display/')) {
    return next();
  }
  controller.checkAdminAuth(req, res, next);
});

// Create order - must be before /:id routes
router.post('/create', controller.createOrder);
// Get order by table - must be before /:id routes
router.get('/table/:tableId', controller.getOrderByTable);
// Update order - must be before /:id GET route
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, items, notes, total } = req.body;
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;

    // Verify order exists
    const existingOrder = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }

    if (total !== undefined) {
      updateFields.push('total = ?');
      updateValues.push(total);
    }

    if (items !== undefined && Array.isArray(items)) {
      // Update items JSON
      updateFields.push('items = ?');
      updateValues.push(JSON.stringify(items));
    }

    // Always update updated_at
    updateFields.push("updated_at = datetime('now')");
    updateValues.push(id);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Niciun câmp de actualizat' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated order
    const updatedOrder = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
});

// Cancel order
router.post('/:id/cancel', controller.cancelOrder);
router.post('/:id/cancel-delivery', controller.cancelDelivery);
router.get('/cancellations', controller.getCancellations);
router.get('/cancelled', controller.getCancelledOrders);
router.put('/cancellations/:id/approve', controller.approveCancellation);

// Get order by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    res.json(order); // Return order directly, not wrapped
  } catch (error) {
    next(error);
  }
});
router.get('/:id/receipt', controller.getReceipt); // No auth required for public receipts
// S17.A - Tracking endpoint (public for track-order page)
router.get('/:id/tracking', controller.getOrderTracking);

// Visits routes
router.post('/visits/close', visitsController.closeVisit);

// Orders operations
router.put('/:id/complete-items', controller.completeOrderItems);
router.put('/:id/complete', controller.completeOrder);
router.put('/:id/reset-items-to-pending', controller.resetItemsToPending);
router.post('/:id/feedback', controller.submitOrderFeedback);

// PUT /api/orders/:id/deliver - Marchează comandă ca livrată (pentru ospătar sau curier)
router.put('/:id/deliver', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { delivered_by = 'waiter' } = req.body; // 'waiter' sau 'courier'
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;

    // Verifică dacă comanda există
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }

    // Verifică dacă comanda poate fi marcată ca livrată
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Comanda este anulată și nu poate fi marcată ca livrată' });
    }

    // Actualizează status-ul comenzii
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'delivered', 
            delivered_timestamp = datetime('now'),
            actual_delivery_time = datetime('now'),
            delivered_by = ?
        WHERE id = ?
      `, [delivered_by, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Dacă există delivery_assignment, actualizează-l și pe acela
    const assignment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM delivery_assignments 
        WHERE order_id = ? 
        ORDER BY assigned_at DESC 
        LIMIT 1
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (assignment) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE delivery_assignments 
          SET status = 'delivered', 
              delivered_at = datetime('now')
          WHERE id = ?
        `, [assignment.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Emit Socket.io event
    if (global.io) {
      global.io.emit('order:delivered', {
        orderId: id,
        deliveredBy: delivered_by,
        timestamp: new Date().toISOString()
      });
    }

    // Obține comanda actualizată
    const updatedOrder = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      success: true,
      message: 'Comandă marcată ca livrată cu succes',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error marking order as delivered:', error);
    next(error);
  }
});

// Orders display variants
router.get('/display/bar/recent-completed', displayController.getBarRecentCompleted);
router.get('/display/bar/all-daily', displayController.getBarAllDaily);
router.get('/display/bar/pending', displayController.getBarPending);
router.get('/display/bar/unfinished', displayController.getBarUnfinished);
router.get('/display/kitchen/unfinished', displayController.getKitchenUnfinished);

// Alias for frontend compatibility
router.get('/orders-display/client-monitor', (req, res, next) => {
  // Forward to new endpoint
  req.url = '/display/client-monitor';
  router.handle(req, res, next);
});

// Alias for KDS frontend compatibility
router.get('/orders-display/kitchen', (req, res, next) => {
  // Forward to kitchen unfinished endpoint
  req.url = '/display/kitchen/unfinished';
  router.handle(req, res, next);
});

// Alias for Bar frontend compatibility
router.get('/orders-display/bar', (req, res, next) => {
  // Forward to bar unfinished endpoint
  req.url = '/display/bar/unfinished';
  router.handle(req, res, next);
});

module.exports = router;
