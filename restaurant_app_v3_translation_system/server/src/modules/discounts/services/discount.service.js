/**
 * DISCOUNT SERVICE
 * Manages discount definitions, application, and validation
 * Data: 14 Februarie 2026
 */

const { dbPromise } = require('../../../../database');

class DiscountService {
  
  /**
   * Get all discount definitions
   */
  async getAllDiscounts(filters = {}) {
    const db = await dbPromise;
    const { active, type, applies_to } = filters;
    
    let query = 'SELECT * FROM discount_definitions WHERE 1=1';
    const params = [];
    
    if (active !== undefined) {
      query += ' AND active = ?';
      params.push(active ? 1 : 0);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (applies_to) {
      query += ' AND applies_to = ?';
      params.push(applies_to);
    }
    
    query += ' ORDER BY created_at DESC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
  
  /**
   * Get discount by ID
   */
  async getDiscountById(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM discount_definitions WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  /**
   * Create new discount definition
   */
  async createDiscount(discountData) {
    const db = await dbPromise;
    const {
      name,
      type,
      value,
      applies_to,
      target_id,
      protocol_id,
      requires_approval,
      max_amount,
      min_order_value,
      valid_from,
      valid_until,
      active,
      created_by
    } = discountData;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO discount_definitions 
        (name, type, value, applies_to, target_id, protocol_id, requires_approval, 
         max_amount, min_order_value, valid_from, valid_until, active, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, type, value, applies_to, target_id || null, protocol_id || null,
        requires_approval ? 1 : 0, max_amount || null, min_order_value || null,
        valid_from || null, valid_until || null, active !== false ? 1 : 0, created_by || null
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...discountData });
      });
    });
  }
  
  /**
   * Update discount definition
   */
  async updateDiscount(id, discountData) {
    const db = await dbPromise;
    const {
      name,
      type,
      value,
      applies_to,
      target_id,
      protocol_id,
      requires_approval,
      max_amount,
      min_order_value,
      valid_from,
      valid_until,
      active
    } = discountData;
    
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE discount_definitions 
        SET name = ?, type = ?, value = ?, applies_to = ?, target_id = ?, 
            protocol_id = ?, requires_approval = ?, max_amount = ?, min_order_value = ?,
            valid_from = ?, valid_until = ?, active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name, type, value, applies_to, target_id || null, protocol_id || null,
        requires_approval ? 1 : 0, max_amount || null, min_order_value || null,
        valid_from || null, valid_until || null, active ? 1 : 0, id
      ], (err) => {
        if (err) reject(err);
        else resolve({ id, ...discountData });
      });
    });
  }
  
  /**
   * Delete discount definition
   */
  async deleteDiscount(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM discount_definitions WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
  
  /**
   * Apply discount to order item
   */
  async applyItemDiscount(orderItemId, discountId, userId) {
    const db = await dbPromise;
    
    // Get discount definition
    const discount = await this.getDiscountById(discountId);
    if (!discount) {
      throw new Error('Discount not found');
    }
    
    // Get order item
    const orderItem = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM order_items WHERE id = ?', [orderItemId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!orderItem) {
      throw new Error('Order item not found');
    }
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (orderItem.price * orderItem.quantity * discount.value) / 100;
    } else if (discount.type === 'fixed_amount') {
      discountAmount = discount.value;
    }
    
    // Apply max_amount limit if set
    if (discount.max_amount && discountAmount > discount.max_amount) {
      discountAmount = discount.max_amount;
    }
    
    // Update order item
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE order_items 
        SET discount_type = ?, discount_value = ?, discount_amount = ?
        WHERE id = ?
      `, [discount.type, discount.value, discountAmount, orderItemId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Record discount application
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO order_discounts 
        (order_id, order_item_id, discount_definition_id, type, value, amount, approved_by, approved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [orderItem.order_id, orderItemId, discountId, discount.type, discount.value, discountAmount, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return { discountAmount, orderItem };
  }
  
  /**
   * Apply discount to entire order
   */
  async applyOrderDiscount(orderId, discountId, userId) {
    const db = await dbPromise;
    
    // Get discount definition
    const discount = await this.getDiscountById(discountId);
    if (!discount) {
      throw new Error('Discount not found');
    }
    
    // Get order total
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (order.total * discount.value) / 100;
    } else if (discount.type === 'fixed_amount') {
      discountAmount = discount.value;
    }
    
    // Apply max_amount limit if set
    if (discount.max_amount && discountAmount > discount.max_amount) {
      discountAmount = discount.max_amount;
    }
    
    // Update order
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET discount_total = ?, 
            subtotal = ?,
            total = ?
        WHERE id = ?
      `, [discountAmount, order.total, order.total - discountAmount, orderId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Record discount application
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO order_discounts 
        (order_id, discount_definition_id, type, value, amount, approved_by, approved_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [orderId, discountId, discount.type, discount.value, discountAmount, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return { discountAmount, order };
  }
  
  /**
   * Get applicable discounts for a product/category/order
   */
  async getApplicableDiscounts(context) {
    const db = await dbPromise;
    const { productId, categoryId, orderTotal } = context;
    
    let query = `
      SELECT * FROM discount_definitions 
      WHERE active = 1 
        AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
        AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)
        AND (
          (applies_to = 'product' AND target_id = ?)
          OR (applies_to = 'category' AND target_id = ?)
          OR (applies_to = 'order' AND (min_order_value IS NULL OR min_order_value <= ?))
        )
      ORDER BY value DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, [productId || null, categoryId || null, orderTotal || 0], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new DiscountService();
