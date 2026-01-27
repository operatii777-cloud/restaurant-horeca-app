/**
 * FAZA 2.C - SLA Routes
 */

const express = require('express');
const router = express.Router();
const deliverySLA = require('../delivery/delivery.sla');

/**
 * GET /api/delivery/sla/:orderId
 * Get SLA metrics for a specific order
 */
router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const sla = await deliverySLA.calculateOrderSLA(parseInt(orderId, 10));
    
    if (!sla) {
      return res.status(404).json({ success: false, error: 'Order not found or not a delivery order' });
    }
    
    res.json({ success: true, data: sla });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/delivery/sla/statistics
 * Get SLA statistics for a date range
 */
router.get('/statistics', async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const stats = await deliverySLA.getSLAStatistics({ dateFrom, dateTo });
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/delivery/sla/violations
 * Get current SLA violations
 */
router.get('/violations', async (req, res, next) => {
  try {
    const violations = await deliverySLA.checkSLAViolations();
    res.json({ success: true, data: violations });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
