/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORDER PROCESSING PIPELINE SERVICE
 * Enterprise-Grade Unified Order Processing (Similar to Lightspeed, Toast, Square)
 * 
 * Asigură procesarea automată a TOATE comenzilor, indiferent de sursă:
 * - Tazz, Wolt, Glovo, Bolt, Uber Eats
 * - Friends Ride, RestorApp
 * - Site propriu, POS, Kiosk, QR
 * 
 * Pattern: Order Lifecycle Hooks (pre-create, post-create, pre-update, post-update)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../../database');
const stockConsumptionService = require('../../stocks/services/stockConsumption.service');

// Logger fallback
let logger;
try {
  logger = require('../../../../src/logging/logger');
} catch (e) {
  logger = console;
}

/**
 * Order Processing Pipeline
 * Similar to Lightspeed/Toast/Square - unified order processing
 */
class OrderProcessingPipeline {
  constructor() {
    this.hooks = {
      preCreate: [],
      postCreate: [],
      preUpdate: [],
      postUpdate: []
    };
  }

  /**
   * Register a hook
   */
  registerHook(type, handler) {
    if (!this.hooks[type]) {
      throw new Error(`Invalid hook type: ${type}`);
    }
    this.hooks[type].push(handler);
  }

  /**
   * Execute hooks
   */
  async executeHooks(type, context) {
    const hooks = this.hooks[type] || [];
    for (const hook of hooks) {
      try {
        await hook(context);
      } catch (error) {
        logger.error(`[OrderPipeline] Hook ${type} failed:`, error);
        // Continue execution even if hook fails
      }
    }
  }

