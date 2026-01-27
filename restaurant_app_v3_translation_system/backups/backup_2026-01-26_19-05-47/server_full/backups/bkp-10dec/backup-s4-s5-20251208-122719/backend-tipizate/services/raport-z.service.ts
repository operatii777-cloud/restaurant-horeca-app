/**
 * PHASE S4.3 - Raport Z Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateRaportZ } = require('../validators/raport-z.validators');

exports.raportZService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('RAPORT_Z', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'RAPORT_Z') {
      throw new Error('Raport Z not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateRaportZ(payload);
    return tipizateRepository.insertDocument('RAPORT_Z', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateRaportZ({ ...existing, ...payload });
    return tipizateRepository.updateDocument('RAPORT_Z', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('RAPORT_Z', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('RAPORT_Z', id, userId, userName);
  },
};

