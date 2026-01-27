/**
 * PHASE S7.2 - Printer Service (Enterprise)
 * 
 * Handles fiscal receipt generation and printer communication using FiscalPrinterProtocol.
 */

const { buildFiscalXML } = require('../utils/receiptFormatter');
const FiscalPrinterDriver = require('../drivers/fiscalPrinterDriver');
const FiscalDocsModel = require('../model/fiscalDocs.model');
const FiscalizareRepository = require('../repo/fiscalizare.repository');
const { dbPromise } = require('../../../database');

class PrinterService {
  constructor() {
    this.driver = null;
    this.model = new FiscalDocsModel();
    this.repository = new FiscalizareRepository();
  }

  /**
   * Initialize printer driver with fiscal config
   */
  async init() {
    if (this.driver) {
      return; // Already initialized
    }

    const config = await this.repository.getFiscalConfig();
    this.driver = new FiscalPrinterDriver(config);
    await this.driver.initialize();
  }

  /**
   * Generate fiscal receipt for an order
   */
  async generateReceipt(orderId, payment) {
    const db = await dbPromise;
    
    // Get order with items
    const order = await this.getOrder(db, orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Build fiscal XML
    const fiscalXML = buildFiscalXML(order, payment);

    // Generate fiscal number
    const fiscalNumber = this.generateFiscalNumber();
    const receiptNumber = this.generateReceiptNumber();

    // Save to database
    const receipt = await this.model.create({
      orderId,
      fiscalNumber,
      receiptNumber,
      xml: fiscalXML,
      type: 'RECEIPT',
      status: 'generated',
      total: order.total,
      paymentType: payment.type,
      paymentAmount: payment.amount
    });

    return {
      id: receipt.id,
      fiscalNumber,
      receiptNumber,
      xml: fiscalXML,
      order,
      payment
    };
  }

  /**
   * Print receipt to fiscal printer
   */
  async print(fiscalPayload) {
    // Ensure driver is initialized
    if (!this.driver) {
      await this.init();
    }

    // Ensure connected
    await this.driver.ensureConnected();

    // Print receipt
    const result = await this.driver.print(fiscalPayload);

    // Update status in database
    if (fiscalPayload.id) {
      await this.model.updateStatus(fiscalPayload.id, 'printed');
    }

    return result;
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(id) {
    return await this.model.getById(id);
  }

  /**
   * Get receipts with filters
   */
  async getReceipts({ startDate, endDate, limit, offset }) {
    return await this.model.getAll({ startDate, endDate, limit, offset });
  }

  /**
   * Cancel receipt
   */
  async cancelReceipt(id, reason) {
    const receipt = await this.model.getById(id);
    if (!receipt) {
      throw new Error('Receipt not found');
    }

    // Ensure driver is initialized
    if (!this.driver) {
      await this.init();
    }

    // Cancel on printer
    await this.driver.cancel(receipt.fiscalNumber, reason);

    // Update in database
    await this.model.cancel(id, reason);

    return { id, status: 'cancelled' };
  }

  /**
   * Print X report (informative)
   */
  async xReport() {
    if (!this.driver) {
      await this.init();
    }

    await this.driver.ensureConnected();
    return await this.driver.printXReport();
  }

  /**
   * Print Z report (daily closure)
   */
  async zReport(report = null) {
    if (!this.driver) {
      await this.init();
    }

    await this.driver.ensureConnected();
    return await this.driver.printZReport(report);
  }

  /**
   * Get Z report data
   */
  async getZReport(date) {
    return await this.model.getZReport(date);
  }

  /**
   * Generate Z report
   */
  async generateZReport() {
    const report = await this.model.generateZReport();
    
    // Print Z report to printer
    await this.zReport(report);

    return report;
  }

  /**
   * Get X report data
   */
  async getXReport() {
    return await this.model.getXReport();
  }

  /**
   * Get printer status
   */
  async getStatus() {
    if (!this.driver) {
      await this.init();
    }

    try {
      return await this.driver.getStatus();
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  async getOrder(db, orderId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT o.*, 
               json_group_array(
                 json_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'vat_rate', COALESCE(p.vat_rate, 19)
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = ?
        GROUP BY o.id
      `, [orderId], (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            row.items = JSON.parse(row.items || '[]');
          }
          resolve(row);
        }
      });
    });
  }

  generateFiscalNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `FISC-${timestamp}-${random}`;
  }

  generateReceiptNumber() {
    const timestamp = Date.now();
    return `RCP-${timestamp}`;
  }

  async getPrinterConfig() {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM fiscal_config LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row || {
          printerType: 'datecs',
          printerPort: null,
          printerIP: null,
          autoPrint: true
        });
      });
    });
  }
}

module.exports = new PrinterService();

