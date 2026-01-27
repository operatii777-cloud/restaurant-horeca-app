/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/portions.js
 */

const PortionService = require('../../../services/portion.service');

async function list(req, res, next) {
  try {
    const db = require('../../../config/database');
    
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
}

async function getByProduct(req, res, next) {
  try {
    const portions = await PortionService.getByProduct(parseInt(req.params.productId));
    res.json({ success: true, data: portions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function create(req, res, next) {
  try {
    const { product_id, portions } = req.body;
    
    const created = await PortionService.createPortions(product_id, portions);
    
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function recalculate(req, res, next) {
  try {
    await PortionService.recalculateAllCosts(parseInt(req.params.productId));
    res.json({ success: true, message: 'Costs recalculated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { list, getByProduct, create, recalculate };
