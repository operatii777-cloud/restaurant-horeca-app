/**
 * PHASE S4.3 - Proces Verbal Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateProcesVerbal } = require('../validators/proces-verbal.validators');

exports.procesVerbalService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('PROCES_VERBAL', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'PROCES_VERBAL') {
      throw new Error('Proces Verbal not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateProcesVerbal(payload);
    return tipizateRepository.insertDocument('PROCES_VERBAL', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateProcesVerbal({ ...existing, ...payload });
    return tipizateRepository.updateDocument('PROCES_VERBAL', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('PROCES_VERBAL', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('PROCES_VERBAL', id, userId, userName);
  },
};

