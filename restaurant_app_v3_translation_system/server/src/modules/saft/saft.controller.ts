/**
 * PHASE S8.5 - SAF-T Controller
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API endpoints for SAF-T validation
 */

const SaftService = require('./saft.service');
const FiscalizareRepository = require('../fiscal/repo/fiscalizare.repository.js');
const tipizateRepository = require('../tipizate/repositories/tipizate.repository').tipizateRepository;
const { dbPromise } = require('../../../database');

/**
 * POST /api/saft/validate/fiscal-receipt/:id
 * Validate fiscal receipt
 */
async function validateFiscalReceipt(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    const repository = new FiscalizareRepository();
    const receipt = await repository.getReceipt(parseInt(id, 10));
    
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Fiscal receipt not found'
      });
    }

    const result = await SaftService.validateFiscalReceiptData(receipt);
    
    res.json({
      success: result.valid,
      data: result
    });
  } catch (error: any) {
    console.error('[SAF-T] Error validating fiscal receipt:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate fiscal receipt'
    });
  }
}

/**
 * POST /api/saft/validate/ubl/:id
 * Validate UBL XML
 */
async function validateUBL(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    const { documentType, xml } = req.body;
    
    if (!xml) {
      return res.status(400).json({
        success: false,
        error: 'XML content is required'
      });
    }

    const result = await SaftService.validateUBLXml(documentType || 'INVOICE', xml);
    
    res.json({
      success: result.valid,
      data: result
    });
  } catch (error: any) {
    console.error('[SAF-T] Error validating UBL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate UBL'
    });
  }
}

/**
 * POST /api/saft/validate/tipizat/:docType/:id
 * Validate tipizate document
 */
async function validateTipizat(req: any, res: any, next: any) {
  try {
    const { docType, id } = req.params;
    const document = await tipizateRepository.getById(parseInt(id, 10));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const result = await SaftService.validateTipizatDocument(docType, document);
    
    res.json({
      success: result.valid,
      data: result
    });
  } catch (error: any) {
    console.error('[SAF-T] Error validating tipizate:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate tipizate document'
    });
  }
}

/**
 * POST /api/saft/validate/stock/:id
 * Validate stock transaction
 */
async function validateStock(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const stockMove = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM stock_moves WHERE id = ?',
        [parseInt(id, 10)],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!stockMove) {
      return res.status(404).json({
        success: false,
        error: 'Stock transaction not found'
      });
    }

    const result = await SaftService.validateStockTransactionData(stockMove);
    
    res.json({
      success: result.valid,
      data: result
    });
  } catch (error: any) {
    console.error('[SAF-T] Error validating stock transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate stock transaction'
    });
  }
}

/**
 * POST /api/saft/validate/payment/:id
 * Validate payment
 */
async function validatePayment(req: any, res: any, next: any) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const payment = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payments WHERE id = ?',
        [parseInt(id, 10)],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    const result = await SaftService.validatePaymentData(payment);
    
    res.json({
      success: result.valid,
      data: result
    });
  } catch (error: any) {
    console.error('[SAF-T] Error validating payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate payment'
    });
  }
}

/**
 * FAZA 1.5 - GET /api/saft/export?month=YYYY-MM
 * Export SAF-T XML for a specific month
 */
async function exportSaft(req: any, res: any, next: any) {
  try {
    const { month } = req.query;
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'Month parameter required in format YYYY-MM'
      });
    }

    const SaftExportService = require('./saft-export.service');
    
    // Validate before export
    const validation = await SaftExportService.validateSaftData(month);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'SAF-T validation failed',
        validationErrors: validation.errors
      });
    }

    // Generate XML
    const xml = await SaftExportService.generateSaftXml(month);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="SAF-T-${month}.xml"`);
    res.send(xml);
  } catch (error: any) {
    console.error('[SAF-T Export] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate SAF-T export'
    });
  }
}

/**
 * FAZA 1.5 - GET /api/saft/validate-export?month=YYYY-MM
 * Validate SAF-T data before export
 */
async function validateExport(req: any, res: any, next: any) {
  try {
    const { month } = req.query;
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'Month parameter required in format YYYY-MM'
      });
    }

    const SaftExportService = require('./saft-export.service');
    const validation = await SaftExportService.validateSaftData(month);
    
    res.json({
      success: validation.valid,
      data: validation
    });
  } catch (error: any) {
    console.error('[SAF-T Validate] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate SAF-T data'
    });
  }
}

/**
 * FAZA 1.5 - GET /api/saft/export-history
 * Get SAF-T export history
 */
async function getExportHistory(req: any, res: any, next: any) {
  try {
    const db = await dbPromise;
    
    const history = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          month,
          exported_at,
          file_size,
          status,
          error_message
        FROM saft_exports
        ORDER BY exported_at DESC
        LIMIT 50
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    console.error('[SAF-T History] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get export history'
    });
  }
}

module.exports = {
  validateFiscalReceipt,
  validateUBL,
  validateTipizat,
  validateStock,
  validatePayment,
  exportSaft,
  validateExport,
  getExportHistory
};


