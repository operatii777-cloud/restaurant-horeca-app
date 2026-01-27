/**
 * PHASE E10.1 - Fiscalizare ANAF Service
 * 
 * Business logic for fiscal receipt generation and ANAF compliance.
 */

const FiscalizareRepository = require('../repo/fiscalizare.repository');
const { FiscalReceiptGenerator } = require('../utils/fiscalReceiptGenerator');
const PrinterService = require('./printer.service');
const PrintJobsRepository = require('../repo/printJobs.repository');
const StockConsumptionService = require('../../stocks/services/stockConsumption.service');
const { BusinessLogicError } = require('../../../utils/errors');
// PHASE S8.4 - TVA System v2
const TVAService = require('../../tva/tva.service');
// PHASE S8.5 - SAF-T Validation
const SaftService = require('../../saft/saft.service');
// PHASE S8.7 - ANAF Submit v2
const AnafSubmitService = require('../../anaf-submit/anafSubmit.service');

class FiscalizareService {
  constructor() {
    this.repository = new FiscalizareRepository();
    this.receiptGenerator = new FiscalReceiptGenerator();
  }

  /**
   * Get fiscal configuration
   */
  async getFiscalConfig() {
    return await this.repository.getFiscalConfig();
  }

  /**
   * Update fiscal configuration
   */
  async updateFiscalConfig(config) {
    // Validate configuration
    this.validateFiscalConfig(config);
    
    return await this.repository.updateFiscalConfig(config);
  }

