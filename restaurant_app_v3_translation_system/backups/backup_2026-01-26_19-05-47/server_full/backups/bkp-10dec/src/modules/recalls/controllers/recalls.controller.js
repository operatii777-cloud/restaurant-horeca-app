/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/recalls.js
 */

const RecallService = require('../../../services/recall.service');

async function list(req, res, next) {
  try {
    const db = require('../../../config/database');
    
    db.all('SELECT * FROM product_recalls ORDER BY recall_date DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: rows || [] });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function create(req, res, next) {
  try {
    const recall = await RecallService.createRecall(req.body);
    res.json({ success: true, data: recall });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function resolve(req, res, next) {
  try {
    const { resolved_by, resolution_notes } = req.body;
    
    await RecallService.update(parseInt(req.params.id), {
      resolved: 1,
      resolved_at: new Date().toISOString(),
      resolved_by,
      resolution_notes
    });
    
    res.json({ success: true, message: 'Recall resolved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { list, create, resolve };
