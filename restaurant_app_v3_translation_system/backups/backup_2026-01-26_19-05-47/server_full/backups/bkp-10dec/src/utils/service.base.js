/**
 * PHASE E9.3 - Base Service Pattern
 * 
 * Standard service base class for all modules.
 * Contains business logic, validation, and orchestration.
 */

/**
 * Base Service Class
 * All module services should extend this
 */
class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Validate data before operations
   * Override in child classes
   */
  validate(data, operation = 'create') {
    // Base validation - override in child classes
    return { valid: true, errors: [] };
  }

  /**
   * Transform data before saving
   * Override in child classes
   */
  transform(data) {
    return data;
  }

  /**
   * Get all records
   */
  async getAll(filters = {}) {
    return this.repository.getAll();
  }

  /**
   * Get record by ID
   */
  async getById(id) {
    if (!id) {
      throw new Error('ID is required');
    }
    
    const record = await this.repository.findById(id);
    if (!record) {
      throw new Error(`Record with ID ${id} not found`);
    }
    
    return record;
  }

  /**
   * Create new record
   */
  async create(data) {
    const validation = this.validate(data, 'create');
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const transformed = this.transform(data);
    return this.repository.create(transformed);
  }

  /**
   * Update record
   */
  async update(id, data) {
    if (!id) {
      throw new Error('ID is required');
    }
    
    // Check if record exists
    await this.getById(id);
    
    const validation = this.validate(data, 'update');
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const transformed = this.transform(data);
    return this.repository.update(id, transformed);
  }

  /**
   * Delete record
   */
  async delete(id) {
    if (!id) {
      throw new Error('ID is required');
    }
    
    // Check if record exists
    await this.getById(id);
    
    return this.repository.delete(id);
  }
}

module.exports = { BaseService };

