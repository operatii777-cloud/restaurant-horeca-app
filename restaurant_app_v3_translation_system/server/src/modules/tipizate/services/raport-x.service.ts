/**
 * PHASE S4.3 - Raport X Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateRaportX } = require('../validators/raport-x.validators');

exports.raportXService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('RAPORT_X', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'RAPORT_X') {
      throw new Error('Raport X not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateRaportX(payload);
    return tipizateRepository.insertDocument('RAPORT_X', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateRaportX({ ...existing, ...payload });
    return tipizateRepository.updateDocument('RAPORT_X', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('RAPORT_X', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('RAPORT_X', id, userId, userName);
  },
};

