/**
 * PHASE S8.5 - SAF-T Controller
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API endpoints for SAF-T validation
 */

const SaftService = require('./saft.service');
const FiscalizareRepository = require('../../fiscal/repo/fiscalizare.repository');
const tipizateRepository = require('../../tipizate/repositories/tipizate.repository').tipizateRepository;
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

module.exports = {
  validateFiscalReceipt,
  validateUBL,
  validateTipizat,
  validateStock,
  validatePayment
};


