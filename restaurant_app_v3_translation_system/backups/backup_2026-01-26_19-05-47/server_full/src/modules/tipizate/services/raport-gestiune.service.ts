/**
 * PHASE S4.3 - Raport Gestiune Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateRaportGestiune } = require('../validators/raport-gestiune.validators');

exports.raportGestiuneService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('RAPORT_GESTIUNE', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'RAPORT_GESTIUNE') {
      throw new Error('Raport Gestiune not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateRaportGestiune(payload);
    return tipizateRepository.insertDocument('RAPORT_GESTIUNE', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateRaportGestiune({ ...existing, ...payload });
    return tipizateRepository.updateDocument('RAPORT_GESTIUNE', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('RAPORT_GESTIUNE', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('RAPORT_GESTIUNE', id, userId, userName);
  },
};

