/**
 * PHASE S4.3 - Bon Consum Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateBonConsum } = require('../validators/bon-consum.validators');

exports.bonConsumService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('BON_CONSUM', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'BON_CONSUM') {
      throw new Error('Bon Consum not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateBonConsum(payload);
    return tipizateRepository.insertDocument('BON_CONSUM', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateBonConsum({ ...existing, ...payload });
    return tipizateRepository.updateDocument('BON_CONSUM', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('BON_CONSUM', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('BON_CONSUM', id, userId, userName);
  },
};

