/**
 * PHASE S8.8 - Cash Register Adapter
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Adapter for cash register operations to fiscal engine
 */

const fiscalEngine = require('../engine/fiscalEngine');

class CashRegisterAdapter {
  /**
   * PHASE S8.8 - Generate fiscal receipt for cash transaction
   */
  async generateReceipt(transactionId: number, payment: {
    method: string;
    amount: number;
  }) {
    // Adapt cash register transaction to order format
    // Then use fiscal engine
    return await fiscalEngine.fiscalizeOrder(transactionId, {
      method: payment.method,
      cashAmount: payment.method === 'cash' ? payment.amount : 0,
      cardAmount: payment.method === 'card' ? payment.amount : 0
    });
  }
}

module.exports = { CashRegisterAdapter };

