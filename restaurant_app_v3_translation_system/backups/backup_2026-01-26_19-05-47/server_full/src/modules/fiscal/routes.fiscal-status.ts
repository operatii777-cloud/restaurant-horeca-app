/**
 * FAZA 1.6 - Fiscal Status Routes
 * 
 * API routes for fiscal status queries
 */

const express = require('express');
const router = express.Router();
const FiscalAuditService = require('./services/fiscalAudit.service');
const { dbPromise } = require('../../../database');

/**
 * GET /api/admin/pos/fiscal/status/:orderId
 * Get fiscal status for an order
 */
router.get('/fiscal/status/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const status = await FiscalAuditService.getOrderFiscalStatus(parseInt(orderId, 10));
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/pos/fiscal/audit/:orderId
 * Get audit log for an order
 */
router.get('/fiscal/audit/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const auditLog = await FiscalAuditService.getOrderAuditLog(parseInt(orderId, 10));
    
    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/pos/fiscal/retry/:orderId
 * Retry fiscal operation for an order
 */
router.post('/fiscal/retry/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { operationType } = req.body; // 'PRINT' or 'ANAF_SUBMIT'
    
    const db = await dbPromise;
    
    if (operationType === 'PRINT') {
      // Get receipt data and re-enqueue
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      
      const FiscalPrintQueueService = require('../services/fiscalPrintQueue.service');
      await FiscalPrintQueueService.enqueue(orderId, { order }, 'high');
      
      await FiscalAuditService.logFiscalOperation({
        orderId: parseInt(orderId, 10),
        operationType: 'RETRY',
        status: 'PENDING',
        retryCount: 1,
      });
      
      res.json({ success: true, message: 'Print job re-enqueued' });
    } else if (operationType === 'ANAF_SUBMIT') {
      // Re-submit to ANAF
      const AnafSubmitService = require('../../anaf-submit/anafSubmit.service');
      // Get invoice/receipt XML
      const invoice = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM invoices WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
          [orderId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (!invoice || !invoice.xml_content) {
        return res.status(404).json({ success: false, error: 'Invoice XML not found' });
      }
      
      await AnafSubmitService.resubmitDocument(parseInt(orderId, 10), 'FACTURA');
      
      await FiscalAuditService.logFiscalOperation({
        orderId: parseInt(orderId, 10),
        operationType: 'RETRY',
        status: 'PENDING',
        retryCount: 1,
      });
      
      res.json({ success: true, message: 'ANAF submission re-queued' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid operation type' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

