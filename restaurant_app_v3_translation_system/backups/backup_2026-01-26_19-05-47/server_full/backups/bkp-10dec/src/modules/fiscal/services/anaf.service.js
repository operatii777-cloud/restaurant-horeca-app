/**
 * PHASE E10.1 - ANAF Service
 * 
 * Handles ANAF compliance: archiving fiscal documents.
 */

const ArchiveModel = require('../model/archive.model');

class ANAFService {
  constructor() {
    this.archiveModel = new ArchiveModel();
  }

  /**
   * Archive fiscal document (ANAF compliance)
   */
  async archiveFiscalDocument(fiscalPayload) {
    const record = await this.archiveModel.create({
      type: 'RECEIPT',
      fiscalNumber: fiscalPayload.fiscalNumber,
      xml: fiscalPayload.xml,
      orderId: fiscalPayload.orderId,
      total: fiscalPayload.total || 0,
      createdAt: new Date()
    });

    return record;
  }

  /**
   * Get archived document
   */
  async getArchivedDocument(id) {
    return await this.archiveModel.getById(id);
  }

  /**
   * Get archived documents with filters
   */
  async getArchivedDocuments({ startDate, endDate, limit, offset }) {
    return await this.archiveModel.getAll({ startDate, endDate, limit, offset });
  }
}

module.exports = new ANAFService();

