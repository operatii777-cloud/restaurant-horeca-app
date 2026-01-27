/**
 * PHASE S8.8 - SAF-T Engine
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * SAF-T validation integration
 */

const SaftService = require('../../modules/saft/saft.service');

class SaftEngine {
  /**
   * PHASE S8.8 - Validate fiscal receipt
   */
  async validateFiscalReceipt(receiptData: any) {
    return await SaftService.validateFiscalReceiptData(receiptData);
  }

  /**
   * PHASE S8.8 - Validate UBL XML
   */
  async validateUBL(documentType: string, xml: string) {
    return await SaftService.validateUBLXml(documentType, xml);
  }

  /**
   * PHASE S8.8 - Validate tipizate document
   */
  async validateTipizat(docType: string, document: any) {
    return await SaftService.validateTipizatDocument(docType, document);
  }
}

module.exports = { SaftEngine };

