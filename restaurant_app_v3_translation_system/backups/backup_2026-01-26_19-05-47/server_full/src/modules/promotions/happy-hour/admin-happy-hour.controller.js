/**
 * Admin Happy Hour Controller
 * Handles CRUD operations for Happy Hour settings (admin interface)
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/admin/happy-hour
 * Get all Happy Hour settings
 */
async function getAllHappyHours(req, res, next) {
  try {
    const db = await dbPromise;
    const happyHours = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM happy_hour_settings
        ORDER BY created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json(happyHours);
  } catch (error) {
    console.error('Error in getAllHappyHours:', error);
    next(error);
  }
}

/**
 * GET /api/admin/happy-hour/:id
 * Get a specific Happy Hour setting
 */
async function getHappyHourById(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const happyHour = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM happy_hour_settings
        WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!happyHour) {
      return res.status(404).json({ error: 'Happy Hour not found' });
    }

    res.json(happyHour);
  } catch (error) {
    console.error('Error in getHappyHourById:', error);
    next(error);
  }
}

/**
 * POST /api/admin/happy-hour
 * Create a new Happy Hour setting
 */
async function createHappyHour(req, res, next) {
  try {
    const {
      name,
      start_time,
      end_time,
      days_of_week,
      discount_percentage = 0,
      discount_fixed = 0,
      applicable_categories,
      applicable_products,
      is_active = true
    } = req.body;

    if (!name || !start_time || !end_time || !days_of_week) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await dbPromise;
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO happy_hour_settings (
          name, start_time, end_time, days_of_week,
          discount_percentage, discount_fixed,
          applicable_categories, applicable_products, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        name,
        start_time,
        end_time,
        typeof days_of_week === 'string' ? days_of_week : JSON.stringify(days_of_week),
        discount_percentage,
        discount_fixed,
        applicable_categories ? (typeof applicable_categories === 'string' ? applicable_categories : JSON.stringify(applicable_categories)) : null,
        applicable_products ? (typeof applicable_products === 'string' ? applicable_products : JSON.stringify(applicable_products)) : null,
        is_active ? 1 : 0
      ], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

    // ✅ Emite eveniment Socket.IO pentru sincronizare în timp real în restorapp
    if (global.io) {
      global.io.emit('happy_hour:updated', {
        id: result.lastID,
        action: 'created',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Socket.IO: Emitted happy_hour:updated event (created)');
    }

    res.status(201).json({
      id: result.lastID,
      message: 'Happy Hour created successfully'
    });
  } catch (error) {
    console.error('Error in createHappyHour:', error);
    next(error);
  }
}

/**
 * PUT /api/admin/happy-hour/:id
 * Update a Happy Hour setting
 */
async function updateHappyHour(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      start_time,
      end_time,
      days_of_week,
      discount_percentage,
      discount_fixed,
      applicable_categories,
      applicable_products,
      is_active
    } = req.body;

    const db = await dbPromise;

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (start_time !== undefined) {
      updates.push('start_time = ?');
      params.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push('end_time = ?');
      params.push(end_time);
    }
    if (days_of_week !== undefined) {
      updates.push('days_of_week = ?');
      params.push(typeof days_of_week === 'string' ? days_of_week : JSON.stringify(days_of_week));
    }
    if (discount_percentage !== undefined) {
      updates.push('discount_percentage = ?');
      params.push(discount_percentage);
    }
    if (discount_fixed !== undefined) {
      updates.push('discount_fixed = ?');
      params.push(discount_fixed);
    }
    if (applicable_categories !== undefined) {
      updates.push('applicable_categories = ?');
      params.push(applicable_categories ? (typeof applicable_categories === 'string' ? applicable_categories : JSON.stringify(applicable_categories)) : null);
    }
    if (applicable_products !== undefined) {
      updates.push('applicable_products = ?');
      params.push(applicable_products ? (typeof applicable_products === 'string' ? applicable_products : JSON.stringify(applicable_products)) : null);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE happy_hour_settings
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

    // ✅ Emite eveniment Socket.IO pentru sincronizare în timp real în restorapp
    if (global.io) {
      global.io.emit('happy_hour:updated', {
        id: parseInt(id),
        action: 'updated',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Socket.IO: Emitted happy_hour:updated event (updated)');
    }

    res.json({ message: 'Happy Hour updated successfully' });
  } catch (error) {
    console.error('Error in updateHappyHour:', error);
    next(error);
  }
}

/**
 * DELETE /api/admin/happy-hour/:id
 * Delete a Happy Hour setting
 */
async function deleteHappyHour(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM happy_hour_settings
        WHERE id = ?
      `, [id], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Happy Hour not found' });
    }

    // ✅ Emite eveniment Socket.IO pentru sincronizare în timp real în restorapp
    if (global.io) {
      global.io.emit('happy_hour:updated', {
        id: parseInt(id),
        action: 'deleted',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Socket.IO: Emitted happy_hour:updated event (deleted)');
    }

    res.json({ message: 'Happy Hour deleted successfully' });
  } catch (error) {
    console.error('Error in deleteHappyHour:', error);
    next(error);
  }
}

/**
 * PUT /api/admin/happy-hour/:id/toggle
 * Toggle active status of a Happy Hour
 */
async function toggleHappyHourStatus(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Get current status
    const happyHour = await new Promise((resolve, reject) => {
      db.get(`
        SELECT is_active FROM happy_hour_settings
        WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!happyHour) {
      return res.status(404).json({ error: 'Happy Hour not found' });
    }

    // Toggle status
    const newStatus = happyHour.is_active ? 0 : 1;
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE happy_hour_settings
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newStatus, id], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });

    // ✅ Emite eveniment Socket.IO pentru sincronizare în timp real în restorapp
    if (global.io) {
      global.io.emit('happy_hour:updated', {
        id: parseInt(id),
        action: 'toggled',
        is_active: newStatus === 1,
        timestamp: new Date().toISOString()
      });
      console.log('✅ Socket.IO: Emitted happy_hour:updated event (toggled)');
    }

    res.json({
      message: 'Happy Hour status toggled successfully',
      is_active: newStatus === 1
    });
  } catch (error) {
    console.error('Error in toggleHappyHourStatus:', error);
    next(error);
  }
}

