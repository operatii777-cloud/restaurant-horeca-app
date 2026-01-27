/**
 * PHASE S4.3 - Raport Lunar Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateRaportLunar } = require('../validators/raport-lunar.validators');

exports.raportLunarService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('RAPORT_LUNAR', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'RAPORT_LUNAR') {
      throw new Error('Raport Lunar not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateRaportLunar(payload);
    return tipizateRepository.insertDocument('RAPORT_LUNAR', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateRaportLunar({ ...existing, ...payload });
    return tipizateRepository.updateDocument('RAPORT_LUNAR', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('RAPORT_LUNAR', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('RAPORT_LUNAR', id, userId, userName);
  },
};

