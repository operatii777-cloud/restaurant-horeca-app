/**
 * PHASE E10.1 - Fiscalizare ANAF Controller
 * 
 * Handles fiscal receipt generation, ANAF compliance, and printer integration.
 */

const FiscalizareService = require('../services/fiscalizare.service');
let FiscalAuditService;
try {
  FiscalAuditService = require('../services/fiscalAudit.service');
} catch (err) {
  console.warn('⚠️ FiscalAuditService not available - fiscal audit features disabled');
  FiscalAuditService = null;
}
const { NotFoundError, BusinessLogicError } = require('../../../utils/errors');

class FiscalizareController {
  constructor() {
    this.service = new FiscalizareService();
  }

  /**
   * GET /api/fiscalizare/config
   */
  getFiscalConfig = async (req, res, next) => {
    try {
      const config = await this.service.getFiscalConfig();
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/fiscalizare/config
   */
  updateFiscalConfig = async (req, res, next) => {
    try {
      const config = await this.service.updateFiscalConfig(req.body);
      res.json({ success: true, data: config, message: 'Fiscal configuration updated' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/fiscalizare/receipt
   * Generate fiscal receipt for an order
   */
  generateReceipt = async (req, res, next) => {
    try {
      const { orderId, paymentMethod, cashAmount, cardAmount, voucherAmount } = req.body;
      
      if (!orderId) {
        throw new BusinessLogicError('Order ID is required', 'MISSING_ORDER_ID');
      }

      const receipt = await this.service.generateReceipt({
        orderId,
        paymentMethod,
        cashAmount,
        cardAmount,
        voucherAmount
      });

      res.status(201).json({
        success: true,
        data: receipt,
        message: 'Fiscal receipt generated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/fiscalizare/receipt/:id
   */
  getReceipt = async (req, res, next) => {
    try {
      const { id } = req.params;
      const receipt = await this.service.getReceipt(id);
      
      if (!receipt) {
        throw new NotFoundError('Fiscal receipt', id);
      }

      res.json({ success: true, data: receipt });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/fiscalizare/receipts
   */
  getReceipts = async (req, res, next) => {
    try {
      const { startDate, endDate, limit = 50, offset = 0 } = req.query;
      const receipts = await this.service.getReceipts({
        startDate,
        endDate,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({ success: true, data: receipts });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/fiscalizare/receipt/:id/print
   */
  printReceipt = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.service.printReceipt(id);
      
      res.json({
        success: true,
        data: result,
        message: 'Receipt sent to fiscal printer'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/fiscalizare/receipt/:id/cancel
   */
  cancelReceipt = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const result = await this.service.cancelReceipt(id, reason);
      
      res.json({
        success: true,
        data: result,
        message: 'Receipt cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/fiscalizare/status
   */
  getFiscalStatus = async (req, res, next) => {
    try {
      const status = await this.service.getFiscalStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/fiscalizare/z-report
   */
  getZReport = async (req, res, next) => {
    try {
      const { date } = req.query;
      const report = await this.service.getZReport(date);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/fiscalizare/z-report
   */
  generateZReport = async (req, res, next) => {
    try {
      const report = await this.service.generateZReport();
      res.json({
        success: true,
        data: report,
        message: 'Z report generated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/fiscalizare/x-report
   */
  getXReport = async (req, res, next) => {
    try {
      const { date } = req.query;
      const report = await this.service.getXReport(date);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/fiscal/reports/monthly
   * Get monthly report for a specific month/year
   */
  getMonthlyReport = async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const report = await this.service.getMonthlyReport(month, year);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/fiscal/reports/monthly/generate
   * Generate monthly report
   */
  generateMonthlyReport = async (req, res, next) => {
    try {
      const { month, year } = req.body;
      const report = await this.service.generateMonthlyReport(month, year);
      res.json({
        success: true,
        data: report,
        message: 'Monthly report generated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/fiscal/reports/monthly/submit
   * Submit monthly report to ANAF
   */
  submitMonthlyReport = async (req, res, next) => {
    try {
      const { month, year } = req.body;
      const result = await this.service.submitMonthlyReport(month, year);
      res.json({
        success: true,
        data: result,
        message: 'Monthly report submitted to ANAF successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * FAZA 1.6 - GET /api/fiscal/order/:id/status
   * Get fiscal status for an order
   */
  getOrderFiscalStatus = async (req, res, next) => {
    try {
      if (!FiscalAuditService) {
        return res.status(503).json({
          success: false,
          error: 'Fiscal audit service not available'
        });
      }
      
      const { id } = req.params;
      const status = await FiscalAuditService.getOrderFiscalStatus(parseInt(id, 10));
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  };

  /**
   * FAZA 1.6 - POST /api/fiscal/order/:id/retry
   * Retry fiscalization for an order
   */
  retryOrderFiscalization = async (req, res, next) => {
    try {
      const { id } = req.params;
      const orderId = parseInt(id, 10);

      if (!FiscalAuditService) {
        return res.status(503).json({
          success: false,
          error: 'Fiscal audit service not available'
        });
      }
      
      // Get current status
      const status = await FiscalAuditService.getOrderFiscalStatus(orderId);
      
      if (!status.canRetry) {
        throw new BusinessLogicError(
          `Order ${orderId} cannot be retried. Current status: ${status.status}`,
          'CANNOT_RETRY'
        );
      }

      // Log retry attempt
      if (FiscalAuditService) {
        await FiscalAuditService.logFiscalOperation({
          orderId,
          status: 'PENDING',
          retryCount: 1,
        });
      }

      // Re-generate receipt
      const receipt = await this.service.generateReceipt({
        orderId,
        paymentMethod: req.body.paymentMethod,
        cashAmount: req.body.cashAmount,
        cardAmount: req.body.cardAmount,
        voucherAmount: req.body.voucherAmount
      });

      res.json({
        success: true,
        data: receipt,
        message: 'Fiscalization retry initiated'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new FiscalizareController();

