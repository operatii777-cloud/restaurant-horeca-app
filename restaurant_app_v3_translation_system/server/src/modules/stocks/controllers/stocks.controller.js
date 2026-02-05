/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/stocks.routes.js
 */

const { dbPromise } = require('../../../../database');

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
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// GET /api/stocks - Lista stocuri curente
async function getStocks(req, res, next) {
  try {
    const db = await dbPromise;

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
    next(error);
  }
}

// GET /api/stocks/alerts/low - Alerte stoc scăzut
/**
 * GET /api/stock/low-stock
 * Returnează produsele cu stoc scăzut (format compatibil cu admin.html)
 */
async function getLowStock(req, res, next) {
  try {
    const db = await dbPromise;

    const lowStock = await dbAll(db, `
      SELECT 
        i.id,
        i.name,
        i.min_stock,
        i.unit,
        COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN sm.type = 'OUT' OR sm.type = 'CONSUME' THEN sm.quantity ELSE 0 END), 0) as current_stock
      FROM ingredients i
      LEFT JOIN stock_moves sm ON i.id = sm.ingredient_id
      WHERE i.is_hidden = 0
        AND i.min_stock > 0
      GROUP BY i.id, i.name, i.min_stock, i.unit
      HAVING current_stock < i.min_stock
      ORDER BY (current_stock - i.min_stock) ASC
    `);

    // Formatează răspunsul în formatul așteptat de admin.html
    res.json({
      success: true,
      low_stock_products: lowStock.map(item => ({
        id: item.id,
        name: item.name,
        current_stock: item.current_stock || 0,
        min_stock: item.min_stock || 0,
        unit: item.unit || '',
        difference: (item.current_stock || 0) - (item.min_stock || 0)
      })),
      count: lowStock.length
    });
  } catch (error) {
    console.error('❌ Error in getLowStock:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la încărcarea produselor cu stoc scăzut',
      low_stock_products: [],
      count: 0
    });
  }
}

async function getLowStockAlerts(req, res, next) {
  try {
    const db = await dbPromise;

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
    next(error);
  }
}

// GET /api/stocks/ingredient/:ingredientId - Stoc specific ingredient
async function getIngredientStock(req, res, next) {
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
    next(error);
  }
}

// GET /api/stocks/history/:ingredientId - Istoric mișcări stoc
async function getStockHistory(req, res, next) {
  try {
    const { ingredientId } = req.params;
    const { days = 30 } = req.query;
    const db = await dbPromise;

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
    next(error);
  }
}

