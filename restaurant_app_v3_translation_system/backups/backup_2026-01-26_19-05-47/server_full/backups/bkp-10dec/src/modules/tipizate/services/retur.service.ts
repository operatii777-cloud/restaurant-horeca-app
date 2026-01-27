/**
 * PHASE S4.3 - Retur Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateRetur } = require('../validators/retur.validators');

exports.returService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('RETUR', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'RETUR') {
      throw new Error('Retur not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateRetur(payload);
    return tipizateRepository.insertDocument('RETUR', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateRetur({ ...existing, ...payload });
    return tipizateRepository.updateDocument('RETUR', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('RETUR', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('RETUR', id, userId, userName);
  },
};

