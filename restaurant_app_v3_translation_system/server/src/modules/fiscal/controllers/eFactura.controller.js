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
   * Generate and save invoice for an order or standalone invoice
   * 
   * Supports:
   * - Invoice with orderId (existing order)
   * - Standalone invoice without orderId (creates temporary order)
   */
  async generateInvoice(req, res, next) {
    try {
      const { orderId, client, invoiceLines, totalAmount, supplier, issueDate, dueDate, paymentMethod, currency, notes } = req.body;

      // If no orderId, create standalone invoice (requires invoiceLines and totalAmount)
      if (!orderId) {
        if (!invoiceLines || !Array.isArray(invoiceLines) || invoiceLines.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'For standalone invoices, invoiceLines array is required'
          });
        }
        if (!totalAmount || totalAmount <= 0) {
          return res.status(400).json({
            success: false,
            error: 'For standalone invoices, totalAmount is required'
          });
        }

        // Generate standalone invoice with supplier info
        const invoice = await EFacturaService.generateStandaloneInvoice({
          client: client || {},
          invoiceLines,
          totalAmount,
          supplier: supplier || null, // Supplier info from frontend (restaurant config)
          issueDate,
          dueDate,
          paymentMethod,
          currency,
          notes
        });

        res.json({
          success: true,
          invoice
        });
      } else {
        // Generate invoice from existing order with supplier info
        const invoice = await EFacturaService.generateAndSave(orderId, client || {}, supplier || null);

        res.json({
          success: true,
          invoice
        });
      }
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

      // Format response for admin-vite React (expects { items, total, page, pageSize })
      // Also support legacy format { invoices, count }
      const page = Math.floor(offset / limit) + 1;
      const pageSize = limit;
      
      res.json({
        success: true,
        // New format for admin-vite
        items: invoices,
        total: invoices.length, // TODO: Get actual total count from DB
        page: page,
        pageSize: pageSize,
        // Legacy format for backward compatibility
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
