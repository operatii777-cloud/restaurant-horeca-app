/**
 * PHASE E10.2 - E-Factura Controller
 * PHASE S8.2 - Enterprise e-Factura for Orders
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * REST API endpoints for e-Factura generation and SPV upload.
 */

const EFacturaService = require('../services/eFactura.service');
const { BusinessLogicError } = require('../../../utils/errors');

class EFacturaController {
  /**
   * PHASE S8.2 - POST /api/fiscal/invoice/generate
   * Generate and save invoice for an order
   */
  async generateInvoice(req, res, next) {
    try {
      const { orderId, client } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      const invoice = await EFacturaService.generateAndSave(orderId, client || {});

      res.json({
        success: true,
        invoice
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PHASE S8.2 - POST /api/fiscal/invoice/:id/upload-spv
   * Upload invoice to SPV (ANAF)
   */
  async uploadToSPV(req, res, next) {
    try {
      const { id } = req.params;

      const result = await EFacturaService.uploadToSPV(parseInt(id, 10));

      res.json({
        success: result.success,
        message: result.message,
        invoice: result.invoice,
        spvId: result.spvId
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PHASE S8.2 - GET /api/fiscal/invoice/:id
   * Get invoice by ID
   */
  async getInvoice(req, res, next) {
    try {
      const { id } = req.params;

      const invoice = await EFacturaService.getInvoice(parseInt(id, 10));

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        invoice
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PHASE S8.2 - GET /api/fiscal/invoices
   * Get invoices with filters
   */
  async getInvoices(req, res, next) {
    try {
      const {
        orderId,
        status,
        startDate,
        endDate,
        limit,
        offset
      } = req.query;

      const filters = {
        orderId: orderId ? parseInt(orderId, 10) : undefined,
        status,
        startDate,
        endDate,
        limit: limit ? parseInt(limit, 10) : 100,
        offset: offset ? parseInt(offset, 10) : 0
      };

      const invoices = await EFacturaService.getInvoices(filters);

      res.json({
        success: true,
        invoices,
        count: invoices.length
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PHASE S8.2 - POST /api/fiscal/invoice/:id/cancel
   * Cancel invoice
   */
  async cancelInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Cancellation reason is required'
        });
      }

      const invoice = await EFacturaService.cancelInvoice(parseInt(id, 10), reason);

      res.json({
        success: true,
        invoice
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EFacturaController();
