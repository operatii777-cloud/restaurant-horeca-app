/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Areas Controller
 * Restaurant areas/zones management
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/areas
 * List all areas
 */
async function getAreas(req, res, next) {
  try {
    const { active_only } = req.query;
    const db = await dbPromise;
    
    let query = 'SELECT * FROM areas';
    const params = [];
    
    if (active_only === 'true') {
      query += ' WHERE is_active = 1';
    }
    
    query += ' ORDER BY name';
    
    const areas = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: areas,
      count: areas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    next(error);
  }
}

/**
 * POST /api/areas
 * Create new area
 */
async function createArea(req, res, next) {
  try {
    const { name, description, capacity, is_active = 1 } = req.body;
    const db = await dbPromise;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO areas (name, description, capacity, is_active, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `, [name, description || null, capacity || null, is_active], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.status(201).json({
      success: true,
      data: { id: result.id, name, description, capacity, is_active },
      message: 'Area created successfully'
    });
  } catch (error) {
    console.error('Error creating area:', error);
    next(error);
  }
}

/**
 * PUT /api/areas/:id
 * Update area
 */
async function updateArea(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, capacity, is_active } = req.body;
    const db = await dbPromise;
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      params.push(capacity);
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
        UPDATE areas 
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
        error: 'Area not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Area updated successfully'
    });
  } catch (error) {
    console.error('Error updating area:', error);
    next(error);
  }
}

/**
 * DELETE /api/areas/:id
 * Delete area (checks for associated tables)
 */
async function deleteArea(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    // Check if area has associated tables
    const tables = await new Promise((resolve, reject) => {
      db.all('SELECT COUNT(*) as count FROM tables WHERE area_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]?.count || 0);
      });
    });
    
    if (tables > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete area: ${tables} table(s) are associated with this area`
      });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM areas WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Area not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Area deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting area:', error);
    next(error);
  }
}

module.exports = {
  getAreas,
  createArea,
  updateArea,
  deleteArea
};

