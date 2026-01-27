/**
 * PHASE S4.3 - Registru Casă Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateRegistruCasa } = require('../validators/registru-casa.validators');

exports.registruCasaService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('REGISTRU_CASA', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'REGISTRU_CASA') {
      throw new Error('Registru Casă not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateRegistruCasa(payload);
    return tipizateRepository.insertDocument('REGISTRU_CASA', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateRegistruCasa({ ...existing, ...payload });
    return tipizateRepository.updateDocument('REGISTRU_CASA', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('REGISTRU_CASA', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('REGISTRU_CASA', id, userId, userName);
  },
};

