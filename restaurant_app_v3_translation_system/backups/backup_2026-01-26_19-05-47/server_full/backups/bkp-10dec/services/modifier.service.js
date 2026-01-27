/**
 * MODIFIER SERVICE - Extras, Toppings, Combos
 * Data: 04 Decembrie 2025
 * Funcționalitate critică pentru restaurante moderne
 */

const { dbPromise } = require('../database');

class ModifierService {
  // ========================================
  // MODIFIER GROUPS
  // ========================================

  /**
   * Get all modifier groups
   */
  async getAllGroups() {
    const db = await dbPromise;
    const groups = await db.all(`
      SELECT 
        mg.*,
        (SELECT COUNT(*) FROM modifier_group_items WHERE group_id = mg.id) as items_count
      FROM modifier_groups mg
      WHERE mg.is_active = 1
      ORDER BY mg.display_order, mg.name
    `);
    return groups;
  }

  /**
   * Get modifier group by ID with items
   */
  async getGroupById(groupId) {
    const db = await dbPromise;
    
    const group = await db.get(`
      SELECT * FROM modifier_groups WHERE id = ?
    `, [groupId]);
    
    if (!group) return null;
    
    const items = await db.all(`
      SELECT * FROM modifier_group_items
      WHERE group_id = ? AND is_active = 1
      ORDER BY display_order, name
    `, [groupId]);
    
    return {
      ...group,
      items
    };
  }

  /**
   * Create modifier group
   */
  async createGroup(data) {
    const db = await dbPromise;
    
    const result = await db.run(`
      INSERT INTO modifier_groups (
        name, name_en, type, min_selections, max_selections,
        is_required, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.name,
      data.name_en || null,
      data.type || 'multiple',
      data.min_selections || 0,
      data.max_selections || null,
      data.is_required ? 1 : 0,
      data.display_order || 0,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
    ]);
    
    return { id: result.lastID, ...data };
  }

  /**
   * Update modifier group
   */
  async updateGroup(groupId, data) {
    const db = await dbPromise;
    
    await db.run(`
      UPDATE modifier_groups SET
        name = ?,
        name_en = ?,
        type = ?,
        min_selections = ?,
        max_selections = ?,
        is_required = ?,
        display_order = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.name,
      data.name_en || null,
      data.type,
      data.min_selections || 0,
      data.max_selections || null,
      data.is_required ? 1 : 0,
      data.display_order || 0,
      data.is_active ? 1 : 0,
      groupId
    ]);
    
