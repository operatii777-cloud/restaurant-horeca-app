/**
 * PHASE S8.8 - Stock Engine
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Stock consumption integration
 */

const StockConsumptionService = require('../../modules/stocks/services/stockConsumption.service');

class StockEngine {
  /**
   * PHASE S8.8 - Consume stock for order
   */
  async consumeStockForOrder(order: any, fiscalReceipt: any) {
    return await StockConsumptionService.consumeStockForOrder(order.id, {
      reason: 'FISCAL_RECEIPT',
      source: 'POS',
      fiscalReceiptId: fiscalReceipt.id,
      fiscalNumber: fiscalReceipt.fiscalNumber || fiscalReceipt.fiscal_number
    });
  }
}

module.exports = { StockEngine };

