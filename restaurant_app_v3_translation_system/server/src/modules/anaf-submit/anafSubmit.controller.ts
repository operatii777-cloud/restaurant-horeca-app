/**
 * FAZA 1 - ANAF Submit Controller
 * Extended with token management and health endpoints
 */

const anafSubmitService = require('./anafSubmit.service');
const anafTokenService = require('./token/anafToken.service');
const AnafJournalRepository = require('./journal/anafJournal.repository');
const AnafQueueService = require('./queue/anafQueue.service');
const { dbPromise } = require('../../../database');

/**
 * GET /api/anaf/health
 * ANAF Health Dashboard data
 */
async function getAnafHealth(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Create anaf_queue table if it doesn't exist
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS anaf_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_type TEXT NOT NULL,
          document_id INTEGER NOT NULL,
          xml TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('high', 'normal')),
          status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'DEAD_LETTER')),
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else {
          // Create indexes
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_queue_status ON anaf_queue(status, scheduled_at)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_queue_priority ON anaf_queue(priority, scheduled_at)`, () => resolve());
        }
      });
    });
    
    // Get certificate info
    const certificate = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM anaf_certificates 
        WHERE is_active = 1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Get token info
    const tokenInfo = await anafTokenService.getCurrentToken();
    const isTokenExpiring = await anafTokenService.isTokenExpiredOrExpiringSoon();
    
    // Get queue stats
    const queueStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END), 0) as processing,
          COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END), 0) as success,
          COALESCE(SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END), 0) as failed,
          COALESCE(SUM(CASE WHEN status = 'DEAD_LETTER' THEN 1 ELSE 0 END), 0) as dead_letter
        FROM anaf_queue
      `, [], (err, row) => {
        if (err) reject(err);
        else {
          // Ensure all values are numbers, not null
          resolve({
            total: row?.total || 0,
            pending: row?.pending ?? 0,
            processing: row?.processing ?? 0,
            success: row?.success ?? 0,
            failed: row?.failed ?? 0,
            dead_letter: row?.dead_letter ?? 0
          });
        }
      });
    });
    
    // Get errors last 24h
    const errorsLast24h = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM anaf_submission_logs
        WHERE state = 'FAILED' 
          AND created_at >= datetime('now', '-1 day')
      `, [], (err, row) => {
        if (err) {
          // Table might not exist
          resolve(0);
        } else {
          resolve(row?.count || 0);
        }
      });
    });

    // Get printer queue stats
    const printerQueueStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
        FROM fiscal_print_queue
      `, [], (err, row) => {
        if (err) {
          // Table might not exist
          resolve({ total: 0, pending: 0, failed: 0 });
        } else {
          resolve(row || { total: 0, pending: 0, failed: 0 });
        }
      });
    });

    // Create anaf_journal table if it doesn't exist
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS anaf_journal (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_id INTEGER NOT NULL,
          document_type TEXT NOT NULL,
          xml TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('QUEUED', 'SUBMITTED', 'CONFIRMED', 'REJECTED', 'FAILED')),
          attempts INTEGER NOT NULL DEFAULT 0,
          spv_id TEXT,
          response_xml TEXT,
          error TEXT,
          submitted_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else {
          // Create indexes
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_journal_document ON anaf_journal(document_id, document_type)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_anaf_journal_status ON anaf_journal(status, created_at)`, () => resolve());
        }
      });
    });
    
    // Get submission timeline (last 7 days)
    const timeline = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          DATE(created_at) as day,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'SUBMITTED' OR status = 'CONFIRMED' THEN 1 ELSE 0 END) as submitted,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
        FROM anaf_journal
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY day DESC
      `, [], (err, rows) => {
        if (err) {
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });
    
    // Get recent submissions (last 10)
    const recentSubmissions = await AnafJournalRepository.list({
      limit: 10,
      offset: 0
    });
    
    res.json({
      success: true,
      data: {
        certificate: certificate ? {
          hasCertificate: true,
          expiryDate: certificate.expiry_date,
          isExpired: certificate.expiry_date ? new Date(certificate.expiry_date) < new Date() : null,
          daysUntilExpiry: certificate.expiry_date 
            ? Math.ceil((new Date(certificate.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null
        } : {
          hasCertificate: false
        },
        token: tokenInfo ? {
          hasToken: true,
          status: isTokenExpiring ? 'expiring_soon' : 'valid',
          expiresAt: tokenInfo.expiresAt,
          isExpiringSoon: isTokenExpiring,
          daysUntilExpiry: Math.ceil((tokenInfo.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        } : {
          hasToken: false,
          status: 'missing'
        },
        queue: queueStats || {
          total: 0,
          pending: 0,
          processing: 0,
          success: 0,
          failed: 0,
          dead_letter: 0
        },
        errorsLast24h,
        recentSubmissions: recentSubmissions || []
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/anaf/submissions
 * List ANAF submissions with filters
 */
async function getSubmissions(req, res, next) {
  try {
    const { documentType, status, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    const submissions = await AnafJournalRepository.list({
      documentType,
      status,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/anaf/token/refresh
 * Manually refresh ANAF token
 */
async function refreshToken(req, res, next) {
  try {
    const newToken = await anafTokenService.refreshToken();
    
    if (newToken) {
      res.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to refresh token. Check ANAF SPV configuration.'
      });
    }
  } catch (error) {
    next(error);
  }
}

// Legacy controller functions (if they exist elsewhere, import them)
// For now, we'll add placeholder implementations
async function getStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { documentType } = req.query;
    
    const status = await anafSubmitService.getSubmissionStatus(parseInt(id), documentType || 'FACTURA');
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
}

// Alias for getAnafHealth (for backward compatibility)
const getHealth = getAnafHealth;

async function resubmit(req, res, next) {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    
    const result = await anafSubmitService.resubmitDocument(parseInt(id), documentType || 'FACTURA');
    
    res.json({
      success: true,
      message: 'Document queued for resubmission',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getJournal(req, res, next) {
  try {
    const { documentType, status, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    const entries = await AnafJournalRepository.list({
      documentType,
      status,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnafHealth,
  getHealth, // Alias for backward compatibility
  getSubmissions,
  refreshToken,
  getStatus,
  resubmit,
  getJournal
};
