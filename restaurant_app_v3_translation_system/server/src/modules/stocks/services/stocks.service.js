/**
 * PHASE E9.3 - Stocks Service
 * 
 * Business logic layer for stocks module.
 * Handles validation, transformations, and business rules.
 */

const { BaseService } = require('../../../utils/service.base');
const StocksRepository = require('../repo/stocks.repository');
// PHASE PRODUCTION-READY: Use centralized validators
const { validateStock } = require('../../../utils/validators');
const { AppError, createValidationError, createBusinessRuleError } = require('../../../utils/error-handler');

class StocksService extends BaseService {
  constructor() {
    super(new StocksRepository());
  }

  /**
   * Validate stock data (using centralized validators)
   */
  validate(data, operation = 'create') {
    const validation = validateStock(data);
    
    // Additional operation-specific validations
    if (operation === 'create') {
      if (data.current_stock === undefined) {
        validation.errors.push('Current stock is required');
        validation.valid = false;
      }
    }

    return validation;
  }

  /**
   * Transform stock data
   */
  transform(data) {
    return {
      ...data,
      current_stock: parseFloat(data.current_stock) || 0,
      min_stock: parseFloat(data.min_stock) || 0,
      cost_per_unit: parseFloat(data.cost_per_unit) || 0,
      is_available: data.is_available !== undefined ? data.is_available : 1
    };
  }

  /**
   * Get stocks with filters
   */
  async getStocks(filters = {}) {
    return this.repository.getStocks(filters);
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts() {
    return this.repository.getLowStockAlerts();
  }

  /**
   * Get ingredient stock
   */
  async getIngredientStock(ingredientId) {
    return this.repository.getIngredientStock(ingredientId);
  }

  /**
   * Get stock history
   */
  async getStockHistory(ingredientId, limit = 50) {
    return this.repository.getStockHistory(ingredientId, limit);
  }

  /**
   * Adjust stock with business logic (with validation)
   */
  async adjustStock(ingredientId, quantity, reason, notes = '') {
    // PHASE PRODUCTION-READY: Use centralized validators
    const { validateInteger, validatePositiveNumber } = require('../../../utils/validators');
    
    if (!ingredientId || !validateInteger(ingredientId, 1)) {
      throw createValidationError('Valid ingredient ID is required');
    }

    if (quantity === 0) {
      throw createBusinessRuleError('Quantity cannot be zero for stock adjustment');
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw createValidationError('Reason is required for stock adjustment');
    }

    // Validate quantity is a number
    if (!validatePositiveNumber(Math.abs(quantity), 0.0001)) {
      throw createValidationError('Quantity must be a valid positive number');
    }

    return this.repository.adjustStock(ingredientId, quantity, reason, notes);
  }
}

module.exports = StocksService;

