/**
 * SERVING ORDER SERVICE
 * Manages serving order groups for product grouping on receipts
 * Data: 14 Februarie 2026
 */

const { dbPromise } = require('../../../../database');

class ServingOrderService {
  
  /**
   * Get all serving order groups
   */
  async getAllGroups() {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM serving_order_groups WHERE active = 1 ORDER BY sequence ASC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
  
  /**
   * Get group by ID
   */
  async getGroupById(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM serving_order_groups WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  /**
   * Create serving order group
   */
  async createGroup(groupData) {
    const db = await dbPromise;
    const { name, sequence, color, icon, active } = groupData;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO serving_order_groups (name, sequence, color, icon, active)
        VALUES (?, ?, ?, ?, ?)
      `, [name, sequence, color || '#3b82f6', icon || null, active !== false ? 1 : 0], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...groupData });
      });
    });
  }
  
  /**
   * Update serving order group
   */
  async updateGroup(id, groupData) {
    const db = await dbPromise;
    const { name, sequence, color, icon, active } = groupData;
    
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE serving_order_groups 
        SET name = ?, sequence = ?, color = ?, icon = ?, active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, sequence, color || '#3b82f6', icon || null, active ? 1 : 0, id], (err) => {
        if (err) reject(err);
        else resolve({ id, ...groupData });
      });
    });
  }
  
  /**
   * Delete serving order group
   */
  async deleteGroup(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM serving_order_groups WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
  
  /**
   * Assign group to order item
   */
  async assignGroupToItem(orderItemId, groupId) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE order_items 
        SET serving_order_group_id = ?
        WHERE id = ?
      `, [groupId, orderItemId], (err) => {
        if (err) reject(err);
        else resolve({ success: true, orderItemId, groupId });
      });
    });
  }
  
  /**
   * Get order items grouped by serving order
   */
  async getOrderItemsGrouped(orderId) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          oi.*,
          sog.name as group_name,
          sog.sequence as group_sequence,
          sog.color as group_color,
          sog.icon as group_icon
        FROM order_items oi
        LEFT JOIN serving_order_groups sog ON oi.serving_order_group_id = sog.id
        WHERE oi.order_id = ?
        ORDER BY COALESCE(sog.sequence, 999), oi.id
      `, [orderId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Group items by serving order
          const grouped = {};
          rows.forEach(item => {
            const groupKey = item.serving_order_group_id || 'ungrouped';
            if (!grouped[groupKey]) {
              grouped[groupKey] = {
                group_id: item.serving_order_group_id,
                group_name: item.group_name || 'Altele',
                group_sequence: item.group_sequence || 999,
                group_color: item.group_color || '#6b7280',
                group_icon: item.group_icon || '📦',
                items: []
              };
            }
            grouped[groupKey].items.push(item);
          });
          
          // Convert to array and sort by sequence
          const result = Object.values(grouped).sort((a, b) => a.group_sequence - b.group_sequence);
          resolve(result);
        }
      });
    });
  }
}

module.exports = new ServingOrderService();
