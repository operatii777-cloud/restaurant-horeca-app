/**
 * PHASE S4.3 - Transfer Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateTransfer } = require('../validators/transfer.validators');

exports.transferService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('TRANSFER', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'TRANSFER') {
      throw new Error('Transfer not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateTransfer(payload);
    return tipizateRepository.insertDocument('TRANSFER', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateTransfer({ ...existing, ...payload });
    return tipizateRepository.updateDocument('TRANSFER', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('TRANSFER', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('TRANSFER', id, userId, userName);
  },
};

