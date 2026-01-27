/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXTERNAL DELIVERY CONTROLLER
 * 
 * Controller pentru gestionare integrare platforme externe
 * ═══════════════════════════════════════════════════════════════════════════
 */

const externalDeliveryService = require('./externalDelivery.service');
const platformSyncService = require('./platform-sync.service');
const UberEatsService = require('./uber-eats.service');
const BoltFoodService = require('./bolt-food.service');
const { dbPromise } = require('../../../database');

/**
 * POST /api/external-delivery/:provider/order-created
 * Webhook pentru comenzi noi de la platforme externe
 */
async function handleOrderCreated(req, res, next) {
  try {
    const { provider } = req.params;
    const payload = req.body;
    
    const result = await externalDeliveryService.handleOrderCreated(provider, payload);
    
    res.json({
      success: true,
      orderId: result.orderId,
      externalOrderId: result.externalOrderId
    });
  } catch (error) {
    console.error(`❌ Error handling order created from ${req.params.provider}:`, error);
    next(error);
  }
}

/**
 * POST /api/external-delivery/:provider/order-status
 * Webhook pentru actualizări status comandă
 */
async function handleOrderStatus(req, res, next) {
  try {
    const { provider } = req.params;
    const payload = req.body;
    
    await externalDeliveryService.handleOrderStatus(provider, payload);
    
    res.json({ success: true });
  } catch (error) {
    console.error(`❌ Error handling order status from ${req.params.provider}:`, error);
    next(error);
  }
}

/**
 * GET /api/external-delivery/connectors
 * Obține lista conectărilor platforme externe
 */
async function getConnectors(req, res, next) {
  try {
    const db = await dbPromise;
    
    const connectors = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM external_delivery_connectors
        ORDER BY provider, created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      connectors: connectors
    });
  } catch (error) {
    console.error('❌ Error getting connectors:', error);
    next(error);
  }
}

/**
 * POST /api/external-delivery/connectors
 * Creează o nouă conectare
 */
