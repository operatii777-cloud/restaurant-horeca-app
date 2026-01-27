/**
 * PORTION SERVICE - Gestionare porții multiple (S/M/L)
 * Data: 03 Decembrie 2025
 */

const db = require('../config/database');

class PortionService {
  
  /**
   * Creează porții pentru un produs
   * @param {number} productId 
   * @param {Array} portions - [{ size_code, size_name, multiplier, price }]
   */
  async createPortions(productId, portions) {
    const created = [];
    
    for (const portion of portions) {
      const result = await this.create({
        product_id: productId,
        size_code: portion.size_code,
        size_name: portion.size_name,
        size_name_en: portion.size_name_en,
        size_description: portion.size_description,
        portion_multiplier: portion.multiplier,
        portion_grams: portion.grams,
        price: portion.price,
        is_default: portion.is_default || 0,
        sort_order: portion.sort_order || 0
      });
      
      created.push(result);
    }
    
    // Recalculează cost pentru toate porțiile
    await this.recalculateAllCosts(productId);
    
    return created;
  }
  
  /**
   * Recalculează cost pentru toate porțiile unui produs
   */
  async recalculateAllCosts(productId) {
    // Obține rețeta de bază
    const product = await this.getProduct(productId);
    
    if (!product.base_recipe_id) {
      console.log(`⚠️ Product ${productId} nu are rețetă de bază`);
      return;
    }
    
    // Calculează cost rețetă de bază (FIFO)
    const baseCost = await this.calculateRecipeCost(product.base_recipe_id);
    
    // Update toate porțiile
    const portions = await this.getByProduct(productId);
    
    for (const portion of portions) {
      const portionCost = baseCost * portion.portion_multiplier;
      const marginPercentage = ((portion.price - portionCost) / portion.price) * 100;
      const markupFactor = portion.price / portionCost;
      
      await this.update(portion.id, {
        cost_per_portion: parseFloat(portionCost.toFixed(2)),
        margin_percentage: parseFloat(marginPercentage.toFixed(2)),
        markup_factor: parseFloat(markupFactor.toFixed(2))
      });
    }
    
    console.log(`✅ Recalculate costs for ${portions.length} portions of product ${productId}`);
  }
  
  /**
   * Obține porția pentru comandă (cu scaling automat)
   */
  async getPortionForOrder(productId, sizeCode) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM product_portions 
        WHERE product_id = ? AND size_code = ?
      `, [productId, sizeCode], (err, row) => {
        if (err) return reject(err);
        if (!row) {
          // Fallback la porția default
          db.get(`
            SELECT * FROM product_portions 
            WHERE product_id = ? AND is_default = 1
          `, [productId], (err2, defaultRow) => {
            if (err2) return reject(err2);
            resolve(defaultRow);
          });
        } else {
          resolve(row);
        }
      });
    });
  }
  
  // CRUD
  async create(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      db.run(`INSERT INTO product_portions (${fields}) VALUES (${placeholders})`, values, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  }
  
  async getByProduct(productId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM product_portions WHERE product_id = ? ORDER BY sort_order', [productId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      db.run(`UPDATE product_portions SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  // Helpers
  async getProduct(productId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) return reject(err);
        resolve(row || {});
      });
    });
  }
  
  async calculateRecipeCost(recipeId) {
    // TODO: Implement FIFO cost calculation
    return 7.25; // Placeholder
  }
}

module.exports = new PortionService();

