/**
 * PHASE S8.8 - Tipizate Adapter
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Adapter for tipizate documents to fiscal engine
 */

const fiscalEngine = require('../engine/fiscalEngine');

class TipizateAdapter {
  /**
   * PHASE S8.8 - Generate UBL for tipizate document
   */
  async generateUBL(docType: string, docId: number) {
    return await fiscalEngine.generateUBLForTipizate(docType, docId);
  }

  /**
   * PHASE S8.8 - Submit tipizate UBL to ANAF
   */
  async submitToANAF(docType: string, docId: number, xml: string) {
    return await fiscalEngine.submitToANAF(docType, docId, xml);
  }
}

module.exports = { TipizateAdapter };

