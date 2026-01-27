/**
 * STOCK CONSUMPTION ENGINE - Unified FIFO/FEFO Logic
 * Data: 03 Decembrie 2025
 * Supports both FIFO (default) and FEFO (for perishables)
 */

const db = require('../config/database');
const ExpiryService = require('../services/expiry.service');

class StockConsumptionEngine {
  
  /**
   * Consume stock with intelligent FIFO/FEFO selection
   * @param {number} ingredientId 
   * @param {number} quantityNeeded 
   * @param {string} orderId 
   * @param {number} locationId 
   * @param {boolean} useFefo - Force FEFO for perishables
   */
  static async consumeStock(ingredientId, quantityNeeded, orderId = null, locationId = null, useFefo = null) {
    // 1. Decide FIFO vs FEFO
    const shouldUseFefo = useFefo !== null ? useFefo : await this.isPerishable(ingredientId);
    
    if (shouldUseFefo) {
      console.log(`🍎 Using FEFO for ingredient ${ingredientId} (perishable)`);
      return ExpiryService.decreaseStockFEFO(ingredientId, quantityNeeded, orderId, locationId);
    } else {
      console.log(`📦 Using FIFO for ingredient ${ingredientId} (standard)`);
      return this.decreaseStockFIFO(ingredientId, quantityNeeded, orderId, locationId);
    }
  }
  
  /**
   * Check if ingredient is perishable (uses FEFO)
   */
  static async isPerishable(ingredientId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          i.*,
          ic.category,
          ic.shelf_life_days
        FROM ingredients i
        LEFT JOIN ingredient_catalog_global ic ON ic.name_ro = i.name
        WHERE i.id = ?
      `, [ingredientId], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(false);
        
        // Perishable categories
        const perishableCategories = [
          'Lactate',
          'Carne',
          'Pește',
          'Fructe de mare',
          'Legume proaspete',
          'Fructe proaspete',
          'Ouă'
        ];
        
        // Perishable if:
        // 1. Category is perishable
        // 2. Shelf life < 30 days
        const isPerishableCategory = perishableCategories.some(cat => 
          (row.category || '').toLowerCase().includes(cat.toLowerCase())
        );
        
        const hasShortShelfLife = row.shelf_life_days && row.shelf_life_days < 30;
        
        resolve(isPerishableCategory || hasShortShelfLife);
      });
    });
  }
  
  /**
   * Standard FIFO consumption
   */
  static async decreaseStockFIFO(ingredientId, quantityNeeded, orderId = null, locationId = null) {
    return new Promise((resolve, reject) => {
      // Get batches ordered by purchase date (FIFO)
      const query = locationId
        ? `SELECT * FROM ingredient_batches 
           WHERE ingredient_id = ? AND location_id = ? AND remaining_quantity > 0
           ORDER BY purchase_date ASC, id ASC`
        : `SELECT * FROM ingredient_batches 
           WHERE ingredient_id = ? AND remaining_quantity > 0
           ORDER BY purchase_date ASC, id ASC`;
      
      const params = locationId ? [ingredientId, locationId] : [ingredientId];
      
      db.all(query, params, async (err, batches) => {
        if (err) return reject(err);
        
        if (!batches || batches.length === 0) {
          return reject(new Error(`No stock available for ingredient ${ingredientId}`));
        }
        
        let remainingToConsume = quantityNeeded;
        const consumedBatches = [];
        
        for (const batch of batches) {
          if (remainingToConsume <= 0) break;
          
          const consumeFromBatch = Math.min(batch.remaining_quantity, remainingToConsume);
          
          // Update batch
          await new Promise((res, rej) => {
            db.run(`
              UPDATE ingredient_batches
              SET remaining_quantity = remaining_quantity - ?
              WHERE id = ?
            `, [consumeFromBatch, batch.id], err2 => {
              if (err2) rej(err2);
              else res();
            });
          });
          
          // Log movement (folosește stock_moves cu structura corectă)
          await new Promise((res, rej) => {
            db.run(`
              INSERT INTO stock_moves (
                ingredient_id, quantity_out, type, reference_type, reference_id, unit_price, value_out, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
              ingredientId,
              consumeFromBatch, // quantity_out (pozitiv pentru consum)
              'CONSUME',
              orderId ? 'ORDER' : 'MANUAL',
              orderId || null,
              batch.unit_cost,
              consumeFromBatch * batch.unit_cost // value_out
            ], err3 => {
              if (err3) {
                console.error(`⚠️ Eroare înregistrare stock_move pentru batch ${batch.batch_number}:`, err3);
                // Nu rejectăm - continuăm chiar dacă logging eșuează
                res();
              } else {
                res();
              }
            });
          });
          
          consumedBatches.push({
            batch_id: batch.id,
            batch_number: batch.batch_number,
            quantity_consumed: consumeFromBatch,
            unit_cost: batch.unit_cost
          });
          
          remainingToConsume -= consumeFromBatch;
        }
        
        if (remainingToConsume > 0) {
          return reject(new Error(
            `Insufficient stock: needed ${quantityNeeded}, consumed ${quantityNeeded - remainingToConsume}`
          ));
        }
        
        resolve({
          success: true,
          consumed: quantityNeeded,
          batches: consumedBatches,
          method: 'FIFO'
        });
      });
    });
  }
  
  /**
   * Consume stock for entire order (all products → recipes → ingredients)
   */
  static async consumeStockForOrder(orderId, items) {
    const results = [];
    
    for (const item of items) {
      const productId = item.product_id || item.id;
      const quantity = item.quantity || 1;
      
      // Get recipe for product
      const recipe = await new Promise((resolve, reject) => {
        db.get(`
          SELECT r.* FROM recipes r
          JOIN products p ON p.base_recipe_id = r.id
          WHERE p.id = ?
        `, [productId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!recipe) continue;
      
      // Get recipe ingredients
      const ingredients = await new Promise((resolve, reject) => {
        db.all(`
          SELECT ri.*, i.name, i.unit
          FROM recipe_ingredients ri
          JOIN ingredients i ON i.id = ri.ingredient_id
          WHERE ri.recipe_id = ?
        `, [recipe.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Consume each ingredient
      for (const ing of ingredients) {
        const quantityNeeded = (ing.quantity_net || ing.quantity_gross || ing.quantity) * quantity;
        
        try {
          const result = await this.consumeStock(
            ing.ingredient_id,
            quantityNeeded,
            orderId,
            null, // location
            null  // auto-detect FIFO/FEFO
          );
          
          results.push({
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.name,
            ...result
          });
        } catch (err) {
          console.error(`❌ Failed to consume ${ing.name}:`, err.message);
          results.push({
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.name,
            success: false,
            error: err.message
          });
        }
      }
    }
    
    return results;
  }
}

module.exports = StockConsumptionEngine;

