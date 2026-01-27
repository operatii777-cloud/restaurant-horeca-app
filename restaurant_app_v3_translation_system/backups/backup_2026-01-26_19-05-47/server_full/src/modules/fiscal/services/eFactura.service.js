/**
 * PHASE E10.2 - E-Factura Service
 * PHASE S8.2 - Enterprise e-Factura for Orders
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Handles e-Factura (UBL 2.1) generation, saving, and SPV upload.
 */

const UBLGeneratorService = require('./ublGenerator.service');
const { dbPromise } = require('../../../../database');

// Use node-fetch for SPV upload (Node.js 18+ has native fetch, but for compatibility)
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  // Fallback: use https module if fetch not available
  fetch = null;
}


class EFacturaService {
  /**
   * PHASE S8.2 - Generate and save invoice for an order
   * 
   * @param {number} orderId - Order ID
   * @param {Object} client - Client information
   * @returns {Promise<Object>} Saved invoice object
   */
  async generateAndSave(orderId, client, supplier = null) {
    const db = await dbPromise;

    // Get company info (with supplier from request if available)
    const company = await UBLGeneratorService.getCompanyInfo(supplier);

    // Generate UBL XML using UBL Core (pass company info)
    const xml = await UBLGeneratorService.createInvoice(orderId, client, company);

    // Get order for DTO
    const order = await UBLGeneratorService.getOrder(db, orderId);
    
    // Map to InvoiceDTO (PHASE S8.4 - async for TVA v2)
    const invoiceDTO = await UBLGeneratorService.mapOrderToInvoiceDTO(order, client, company);

    // Save invoice to database
    return new Promise((resolve, reject) => {
      // Extract series from invoice number (e.g., "INV-123" -> "INV")
      const invoiceSeries = invoiceDTO.invoiceNumber.split('-')[0] || 'INV';
      
      db.run(
        `INSERT INTO invoices 
         (order_id, invoice_series, invoice_number, client_name, client_cui, client_reg_com, total_amount, vat_amount, xml_content, json_data, dto_data, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated', datetime('now', 'localtime'), datetime('now', 'localtime'))`,
        [
          orderId,
          invoiceSeries,
          invoiceDTO.invoiceNumber,
          invoiceDTO.customer?.name || 'Client',
          invoiceDTO.customer?.cui || null,
          invoiceDTO.customer?.regCom || null,
          invoiceDTO.taxInclusiveAmount || 0,
          invoiceDTO.taxSubtotals?.reduce((sum, t) => sum + t.taxAmount, 0) || 0,
          xml,
          JSON.stringify(invoiceDTO),
          JSON.stringify(invoiceDTO)
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              orderId,
              invoiceNumber: invoiceDTO.invoiceNumber,
              status: 'generated',
              xml: xml
            });
          }
        }
      );
    });
  }

  /**
   * Generate standalone invoice without order (creates temporary order)
   * 
   * @param {Object} params - Invoice parameters
   * @param {Object} params.client - Client information
   * @param {Array} params.invoiceLines - Invoice lines (items)
   * @param {number} params.totalAmount - Total amount
   * @param {Object} params.supplier - Supplier information (from restaurant config)
   * @param {string} params.issueDate - Invoice issue date
   * @param {string} params.dueDate - Invoice due date
   * @param {string} params.paymentMethod - Payment method
   * @param {string} params.currency - Currency (RON, EUR, USD)
   * @param {string} params.notes - Invoice notes
   * @returns {Promise<Object>} Saved invoice object
   */
  async generateStandaloneInvoice({ client, invoiceLines, totalAmount, supplier, issueDate, dueDate, paymentMethod, currency, notes }) {
    const db = await dbPromise;

    // Calculate totalAmount from invoiceLines if not provided
    let calculatedTotal = totalAmount;
    if (!calculatedTotal && invoiceLines && invoiceLines.length > 0) {
      calculatedTotal = invoiceLines.reduce((sum, line) => {
        const lineTotal = (line.unitPrice || line.price || 0) * (line.quantity || 1);
        // Add VAT if included in price
        const vatRate = line.vatRate || 21;
        return sum + lineTotal * (1 + vatRate / 100);
      }, 0);
    }

    if (!calculatedTotal || calculatedTotal <= 0) {
      throw new Error('totalAmount is required and must be greater than 0');
    }

    // Create temporary order for invoice
    const tempOrderId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO orders (
          type, order_source, items, total, status, timestamp, is_paid, general_notes
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
        [
          'invoice', // Type: invoice (temporary order for invoice)
          'INVOICE', // Source: INVOICE (standalone invoice)
          JSON.stringify(invoiceLines.map(line => ({
            product_name: line.name || 'Servicii',
            quantity: line.quantity || 1,
            price: line.unitPrice || line.price || 0,
            product_id: line.productId || null,
            unit: line.unit || 'buc',
            vatRate: line.vatRate || 21
          }))),
          calculatedTotal,
          'paid', // Status: paid (invoice is already paid)
          1, // is_paid: true
          notes || `Factură standalone pentru ${client.name || 'Client'}`
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`[e-Factura] Standalone invoice created with temp order ID: ${tempOrderId}`);
    console.log(`[e-Factura] Supplier info:`, supplier ? supplier.name : 'Will be loaded from settings');

    // Generate invoice using the temporary order (pass supplier info)
    return await this.generateAndSave(tempOrderId, client, supplier);
  }

  /**
   * PHASE S8.2 - Upload invoice to SPV (ANAF)
   * 
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadToSPV(invoiceId) {
    const db = await dbPromise;

    // Get invoice
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status === 'uploaded') {
      return { success: true, message: 'Invoice already uploaded', invoice };
    }

    // Check if SPV is configured
    const spvUrl = process.env.ANAF_SPV_URL;
    const spvToken = process.env.ANAF_SPV_TOKEN;

    if (!spvUrl || !spvToken) {
      // SPV not configured - mark as generated only
      return {
        success: false,
        message: 'SPV not configured',
        invoice
      };
    }

    try {
      // Upload to SPV
      const response = await fetch(spvUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Bearer ${spvToken}`
        },
        body: invoice.xml_content
      });

      if (!response.ok) {
        throw new Error(`SPV upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update invoice status
      const self = this; // Save reference to this for use in callback
      return new Promise((resolve, reject) => {
        db.run(
          `UPDATE invoices 
           SET status = 'uploaded', 
               spv_id = ?,
               spv_response = ?,
               updated_at = datetime('now', 'localtime')
           WHERE id = ?`,
          [
            result.id || null,
            JSON.stringify(result),
            invoiceId
          ],
          async function(err) {
            if (err) {
              reject(err);
            } else {
              const updatedInvoice = await self.getInvoice(invoiceId);
              resolve({
                success: true,
                message: 'Invoice uploaded to SPV',
                spvId: result.id,
                invoice: updatedInvoice
              });
            }
          }
        );
      });
    } catch (error) {
      // Update invoice status to rejected
      const self = this; // Save reference to this for use in callback
      return new Promise((resolve, reject) => {
        db.run(
          `UPDATE invoices 
           SET status = 'rejected', 
               spv_error = ?,
               updated_at = datetime('now', 'localtime')
           WHERE id = ?`,
          [error.message, invoiceId],
          async function(err) {
            if (err) {
              reject(err);
            } else {
              const updatedInvoice = await self.getInvoice(invoiceId);
              resolve({
                success: false,
                message: error.message,
                invoice: updatedInvoice
              });
            }
          }
        );
      });
    }
  }

  /**
   * PHASE S8.2 - Get invoice by ID
   * 
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<Object|null>} Invoice object
   */
  async getInvoice(invoiceId) {
    const db = await dbPromise;

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM invoices WHERE id = ?`,
        [invoiceId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              // Parse JSON fields
              if (row.json_data && typeof row.json_data === 'string') {
                row.json_data = JSON.parse(row.json_data);
              }
              if (row.dto_data && typeof row.dto_data === 'string') {
                row.dto_data = JSON.parse(row.dto_data);
              }
              if (row.spv_response && typeof row.spv_response === 'string') {
                row.spv_response = JSON.parse(row.spv_response);
              }
            }
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * PHASE S8.2 - Get invoices with filters
   * 
   * @param {Object} filters - Filter options
   * @param {number} filters.orderId - Filter by order ID
   * @param {string} filters.status - Filter by status
   * @param {string} filters.startDate - Start date
   * @param {string} filters.endDate - End date
   * @param {number} filters.limit - Limit results
   * @param {number} filters.offset - Offset results
   * @returns {Promise<Array>} Array of invoices
   */
  async getInvoices(filters = {}) {
    const db = await dbPromise;
    const {
      orderId,
      status,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = filters;

    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];

    if (orderId) {
      query += ' AND order_id = ?';
      params.push(orderId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse JSON fields
          rows.forEach(row => {
            if (row.json_data && typeof row.json_data === 'string') {
              row.json_data = JSON.parse(row.json_data);
            }
            if (row.dto_data && typeof row.dto_data === 'string') {
              row.dto_data = JSON.parse(row.dto_data);
            }
            if (row.spv_response && typeof row.spv_response === 'string') {
              row.spv_response = JSON.parse(row.spv_response);
            }
          });
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * PHASE S8.2 - Cancel invoice
   * 
   * @param {number} invoiceId - Invoice ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancelled invoice
   */
  async cancelInvoice(invoiceId, reason) {
    const db = await dbPromise;

    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Invoice already cancelled');
    }

    const self = this; // Save reference to this for use in callback
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE invoices 
         SET status = 'cancelled',
             cancellation_reason = ?,
             updated_at = datetime('now', 'localtime')
         WHERE id = ?`,
        [reason, invoiceId],
        async function(err) {
          if (err) {
            reject(err);
          } else {
            const cancelledInvoice = await self.getInvoice(invoiceId);
            resolve(cancelledInvoice);
          }
        }
      );
    });
  }
}

module.exports = new EFacturaService();
