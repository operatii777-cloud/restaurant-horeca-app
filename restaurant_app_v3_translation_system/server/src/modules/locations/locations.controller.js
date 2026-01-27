/**
 * FAZA MT.5 - Locations Controller
 * 
 * Handles CRUD operations for management_locations.
 */

const { dbPromise, locationQuery, locationQueryOne } = require('../../../database');

/**
 * GET /api/settings/locations
 * List all locations (filtered by current location context if needed)
 */
async function getAllLocations(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabela există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='management_locations'`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    if (!tableExists) {
      // Tabela nu există - returnează array gol
      return res.json({ success: true, locations: [] });
    }
    
    // Get all active locations (for multi-restaurant management)
    // In single-tenant mode, return all locations
    const locations = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          id, name, type, description, is_active,
          can_receive_deliveries, can_transfer_out, can_transfer_in, can_consume,
          manager_name, created_at, updated_at
        FROM management_locations
        ORDER BY is_active DESC, type DESC, name ASC`,
        [],
        (err, rows) => {
          if (err) {
            // Dacă e eroare SQL, returnează array gol în loc să crape
            console.warn('[Locations] Error querying management_locations:', err.message);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
    
    res.json({ success: true, locations });
  } catch (error) {
    // Dacă apare orice eroare, returnează array gol în loc de 500
    console.error('[Locations] Error in getAllLocations:', error);
    res.json({ success: true, locations: [] });
  }
}

/**
 * GET /api/settings/locations/:id
 * Get single location by ID
 */
async function getLocationById(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const location = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          id, name, type, description, is_active,
          can_receive_deliveries, can_transfer_out, can_transfer_in, can_consume,
          manager_name, created_at, updated_at
        FROM management_locations
        WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ success: true, location });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/settings/locations
 * Create new location
 */
async function createLocation(req, res, next) {
  try {
    const {
      name,
      type = 'operational',
      description,
      can_receive_deliveries = false,
      can_transfer_out = true,
      can_transfer_in = true,
      can_consume = false,
      manager_name,
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    
    const db = await dbPromise;
    
    const locationId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO management_locations 
        (name, type, description, is_active, can_receive_deliveries, 
         can_transfer_out, can_transfer_in, can_consume, manager_name, 
         created_at, updated_at)
        VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          name, type, description || null,
          can_receive_deliveries ? 1 : 0,
          can_transfer_out ? 1 : 0,
          can_transfer_in ? 1 : 0,
          can_consume ? 1 : 0,
          manager_name || null,
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // Return created location
    const location = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM management_locations WHERE id = ?`,
        [locationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    res.status(201).json({ success: true, location });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/settings/locations/:id
 * Update location
 */
async function updateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      description,
      can_receive_deliveries,
      can_transfer_out,
      can_transfer_in,
      can_consume,
      manager_name,
    } = req.body;
    
    const db = await dbPromise;
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (can_receive_deliveries !== undefined) {
      updates.push('can_receive_deliveries = ?');
      params.push(can_receive_deliveries ? 1 : 0);
    }
    if (can_transfer_out !== undefined) {
      updates.push('can_transfer_out = ?');
      params.push(can_transfer_out ? 1 : 0);
    }
    if (can_transfer_in !== undefined) {
      updates.push('can_transfer_in = ?');
      params.push(can_transfer_in ? 1 : 0);
    }
    if (can_consume !== undefined) {
      updates.push('can_consume = ?');
      params.push(can_consume ? 1 : 0);
    }
    if (manager_name !== undefined) {
      updates.push('manager_name = ?');
      params.push(manager_name);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = datetime(\'now\')');
    params.push(id);
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE management_locations 
        SET ${updates.join(', ')}
        WHERE id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Return updated location
    const location = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM management_locations WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ success: true, location });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/settings/locations/:id
 * Soft delete location (set is_active = 0)
 */
async function deleteLocation(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE management_locations 
        SET is_active = 0, updated_at = datetime('now')
        WHERE id = ?`,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Location deactivated' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/settings/locations/:id/activate
 * Activate location
 */
async function activateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE management_locations 
        SET is_active = 1, updated_at = datetime('now')
        WHERE id = ?`,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Location activated' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/settings/locations/:id/deactivate
 * Deactivate location
 */
async function deactivateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE management_locations 
        SET is_active = 0, updated_at = datetime('now')
        WHERE id = ?`,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Location deactivated' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  activateLocation,
  deactivateLocation,
};

