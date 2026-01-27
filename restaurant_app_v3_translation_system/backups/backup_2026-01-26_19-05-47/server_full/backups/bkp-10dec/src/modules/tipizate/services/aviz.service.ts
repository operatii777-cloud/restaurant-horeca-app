/**
 * PHASE S4.3 - Aviz Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateAviz } = require('../validators/aviz.validators');

exports.avizService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('AVIZ', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'AVIZ') {
      throw new Error('Aviz not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateAviz(payload);
    return tipizateRepository.insertDocument('AVIZ', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateAviz({ ...existing, ...payload });
    return tipizateRepository.updateDocument('AVIZ', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('AVIZ', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('AVIZ', id, userId, userName);
  },
};

