/**
 * PHASE S8.8 - UBL Engine
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Unified UBL generation for Orders and Tipizate
 */

const UBLGeneratorService = require('../../modules/fiscal/services/ublGenerator.service');
const ublTipizateService = require('../../modules/tipizate/ubl/ublTipizate.service');

class UBLEngine {
  /**
   * PHASE S8.8 - Generate UBL for order
   */
  async generateUBLForOrder(orderId: number, options: { client?: any }) {
    const generator = new UBLGeneratorService();
    return await generator.createInvoice(orderId, options.client || {});
  }

  /**
   * PHASE S8.8 - Generate UBL for tipizate document
   */
  async generateUBLForTipizate(docType: string, docId: number) {
    return await ublTipizateService.buildUBLForTipizate(docType, docId);
  }
}

module.exports = { UBLEngine };