    return { id: groupId, ...data };
  }

  /**
   * Delete modifier group
   */
  async deleteGroup(groupId) {
    const db = await dbPromise;
    await db.run(`DELETE FROM modifier_groups WHERE id = ?`, [groupId]);
    return { success: true };
  }

  // ========================================
  // MODIFIER GROUP ITEMS
  // ========================================

  /**
   * Add item to group
   */
  async addItemToGroup(groupId, data) {
    const db = await dbPromise;
    
    const result = await db.run(`
      INSERT INTO modifier_group_items (
        group_id, name, name_en, price_delta,
        is_default, is_active, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      groupId,
      data.name,
      data.name_en || null,
      data.price_delta || 0,
      data.is_default ? 1 : 0,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      data.display_order || 0
    ]);
    
    return { id: result.lastID, group_id: groupId, ...data };
  }

  /**
   * Update modifier item
   */
  async updateItem(itemId, data) {
    const db = await dbPromise;
    
    await db.run(`
      UPDATE modifier_group_items SET
        name = ?,
        name_en = ?,
        price_delta = ?,
        is_default = ?,
        is_active = ?,
        display_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.name,
      data.name_en || null,
      data.price_delta || 0,
      data.is_default ? 1 : 0,
      data.is_active ? 1 : 0,
      data.display_order || 0,
      itemId
    ]);
    
    return { id: itemId, ...data };
  }

  /**
   * Delete modifier item
   */
  async deleteItem(itemId) {
    const db = await dbPromise;
    await db.run(`DELETE FROM modifier_group_items WHERE id = ?`, [itemId]);
    return { success: true };
  }

  // ========================================
  // PRODUCT MODIFIERS (Link Products → Groups)
  // ========================================

  /**
   * Get modifiers for product/menu item
   */
  async getModifiersForProduct(productId) {
    const db = await dbPromise;
    
    const productModifiers = await db.all(`
      SELECT 
        pm.id as product_modifier_id,
        pm.is_required as product_is_required,
        pm.display_order as product_display_order,
        mg.*
      FROM product_modifiers pm
      JOIN modifier_groups mg ON pm.modifier_group_id = mg.id
      WHERE pm.product_id = ? AND mg.is_active = 1
      ORDER BY pm.display_order, mg.name
    `, [productId]);
    
    // Get items for each group
    for (const modifier of productModifiers) {
      modifier.items = await db.all(`
        SELECT * FROM modifier_group_items
        WHERE group_id = ? AND is_active = 1
        ORDER BY display_order, name
      `, [modifier.id]);
    }
    
    return productModifiers;
  }

  /**
   * Save product modifiers (replace all)
   */
  async saveProductModifiers(productId, modifiers) {
    const db = await dbPromise;
    
    // Delete existing
    await db.run(`DELETE FROM product_modifiers WHERE product_id = ?`, [productId]);
    
    // Insert new
    for (const mod of modifiers) {
      await db.run(`
        INSERT INTO product_modifiers (
          product_id, modifier_group_id, is_required, display_order
        ) VALUES (?, ?, ?, ?)
      `, [
        productId,
        mod.modifier_group_id || mod.id,
        mod.is_required ? 1 : 0,
        mod.display_order || 0
      ]);
    }
    
    return { success: true, count: modifiers.length };
  }

  /**
   * Link modifier group to product
   */
  async linkGroupToProduct(productId, groupId, options = {}) {
    const db = await dbPromise;
    
    await db.run(`
      INSERT OR REPLACE INTO product_modifiers (
        product_id, modifier_group_id, is_required, display_order
      ) VALUES (?, ?, ?, ?)
    `, [
      productId,
      groupId,
      options.is_required ? 1 : 0,
      options.display_order || 0
    ]);
    
    return { success: true };
  }

  /**
   * Unlink modifier group from product
   */
  async unlinkGroupFromProduct(productId, groupId) {
    const db = await dbPromise;
    
    await db.run(`
      DELETE FROM product_modifiers
      WHERE product_id = ? AND modifier_group_id = ?
    `, [productId, groupId]);
    
    return { success: true };
  }

  // ========================================
  // ORDER MODIFIERS (Runtime)
  // ========================================

  /**
   * Save order item modifiers
   */
  async saveOrderItemModifiers(orderItemId, modifiers) {
    const db = await dbPromise;
    
    // Delete existing
    await db.run(`DELETE FROM order_item_modifiers WHERE order_item_id = ?`, [orderItemId]);
    
    // Insert new
    for (const mod of modifiers) {
      await db.run(`
        INSERT INTO order_item_modifiers (
          order_item_id, modifier_group_id, modifier_item_id,
          quantity, price_delta
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        orderItemId,
        mod.group_id,
        mod.item_id,
        mod.quantity || 1,
        mod.price_delta || 0
      ]);
    }
    
    return { success: true };
  }

  /**
   * Get order item modifiers
   */
  async getOrderItemModifiers(orderItemId) {
    const db = await dbPromise;
    
    return await db.all(`
      SELECT 
        oim.*,
        mg.name as group_name,
        mgi.name as item_name
      FROM order_item_modifiers oim
      JOIN modifier_groups mg ON oim.modifier_group_id = mg.id
      JOIN modifier_group_items mgi ON oim.modifier_item_id = mgi.id
      WHERE oim.order_item_id = ?
      ORDER BY mg.display_order, mgi.display_order
    `, [orderItemId]);
  }

  /**
   * Calculate total modifier price for order item
   */
  async calculateModifierPrice(modifiers) {
    let total = 0;
    
    for (const mod of modifiers) {
      const priceDelta = mod.price_delta || 0;
      const quantity = mod.quantity || 1;
      total += priceDelta * quantity;
    }
    
    return total;
  }
}

module.exports = new ModifierService();

