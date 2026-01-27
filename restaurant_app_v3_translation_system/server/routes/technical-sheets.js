/**
 * TECHNICAL SHEETS ROUTES - API pentru Fișe Tehnice
 * Data: 03 Decembrie 2025
 * 
 * ENTERPRISE TODO (PHASE E5): This route will be migrated to src/modules/technical-sheets/routes.js
 */

const express = require('express');
const router = express.Router();
const TechnicalSheetService = require('../services/technical-sheet.service');
const PDFGenerator = require('../utils/pdf-technical-sheet-ansvsa');

// GET all technical sheets
router.get('/', async (req, res) => {
  try {
    const db = require('../config/database');
    
    db.all('SELECT * FROM technical_sheets ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: rows || [] });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const sheet = await TechnicalSheetService.getById(parseInt(req.params.id));
    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST generate from recipe
router.post('/generate', async (req, res) => {
  try {
    const { product_id, recipe_id } = req.body;
    
    const sheet = await TechnicalSheetService.generateFromRecipe(product_id, recipe_id);
    
    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST approve by chef
router.post('/:id/approve-chef', async (req, res) => {
  try {
    const { chef_name, notes } = req.body;
    
    const sheet = await TechnicalSheetService.approveByChef(
      parseInt(req.params.id),
      chef_name,
      notes
    );
    
    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST approve by manager
router.post('/:id/approve-manager', async (req, res) => {
  try {
    const { manager_name, notes } = req.body;
    
    const sheet = await TechnicalSheetService.approveByManager(
      parseInt(req.params.id),
      manager_name,
      notes
    );
    
    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST lock
router.post('/:id/lock', async (req, res) => {
  try {
    const { locked_by, reason } = req.body;
    
    const sheet = await TechnicalSheetService.lock(
      parseInt(req.params.id),
      locked_by,
      reason
    );
    
    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET download PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const sheet = await TechnicalSheetService.getById(parseInt(req.params.id));
    
    const pdfPath = await PDFGenerator.generate(sheet);
    
    res.download(pdfPath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

