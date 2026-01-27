/**
 * PHASE E10.1 - Archive Service
 * 
 * Handles long-term archiving of fiscal documents (legal compliance).
 */

const ArchiveModel = require('../model/archive.model');

class ArchiveService {
  constructor() {
    this.model = new ArchiveModel();
  }

  /**
   * Archive document
   */
  async archive(document) {
    return await this.model.create(document);
  }

  /**
   * Get archived document
   */
  async getArchived(id) {
    return await this.model.getById(id);
  }

  /**
   * Search archived documents
   */
  async search({ type, startDate, endDate, limit, offset }) {
    return await this.model.search({ type, startDate, endDate, limit, offset });
  }
}

module.exports = new ArchiveService();

