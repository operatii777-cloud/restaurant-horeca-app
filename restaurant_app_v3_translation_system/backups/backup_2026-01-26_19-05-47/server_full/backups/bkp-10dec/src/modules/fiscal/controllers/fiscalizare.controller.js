/**
 * PHASE E10.1 - Fiscalizare ANAF Controller
 * 
 * Handles fiscal receipt generation, ANAF compliance, and printer integration.
 */

const FiscalizareService = require('../services/fiscalizare.service');
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
      const report = await this.service.getXReport();
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new FiscalizareController();

