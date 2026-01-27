/**
 * 📦 STOCKS API ROUTES
 * 
 * Endpoints pentru gestionarea stocurilor cu alerte nivel minim
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

function dbAll(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function dbGet(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function dbRun(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// ========================================
// GET /api/stocks - Lista stocuri curente
// ========================================
router.get('/', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Fetch stocuri cu informații despre ingrediente
    const stocks = await dbAll(db, `
      SELECT 
        i.id,
        i.id as ingredient_id,
        i.name as ingredient_name,
        i.unit,
        COALESCE(i.current_stock, 0) as quantity,
        COALESCE(i.min_stock, 0) as min_quantity,
        i.last_updated as last_updated
      FROM ingredients i
      WHERE i.is_hidden = 0
      ORDER BY i.name ASC
    `);
    
    console.log(`✅ Returnat ${stocks.length} intrări de stoc`);
    res.json({
      success: true,
      data: stocks,
      count: stocks.length,
    });
    
  } catch (error) {
    console.error('❌ Eroare la încărcarea stocurilor:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// GET /api/stocks/alerts/low - Alerte stoc scăzut
// ========================================
router.get('/alerts/low', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Fetch ingrediente cu stoc sub nivelul minim
    const lowStock = await dbAll(db, `
      SELECT 
        i.id,
        i.name as ingredient_name,
        i.unit,
        COALESCE(i.current_stock, 0) as quantity,
        COALESCE(i.min_stock, 0) as min_quantity,
        ROUND((COALESCE(i.current_stock, 0) / NULLIF(i.min_stock, 0)) * 100, 2) as percentage
      FROM ingredients i
      WHERE i.is_hidden = 0
        AND i.min_stock > 0
        AND i.current_stock < i.min_stock
      ORDER BY percentage ASC, i.name ASC
    `);
    
    console.log(`⚠️ Găsite ${lowStock.length} ingrediente cu stoc scăzut`);
    res.json({
      success: true,
      data: lowStock,
      count: lowStock.length,
    });
    
  } catch (error) {
    console.error('❌ Eroare la încărcarea alertelor de stoc:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// GET /api/stocks/ingredient/:ingredientId - Stoc specific ingredient
// ========================================
router.get('/ingredient/:ingredientId', async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const db = await dbPromise;
    
    const stock = await dbGet(db, `
      SELECT 
        i.id,
        i.id as ingredient_id,
        i.name as ingredient_name,
        i.unit,
        COALESCE(i.current_stock, 0) as quantity,
        COALESCE(i.min_stock, 0) as min_quantity,
        i.last_updated as last_updated
      FROM ingredients i
      WHERE i.id = ?
    `, [ingredientId]);
    
    if (!stock) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ingredient nu a fost găsit' 
      });
    }
    
    res.json({
      success: true,
      data: stock,
    });
    
  } catch (error) {
    console.error('❌ Eroare la încărcarea stocului:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// GET /api/stocks/history/:ingredientId - Istoric mișcări stoc
// ========================================
router.get('/history/:ingredientId', async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const { days = 30 } = req.query;
    const db = await dbPromise;
    
    // Verifică dacă există tabela stock_movements
    const tableExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='stock_movements'"
    );
    
    if (!tableExists) {
      return res.json({ success: true, data: [] });
    }
    
    const history = await dbAll(db, `
      SELECT 
        sm.*,
        i.name as ingredient_name,
        i.unit
      FROM stock_movements sm
      JOIN ingredients i ON i.id = sm.ingredient_id
      WHERE sm.ingredient_id = ?
        AND sm.created_at >= date('now', '-' || ? || ' days')
      ORDER BY sm.created_at DESC
    `, [ingredientId, days]);
    
    console.log(`✅ Returnat ${history.length} mișcări de stoc pentru ingredient ${ingredientId}`);
    res.json({
      success: true,
      data: history,
      count: history.length,
    });
    
  } catch (error) {
    console.error('❌ Eroare la încărcarea istoricului:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========================================
// POST /api/stocks/adjust - Ajustare manuală stoc
// ========================================
router.post('/adjust', async (req, res) => {
  try {
    const { ingredient_id, quantity, reason } = req.body;
    
    if (!ingredient_id || !quantity || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ingredient ID, cantitate și motiv sunt obligatorii' 
      });
    }
    
    const db = await dbPromise;
    
    // Obține stocul curent
    const ingredient = await db.get('SELECT * FROM ingredients WHERE id = ?', [ingredient_id]);
    
    if (!ingredient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ingredient nu a fost găsit' 
      });
    }
    
    const currentQuantity = ingredient.current_stock || 0;
    const newQuantity = Math.max(0, currentQuantity + parseFloat(quantity));
    
    // Actualizează cantitatea în tabela ingredients
    await dbRun(db, `
      UPDATE ingredients
      SET current_stock = ?,
          last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newQuantity, ingredient_id]);
    
    // Înregistrează mișcarea în istoric (dacă tabela există)
    const tableExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='stock_movements'"
    );
    
    if (tableExists) {
      await dbRun(db, `
        INSERT INTO stock_movements (
          ingredient_id, 
          type, 
          quantity, 
          reason, 
          created_at
        )
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [
        ingredient_id,
        quantity > 0 ? 'in' : 'out',
        Math.abs(quantity),
        reason
      ]);
    }
    
    console.log(`✅ Stoc ajustat: ${ingredient.name} ${quantity > 0 ? '+' : ''}${quantity} ${ingredient.unit}`);
    
    res.json({
      success: true,
      previous_quantity: currentQuantity,
      new_quantity: newQuantity,
      adjustment: quantity,
      message: 'Stoc ajustat cu succes'
    });
    
  } catch (error) {
    console.error('❌ Eroare la ajustarea stocului:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;

