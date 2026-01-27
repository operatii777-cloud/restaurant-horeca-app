/**
 * PHASE E9.3 - Stocks Repository
 * 
 * Data Access Layer for stocks module.
 * Handles all database operations.
 */

const { BaseRepository } = require('../../../utils/repository.base');

class StocksRepository extends BaseRepository {
  constructor() {
    super('ingredients'); // Base table
  }

  /**
   * Get stocks with filters
   */
  async getStocks(filters = {}) {
    let query = 'SELECT * FROM ingredients WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.minStock !== undefined) {
      query += ' AND current_stock <= ?';
      params.push(filters.minStock);
    }

    query += ' ORDER BY name';

    return this.findAll(query, params);
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts() {
    const query = `
      SELECT * FROM ingredients 
      WHERE current_stock <= min_stock 
      AND is_available = 1
      ORDER BY (current_stock - min_stock) ASC
    `;
    return this.findAll(query);
  }

  /**
   * Get stock for specific ingredient
   */
  async getIngredientStock(ingredientId) {
    return this.findById(ingredientId);
  }

  /**
   * Get stock history
   */
  async getStockHistory(ingredientId, limit = 50) {
    const query = `
      SELECT * FROM stock_movements 
      WHERE ingredient_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    return this.findAll(query, [ingredientId, limit]);
  }

  /**
   * Adjust stock
   */
  async adjustStock(ingredientId, quantity, reason, notes = '') {
    const db = await this.getDb();
    
    return this.transaction(async () => {
      // Get current stock
      const ingredient = await this.findById(ingredientId);
      if (!ingredient) {
        throw new Error('Ingredient not found');
      }

      const newStock = ingredient.current_stock + quantity;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      // Update stock
      await this.update(ingredientId, { current_stock: newStock });

      // Record movement
      await this.execute(
        `INSERT INTO stock_movements 
         (ingredient_id, movement_type, quantity, reason, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
        [ingredientId, quantity > 0 ? 'adjustment_in' : 'adjustment_out', Math.abs(quantity), reason, notes]
      );

      return this.findById(ingredientId);
    });
  }
}

module.exports = StocksRepository;