/**
 * GET /api/admin/happy-hour/stats
 * Get statistics for Happy Hour usage
 */
async function getHappyHourStats(req, res, next) {
  try {
    const db = await dbPromise;
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'AND hhu.timestamp >= ? AND hhu.timestamp <= ?';
      params.push(startDate, endDate);
    }

    // Get statistics per Happy Hour
    const stats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          hhs.id,
          hhs.name,
          hhs.start_time,
          hhs.end_time,
          hhs.days_of_week,
          hhs.discount_percentage,
          hhs.discount_fixed,
          COUNT(hhu.id) as usage_count,
          COALESCE(SUM(hhu.discount_amount), 0) as total_discount,
          COALESCE(SUM(hhu.final_total), 0) as total_revenue,
          COALESCE(AVG(hhu.discount_amount), 0) as avg_discount
        FROM happy_hour_settings hhs
        LEFT JOIN happy_hour_usage hhu ON hhs.id = hhu.happy_hour_id
        ${dateFilter ? `WHERE 1=1 ${dateFilter}` : ''}
        GROUP BY hhs.id
        ORDER BY usage_count DESC, hhs.created_at DESC
      `, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Error in getHappyHourStats:', error);
    next(error);
  }
}

/**
 * GET /api/admin/happy-hour/stats/revenue
 * Get revenue statistics over time for Happy Hour
 */
async function getHappyHourRevenueStats(req, res, next) {
  try {
    const db = await dbPromise;
    const { startDate, endDate, happyHourId } = req.query;

    let dateFilter = '';
    let happyHourFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND DATE(hhu.timestamp) >= ? AND DATE(hhu.timestamp) <= ?';
      params.push(startDate, endDate);
    }
    
    if (happyHourId) {
      happyHourFilter = 'AND hhu.happy_hour_id = ?';
      params.push(happyHourId);
    }

    const revenueData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          DATE(hhu.timestamp) as date,
          COALESCE(SUM(hhu.final_total), 0) as revenue,
          COALESCE(SUM(hhu.discount_amount), 0) as discount,
          COUNT(DISTINCT hhu.order_id) as orders
        FROM happy_hour_usage hhu
        WHERE 1=1 ${dateFilter} ${happyHourFilter}
        GROUP BY DATE(hhu.timestamp)
        ORDER BY date ASC
      `, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(revenueData);
  } catch (error) {
    console.error('Error in getHappyHourRevenueStats:', error);
    next(error);
  }
}

/**
 * GET /api/admin/happy-hour/stats/top-products
 * Get top products sold during Happy Hour
 */
async function getHappyHourTopProducts(req, res, next) {
  try {
    const db = await dbPromise;
    const { startDate, endDate, happyHourId, limit = 10 } = req.query;

    let dateFilter = '';
    let happyHourFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND DATE(o.timestamp) >= ? AND DATE(o.timestamp) <= ?';
      params.push(startDate, endDate);
    }
    
    if (happyHourId) {
      happyHourFilter = 'AND hhu.happy_hour_id = ?';
      params.push(happyHourId);
    }

    params.push(parseInt(limit));

    const topProducts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          oi.product_id,
          COALESCE(m.name, oi.product_name, 'Produs necunoscut') as product_name,
          SUM(oi.quantity) as quantity,
          SUM(oi.price * oi.quantity) as revenue,
          SUM(COALESCE(hhu.discount_amount, 0) * oi.quantity / (
            SELECT SUM(oi2.quantity) 
            FROM order_items oi2 
            WHERE oi2.order_id = o.id
          )) as discount
        FROM orders o
        INNER JOIN happy_hour_usage hhu ON o.id = hhu.order_id
        INNER JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu m ON oi.product_id = m.id
        WHERE 1=1 ${dateFilter} ${happyHourFilter}
        GROUP BY oi.product_id, COALESCE(m.name, oi.product_name)
        ORDER BY quantity DESC, revenue DESC
        LIMIT ?
      `, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(topProducts);
  } catch (error) {
    console.error('Error in getHappyHourTopProducts:', error);
    next(error);
  }
}

module.exports = {
  getAllHappyHours,
  getHappyHourById,
  createHappyHour,
  updateHappyHour,
  deleteHappyHour,
  toggleHappyHourStatus,
  getHappyHourStats,
  getHappyHourRevenueStats,
  getHappyHourTopProducts
};

