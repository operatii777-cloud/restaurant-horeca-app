/**
 * PHASE IMPORT-FACTURI - Invoice Import Controller
 * 
 * Handles invoice import functionality (PDF, XML, manual)
 * Integrates with NIR (Notă de Intrare Recepție) and stock_moves
 */

const { dbPromise } = require('../../../../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../../uploads/invoices');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `invoice-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.xml'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tip fișier invalid: ${ext}. Acceptate: ${allowedTypes.join(', ')}`));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

/**
 * Parse XML invoice (e-Factura RO format)
 * @param {string} xmlContent - XML content
 * @returns {Object} Parsed invoice data
 */
async function parseXMLInvoice(xmlContent) {
  // TODO: Implement full XML parsing for e-Factura RO format (UBL)
  // For now, return basic structure
  return {
    invoiceNumber: 'XML-' + Date.now(),
    supplier: 'Supplier from XML',
    date: new Date().toISOString().split('T')[0],
    total: 0,
    items: []
  };
}

/**
 * Parse PDF invoice (OCR-based extraction)
 * @param {string} filePath - Path to PDF file
 * @returns {Object} Parsed invoice data
 */
async function parsePDFInvoice(filePath) {
  // TODO: Implement PDF parsing with pdf-parse or OCR
  // For now, return basic structure
  return {
    invoiceNumber: 'PDF-' + Date.now(),
    supplier: 'Supplier from PDF',
    date: new Date().toISOString().split('T')[0],
    total: 0,
    items: []
  };
}

/**
 * POST /api/admin/inventory/import-invoice
 * Import invoice (PDF or XML) and create NIR + stock_moves
 */
