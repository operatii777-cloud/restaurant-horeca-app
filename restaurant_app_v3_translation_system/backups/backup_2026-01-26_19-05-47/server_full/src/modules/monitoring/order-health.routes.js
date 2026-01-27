/**
 * ORDER HEALTH MONITOR ROUTES
 * 
 * Endpoint-uri pentru monitoring uniformitate comenzi
 */

const express = require('express');
const router = express.Router();
const orderHealthMonitor = require('./order-health.monitor');

/**
 * GET /api/monitoring/order-health
 * Verifică starea de sănătate a sistemului de comenzi
 */
router.get('/order-health', async (req, res) => {
  try {
    const health = await orderHealthMonitor.checkHealth();
    res.json({
      success: true,
      health
    });
  } catch (error) {
    console.error('❌ [OrderHealthMonitor] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/monitoring/orders-without-stock-movements
 * Obține comenzi fără stock_movements (pentru debugging)
 */
router.get('/orders-without-stock-movements', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await orderHealthMonitor.getOrdersWithoutStockMovements(limit);
    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('❌ [OrderHealthMonitor] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
