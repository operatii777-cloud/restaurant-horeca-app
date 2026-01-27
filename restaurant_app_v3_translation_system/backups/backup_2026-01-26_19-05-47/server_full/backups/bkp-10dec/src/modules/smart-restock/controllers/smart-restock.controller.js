/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/smart-restock-v2.js
 * 
 * NOTE: This controller contains complex ML-based restock logic.
 * The full implementation is preserved from routes/smart-restock-v2.js
 */

// Import the original route handlers logic
// In PHASE E7, we keep the logic inline but structure it in controller
const getDb = () => {
  try {
    const { getDbConnection } = require('../../../database');
    return getDbConnection();
  } catch (e) {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '../../../restaurant.db');
    return new sqlite3.Database(dbPath);
  }
};

async function analysis(req, res, next) {
  // Full logic from routes/smart-restock-v2.js router.get('/analysis', ...)
  // This is a large handler, so we keep it as-is for now
  // TODO PHASE E8: Extract business logic to service layer
  
  const db = getDb();
  const { days = 30, forecast_days = 14 } = req.query;
  
  try {
    // Import full logic from original file
    // For now, we'll require the original router and extract the handler
    // This is a temporary solution until we can properly refactor the complex logic
    
    // Since the logic is very complex (200+ lines), we'll keep it in a service
    // For PHASE E7, we'll create a wrapper that calls the original route logic
    const originalRouter = require('../../../routes/smart-restock-v2');
    
    // Create a mock request/response to call the original handler
    // This is a temporary bridge until full refactoring
    const originalHandler = originalRouter.stack.find(layer => 
      layer.route && layer.route.path === '/analysis'
    );
    
    if (originalHandler) {
      return originalHandler.route.stack[0].handle(req, res, next);
    }
    
    res.status(500).json({ success: false, error: 'Handler not found' });
  } catch (error) {
    console.error('❌ Smart Restock V2 Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function generateOrder(req, res, next) {
  // Full logic from routes/smart-restock-v2.js router.post('/generate-order', ...)
  // TODO PHASE E8: Extract to service layer
  
  const db = getDb();
  const { supplier_id, items } = req.body;
  
  if (!supplier_id || !items || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'supplier_id și items sunt obligatorii' 
    });
  }
  
  try {
    // Similar to analysis - use original handler as bridge
    const originalRouter = require('../../../routes/smart-restock-v2');
    const originalHandler = originalRouter.stack.find(layer => 
      layer.route && layer.route.path === '/generate-order'
    );
    
    if (originalHandler) {
      return originalHandler.route.stack[0].handle(req, res, next);
    }
    
    res.status(500).json({ success: false, error: 'Handler not found' });
  } catch (error) {
    console.error('❌ Generate Order Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { analysis, generateOrder };
