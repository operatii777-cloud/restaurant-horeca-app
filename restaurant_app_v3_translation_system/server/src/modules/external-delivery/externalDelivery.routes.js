/**
 * S17.I - External Delivery Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./externalDelivery.controller');
const { dbPromise } = require('../../../database');

// GET /api/external-delivery - Root endpoint (returns summary of external delivery integrations)
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Get all connectors
    const connectors = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM external_delivery_connectors WHERE is_enabled = 1', [], (err, rows) => {
        if (err && !err.message.includes('no such table')) reject(err);
        else resolve(rows || []);
      });
    }).catch(() => []);
    
    // Get recent orders from external platforms
    const recentOrders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE order_source = 'DELIVERY' 
          AND platform IN ('GLOVO', 'WOLT', 'BOLT_FOOD', 'UBER_EATS', 'TAZZ')
        ORDER BY timestamp DESC 
        LIMIT 50
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    }).catch(() => []);
    
    res.json({
      success: true,
      data: {
        connectors: connectors || [],
        recent_orders: recentOrders || [],
        platforms: ['GLOVO', 'WOLT', 'BOLT_FOOD', 'UBER_EATS', 'TAZZ'],
        summary: {
          connectors_count: connectors.length || 0,
          recent_orders_count: recentOrders.length || 0,
          enabled_platforms: connectors.map(c => c.provider).filter(Boolean) || []
        }
      },
      message: 'External delivery integrations retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting external delivery data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        connectors: [],
        recent_orders: [],
        platforms: [],
        summary: {
          connectors_count: 0,
          recent_orders_count: 0,
          enabled_platforms: []
        }
      }
    });
  }
});

// Webhook endpoints (no auth required, but should verify webhook secret in production)
router.post('/:provider/order-created', controller.handleOrderCreated);
router.post('/:provider/order-status', controller.handleOrderStatus);

// Admin endpoints (add auth if needed)
router.get('/connectors', controller.getConnectors);
router.post('/connectors', controller.createConnector);
router.put('/connectors/:id', controller.updateConnector);

// Platform sync endpoints
const platformSyncService = require('./platform-sync.service');
router.post('/sync/:platform/menu', async (req, res) => {
  try {
    const { platform } = req.params;
    const db = await dbPromise;
    const connector = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM external_delivery_connectors WHERE provider = ? AND is_enabled = 1', [platform.toUpperCase()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!connector) {
      return res.status(404).json({ success: false, error: `Connector not found for ${platform}` });
    }
    
    await platformSyncService.syncMenuToPlatform(platform.toUpperCase(), connector);
    res.json({ success: true, message: `Menu synced to ${platform}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sync/all', async (req, res) => {
  try {
    await platformSyncService.syncAllEnabledPlatforms();
    res.json({ success: true, message: 'All platforms synced' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// External order creation and tracking
router.post('/:platform/create-order', controller.createExternalOrder);
router.get('/:platform/order/:externalOrderId/status', controller.getExternalOrderStatus);

module.exports = router;

