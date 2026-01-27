/**
 * Archive Controller
 * 
 * Endpoint-uri pentru gestionarea arhivei de comenzi
 */

const archiveService = require('./archive.service');

/**
 * POST /api/archive/run
 * Rulează procesul de arhivare manual
 */
async function runArchive(req, res, next) {
  try {
    const { daysOld } = req.body;
    const result = await archiveService.archiveOldOrders(daysOld || archiveService.ARCHIVE_RETENTION_DAYS);
    
    res.json({
      success: true,
      message: `Arhivare finalizată: ${result.archived} comenzi arhivate, ${result.errors} erori`,
      archived: result.archived,
      errors: result.errors
    });
  } catch (error) {
    console.error('❌ Eroare la rularea arhivării:', error);
    next(error);
  }
}

/**
 * GET /api/archive/stats
 * Obține statistici despre arhivă
 */
async function getArchiveStats(req, res, next) {
  try {
    const stats = await archiveService.getArchiveStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Eroare la obținerea statisticilor arhivei:', error);
    next(error);
  }
}

/**
 * POST /api/archive/backup
 * Creează backup extern al arhivei
 */
async function createBackup(req, res, next) {
  try {
    const { outputPath } = req.body;
    const backupPath = await archiveService.createArchiveBackup(outputPath);
    
    res.json({
      success: true,
      message: 'Backup creat cu succes',
      backupPath
    });
  } catch (error) {
    console.error('❌ Eroare la crearea backup-ului:', error);
    next(error);
  }
}

/**
 * GET /api/archive/orders
 * Obține comenzi arhivate (pentru rapoarte istorice)
 */
async function getArchivedOrders(req, res, next) {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    let query = `SELECT * FROM orders_archive WHERE 1=1`;
    const params = [];

    if (startDate) {
      query += ` AND timestamp >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND timestamp <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const orders = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Obține totalul pentru paginare
    let countQuery = `SELECT COUNT(*) as total FROM orders_archive WHERE 1=1`;
    const countParams = [];
    if (startDate) {
      countQuery += ` AND timestamp >= ?`;
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ` AND timestamp <= ?`;
      countParams.push(endDate);
    }

    const total = await new Promise((resolve, reject) => {
      db.get(countQuery, countParams, (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
      });
    });

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('❌ Eroare la obținerea comenzilor arhivate:', error);
    next(error);
  }
}

/**
 * GET /api/admin/archive-stats
 * Alias pentru /api/archive/stats (pentru compatibilitate cu frontend)
 */
async function getAdminArchiveStats(req, res, next) {
  return getArchiveStats(req, res, next);
}

/**
 * POST /api/admin/archive-orders
 * Alias pentru /api/archive/run (pentru compatibilitate cu frontend)
 */
async function archiveOrdersAdmin(req, res, next) {
  return runArchive(req, res, next);
}

/**
 * GET /api/admin/export-archived
 * Exportă comenzi arhivate în CSV/JSON
 */
async function exportArchivedOrders(req, res, next) {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;

    let query = `SELECT * FROM orders_archive WHERE 1=1`;
    const params = [];

    if (startDate) {
      query += ` AND timestamp >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND timestamp <= ?`;
      params.push(endDate);
    }
    query += ` ORDER BY timestamp DESC`;

    const orders = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (format === 'json') {
      res.json({
        success: true,
        orders,
        count: orders.length
      });
    } else {
      // CSV format
      const csv = [
        ['ID', 'Type', 'Table', 'Status', 'Total', 'Timestamp', 'Paid'].join(','),
        ...orders.map(o => [
          o.id,
          o.type || '',
          o.table_number || '',
          o.status || '',
          o.total || 0,
          o.timestamp || '',
          o.is_paid ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=archived-orders-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    }
  } catch (error) {
    console.error('❌ Eroare la exportul comenzilor arhivate:', error);
    next(error);
  }
}

/**
 * DELETE /api/admin/delete-archived
 * Șterge comenzi arhivate (cu validare)
 */
async function deleteArchivedOrders(req, res, next) {
  try {
    const { startDate, endDate, confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({
        success: false,
        error: 'Confirmare necesară pentru ștergerea comenzilor arhivate'
      });
    }

    const { dbPromise } = require('../../../database');
    const db = await dbPromise;

    let query = `DELETE FROM orders_archive WHERE 1=1`;
    const params = [];

    if (startDate) {
      query += ` AND timestamp >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND timestamp <= ?`;
      params.push(endDate);
    }

    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    res.json({
      success: true,
      message: `${result.changes} comenzi arhivate șterse`,
      deleted: result.changes
    });
  } catch (error) {
    console.error('❌ Eroare la ștergerea comenzilor arhivate:', error);
    next(error);
  }
}

module.exports = {
  runArchive,
  getArchiveStats,
  createBackup,
  getArchivedOrders,
  getAdminArchiveStats,
  archiveOrdersAdmin,
  exportArchivedOrders,
  deleteArchivedOrders
};

