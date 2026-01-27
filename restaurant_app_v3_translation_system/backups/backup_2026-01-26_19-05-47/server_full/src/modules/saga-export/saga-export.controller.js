/**
 * SAGA Export Controller
 * Handles SAGA export functionality and history
 */

const { dbPromise } = require('../../../database');
const { convertUnit } = require('../../../helpers/unit-conversion');

/**
 * POST /api/saga/export
 * Export data to SAGA format (CSV)
 */
async function exportSaga(req, res, next) {
  try {
    const { type, startDate, endDate, debitAccount, creditAccount, defaultVatRate, brand } = req.body;
    
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Lipsesc date obligatorii: type, startDate, endDate' });
    }

    const db = await dbPromise;
    let rows = [];

    if (type === 'nir') {
      // Get NIR documents
      const nirs = await db.all(`
        SELECT 
          td.id,
          td.number,
          td.date,
          td.supplier_name,
          td.supplier_cui,
          td.supplier_address,
          td.total_value,
          td.vat_amount,
          td.total_with_vat,
          td.location_name as gestiune,
          json_extract(td.lines, '$') as lines_json
        FROM tipizate_documents td
        WHERE td.type = 'NIR'
          AND DATE(td.date) >= ?
          AND DATE(td.date) <= ?
          AND td.status = 'LOCKED'
        ORDER BY td.date, td.number
      `, [startDate, endDate]);

      for (const nir of nirs) {
        let lines = [];
        try {
          lines = JSON.parse(nir.lines_json || '[]');
        } catch {
          lines = [];
        }

        for (const line of lines) {
          const vatRate = line.vat_percent || defaultVatRate || 11;
          const valueWithoutVat = line.total_value / (1 + vatRate / 100);
          const vatAmount = line.total_value - valueWithoutVat;

          rows.push({
            TipDocument: 'NIR',
            NumarDocument: nir.number || `NIR-${nir.id}`,
            DataDocument: nir.date,
            Partener: nir.supplier_name || '',
            CUI: nir.supplier_cui || '',
            Factura: line.invoice_number || '',
            ContDebit: debitAccount || '371',
            ContCredit: creditAccount || '401',
            Gestiune: nir.gestiune || brand?.gestion || '',
            Articol: line.productName || '',
            Cantitate: line.quantity || 0,
            UM: line.unit || 'buc',
            ValoareFaraTVA: valueWithoutVat.toFixed(2),
            TVA: vatAmount.toFixed(2),
            ValoareCuTVA: line.total_value.toFixed(2),
            CotaTVA: vatRate.toFixed(2),
            Observatii: line.notes || ''
          });
        }
      }
    } else if (type === 'sales') {
      // Get sales orders
      const orders = await db.all(`
        SELECT 
          o.id,
          o.id as order_number,
          o.timestamp,
          o.total,
          o.vat_amount,
          o.customer_name,
          o.customer_cui,
          o.customer_address,
          o.location_name as gestiune
        FROM orders o
        WHERE DATE(o.timestamp) >= ?
          AND DATE(o.timestamp) <= ?
          AND o.status != 'cancelled'
          AND o.is_paid = 1
        ORDER BY o.timestamp
      `, [startDate, endDate]);

      for (const order of orders) {
        const vatRate = defaultVatRate || 11;
        const valueWithoutVat = order.total / (1 + vatRate / 100);
        const vatAmount = order.total - valueWithoutVat;

        rows.push({
          TipDocument: 'Vanzare',
          NumarDocument: order.order_number || `ORD-${order.id}`,
          DataDocument: order.timestamp.split(' ')[0],
          Partener: order.customer_name || 'Client',
          CUI: order.customer_cui || '',
          Factura: '',
          ContDebit: debitAccount || '371',
          ContCredit: creditAccount || '401',
          Gestiune: order.gestiune || brand?.gestion || '',
          Articol: 'Vanzare servicii',
          Cantitate: 1,
          UM: 'buc',
          ValoareFaraTVA: valueWithoutVat.toFixed(2),
          TVA: vatAmount.toFixed(2),
          ValoareCuTVA: order.total.toFixed(2),
          CotaTVA: vatRate.toFixed(2),
          Observatii: `Comanda ${order.order_number}`
        });
      }
    }

    // Save to history
    if (rows.length > 0) {
      await db.run(`
        INSERT INTO saga_export_history (
          type, start_date, end_date, rows_count,
          debit_account, credit_account, default_vat_rate,
          exported_by, exported_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        type,
        startDate,
        endDate,
        rows.length,
        debitAccount || '371',
        creditAccount || '401',
        defaultVatRate || 11,
        req.user?.username || 'admin'
      ]);
    }

    // Generate CSV
    const csvColumns = [
      'TipDocument', 'NumarDocument', 'DataDocument', 'Partener', 'CUI',
      'Factura', 'ContDebit', 'ContCredit', 'Gestiune', 'Articol',
      'Cantitate', 'UM', 'ValoareFaraTVA', 'TVA', 'ValoareCuTVA',
      'CotaTVA', 'Observatii'
    ];

    const csvHeader = csvColumns.join(';');
    const csvRows = rows.map(row =>
      csvColumns.map(col => {
        const value = row[col] ?? '';
        const safe = String(value).replace(/"/g, '""');
        return `"${safe}"`;
      }).join(';')
    );
    const csv = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="saga-${type}-${startDate}-${endDate}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error in exportSaga:', error);
    next(error);
  }
}

/**
 * GET /api/saga/history
 * Get SAGA export history
 */
async function getSagaHistory(req, res, next) {
  try {
    const db = await dbPromise;
    const history = await db.all(`
      SELECT 
        id,
        type,
        start_date,
        end_date,
        rows_count,
        debit_account,
        credit_account,
        default_vat_rate,
        exported_by,
        exported_at
      FROM saga_export_history
      ORDER BY exported_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      history: history || []
    });
  } catch (error) {
    console.error('Error in getSagaHistory:', error);
    next(error);
  }
}

