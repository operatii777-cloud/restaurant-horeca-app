/**
 * PHASE S8.7 - ANAF Journal Repository
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Repository for ANAF submission journal
 */

const { dbPromise } = require('../../../../database');

/**
 * PHASE S8.7 - Create journal entry
 */
async function create(entry: {
  document_id: number;
  document_type: string;
  xml: string;
  status: string;
  attempts: number;
  spvId?: string | null;
  responseXml?: string | null;
  error?: string | null;
}) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO anaf_submission_logs 
       (document_id, document_type, payload, state, attempts, error_code, error_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
      [
        entry.document_id,
        entry.document_type,
        entry.xml || entry.payload || null,
        entry.status || 'QUEUED',
        entry.attempts || 0,
        null, // error_code
        entry.error || null // error_message
      ],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...entry });
      }
    );
  });
}

/**
 * PHASE S8.7 - Update journal entry status
 */
async function updateStatus(documentId: number, documentType: string, status: string, data: {
  spvId?: string | null;
  responseXml?: string | null;
  error?: string | null;
  submittedAt?: Date | null;
}) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    const updates: string[] = ['state = ?'];
    const params: any[] = [status];

    if (data.error !== undefined) {
      updates.push('error_message = ?');
      params.push(data.error);
    }

    params.push(documentId, documentType);

    db.run(
      `UPDATE anaf_submission_logs 
       SET ${updates.join(', ')}
       WHERE document_id = ? AND document_type = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      params,
      function(err) {
        if (err) reject(err);
        else resolve({ documentId, documentType, status });
      }
    );
  });
}

/**
 * PHASE S8.7 - Get journal entry by document
 */
async function getByDocument(documentId: number, documentType: string) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM anaf_submission_logs 
       WHERE document_id = ? AND document_type = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [documentId, documentType],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

/**
 * PHASE S8.7 - List journal entries
 */
async function list(filters: {
  documentType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await dbPromise;
  
  let sql = 'SELECT * FROM anaf_submission_logs WHERE 1=1';
  const params: any[] = [];

  if (filters.documentType) {
    sql += ' AND document_type = ?';
    params.push(filters.documentType);
  }
  if (filters.status) {
    sql += ' AND state = ?';
    params.push(filters.status);
  }
  if (filters.startDate) {
    sql += ' AND created_at >= ?';
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    sql += ' AND created_at <= ?';
    params.push(filters.endDate);
  }

  sql += ' ORDER BY created_at DESC';
  sql += ` LIMIT ? OFFSET ?`;
  params.push(filters.limit || 100, filters.offset || 0);

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = {
  create,
  updateStatus,
  getByDocument,
  list
};


