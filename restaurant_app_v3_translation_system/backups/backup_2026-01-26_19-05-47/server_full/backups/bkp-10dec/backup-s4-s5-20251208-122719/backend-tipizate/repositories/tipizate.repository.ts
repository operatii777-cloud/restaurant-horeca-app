/**
 * PHASE S4.2 - Tipizate Repository
 * Database access layer for tipizate documents
 */

const { dbPromise } = require('../../../database');

exports.tipizateRepository = {
  /**
   * List documents by type with filters
   */
  async listByType(
    type: TipizatType,
    filters: {
      from?: string;
      to?: string;
      locationId?: number;
      warehouseId?: number;
      status?: TipizatStatus;
    } = {}
  ) {
    const db = await dbPromise;
    let sql = `
      SELECT * FROM tipizate_documents
      WHERE type = ?
    `;
    const params: any[] = [type];

    if (filters.from) {
      sql += ` AND date >= ?`;
      params.push(filters.from);
    }
    if (filters.to) {
      sql += ` AND date <= ?`;
      params.push(filters.to);
    }
    if (filters.locationId) {
      sql += ` AND location_id = ?`;
      params.push(filters.locationId);
    }
    if (filters.warehouseId) {
      sql += ` AND warehouse_id = ?`;
      params.push(filters.warehouseId);
    }
    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }

    sql += ` ORDER BY date DESC, number DESC`;

    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * Get document by ID
   */
  async getById(id: number) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tipizate_documents WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  },

  /**
   * Get NIR by ID (legacy, use getById)
   */
  async getNirById(id: number) {
    return this.getById(id);
  },

  /**
   * Insert NIR document (legacy, use insertDocument)
   */
  async insertNir(doc: any, userId: number) {
    return this.insertDocument('NIR', doc, userId);
  },

  /**
   * Update NIR document (legacy, use updateDocument)
   */
  async updateNir(id: number, doc: any, userId: number) {
    return this.updateDocument('NIR', id, doc, userId);
  },

  /**
   * Insert document (generic, works for all types)
   */
  async insertDocument(docType: string, doc: any, userId: number) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tipizate_documents (
          type, series, number, location_id, location_name, warehouse_id,
          date, status, created_by_user_id, created_at, updated_at,
          fiscal_header, lines, totals, document_data, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docType,
          doc.series,
          doc.number,
          doc.locationId,
          doc.locationName,
          doc.warehouseId || null,
          doc.date,
          'DRAFT',
          userId,
          now,
          now,
          JSON.stringify(doc.fiscalHeader || {}),
          JSON.stringify(doc.lines || []),
          JSON.stringify(doc.totals || {}),
          JSON.stringify(doc.documentData || {}),
          1,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...doc });
        }
      );
    });
  },

  /**
   * Update document (generic, works for all types)
   */
  async updateDocument(docType: string, id: number, doc: any, userId: number) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET
          series = ?, number = ?, date = ?,
          location_id = ?, location_name = ?, warehouse_id = ?,
          fiscal_header = ?, lines = ?, totals = ?, document_data = ?,
          updated_at = ?, version = version + 1
        WHERE id = ? AND status = 'DRAFT'`,
        [
          doc.series,
          doc.number,
          doc.date,
          doc.locationId,
          doc.locationName,
          doc.warehouseId || null,
          JSON.stringify(doc.fiscalHeader || {}),
          JSON.stringify(doc.lines || []),
          JSON.stringify(doc.totals || {}),
          JSON.stringify(doc.documentData || {}),
          now,
          id,
        ],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Document not found or cannot be modified'));
          else resolve({ id, ...doc });
        }
      );
    });
  },

  /**
   * Sign document
   */
  async signDocument(type: TipizatType, id: number, userId: number, userName?: string) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET
          status = 'SIGNED',
          signed_by_user_id = ?,
          signed_by_name = ?,
          signed_at = ?,
          updated_at = ?
        WHERE id = ? AND status IN ('DRAFT', 'VALIDATED')`,
        [userId, userName || null, now, now, id],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Document cannot be signed'));
          else resolve({ id, status: 'SIGNED' });
        }
      );
    });
  },

  /**
   * Lock document
   */
  async lockDocument(type: TipizatType, id: number, userId: number, userName?: string) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET
          status = 'LOCKED',
          locked_by_user_id = ?,
          locked_by_name = ?,
          locked_at = ?,
          updated_at = ?
        WHERE id = ? AND status = 'SIGNED'`,
        [userId, userName || null, now, now, id],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Document cannot be locked'));
          else resolve({ id, status: 'LOCKED' });
        }
      );
    });
  },

  /**
   * Archive document
   */
  async archiveDocument(id: number, userId: number, reason?: string) {
    const db = await dbPromise;
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tipizate_documents SET
          status = 'ARCHIVED',
          archived_at = ?,
          updated_at = ?
        WHERE id = ? AND status = 'LOCKED'`,
        [now, now, id],
        async function (err) {
          if (err) {
            reject(err);
            return;
          }
          if (this.changes === 0) {
            reject(new Error('Document cannot be archived'));
            return;
          }
          
          // Insert into archive table
          try {
            await new Promise((resolveArchive, rejectArchive) => {
              db.run(
                `INSERT INTO tipizate_archive (
                  document_id, archived_at, archived_by, archive_reason
                ) VALUES (?, ?, ?, ?)`,
                [id, now, userId, reason || null],
                function (archiveErr) {
                  if (archiveErr) rejectArchive(archiveErr);
                  else resolveArchive({ archiveId: this.lastID });
                }
              );
            });
            resolve({ id, status: 'ARCHIVED' });
          } catch (archiveErr) {
            reject(archiveErr);
          }
        }
      );
    });
  },
};