async function importInvoice(req, res, next) {
  const db = await dbPromise;
  
  try {
    console.log('[Invoice Import] Starting import...');
    console.log('[Invoice Import] Body:', req.body);
    console.log('[Invoice Import] File:', req.file);

    const {
      file_type,
      invoice_number,
      supplier,
      invoice_date,
      total_value
    } = req.body;

    // Validate required fields
    if (!invoice_number || !supplier || !invoice_date || !total_value) {
      return res.status(400).json({
        success: false,
        error: 'Câmpuri obligatorii lipsă: invoice_number, supplier, invoice_date, total_value'
      });
    }

    const file = req.file;
    let parsedData = null;

    // Parse file if provided
    if (file) {
      console.log('[Invoice Import] Parsing file:', file.originalname);
      
      if (file_type === 'xml') {
        const xmlContent = await fs.readFile(file.path, 'utf8');
        parsedData = await parseXMLInvoice(xmlContent);
      } else if (file_type === 'pdf') {
        parsedData = await parsePDFInvoice(file.path);
      }
      
      console.log('[Invoice Import] Parsed data:', parsedData);
    }

    // Use manual data if no file or parsing failed
    const invoiceData = {
      invoice_number: parsedData?.invoiceNumber || invoice_number,
      supplier: parsedData?.supplier || supplier,
      date: parsedData?.date || invoice_date,
      total: parsedData?.total || parseFloat(total_value),
      file_path: file ? file.path : null,
      file_type: file_type || 'manual',
      items: parsedData?.items || []
    };

    console.log('[Invoice Import] Final invoice data:', invoiceData);

    // Step 1: Create NIR header
    const nirResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO nir_headers (
          nir_number,
          supplier_id,
          supplier_name,
          date,
          total,
          status,
          notes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          invoiceData.invoice_number,
          null, // supplier_id - will be resolved from supplier name later
          invoiceData.supplier,
          invoiceData.date,
          invoiceData.total,
          'draft',
          `Importat din factură ${file_type || 'manual'}`,
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    const nirId = nirResult.id;
    console.log('[Invoice Import] NIR created with ID:', nirId);

    // Step 2: Create NIR lines (if items exist)
    if (invoiceData.items && invoiceData.items.length > 0) {
      for (const item of invoiceData.items) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO nir_lines (
              nir_id,
              ingredient_id,
              ingredient_name,
              quantity,
              unit_of_measure,
              unit_price,
              total_price,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              nirId,
              item.ingredient_id || null,
              item.name,
              item.quantity,
              item.unit || 'kg',
              item.unit_price,
              item.total
            ],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      console.log('[Invoice Import] NIR lines created:', invoiceData.items.length);
    }

    // Step 3: Create stock movements (RECEIVE type)
    if (invoiceData.items && invoiceData.items.length > 0) {
      for (const item of invoiceData.items) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO stock_moves (
              ingredient_id,
              ingredient_name,
              quantity,
              movement_type,
              reference_type,
              reference_id,
              notes,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              item.ingredient_id || null,
              item.name,
              item.quantity,
              'RECEIVE',
              'NIR',
              nirId,
              `Import NIR ${invoiceData.invoice_number}`
            ],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      console.log('[Invoice Import] Stock moves created:', invoiceData.items.length);
    }

    // Step 4: Store invoice document record
    const docResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO invoice_imports (
          invoice_number,
          supplier_name,
          invoice_date,
          total_value,
          file_type,
          file_path,
          nir_id,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          invoiceData.invoice_number,
          invoiceData.supplier,
          invoiceData.date,
          invoiceData.total,
          invoiceData.file_type,
          invoiceData.file_path,
          nirId,
          'imported'
        ],
        function(err) {
          if (err) {
            // Table might not exist, create it
            db.run(
              `CREATE TABLE IF NOT EXISTS invoice_imports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT NOT NULL,
                supplier_name TEXT NOT NULL,
                invoice_date TEXT NOT NULL,
                total_value REAL NOT NULL,
                file_type TEXT DEFAULT 'manual',
                file_path TEXT,
                nir_id INTEGER,
                status TEXT DEFAULT 'draft',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (nir_id) REFERENCES nir_headers(id) ON DELETE SET NULL
              )`,
              (createErr) => {
                if (createErr) {
                  reject(createErr);
                } else {
                  // Retry insert
                  db.run(
                    `INSERT INTO invoice_imports (
                      invoice_number,
                      supplier_name,
                      invoice_date,
                      total_value,
                      file_type,
                      file_path,
                      nir_id,
                      status,
                      created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [
                      invoiceData.invoice_number,
                      invoiceData.supplier,
                      invoiceData.date,
                      invoiceData.total,
                      invoiceData.file_type,
                      invoiceData.file_path,
                      nirId,
                      'imported'
                    ],
                    function(retryErr) {
                      if (retryErr) reject(retryErr);
                      else resolve({ id: this.lastID });
                    }
                  );
                }
              }
            );
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });

    console.log('[Invoice Import] Invoice import record created:', docResult.id);

    res.json({
      success: true,
      message: 'Factura a fost importată cu succes',
      data: {
        invoice_import_id: docResult.id,
        nir_id: nirId,
        invoice_number: invoiceData.invoice_number,
        supplier: invoiceData.supplier,
        total: invoiceData.total,
        items_count: invoiceData.items.length
      }
    });

  } catch (error) {
    console.error('[Invoice Import] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la importul facturii'
    });
  }
}

/**
 * GET /api/admin/inventory/import-history
 * Get import history
 */
async function getImportHistory(req, res, next) {
  const db = await dbPromise;
  
  try {
    const { limit = 50, offset = 0, status } = req.query;

    let query = `
      SELECT 
        ii.*,
        nh.status as nir_status,
        COUNT(nl.id) as items_count
      FROM invoice_imports ii
      LEFT JOIN nir_headers nh ON ii.nir_id = nh.id
      LEFT JOIN nir_lines nl ON nh.id = nl.nir_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND ii.status = ?';
      params.push(status);
    }

    query += `
      GROUP BY ii.id
      ORDER BY ii.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const imports = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          // Table might not exist
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          resolve(rows || []);
        }
      });
    });

    // Get total count
    const countQuery = 'SELECT COUNT(*) as total FROM invoice_imports' + (status ? ' WHERE status = ?' : '');
    const countParams = status ? [status] : [];
    
    const totalResult = await new Promise((resolve, reject) => {
      db.get(countQuery, countParams, (err, row) => {
        if (err) {
          resolve({ total: 0 });
        } else {
          resolve(row || { total: 0 });
        }
      });
    });

    res.json({
      success: true,
      data: imports,
      meta: {
        total: totalResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('[Invoice Import] Get history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la preluarea istoricului'
    });
  }
}

/**
 * DELETE /api/admin/inventory/import/:id
 * Delete an import record
 */
async function deleteImport(req, res, next) {
  const db = await dbPromise;
  
  try {
    const { id } = req.params;

    // Get import record to get file path and NIR ID
    const importRecord = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM invoice_imports WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!importRecord) {
      return res.status(404).json({
        success: false,
        error: 'Importul nu a fost găsit'
      });
    }

    // Delete file if exists
    if (importRecord.file_path) {
      try {
        await fs.unlink(importRecord.file_path);
      } catch (err) {
        console.warn('[Invoice Import] Could not delete file:', err.message);
      }
    }

    // Delete import record
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM invoice_imports WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      message: 'Importul a fost șters cu succes'
    });

  } catch (error) {
    console.error('[Invoice Import] Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la ștergerea importului'
    });
  }
}

module.exports = {
  upload,
  importInvoice,
  getImportHistory,
  deleteImport
};

