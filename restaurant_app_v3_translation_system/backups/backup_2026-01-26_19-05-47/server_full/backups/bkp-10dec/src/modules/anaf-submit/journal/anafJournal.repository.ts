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
      `INSERT INTO anaf_journal 
       (document_id, document_type, xml, status, attempts, spv_id, response_xml, error, submitted_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))`,
      [
        entry.document_id,
        entry.document_type,
        entry.xml,
        entry.status,
        entry.attempts || 0,
        entry.spvId || null,
        entry.responseXml || null,
        entry.error || null
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
    const updates: string[] = ['status = ?', 'updated_at = datetime(\'now\', \'localtime\')'];
    const params: any[] = [status];

    if (data.spvId !== undefined) {
      updates.push('spv_id = ?');
      params.push(data.spvId);
    }
    if (data.responseXml !== undefined) {
      updates.push('response_xml = ?');
      params.push(data.responseXml);
    }
    if (data.error !== undefined) {
      updates.push('error = ?');
      params.push(data.error);
    }
    if (data.submittedAt) {
      updates.push('submitted_at = ?');
      params.push(data.submittedAt.toISOString());
    }

    params.push(documentId, documentType);

    db.run(
      `UPDATE anaf_journal 
       SET ${updates.join(', ')}
       WHERE document_id = ? AND document_type = ?`,
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
      `SELECT * FROM anaf_journal 
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
  
  let sql = 'SELECT * FROM anaf_journal WHERE 1=1';
  const params: any[] = [];

  if (filters.documentType) {
    sql += ' AND document_type = ?';
    params.push(filters.documentType);
  }
  if (filters.status) {
    sql += ' AND status = ?';
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


