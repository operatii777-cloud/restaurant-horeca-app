/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Tables Controller
 * Restaurant tables management
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/tables
 * List all tables
 */
async function getTables(req, res, next) {
  try {
    const { area_id, active_only } = req.query;
    const db = await dbPromise;
    
    let query = 'SELECT * FROM tables';
    const params = [];
    const conditions = [];
    
    if (area_id) {
      conditions.push('area_id = ?');
      params.push(area_id);
    }
    
    if (active_only === 'true') {
      conditions.push('is_active = 1');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY area_id, table_number';
    
    const tables = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: tables,
      count: tables.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    next(error);
  }
}

/**
 * POST /api/tables
 * Create new table
 */
async function createTable(req, res, next) {
  try {
    const { table_number, area_id, capacity, position_x, position_y, is_active = 1 } = req.body;
    const db = await dbPromise;
    
    if (!table_number) {
      return res.status(400).json({
        success: false,
        error: 'table_number is required'
      });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO tables (table_number, area_id, capacity, position_x, position_y, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, [table_number, area_id || null, capacity || null, position_x || null, position_y || null, is_active], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.status(201).json({
      success: true,
      data: { 
        id: result.id, 
        table_number, 
        area_id, 
        capacity, 
        position_x, 
        position_y, 
        is_active 
      },
      message: 'Table created successfully'
    });
  } catch (error) {
    console.error('Error creating table:', error);
    next(error);
  }
}

/**
 * PUT /api/tables/:id
 * Update table
 */
async function updateTable(req, res, next) {
  try {
    const { id } = req.params;
    const { table_number, area_id, capacity, position_x, position_y, is_active } = req.body;
    const db = await dbPromise;
    
    const updates = [];
    const params = [];
    
    if (table_number !== undefined) {
      updates.push('table_number = ?');
      params.push(table_number);
    }
    if (area_id !== undefined) {
      updates.push('area_id = ?');
      params.push(area_id);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      params.push(capacity);
    }
    if (position_x !== undefined) {
      updates.push('position_x = ?');
      params.push(position_x);
    }
    if (position_y !== undefined) {
      updates.push('position_y = ?');
      params.push(position_y);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    updates.push("updated_at = datetime('now')");
    params.push(id);
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE tables 
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Table updated successfully'
    });
  } catch (error) {
    console.error('Error updating table:', error);
    next(error);
  }
}

/**
 * PUT /api/tables/:id/position
 * Update only table position (for drag & drop)
 */
async function updateTablePosition(req, res, next) {
  try {
    const { id } = req.params;
    const { position_x, position_y } = req.body;
    const db = await dbPromise;
    
    if (position_x === undefined && position_y === undefined) {
      return res.status(400).json({
        success: false,
        error: 'position_x or position_y is required'
      });
    }
    
    const updates = [];
    const params = [];
    
    if (position_x !== undefined) {
      updates.push('position_x = ?');
      params.push(position_x);
    }
    if (position_y !== undefined) {
      updates.push('position_y = ?');
      params.push(position_y);
    }
    
    updates.push("updated_at = datetime('now')");
    params.push(id);
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE tables 
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Table position updated successfully'
    });
  } catch (error) {
    console.error('Error updating table position:', error);
    next(error);
  }
}

module.exports = {
  getTables,
  createTable,
  updateTable,
  updateTablePosition
};