// POST /api/stocks/adjust - Ajustare manuală stoc
async function adjustStock(req, res, next) {
  try {
    const { ingredient_id, quantity, reason } = req.body;

    if (!ingredient_id || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient ID, cantitate și motiv sunt obligatorii'
      });
    }

    const db = await dbPromise;

    const ingredient = await db.get('SELECT * FROM ingredients WHERE id = ?', [ingredient_id]);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient nu a fost găsit'
      });
    }

    const currentQuantity = ingredient.current_stock || 0;
    const newQuantity = Math.max(0, currentQuantity + parseFloat(quantity));

    await dbRun(db, `
      UPDATE ingredients
      SET current_stock = ?,
          last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newQuantity, ingredient_id]);

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
    next(error);
  }
}

// GET /api/stocks/movements - Lista tuturor mișcărilor de stoc
async function getStockMovements(req, res, next) {
  try {
    const { ingredient_id, type, date_from, date_to, limit = 100 } = req.query;
    const db = await dbPromise;

    // Check if stock_moves table exists (preferred) or stock_movements (fallback)
    const stockMovesExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='stock_moves'"
    );

    const stockMovementsExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='stock_movements'"
    );

    if (!stockMovesExists && !stockMovementsExists) {
      return res.json({ success: true, data: [], count: 0 });
    }

    // Use stock_moves if available, otherwise stock_movements
    const tableName = stockMovesExists ? 'stock_moves' : 'stock_movements';
    const isStockMoves = stockMovesExists;

    // Build query based on table schema
    let quantityOutExpr, quantityInExpr, typeExpr, typeFilterColumn;

    if (isStockMoves) {
      // stock_moves table: has 'type', 'quantity_in', 'quantity_out'
      quantityOutExpr = 'COALESCE(sm.quantity_out, 0)';
      quantityInExpr = 'COALESCE(sm.quantity_in, 0)';
      typeExpr = `COALESCE(sm.type, 'CONSUME')`;
      typeFilterColumn = 'sm.type';
    } else {
      // stock_movements table: has 'movement_type', 'quantity_change'
      // quantity_change can be positive (in) or negative (out)
      quantityOutExpr = 'CASE WHEN COALESCE(sm.quantity_change, 0) < 0 THEN ABS(sm.quantity_change) ELSE 0 END';
      quantityInExpr = 'CASE WHEN COALESCE(sm.quantity_change, 0) > 0 THEN sm.quantity_change ELSE 0 END';
      typeExpr = `COALESCE(sm.movement_type, 'order')`;
      typeFilterColumn = 'sm.movement_type';
    }

    // Build notes column expression based on table
    let notesExpr, dateExpr, createdAtExpr, dateFilterExpr, orderByExpr;
    if (isStockMoves) {
      // stock_moves has move_reason, move_source, meta_json, but not notes
      // Has: date, created_at (no timestamp)
      notesExpr = `COALESCE(sm.move_reason, sm.move_source, sm.reference_type, '')`;
      dateExpr = `COALESCE(sm.date, sm.created_at, datetime('now'))`;
      createdAtExpr = `COALESCE(sm.created_at, sm.date, datetime('now'))`;
      dateFilterExpr = `COALESCE(sm.date, sm.created_at)`;
      orderByExpr = `COALESCE(sm.date, sm.created_at)`;
    } else {
      // stock_movements has notes column
      // Has: created_at (no date, no timestamp)
      notesExpr = `COALESCE(sm.notes, '')`;
      dateExpr = `COALESCE(sm.created_at, datetime('now'))`;
      createdAtExpr = `COALESCE(sm.created_at, datetime('now'))`;
      dateFilterExpr = `sm.created_at`;
      orderByExpr = `sm.created_at`;
    }

    let query = `
      SELECT 
        sm.id,
        sm.ingredient_id,
        i.name as ingredient_name,
        i.unit,
        ${quantityOutExpr} as quantity_out,
        ${quantityInExpr} as quantity_in,
        ${typeExpr} as type,
        COALESCE(sm.reference_type, '') as reference_type,
        COALESCE(sm.reference_id, 0) as reference_id,
        ${notesExpr} as notes,
        ${dateExpr} as date,
        ${createdAtExpr} as created_at
      FROM ${tableName} sm
      LEFT JOIN ingredients i ON i.id = sm.ingredient_id
      WHERE 1=1
    `;

    const params = [];

    if (ingredient_id) {
      query += ' AND sm.ingredient_id = ?';
      params.push(ingredient_id);
    }

    if (type) {
      query += ` AND ${typeFilterColumn} = ?`;
      params.push(type);
    }

    if (date_from) {
      query += ` AND DATE(${dateFilterExpr}) >= DATE(?)`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND DATE(${dateFilterExpr}) <= DATE(?)`;
      params.push(date_to);
    }

    query += ` ORDER BY ${orderByExpr} DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const movements = await dbAll(db, query, params);

    console.log(`✅ Returnat ${movements.length} mișcări de stoc`);
    res.json({
      success: true,
      data: movements,
      count: movements.length,
    });
  } catch (error) {
    console.error('❌ Error getting stock movements:', error);
    next(error);
  }
}

// GET /api/stock/finished-products - Produse finite cu stoc
async function getFinishedProducts(req, res, next) {
  console.log('🔍 [getFinishedProducts] Endpoint called');
  try {
    const db = await dbPromise;

    // Verificăm dacă există tabelul menu și recipes
    const menuTableExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='menu'"
    );

    if (!menuTableExists) {
      console.log('⚠️ Tabelul menu nu există');
      return res.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Verificăm dacă există tabelul recipes
    const recipesTableExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='recipes'"
    );

    if (!recipesTableExists) {
      console.log('⚠️ Tabelul recipes nu există');
      return res.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Verificăm ce coloane există în tabelul menu
    const menuColumns = await dbAll(db, "PRAGMA table_info(menu)");
    const columnNames = menuColumns.map(col => col.name);

    const hasCurrentStock = columnNames.includes('current_stock');
    const hasMinStock = columnNames.includes('min_stock');
    const hasMaxStock = columnNames.includes('max_stock');
    const hasAutoManaged = columnNames.includes('is_auto_managed');
    const hasLastUpdated = columnNames.includes('last_updated');

    // Construim query-ul dinamic în funcție de coloanele disponibile
    const currentStockExpr = hasCurrentStock ? 'COALESCE(m.current_stock, 0)' : '0';
    const minStockExpr = hasMinStock ? 'COALESCE(m.min_stock, 0)' : '0';
    const maxStockExpr = hasMaxStock ? 'COALESCE(m.max_stock, 0)' : '0';
    const autoManagedExpr = hasAutoManaged ? 'COALESCE(m.is_auto_managed, 0)' : '0';
    const lastUpdatedExpr = hasLastUpdated ? 'm.last_updated' : 'NULL';

    const finishedProducts = await dbAll(db, `
      SELECT 
        m.id as product_id,
        m.name as product_name,
        m.name,
        m.category,
        m.price,
        ${currentStockExpr} as current_stock,
        ${minStockExpr} as min_stock,
        ${maxStockExpr} as max_stock,
        ${autoManagedExpr} as is_auto_managed,
        ${lastUpdatedExpr} as last_updated,
        CASE 
          WHEN ${currentStockExpr} <= 0 THEN 'out'
          WHEN ${minStockExpr} > 0 AND ${currentStockExpr} <= ${minStockExpr} * 0.2 THEN 'critical'
          WHEN ${minStockExpr} > 0 AND ${currentStockExpr} <= ${minStockExpr} THEN 'low'
          ELSE 'ok'
        END as stock_status
      FROM menu m
      WHERE EXISTS (
        SELECT 1 FROM recipes r WHERE r.product_id = m.id
      )
      ORDER BY m.name ASC
    `);

    console.log(`✅ Returnat ${finishedProducts.length} produse finite cu stoc`);
    res.json({
      success: true,
      data: finishedProducts,
      count: finishedProducts.length,
    });
  } catch (error) {
    console.error('❌ Eroare la obținerea produselor finite:', error);
    // Dacă tabelul menu nu există sau nu are coloanele necesare, returnăm array gol
    res.json({
      success: true,
      data: [],
      count: 0,
    });
  }
}

// GET /api/stock/finished-products/:id
async function getFinishedProduct(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Verificăm dacă există tabelul menu
    const menuTableExists = await dbGet(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='menu'"
    );

    if (!menuTableExists) {
      return res.status(404).json({ success: false, message: 'Tabelul menu nu există' });
    }

    // Verificăm ce coloane există în tabelul menu
    const menuColumns = await dbAll(db, "PRAGMA table_info(menu)");
    const columnNames = menuColumns.map(col => col.name);

    if (!columnNames.includes('current_stock')) {
      return res.status(500).json({ success: false, message: 'Coloanele de stoc lipsesc din tabelul menu' });
    }

    const hasMinStock = columnNames.includes('min_stock');
    const hasMaxStock = columnNames.includes('max_stock');
    const hasAutoManaged = columnNames.includes('is_auto_managed');

    const product = await dbGet(db, `
      SELECT 
        id as product_id,
        name as product_name,
        COALESCE(current_stock, 0) as current_stock,
        ${hasMinStock ? 'COALESCE(min_stock, 0)' : '0'} as min_stock,
        ${hasMaxStock ? 'COALESCE(max_stock, 0)' : '0'} as max_stock,
        ${hasAutoManaged ? 'COALESCE(is_auto_managed, 0)' : '0'} as is_auto_managed
      FROM menu
      WHERE id = ?
    `, [id]);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produsul nu a fost găsit' });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
}

// POST/PUT /api/stock/finished-products/:id?
async function updateFinishedProductStock(req, res, next) {
  try {
    const id = req.params.id || req.body.product_id;
    const { current_stock, min_stock, max_stock, is_auto_managed } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID-ul produsului este obligatoriu' });
    }

    const db = await dbPromise;

    // Build dynamic update query based on existing columns
    const menuColumns = await dbAll(db, "PRAGMA table_info(menu)");
    const columnNames = menuColumns.map(col => col.name);

    let updateFields = [];
    let params = [];

    if (current_stock !== undefined && columnNames.includes('current_stock')) {
      updateFields.push('current_stock = ?');
      params.push(current_stock);
    }
    if (min_stock !== undefined && columnNames.includes('min_stock')) {
      updateFields.push('min_stock = ?');
      params.push(min_stock);
    }
    if (max_stock !== undefined && columnNames.includes('max_stock')) {
      updateFields.push('max_stock = ?');
      params.push(max_stock);
    }
    if (is_auto_managed !== undefined && columnNames.includes('is_auto_managed')) {
      updateFields.push('is_auto_managed = ?');
      params.push(is_auto_managed ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.json({ success: true, message: 'Nicio modificare de stoc de aplicat' });
    }

    // Add last_updated if exists
    if (columnNames.includes('last_updated')) {
      updateFields.push("last_updated = CURRENT_TIMESTAMP");
    }

    params.push(id);

    await dbRun(db, `
      UPDATE menu
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: 'Stoc produs actualizat cu succes'
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStocks,
  getLowStockAlerts,
  getLowStock,
  getIngredientStock,
  getStockHistory,
  getStockMovements,
  adjustStock,
  getFinishedProducts,
  getFinishedProduct,
  updateFinishedProductStock,
};

