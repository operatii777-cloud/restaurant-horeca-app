/**
 * PHASE S4.3 - Factură Service
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateFactura } = require('../validators/factura.validators');

exports.facturaService = {
  async list(filters = {}) {
    return tipizateRepository.listByType('FACTURA', filters);
  },

  async getById(id) {
    const doc = await tipizateRepository.getById(id);
    if (!doc || doc.type !== 'FACTURA') {
      throw new Error('Factură not found');
    }
    return doc;
  },

  async create(payload, userId) {
    const validated = validateFactura(payload);
    return tipizateRepository.insertDocument('FACTURA', validated, userId);
  },

  async update(id, payload, userId) {
    const existing = await this.getById(id);
    if (existing.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }
    const validated = validateFactura({ ...existing, ...payload });
    return tipizateRepository.updateDocument('FACTURA', id, validated, userId);
  },

  async sign(id, userId, userName) {
    return tipizateRepository.signDocument('FACTURA', id, userId, userName);
  },

  async lock(id, userId, userName) {
    return tipizateRepository.lockDocument('FACTURA', id, userId, userName);
  },
};

