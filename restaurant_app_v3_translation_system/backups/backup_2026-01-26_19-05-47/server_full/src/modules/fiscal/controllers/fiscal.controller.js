/**
 * PHASE E10.1 - Fiscal Controller
 * 
 * Coordinates fiscal receipt generation, printing, and archiving.
 */

const FiscalService = require('../services/printer.service');
const ANAFService = require('../services/anaf.service');
const { requireRole } = require('../../../middleware/rbac');

class FiscalController {
  /**
   * POST /api/fiscal/fiscalize-order
   * Fiscalize an order (generate receipt + print + archive)
   */
  async fiscalizeOrder(req, res, next) {
    try {
      const { orderId, payment } = req.body;

      // 1. Generate fiscal receipt XML
      const fiscalPayload = await FiscalService.generateReceipt(orderId, payment);

      // 2. Print to fiscal printer
      const printerResponse = await FiscalService.print(fiscalPayload);

      // 3. Archive fiscal document (ANAF compliance)
      const archive = await ANAFService.archiveFiscalDocument(fiscalPayload);

      res.json({
        status: 'ok',
        printer: printerResponse,
        archiveId: archive.id,
        fiscalNumber: fiscalPayload.fiscalNumber
      });
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
   * POST /api/fiscal/receipt/:id/cancel
   */
  async cancelReceipt(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const result = await FiscalService.cancelReceipt(id, reason);
      
      res.json({
        status: 'ok',
        data: result,
        message: 'Receipt cancelled successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fiscal/z-report
   */
  async getZReport(req, res, next) {
    try {
      const { date } = req.query;
      const report = await FiscalService.getZReport(date);
      res.json({ status: 'ok', data: report });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/fiscal/z-report
   */
  async generateZReport(req, res, next) {
    try {
      const report = await FiscalService.generateZReport();
      res.json({
        status: 'ok',
        data: report,
        message: 'Z report generated successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fiscal/x-report
   */
  async getXReport(req, res, next) {
    try {
      const report = await FiscalService.getXReport();
      res.json({ status: 'ok', data: report });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fiscal/status
   * Get real printer status via FiscalPrinterProtocol
   */
  async getFiscalStatus(req, res, next) {
    try {
      const PrinterService = require('../services/printer.service');
      
      // Initialize if needed
      await PrinterService.init();
      
      // Get status from protocol
      const status = await PrinterService.getStatus();
      
      res.json({
        success: true,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('[FiscalController] Status error:', err);
      res.json({
        success: false,
        error: err.message,
        status: {
          connected: false,
          error: err.message
        }
      });
    }
  }
}

module.exports = new FiscalController();

