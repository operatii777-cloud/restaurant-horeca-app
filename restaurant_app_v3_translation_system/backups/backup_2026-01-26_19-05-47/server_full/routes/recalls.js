/**
 * RECALLS ROUTES - API pentru Recall Management
 * Data: 03 Decembrie 2025
 * 
 * ENTERPRISE TODO (PHASE E5): This route will be migrated to src/modules/recalls/routes.js
 */

const express = require('express');
const router = express.Router();
const RecallService = require('../services/recall.service');

// GET all recalls
router.get('/', async (req, res) => {
  try {
    const db = require('../config/database');
    
    db.all('SELECT * FROM product_recalls ORDER BY recall_date DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: rows || [] });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create recall
router.post('/', async (req, res) => {
  try {
    const recall = await RecallService.createRecall(req.body);
    res.json({ success: true, data: recall });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST resolve recall
router.post('/:id/resolve', async (req, res) => {
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
});

module.exports = router;

