/**
 * PHASE E9.3 - Stocks Service
 * 
 * Business logic layer for stocks module.
 * Handles validation, transformations, and business rules.
 */

const { BaseService } = require('../../../utils/service.base');
const StocksRepository = require('../repo/stocks.repository');

class StocksService extends BaseService {
  constructor() {
    super(new StocksRepository());
  }

  /**
   * Validate stock data
   */
  validate(data, operation = 'create') {
    const errors = [];

    if (operation === 'create') {
      if (!data.name) errors.push('Name is required');
      if (!data.unit) errors.push('Unit is required');
      if (data.current_stock === undefined) errors.push('Current stock is required');
    }

    if (operation === 'update') {
      if (data.current_stock !== undefined && data.current_stock < 0) {
        errors.push('Stock cannot be negative');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
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
   * Adjust stock with business logic
   */
  async adjustStock(ingredientId, quantity, reason, notes = '') {
    if (!ingredientId) {
      throw new Error('Ingredient ID is required');
    }

    if (quantity === 0) {
      throw new Error('Quantity cannot be zero');
    }

    if (!reason) {
      throw new Error('Reason is required for stock adjustment');
    }

    return this.repository.adjustStock(ingredientId, quantity, reason, notes);
  }
}

module.exports = StocksService;

