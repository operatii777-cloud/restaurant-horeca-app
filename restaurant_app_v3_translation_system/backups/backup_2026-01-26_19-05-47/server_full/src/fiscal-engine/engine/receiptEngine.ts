/**
 * PHASE S8.8 - Receipt Engine
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Fiscal receipt generation and management
 */

const FiscalizareRepository = require('../../modules/fiscal/repo/fiscalizare.repository');
const { FiscalReceiptGenerator } = require('../../modules/fiscal/utils/fiscalReceiptGenerator');

class ReceiptEngine {
  private repository: any;
  private receiptGenerator: any;

  constructor() {
    this.repository = new FiscalizareRepository();
    this.receiptGenerator = new FiscalReceiptGenerator();
  }

  async getOrder(orderId: number) {
    return await this.repository.getOrder(orderId);
  }

  generateReceiptData(data: any) {
    return this.receiptGenerator.generate(data);
  }

  async saveReceipt(receiptData: any) {
    return await this.repository.saveReceipt(receiptData);
  }

  shouldAutoPrint() {
    const config = this.repository.getFiscalConfig();
    return config?.autoPrint !== false;
  }
}

module.exports = { ReceiptEngine };