async function createConnector(req, res, next) {
  try {
    const db = await dbPromise;
    const { provider, api_key, api_secret, webhook_secret, is_enabled, restaurant_id } = req.body;
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO external_delivery_connectors (
          provider, api_key, api_secret, webhook_secret, is_enabled, restaurant_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [provider, api_key, api_secret, webhook_secret, is_enabled ? 1 : 0, restaurant_id || 1], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    const connector = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM external_delivery_connectors WHERE id = ?
      `, [result.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({
      success: true,
      connector: connector
    });
  } catch (error) {
    console.error('❌ Error creating connector:', error);
    next(error);
  }
}

/**
 * PUT /api/external-delivery/connectors/:id
 * Actualizează o conectare
 */
async function updateConnector(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { provider, api_key, api_secret, webhook_secret, is_enabled, restaurant_id } = req.body;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE external_delivery_connectors
        SET provider = ?,
            api_key = ?,
            api_secret = ?,
            webhook_secret = ?,
            is_enabled = ?,
            restaurant_id = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `, [provider, api_key, api_secret, webhook_secret, is_enabled ? 1 : 0, restaurant_id || 1, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    const connector = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM external_delivery_connectors WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({
      success: true,
      connector: connector
    });
  } catch (error) {
    console.error('❌ Error updating connector:', error);
    next(error);
  }
}

/**
 * POST /api/external-delivery/sync/:platform/menu
 * Sincronizează meniul cu o platformă specifică
 */
async function syncMenu(req, res, next) {
  try {
    const { platform } = req.params;
    const result = await platformSyncService.syncMenu(platform);
    
    res.json({
      success: result.success,
      result: result
    });
  } catch (error) {
    console.error(`❌ Error syncing menu for ${req.params.platform}:`, error);
    next(error);
  }
}

/**
 * POST /api/external-delivery/sync/all
 * Sincronizează meniul cu toate platformele
 */
async function syncAllPlatforms(req, res, next) {
  try {
    const results = await platformSyncService.syncAllPlatforms();
    
    res.json({
      success: true,
      results: results
    });
  } catch (error) {
    console.error('❌ Error syncing all platforms:', error);
    next(error);
  }
}

/**
 * POST /api/external-delivery/:platform/create-order
 * Creează o comandă pe o platformă externă (Uber Eats, Bolt Food)
 */
async function createExternalOrder(req, res, next) {
  try {
    const { platform } = req.params;
    const orderData = req.body;
    const db = await dbPromise;
    
    // Obține connector-ul pentru platformă
    const connector = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM external_delivery_connectors
        WHERE provider = ? AND is_enabled = 1
      `, [platform.toUpperCase()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!connector) {
      return res.status(404).json({
        success: false,
        error: `No active connector found for ${platform}`
      });
    }
    
    let externalOrder;
    
    // Folosește serviciul specific pentru platformă
    if (platform.toUpperCase() === 'UBER_EATS') {
      const uberService = new UberEatsService(
        connector.api_key,
        connector.api_secret,
        connector.restaurant_id || 1
      );
      await uberService.authenticate();
      externalOrder = await uberService.createOrder(orderData);
    } else if (platform.toUpperCase() === 'BOLT_FOOD') {
      const boltService = new BoltFoodService(
        connector.api_key,
        connector.api_secret,
        connector.restaurant_id || 1
      );
      await boltService.authenticate();
      externalOrder = await boltService.createOrder(orderData);
    } else {
      return res.status(400).json({
        success: false,
        error: `Platform ${platform} not supported for order creation`
      });
    }
    
    // Actualizează connector-ul cu ultima sincronizare
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE external_delivery_connectors
        SET last_sync_at = datetime('now'),
            last_sync_status = 'success'
        WHERE id = ?
      `, [connector.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({
      success: true,
      external_order: externalOrder
    });
  } catch (error) {
    console.error(`❌ Error creating external order on ${req.params.platform}:`, error);
    
    // Actualizează connector-ul cu eroare
    try {
      const db = await dbPromise;
      const connector = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM external_delivery_connectors
          WHERE provider = ? AND is_enabled = 1
        `, [req.params.platform.toUpperCase()], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (connector) {
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE external_delivery_connectors
            SET last_sync_at = datetime('now'),
                last_sync_status = 'failed',
                last_sync_error = ?
            WHERE id = ?
          `, [error.message, connector.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    } catch (updateError) {
      console.error('❌ Error updating connector sync status:', updateError);
    }
    
    next(error);
  }
}

/**
 * GET /api/external-delivery/:platform/order/:externalOrderId/status
 * Obține statusul unei comenzi externe
 */
async function getExternalOrderStatus(req, res, next) {
  try {
    const { platform, externalOrderId } = req.params;
    const db = await dbPromise;
    
    // Obține connector-ul
    const connector = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM external_delivery_connectors
        WHERE provider = ? AND is_enabled = 1
      `, [platform.toUpperCase()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!connector) {
      return res.status(404).json({
        success: false,
        error: `No active connector found for ${platform}`
      });
    }
    
    let status;
    
    // Folosește serviciul specific
    if (platform.toUpperCase() === 'UBER_EATS') {
      const uberService = new UberEatsService(
        connector.api_key,
        connector.api_secret,
        connector.restaurant_id || 1
      );
      await uberService.authenticate();
      status = await uberService.getOrderStatus(externalOrderId);
    } else if (platform.toUpperCase() === 'BOLT_FOOD') {
      const boltService = new BoltFoodService(
        connector.api_key,
        connector.api_secret,
        connector.restaurant_id || 1
      );
      await boltService.authenticate();
      status = await boltService.getOrderStatus(externalOrderId);
    } else {
      return res.status(400).json({
        success: false,
        error: `Platform ${platform} not supported`
      });
    }
    
    res.json({
      success: true,
      external_order_id: externalOrderId,
      status: status
    });
  } catch (error) {
    console.error(`❌ Error getting external order status:`, error);
    next(error);
  }
}

module.exports = {
  handleOrderCreated,
  handleOrderStatus,
  getConnectors,
  createConnector,
  updateConnector,
  syncMenu,
  syncAllPlatforms,
  createExternalOrder,
  getExternalOrderStatus,
};
