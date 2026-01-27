/**
 * PHASE S4.3 - Inventar Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateInventar } = require('../validators/inventar.validators');

exports.inventarService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('INVENTAR', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'INVENTAR') {
      throw new Error('Inventar not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateInventar(payload);
    return tipizateRepository.insertDocument('INVENTAR', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateInventar({ ...existing, ...payload });
    return tipizateRepository.updateDocument('INVENTAR', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('INVENTAR', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('INVENTAR', id, userId, userName);
  },
};

