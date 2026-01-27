/**
 * PHASE S4.3 - Waste Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateWaste } = require('../validators/waste.validators');

exports.wasteService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('WASTE', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'WASTE') {
      throw new Error('Waste document not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateWaste(payload);
    return tipizateRepository.insertDocument('WASTE', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateWaste({ ...existing, ...payload });
    return tipizateRepository.updateDocument('WASTE', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('WASTE', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('WASTE', id, userId, userName);
  },

  async pdf(id) {
    const { pdfEngineService } = require('../pdf/pdf-engine.service');
    return pdfEngineService.generatePdf('WASTE', id);
  },
};

