/**
 * PHASE S4.2 - NIR Service
 * Business logic for NIR documents
 */

const { tipizateRepository } = require('../repositories/tipizate.repository');
const { validateNir } = require('../validators/nir.validators');

exports.nirService = {
  /**
   * List NIR documents with filters
   */
  async list(filters: {
    from?: string;
    to?: string;
    locationId?: number;
    warehouseId?: number;
    status?: string;
  } = {}) {
    return tipizateRepository.listByType('NIR', filters);
  },

  /**
   * Get NIR by ID
   */
  async getById(id: number) {
    const doc = await tipizateRepository.getNirById(id);
    if (!doc) {
      throw new Error('NIR not found');
    }
    return doc;
  },

  /**
   * Create new NIR
   */
  async create(payload: Partial<NirDocument>, userId: number) {
    const validated = validateNir(payload);
    return tipizateRepository.insertNir(validated, userId);
  },

  /**
   * Update NIR (only if DRAFT)
   */
  async update(id: number, payload: Partial<NirDocument>, userId: number) {
    const existing = await tipizateRepository.getNirById(id);
    if (!existing) {
      throw new Error('NIR not found');
    }
    
    const existingDoc = existing as any;
    if (existingDoc.status !== 'DRAFT') {
      throw new Error('Documentul nu poate fi modificat (nu mai este în DRAFT)');
    }

    const validated = validateNir({ ...existingDoc, ...payload });
    return tipizateRepository.updateNir(id, validated, userId);
  },

  /**
   * Sign NIR
   */
  async sign(id: number, userId: number, userName?: string) {
    return tipizateRepository.signDocument('NIR', id, userId, userName);
  },

  /**
   * Lock NIR
   */
  async lock(id: number, userId: number, userName?: string) {
    return tipizateRepository.lockDocument('NIR', id, userId, userName);
  },

  /**
   * Archive NIR
   */
  async archive(id: number, userId: number, reason?: string) {
    return tipizateRepository.archiveDocument(id, userId, reason);
  },
};

