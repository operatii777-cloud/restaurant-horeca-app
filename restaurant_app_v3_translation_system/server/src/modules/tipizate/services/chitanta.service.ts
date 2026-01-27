/**
 * PHASE S4.3 - Chitanță Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateChitanta } = require('../validators/chitanta.validators');

exports.chitantaService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('CHITANTA', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'CHITANTA') {
      throw new Error('Chitanță not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateChitanta(payload);
    return tipizateRepository.insertDocument('CHITANTA', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateChitanta({ ...existing, ...payload });
    return tipizateRepository.updateDocument('CHITANTA', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('CHITANTA', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('CHITANTA', id, userId, userName);
  },
};