/**
 * GET /api/saga/brand-config
 * Get SAGA brand configuration
 */
async function getBrandConfig(req, res, next) {
  try {
    const db = await dbPromise;
    const config = await db.get(`
      SELECT * FROM saga_brand_config
      ORDER BY id DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      config: config || {
        unitName: '',
        cui: '',
        address: '',
        gestion: ''
      }
    });
  } catch (error) {
    console.error('Error in getBrandConfig:', error);
    // If table doesn't exist, return empty config
    res.json({
      success: true,
      config: {
        unitName: '',
        cui: '',
        address: '',
        gestion: ''
      }
    });
  }
}

/**
 * POST /api/saga/brand-config
 * Save SAGA brand configuration
 */
async function saveBrandConfig(req, res, next) {
  try {
    const { unitName, cui, address, gestion } = req.body;

    if (!unitName || !cui || !address || !gestion) {
      return res.status(400).json({ error: 'Lipsesc date obligatorii: unitName, cui, address, gestion' });
    }

    const db = await dbPromise;
    
    // Create table if it doesn't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS saga_brand_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unitName TEXT NOT NULL,
        cui TEXT NOT NULL,
        address TEXT NOT NULL,
        gestion TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert or update config
    await db.run(`
      INSERT INTO saga_brand_config (unitName, cui, address, gestion)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        unitName = excluded.unitName,
        cui = excluded.cui,
        address = excluded.address,
        gestion = excluded.gestion,
        updated_at = CURRENT_TIMESTAMP
    `, [unitName, cui, address, gestion]);

    res.json({
      success: true,
      message: 'Configurare brand salvată cu succes'
    });
  } catch (error) {
    console.error('Error in saveBrandConfig:', error);
    next(error);
  }
}

module.exports = {
  exportSaga,
  getSagaHistory,
  getBrandConfig,
  saveBrandConfig
};

