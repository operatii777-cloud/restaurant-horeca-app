/**
 * PHASE S8.8 - Inventory Adapter
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Adapter for inventory operations to fiscal engine
 */

const fiscalEngine = require('../engine/fiscalEngine');

class InventoryAdapter {
  /**
   * PHASE S8.8 - Generate UBL for inventory document
   */
  async generateUBL(docType: string, docId: number) {
    return await fiscalEngine.generateUBLForTipizate(docType, docId);
  }
}

module.exports = { InventoryAdapter };

