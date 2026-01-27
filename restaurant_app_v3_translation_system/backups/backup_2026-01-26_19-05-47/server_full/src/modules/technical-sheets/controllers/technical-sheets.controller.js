/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/technical-sheets.js
 */

const TechnicalSheetService = require('../../../../services/technical-sheet.service');
const PDFGenerator = require('../../../../utils/pdf-technical-sheet-ansvsa');
const { dbPromise } = require('../../../../database');

async function list(req, res, next) {
  try {
    const db = await dbPromise;
    
    db.all('SELECT * FROM technical_sheets ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: rows || [] });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getById(req, res, next) {
  try {
    const sheet = await TechnicalSheetService.getById(parseInt(req.params.id));
    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function generateFromRecipe(req, res, next) {
  try {
    const { product_id, recipe_id } = req.body;
    
    const sheet = await TechnicalSheetService.generateFromRecipe(product_id, recipe_id);
    
    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function approveByChef(req, res, next) {
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
}

async function approveByManager(req, res, next) {
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
}

async function lock(req, res, next) {
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
}

async function downloadPDF(req, res, next) {
  try {
    const sheet = await TechnicalSheetService.getById(parseInt(req.params.id));
    
    const pdfPath = await PDFGenerator.generate(sheet);
    
    res.download(pdfPath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  list,
  getById,
  generateFromRecipe,
  approveByChef,
  approveByManager,
  lock,
  downloadPDF
};