  /**
   * Generate fiscal receipt for an order
   */
  async generateReceipt({ orderId, paymentMethod, cashAmount, cardAmount, voucherAmount }) {
    // 1. Get order details
    const order = await this.repository.getOrder(orderId);
    if (!order) {
      throw new BusinessLogicError(`Order ${orderId} not found`, 'ORDER_NOT_FOUND');
    }

    // 2. Calculate totals (PHASE S8.4 - uses TVA System v2)
    const totals = await this.calculateTotals(order, {
      cashAmount: cashAmount || 0,
      cardAmount: cardAmount || 0,
      voucherAmount: voucherAmount || 0
    });

    // 3. Generate fiscal receipt data (ANAF format)
    const receiptData = this.receiptGenerator.generate({
      order,
      totals,
      paymentMethod,
      timestamp: new Date()
    });

    // PHASE S8.5 - Validate against SAF-T requirements
    const saftValidation = await SaftService.validateFiscalReceiptData(receiptData);
    if (!saftValidation.valid) {
      console.warn('[FISCAL] SAF-T validation errors:', saftValidation.errors);
      // Continue with warnings, but log errors
      if (saftValidation.errors.length > 0) {
        throw new BusinessLogicError(
          `SAF-T validation failed: ${saftValidation.errors.map(e => e.message).join(', ')}`,
          'SAFT_VALIDATION_ERROR'
        );
      }
    }

    // 4. Save receipt to database
    const receipt = await this.repository.saveReceipt(receiptData);

    // 5. Create print job in queue (PHASE S7.3)
    if (this.shouldAutoPrint()) {
      try {
        await PrintJobsRepository.createPrintJob(receipt.id);
        console.log(`[FiscalizareService] Print job created for receipt ${receipt.id}`);
        
        // Optional: Try immediate print (non-blocking best-effort)
        // PrintQueueService.processNextJob().catch(() => {});
      } catch (queueError) {
        // Log error but don't fail receipt generation
        console.error('[FiscalizareService] Failed to create print job:', queueError);
      }
    }

    // 6. Consume stock (PHASE S7.4) - only if order is fully paid and receipt is saved
    if (totals.totalPaid >= totals.total && receipt.id) {
      try {
        await this.consumeStockForOrder(order, receipt);
      } catch (stockError) {
        // Log error but don't fail receipt generation
        console.error('[FiscalizareService] Failed to consume stock:', stockError);
      }
    }

    return receipt;
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(id) {
    return await this.repository.getReceipt(id);
  }

  /**
   * Get receipts with filters
   */
  async getReceipts({ startDate, endDate, limit, offset }) {
    return await this.repository.getReceipts({
      startDate,
      endDate,
      limit,
      offset
    });
  }

  /**
   * Print receipt to fiscal printer
   */
  async printReceipt(receiptId) {
    const receipt = await this.repository.getReceipt(receiptId);
    if (!receipt) {
      throw new BusinessLogicError('Receipt not found', 'RECEIPT_NOT_FOUND');
    }

    const result = await this.printerDriver.print(receipt);
    await this.repository.updateReceiptStatus(receiptId, 'printed');

    return result;
  }

  /**
   * Cancel receipt
   */
  async cancelReceipt(receiptId, reason) {
    const receipt = await this.repository.getReceipt(receiptId);
    if (!receipt) {
      throw new BusinessLogicError('Receipt not found', 'RECEIPT_NOT_FOUND');
    }

    if (receipt.status === 'cancelled') {
      throw new BusinessLogicError('Receipt already cancelled', 'ALREADY_CANCELLED');
    }

    // Cancel on fiscal printer
    await this.printerDriver.cancel(receipt.fiscalNumber, reason);

    // Update in database
    await this.repository.cancelReceipt(receiptId, reason);

    return { receiptId, status: 'cancelled' };
  }

  /**
   * Get fiscal printer status
   */
  async getFiscalStatus() {
    return await this.printerDriver.getStatus();
  }

  /**
   * Get Z report for date
   */
  async getZReport(date) {
    return await this.repository.getZReport(date);
  }

  /**
   * Generate Z report
   */
  async generateZReport() {
    const report = await this.repository.generateZReport();
    
    // Print Z report to fiscal printer
    if (this.shouldAutoPrint()) {
      await this.printerDriver.printZReport(report);
    }

    return report;
  }

  /**
   * Get X report (intermediary)
   */
  async getXReport() {
    return await this.repository.getXReport();
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  validateFiscalConfig(config) {
    if (!config.printerType) {
      throw new BusinessLogicError('Printer type is required', 'INVALID_CONFIG');
    }
    
    if (!config.printerPort && !config.printerIP) {
      throw new BusinessLogicError('Printer port or IP is required', 'INVALID_CONFIG');
    }
  }

  /**
   * PHASE S8.4 - Calculate totals with TVA System v2
   * 
   * Uses TVA System v2 to resolve VAT rates per product and date
   */
  async calculateTotals(order, payments) {
    const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
    
    // Calculate subtotal and VAT using TVA System v2
    let subtotal = 0;
    let vatAmount = 0;
    const vatBreakdown = {};
    
    for (const item of order.items || []) {
      const lineSubtotal = item.price * item.quantity;
      subtotal += lineSubtotal;
      
      // PHASE S8.4 - Use TVA System v2 to get VAT rate
      const vatRate = item.product_id 
        ? await TVAService.getVatRateForProduct(item.product_id, orderDate)
        : await TVAService.getVatRateAt(orderDate, 'standard');
      
      const lineVat = (lineSubtotal * vatRate) / 100;
      vatAmount += lineVat;
      
      // Group by VAT rate for breakdown
      if (!vatBreakdown[vatRate]) {
        vatBreakdown[vatRate] = {
          baseAmount: 0,
          vatAmount: 0
        };
      }
      vatBreakdown[vatRate].baseAmount += lineSubtotal;
      vatBreakdown[vatRate].vatAmount += lineVat;
    }
    
    const total = subtotal + vatAmount;
    const totalPaid = (payments.cashAmount || 0) + (payments.cardAmount || 0) + (payments.voucherAmount || 0);
    const change = totalPaid - total;

    return {
      subtotal,
      vatAmount,
      total,
      totalPaid,
      change,
      payments,
      vatBreakdown: Object.keys(vatBreakdown).map(rate => ({
        vatRate: parseFloat(rate),
        baseAmount: vatBreakdown[rate].baseAmount,
        vatAmount: vatBreakdown[rate].vatAmount
      }))
    };
  }

  shouldAutoPrint() {
    const config = this.repository.getFiscalConfig();
    return config?.autoPrint !== false; // Default: true
  }

  /**
   * PHASE S7.4 - Consume stock for order via unified StockEngine
   * 
   * This method consumes stock when a fiscal receipt is generated.
   * It is idempotent - if stock is already consumed, it skips.
   * 
   * @param {Object} order - Order object
   * @param {Object} fiscalReceipt - Fiscal receipt object
   * @returns {Promise<Object>} Result of stock consumption
   */
  async consumeStockForOrder(order, fiscalReceipt) {
    if (!order?.id) {
      throw new Error('Order ID missing for stock consumption');
    }

    if (!fiscalReceipt?.id) {
      console.warn(`[FISCAL STOCK] No fiscal receipt ID provided for order ${order.id}, skipping stock consumption`);
      return { skipped: true, reason: 'NO_RECEIPT' };
    }

    try {
      // Use unified StockConsumptionService
      const result = await StockConsumptionService.consumeStockForOrder(order.id, {
        reason: 'FISCAL_RECEIPT',
        source: 'POS',
        fiscalReceiptId: fiscalReceipt.id,
        fiscalNumber: fiscalReceipt.fiscalNumber || fiscalReceipt.fiscal_number
      });

      return result;
    } catch (err) {
      console.error(`[FISCAL STOCK] Error consuming stock for order ${order.id}:`, err);
      throw err;
    }
  }
}

module.exports = FiscalizareService;

