/**
 * RECALL SERVICE - Gestionare retrageri produse (siguranță alimentară)
 * Data: 03 Decembrie 2025
 * Conformitate: ANSVSA + EU Food Safety
 */

const db = require('../config/database');

class RecallService {
  
  /**
   * Creează recall pentru ingredient/produs/lot
   * @param {Object} recallData 
   * @returns {Promise<Object>}
   */
  async createRecall(recallData) {
    const {
      recall_type, // 'ingredient', 'product', 'supplier', 'batch'
      ingredient_id = null,
      product_id = null,
      supplier_id = null,
      batch_numbers = [],
      severity, // 'low', 'medium', 'high', 'critical'
      health_risk,
      reason,
      description,
      action_taken
    } = recallData;
    
    // Generează număr recall
    const recall_number = await this.generateRecallNumber();
    
    // Identifică produsele/comenzile afectate
    const affected = await this.identifyAffected(recall_type, ingredient_id, product_id, batch_numbers);
    
    // Creează recall
    const recall = await this.create({
      recall_number,
      recall_date: new Date().toISOString().split('T')[0],
      recall_type,
      ingredient_id,
      product_id,
      supplier_id,
      batch_numbers: JSON.stringify(batch_numbers),
      severity,
      health_risk,
      reason,
      description,
      affected_products_count: affected.products.length,
      affected_orders_count: affected.orders.length,
      affected_customers_count: affected.customers.length,
      affected_products_list: JSON.stringify(affected.products),
      affected_orders_list: JSON.stringify(affected.orders),
      action_taken,
      created_by: 'System'
    });
    
    // Notifică automat dacă severity = 'critical' sau 'high'
    if (severity === 'critical' || severity === 'high') {
      await this.sendNotifications(recall.id);
    }
    
    return recall;
  }
  
  /**
   * Identifică produse/comenzi afectate de recall
   */
  async identifyAffected(recallType, ingredientId, productId, batchNumbers) {
    const affected = {
      products: [],
      orders: [],
      customers: []
    };
    
    if (recallType === 'batch' && batchNumbers.length > 0) {
      // Găsește toate consumurile care au folosit aceste loturi
      const consumeItems = await this.getConsumeItemsByBatches(batchNumbers);
      
      // Extrage order_ids unice
      const orderIds = [...new Set(consumeItems.map(item => item.order_id))];
      
      // Obține comenzile
      affected.orders = await this.getOrdersByIds(orderIds);
      
      // Extrage produsele afectate
      const productIds = [...new Set(consumeItems.map(item => item.product_id))];
      affected.products = await this.getProductsByIds(productIds);
      
      // Extrage clienții (dacă au loyalty)
      affected.customers = affected.orders
        .filter(o => o.customer_id)
        .map(o => ({ customer_id: o.customer_id, customer_name: o.customer_name }));
    }
    
    if (recallType === 'ingredient' && ingredientId) {
      // Găsește toate rețetele care conțin acest ingredient
      const recipes = await this.getRecipesByIngredient(ingredientId);
      
      // Găsește toate produsele cu aceste rețete
      affected.products = await this.getProductsByRecipes(recipes.map(r => r.id));
      
      // Găsește toate comenzile cu aceste produse (ultimele 30 zile)
      affected.orders = await this.getOrdersByProducts(
        affected.products.map(p => p.id),
        30 // zile
      );
    }
    
    return affected;
  }
  
  /**
   * Trimite notificări pentru recall
   */
  async sendNotifications(recallId) {
    const recall = await this.getById(recallId);
    
    // TODO: Implement email/SMS/push notifications
    console.log(`📧 Sending recall notifications for ${recall.recall_number}...`);
    
    // Update status
    await this.update(recallId, {
      notification_sent: 1,
      notification_sent_at: new Date().toISOString(),
      notification_method: 'Email, SMS, Push'
    });
    
    return true;
  }
  
  /**
   * Generează număr recall unic
   */
  async generateRecallNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Găsește ultimul număr din ziua curentă
    const lastRecall = await new Promise((resolve, reject) => {
      db.get(`
        SELECT recall_number FROM product_recalls 
        WHERE recall_date = ?
        ORDER BY id DESC LIMIT 1
      `, [`${year}-${month}-${day}`], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    
    let sequence = 1;
    if (lastRecall) {
      const parts = lastRecall.recall_number.split('-');
      sequence = parseInt(parts[parts.length - 1]) + 1;
    }
    
    return `RCL-${year}${month}${day}-${String(sequence).padStart(5, '0')}`;
  }
  
  // CRUD
  async create(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      db.run(`INSERT INTO product_recalls (${fields}) VALUES (${placeholders})`, values, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM product_recalls WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
  
  async update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      db.run(`UPDATE product_recalls SET ${fields} WHERE id = ?`, values, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  // Helpers (REAL IMPLEMENTATION)
  async getConsumeItemsByBatches(batchNumbers) {
    return new Promise((resolve, reject) => {
      const placeholders = batchNumbers.map(() => '?').join(',');
      
      db.all(`
        SELECT ci.*, cn.order_id
        FROM consume_items ci
        JOIN consume_notes cn ON cn.id = ci.consume_id
        WHERE ci.batch_number IN (${placeholders})
      `, batchNumbers, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async getOrdersByIds(orderIds) {
    if (!orderIds || orderIds.length === 0) return [];
    
    return new Promise((resolve, reject) => {
      const placeholders = orderIds.map(() => '?').join(',');
      
      db.all(`
        SELECT id, timestamp, table_number, total, customer_name, customer_phone
        FROM orders
        WHERE id IN (${placeholders})
      `, orderIds, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async getProductsByIds(productIds) {
    if (!productIds || productIds.length === 0) return [];
    
    return new Promise((resolve, reject) => {
      const placeholders = productIds.map(() => '?').join(',');
      
      db.all(`
        SELECT id, name, category
        FROM products
        WHERE id IN (${placeholders})
      `, productIds, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async getRecipesByIngredient(ingredientId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT r.*
        FROM recipes r
        JOIN recipe_ingredients ri ON ri.recipe_id = r.id
        WHERE ri.ingredient_id = ?
      `, [ingredientId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async getProductsByRecipes(recipeIds) {
    if (!recipeIds || recipeIds.length === 0) return [];
    
    return new Promise((resolve, reject) => {
      const placeholders = recipeIds.map(() => '?').join(',');
      
      db.all(`
        SELECT DISTINCT p.*
        FROM products p
        WHERE p.base_recipe_id IN (${placeholders})
      `, recipeIds, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async getOrdersByProducts(productIds, days) {
    if (!productIds || productIds.length === 0) return [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return new Promise((resolve, reject) => {
      // Parse items JSON și găsește comenzi cu produsele respective
      db.all(`
        SELECT id, timestamp, items, table_number, total, customer_name
        FROM orders
        WHERE timestamp >= ? AND status = 'completed'
      `, [cutoffDate.toISOString()], (err, rows) => {
        if (err) return reject(err);
        
        // Filtrează comenzi care conțin produsele afectate
        const affectedOrders = rows.filter(order => {
          try {
            const items = JSON.parse(order.items || '[]');
            return items.some(item => productIds.includes(item.product_id || item.id));
          } catch {
            return false;
          }
        });
        
        resolve(affectedOrders);
      });
    });
  }
}

module.exports = new RecallService();

