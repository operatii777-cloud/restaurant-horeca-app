/**
 * PORTIONS ROUTES - API pentru Porții Multiple
 * Data: 03 Decembrie 2025
 */

const express = require('express');
const router = express.Router();
const PortionService = require('../services/portion.service');

// GET all portions
router.get('/', async (req, res) => {
  try {
    const db = require('../config/database');
    
    db.all(`
      SELECT pp.*, p.name as product_name
      FROM product_portions pp
      LEFT JOIN products p ON p.id = pp.product_id
      ORDER BY pp.product_id, pp.sort_order
    `, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: rows || [] });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET by product
router.get('/product/:productId', async (req, res) => {
  try {
    const portions = await PortionService.getByProduct(parseInt(req.params.productId));
    res.json({ success: true, data: portions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create portions for product
router.post('/', async (req, res) => {
  try {
    const { product_id, portions } = req.body;
    
    const created = await PortionService.createPortions(product_id, portions);
    
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST recalculate costs
router.post('/recalculate/:productId', async (req, res) => {
  try {
    await PortionService.recalculateAllCosts(parseInt(req.params.productId));
    res.json({ success: true, message: 'Costs recalculated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