  /**
   * Process order after creation
   * This is the MAIN entry point for all order processing
   */
  async processOrderAfterCreation(orderId, orderData = {}) {
    try {
      const db = await dbPromise;
      
      // Get order details if not provided
      let order = orderData;
      if (!order || !order.id) {
        order = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      }

      if (!order) {
        logger.warn(`[OrderPipeline] Order ${orderId} not found`);
        return { success: false, error: 'Order not found' };
      }

      // Parse items if string
      let items = [];
      if (order.items) {
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          if (!Array.isArray(items)) items = [];
        } catch (e) {
          logger.error(`[OrderPipeline] Failed to parse items for order ${orderId}:`, e);
          items = [];
        }
      }

      if (items.length === 0) {
        logger.warn(`[OrderPipeline] Order ${orderId} has no items, skipping stock consumption`);
        return { success: true, skipped: true, reason: 'NO_ITEMS' };
      }

      // Determine platform/source
      const platform = order.platform || order.order_source || 'UNKNOWN';
      const source = this.mapPlatformToSource(platform);

      logger.info(`[OrderPipeline] Processing order ${orderId} from platform ${platform}`, {
        orderId,
        platform,
        source,
        itemsCount: items.length,
        isPaid: order.is_paid || 0
      });

      // Execute pre-create hooks
      await this.executeHooks('preCreate', { order, items, platform, source });

      // ✅ CRITICAL: Consume stock AUTOMATICALLY for ALL orders
      // This is the KEY feature - automatic stock consumption regardless of source
      const stockResult = await this.consumeStockForOrder(orderId, order, items, source);

      // Execute post-create hooks
      await this.executeHooks('postCreate', { 
        order, 
        items, 
        platform, 
        source, 
        stockResult 
      });

      return {
        success: true,
        orderId,
        platform,
        source,
        stockConsumed: stockResult.success,
        stockResult
      };

    } catch (error) {
      logger.error(`[OrderPipeline] Failed to process order ${orderId}:`, error);
      return {
        success: false,
        error: error.message,
        orderId
      };
    }
  }

  /**
   * Consume stock for order
   * Unified stock consumption for ALL order sources
   */
  async consumeStockForOrder(orderId, order, items, source) {
    try {
      // Check if stock is already consumed (idempotent)
      const alreadyConsumed = await stockConsumptionService.isStockConsumedForOrder(orderId);
      
      if (alreadyConsumed) {
        logger.info(`[OrderPipeline] Stock already consumed for order ${orderId}, skipping`);
        return {
          success: true,
          skipped: true,
          reason: 'ALREADY_CONSUMED'
        };
      }

      // Determine consumption reason based on order status
      const reason = this.determineConsumptionReason(order);

      // Consume stock using unified service
      const result = await stockConsumptionService.consumeStockForOrder(orderId, {
        reason,
        source,
        fiscalReceiptId: order.fiscal_receipt_id || null,
        fiscalNumber: order.fiscal_number || null
      });

      logger.info(`[OrderPipeline] Stock consumption result for order ${orderId}:`, result);

      return {
        success: !result.skipped,
        skipped: result.skipped || false,
        reason: result.reason || 'SUCCESS',
        result
      };

    } catch (error) {
      logger.error(`[OrderPipeline] Stock consumption failed for order ${orderId}:`, error);
      
      // Emit alert but don't fail order creation
      if (global.io) {
        global.io.emit('alert:stock-consumption-failed', {
          type: 'STOCK_CONSUMPTION_FAILED',
          severity: 'error',
          message: `Eroare la consumul de stoc pentru comanda ${orderId}`,
          orderId,
          platform: order.platform || 'UNKNOWN',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Map platform to stock source
   */
  mapPlatformToSource(platform) {
    const platformMap = {
      'GLOVO': 'GLOVO',
      'WOLT': 'WOLT',
      'TAZZ': 'TAZZ',
      'BOLT': 'BOLT',
      'BOLT_FOOD': 'BOLT',
      'UBER_EATS': 'UBER_EATS',
      'FRIENDSRIDE': 'FRIENDSRIDE',
      'FRIENDS_RIDE': 'FRIENDSRIDE',
      'MOBILE_APP': 'MOBILE_APP',
      'RESTORAPP': 'MOBILE_APP',
      'POS': 'POS',
      'KIOSK': 'KIOSK',
      'QR': 'QR',
      'PHONE': 'PHONE',
      'WEBSITE': 'WEBSITE',
      'SITE_PROPRIU': 'WEBSITE'
    };

    return platformMap[platform?.toUpperCase()] || 'UNKNOWN';
  }

  /**
   * Determine consumption reason based on order status
   */
  determineConsumptionReason(order) {
    // For paid orders, consume immediately
    if (order.is_paid === 1 || order.is_paid === true) {
      return 'ORDER_CREATED_PAID';
    }

    // For pending orders, consume on creation (standard practice)
    if (order.status === 'pending') {
      return 'ORDER_CREATED';
    }

    // For preparing/ready orders, consume
    if (order.status === 'preparing' || order.status === 'ready') {
      return 'ORDER_IN_PREPARATION';
    }

    // Default: consume on creation
    return 'ORDER_CREATED';
  }

  /**
   * Process order after update (e.g., status change, payment)
   */
  async processOrderAfterUpdate(orderId, oldOrder, newOrder) {
    try {
      // If order was just paid, ensure stock is consumed
      if (oldOrder.is_paid !== 1 && newOrder.is_paid === 1) {
        logger.info(`[OrderPipeline] Order ${orderId} was just paid, ensuring stock consumption`);
        await this.processOrderAfterCreation(orderId, newOrder);
      }

      // Execute post-update hooks
      await this.executeHooks('postUpdate', { oldOrder, newOrder });

      return { success: true };

    } catch (error) {
      logger.error(`[OrderPipeline] Failed to process order update ${orderId}:`, error);
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const orderProcessingPipeline = new OrderProcessingPipeline();

// Register default hooks
orderProcessingPipeline.registerHook('postCreate', async (context) => {
  const { order, platform, source } = context;
  
  // Emit Socket.IO events
  if (global.io) {
    global.io.emit('order:processed', {
      orderId: order.id,
      platform,
      source,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = orderProcessingPipeline;
