/**
 * PHASE S8.8 - TVA Engine
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * TVA System v2 integration
 */

const TVAService = require('../../modules/tva/tva.service');

class TVAEngine {
  /**
   * PHASE S8.8 - Calculate totals with TVA v2
   */
  async calculateTotals(order: any, payments: any) {
    const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
    
    let subtotal = 0;
    let vatAmount = 0;
    const vatBreakdown: { [key: number]: { baseAmount: number; vatAmount: number } } = {};
    
    for (const item of order.items || []) {
      const lineSubtotal = item.price * item.quantity;
      subtotal += lineSubtotal;
      
      const vatRate = item.product_id 
        ? await TVAService.getVatRateForProduct(item.product_id, orderDate)
        : await TVAService.getVatRateAt(orderDate, 'standard');
      
      const lineVat = (lineSubtotal * vatRate) / 100;
      vatAmount += lineVat;
      
      if (!vatBreakdown[vatRate]) {
        vatBreakdown[vatRate] = { baseAmount: 0, vatAmount: 0 };
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
}

module.exports = { TVAEngine };

