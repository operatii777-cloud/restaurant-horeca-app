/**
 * PHASE S8.8 - Orders Adapter
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Adapter for orders to fiscal engine
 */

const fiscalEngine = require('../engine/fiscalEngine');

class OrdersAdapter {
  /**
   * PHASE S8.8 - Fiscalize order
   */
  async fiscalize(orderId: number, payment: {
    method: string;
    cashAmount?: number;
    cardAmount?: number;
    voucherAmount?: number;
  }) {
    return await fiscalEngine.fiscalizeOrder(orderId, payment);
  }

  /**
   * PHASE S8.8 - Generate UBL for order
   */
  async generateUBL(orderId: number, client?: any) {
    return await fiscalEngine.generateUBLForTipizate('ORDER', orderId);
  }
}

module.exports = { OrdersAdapter };

