/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLATFORM SYNC SERVICE
 * 
 * Sincronizare automată cu platformele externe (Glovo, Wolt, etc.):
 * - Sincronizare meniu (produse, prețuri, categorii)
 * - Sincronizare disponibilitate (stoc)
 * - Sincronizare status comenzi
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');
const http = require('http');
const https = require('https');

class PlatformSyncService {
  constructor() {
    this.syncIntervals = new Map(); // Store intervals for each platform
    this.isSyncing = new Map(); // Track if sync is in progress
  }

  /**
   * Sync menu to external platform
   */
  async syncMenuToPlatform(platform, connector) {
    if (this.isSyncing.get(`${platform}-menu`)) {
      console.log(`⏳ [SYNC] Menu sync already in progress for ${platform}`);
      return;
    }

    this.isSyncing.set(`${platform}-menu`, true);

    try {
      const db = await dbPromise;
      
      // Get active menu items
      const menuItems = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id, name, name_en, description, description_en,
            price, category, category_en, image, is_active,
            allergens, additives
          FROM menu 
          WHERE is_active = 1
          ORDER BY category, name
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Check stock availability for each item
      const itemsWithStock = [];
      for (const item of menuItems) {
        const hasStock = await this.checkItemStockAvailability(item.id, db);
        itemsWithStock.push({
          ...item,
          available: hasStock
        });
      }

      // Transform to platform format
      const platformMenu = this.transformMenuForPlatform(platform, itemsWithStock);

      // Send to platform API
      await this.sendMenuToPlatform(platform, connector, platformMenu);

      console.log(`✅ [SYNC] Menu synced to ${platform}: ${itemsWithStock.length} items`);
    } catch (error) {
      console.error(`❌ [SYNC] Error syncing menu to ${platform}:`, error);
    } finally {
      this.isSyncing.set(`${platform}-menu`, false);
    }
  }

  /**
   * Check if item has sufficient stock
   */
  async checkItemStockAvailability(productId, db) {
    try {
      // Get recipe ingredients
      const ingredients = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            r.ingredient_id,
            r.quantity,
            i.current_stock,
            i.min_stock
          FROM recipes r
          JOIN ingredients i ON i.id = r.ingredient_id
          WHERE r.product_id = ? AND (i.is_available = 1 OR i.is_available IS NULL)
        `, [productId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      if (ingredients.length === 0) {
        // No recipe = always available
        return true;
      }

      // Check if all ingredients have sufficient stock (at least min_stock)
      for (const ing of ingredients) {
        const currentStock = parseFloat(ing.current_stock || 0);
        const minStock = parseFloat(ing.min_stock || 0);
        
        if (minStock > 0 && currentStock < minStock) {
          return false; // Insufficient stock
        }
      }

      return true; // All ingredients have sufficient stock
    } catch (error) {
      console.error(`❌ [SYNC] Error checking stock for product ${productId}:`, error);
      return true; // Default to available if check fails
    }
  }

  /**
   * Transform menu to platform-specific format
   */
  transformMenuForPlatform(platform, items) {
    // Base transformation (can be extended per platform)
    return items.map(item => ({
      id: item.id,
      name: item.name_en || item.name,
      description: item.description_en || item.description,
      price: parseFloat(item.price || 0),
      category: item.category_en || item.category,
      image: item.image,
      available: item.available,
      allergens: item.allergens ? JSON.parse(item.allergens) : [],
      additives: item.additives ? JSON.parse(item.additives) : []
    }));
  }

  /**
   * Send menu to platform API
   */
  async sendMenuToPlatform(platform, connector, menu) {
    // This is a placeholder - actual implementation depends on platform API
    // Each platform (Glovo, Wolt) has different API endpoints and formats
    
    console.log(`📤 [SYNC] Sending menu to ${platform} (${menu.length} items)`);
    
    // TODO: Implement actual API calls per platform
    // Example for Glovo:
    // if (platform === 'GLOVO') {
    //   await this.sendToGlovoAPI(connector, menu);
    // } else if (platform === 'WOLT') {
    //   await this.sendToWoltAPI(connector, menu);
    // }
    
    // For now, just log
    console.log(`✅ [SYNC] Menu sent to ${platform} (mock)`);
  }

  /**
   * Sync order status to external platform
   */
  async syncOrderStatusToPlatform(platform, connector, orderId, status) {
    try {
      const db = await dbPromise;
      
      // Get order
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!order || !order.external_order_id) {
        console.warn(`⚠️ [SYNC] Order ${orderId} has no external_order_id`);
        return;
      }

      // Map internal status to platform status
      const platformStatus = this.mapStatusToPlatform(platform, status);

      // Send status update to platform
      await this.sendStatusToPlatform(platform, connector, order.external_order_id, platformStatus);

      console.log(`✅ [SYNC] Status synced to ${platform} for order ${orderId}: ${status} -> ${platformStatus}`);
    } catch (error) {
      console.error(`❌ [SYNC] Error syncing status to ${platform}:`, error);
    }
  }

  /**
   * Map internal status to platform status
   */
  mapStatusToPlatform(platform, internalStatus) {
    const statusMap = {
      'pending': 'pending',
      'preparing': 'preparing',
      'ready': 'ready',
      'assigned': 'assigned',
      'picked_up': 'picked_up',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    return statusMap[internalStatus] || internalStatus;
  }

  /**
   * Send status update to platform API
   */
  async sendStatusToPlatform(platform, connector, externalOrderId, status) {
    // This is a placeholder - actual implementation depends on platform API
    console.log(`📤 [SYNC] Sending status to ${platform} for order ${externalOrderId}: ${status}`);
    
    // TODO: Implement actual API calls per platform
    // Example:
    // if (platform === 'GLOVO') {
    //   await this.updateGlovoOrderStatus(connector, externalOrderId, status);
    // } else if (platform === 'WOLT') {
    //   await this.updateWoltOrderStatus(connector, externalOrderId, status);
    // }
    
    console.log(`✅ [SYNC] Status sent to ${platform} (mock)`);
  }

  /**
   * Start automatic sync for a platform
   */
  startAutoSync(platform, connector, intervalMinutes = 15) {
    const intervalKey = `${platform}-auto`;
    
    // Stop existing sync if any
    this.stopAutoSync(platform);

    // Start new sync interval
    const interval = setInterval(async () => {
      try {
        await this.syncMenuToPlatform(platform, connector);
      } catch (error) {
        console.error(`❌ [SYNC] Auto sync error for ${platform}:`, error);
      }
    }, intervalMinutes * 60 * 1000);

    this.syncIntervals.set(intervalKey, interval);
    console.log(`✅ [SYNC] Auto sync started for ${platform} (every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop automatic sync for a platform
   */
  stopAutoSync(platform) {
    const intervalKey = `${platform}-auto`;
    const interval = this.syncIntervals.get(intervalKey);
    
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(intervalKey);
      console.log(`✅ [SYNC] Auto sync stopped for ${platform}`);
    }
  }

  /**
   * Sync all enabled platforms
   */
  async syncAllEnabledPlatforms() {
    const db = await dbPromise;
    
    try {
      const connectors = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM external_delivery_connectors 
          WHERE is_enabled = 1
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      for (const connector of connectors) {
        await this.syncMenuToPlatform(connector.provider, connector);
      }

      console.log(`✅ [SYNC] All enabled platforms synced`);
    } catch (error) {
      console.error(`❌ [SYNC] Error syncing all platforms:`, error);
    }
  }
}

module.exports = new PlatformSyncService();
