/**
 * PHASE E10.1 - Receipts Controller
 * 
 * Handles receipt queries and management.
 */

const FiscalService = require('../services/printer.service');

class ReceiptsController {
  /**
   * GET /api/fiscal/receipts
   */
  async getReceipts(req, res, next) {
    try {
      const { startDate, endDate, limit = 50, offset = 0 } = req.query;
      const receipts = await FiscalService.getReceipts({
        startDate,
        endDate,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({ status: 'ok', data: receipts });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fiscal/receipt/:id
   */
  async getReceipt(req, res, next) {
    try {
      const { id } = req.params;
      const receipt = await FiscalService.getReceipt(id);
      
      if (!receipt) {
        return res.status(404).json({
          status: 'error',
          error: 'Receipt not found'
        });
      }

      res.json({ status: 'ok', data: receipt });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fiscal/receipt/:id/xml
   */
  async getReceiptXML(req, res, next) {
    try {
      const { id } = req.params;
      const receipt = await FiscalService.getReceipt(id);
      
      if (!receipt) {
        return res.status(404).json({
          status: 'error',
          error: 'Receipt not found'
        });
      }

      res.setHeader('Content-Type', 'application/xml');
      res.send(receipt.xml || receipt.receipt_xml);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReceiptsController();

