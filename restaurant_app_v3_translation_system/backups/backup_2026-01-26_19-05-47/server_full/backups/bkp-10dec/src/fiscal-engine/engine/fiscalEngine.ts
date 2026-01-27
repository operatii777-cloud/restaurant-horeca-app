/**
 * PHASE S8.8 - Fiscal Engine (Unified)
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Main entry point for all fiscal operations
 */

const { ReceiptEngine } = require('./receiptEngine');
const { UBLEngine } = require('./ublEngine');
const { TVAEngine } = require('./tvaEngine');
const { StockEngine } = require('./stockEngine');
const { PrinterEngine } = require('./printerEngine');
const { SaftEngine } = require('./saftEngine');
const { AnafEngine } = require('./anafEngine');

/**
 * PHASE S8.8 - Unified Fiscal Engine
 * 
 * Consolidates all fiscal operations into a single enterprise engine
 */
class FiscalEngine {
  private receiptEngine: ReceiptEngine;
  private ublEngine: UBLEngine;
  private tvaEngine: TVAEngine;
  private stockEngine: StockEngine;
  private printerEngine: PrinterEngine;
  private saftEngine: SaftEngine;
  private anafEngine: AnafEngine;

  constructor() {
    this.receiptEngine = new ReceiptEngine();
    this.ublEngine = new UBLEngine();
    this.tvaEngine = new TVAEngine();
    this.stockEngine = new StockEngine();
    this.printerEngine = new PrinterEngine();
    this.saftEngine = new SaftEngine();
    this.anafEngine = new AnafEngine();
  }

  /**
   * PHASE S8.8 - Fiscalize order (complete flow)
   * 
   * 1. Validate order
   * 2. Calculate totals with TVA v2
   * 3. Generate fiscal receipt
   * 4. Validate with SAF-T
   * 5. Print to fiscal printer
   * 6. Consume stock
   * 7. Generate UBL
   * 8. Queue for ANAF submission
   */
  async fiscalizeOrder(orderId: number, payment: {
    method: string;
    cashAmount?: number;
    cardAmount?: number;
    voucherAmount?: number;
  }) {
    // 1. Get order
    const order = await this.receiptEngine.getOrder(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. Calculate totals with TVA v2
    const totals = await this.tvaEngine.calculateTotals(order, payment);

    // 3. Generate fiscal receipt
    const receiptData = this.receiptEngine.generateReceiptData({
      order,
      totals,
      paymentMethod: payment.method,
      timestamp: new Date()
    });

    // 4. Validate with SAF-T
    const saftValidation = await this.saftEngine.validateFiscalReceipt(receiptData);
    if (!saftValidation.valid && saftValidation.errors.length > 0) {
      throw new Error(`SAF-T validation failed: ${saftValidation.errors.map(e => e.message).join(', ')}`);
    }

    // 5. Save receipt
    const receipt = await this.receiptEngine.saveReceipt(receiptData);

    // 6. Print to fiscal printer (queue)
    if (this.receiptEngine.shouldAutoPrint()) {
      await this.printerEngine.queuePrint(receipt.id);
    }

    // 7. Consume stock
    if (totals.totalPaid >= totals.total && receipt.id) {
      await this.stockEngine.consumeStockForOrder(order, receipt);
    }

    // 8. Generate UBL
    const ublXml = await this.ublEngine.generateUBLForOrder(orderId, {
      client: { name: order.customer_name || 'Client' }
    });

    // 9. Queue for ANAF submission
    if (process.env.ANAF_AUTO_SUBMIT === 'true') {
      await this.anafEngine.queueDocument('ORDER', orderId, ublXml);
    }

    return {
      receipt,
      ublXml,
      totals
    };
  }

  /**
   * PHASE S8.8 - Generate UBL for tipizate document
   */
  async generateUBLForTipizate(docType: string, docId: number) {
    // Use UBL engine with tipizate adapter
    return await this.ublEngine.generateUBLForTipizate(docType, docId);
  }

  /**
   * PHASE S8.8 - Submit document to ANAF
   */
  async submitToANAF(documentType: string, documentId: number, xml: string) {
    return await this.anafEngine.submitDocument(documentType, documentId, xml);
  }

  /**
   * PHASE S8.8 - Get fiscal status
   */
  async getStatus() {
    return {
      printer: await this.printerEngine.getStatus(),
      queue: await this.anafEngine.getQueueStatus(),
      journal: await this.anafEngine.getJournalStats()
    };
  }
}

// Export singleton instance
const fiscalEngine = new FiscalEngine();
module.exports = fiscalEngine;
module.exports.fiscalEngine = fiscalEngine;

