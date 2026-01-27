/**
 * PHASE S8.8 - Printer Engine
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Fiscal printer integration
 */

const PrintJobsRepository = require('../../modules/fiscal/repo/printJobs.repository');
const PrinterService = require('../../modules/fiscal/services/printer.service');

class PrinterEngine {
  /**
   * PHASE S8.8 - Queue print job
   */
  async queuePrint(receiptId: number) {
    return await PrintJobsRepository.createPrintJob(receiptId);
  }

  /**
   * PHASE S8.8 - Get printer status
   */
  async getStatus() {
    const printerService = new PrinterService();
    await printerService.init();
    return await printerService.getStatus();
  }
}

module.exports = { PrinterEngine };

