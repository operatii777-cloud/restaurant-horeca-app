/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HIGH CONCURRENCY ORDER SERVICE
 * 
 * Optimizat pentru 200+ clienți simultan
 * - Batch processing
 * - Queue management
 * - Request batching
 * - Optimized queries
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');
const orderQueueService = require('./order-queue.service');
const connectionPoolService = require('../database/connection-pool.service');

class HighConcurrencyOrderService {
  constructor() {
    this.processingQueue = [];
    this.batchSize = 10; // Procesează 10 comenzi simultan
    this.processing = false;
    this.stats = {
      totalProcessed: 0,
      totalQueued: 0,
      totalFailed: 0,
      avgProcessingTime: 0,
    };
  }

  /**
   * Procesează comandă cu optimizări pentru high concurrency
   */
  async processOrderOptimized(orderData) {
    const startTime = Date.now();

    try {
      const db = await dbPromise;

      // Verifică dacă trebuie pusă în coadă
      if (orderQueueService.shouldQueueOrder(orderData)) {
        await orderQueueService.queueOrder(orderData);
        this.stats.totalQueued++;
        return {
          success: true,
          queued: true,
          message: 'Comanda a fost adăugată în coadă',
        };
      }

      // Procesare instant optimizată
      const orderId = await this._createOrderOptimized(db, orderData);

      const processingTime = Date.now() - startTime;
      this._updateAvgProcessingTime(processingTime);
      this.stats.totalProcessed++;

      return {
        success: true,
        order_id: orderId,
        processing_time_ms: processingTime,
      };
    } catch (error) {
      this.stats.totalFailed++;
      console.error('❌ Error processing order:', error);
      throw error;
    }
  }

  /**
   * Creează comandă optimizată (folosește prepared statements și batch)
   */
  async _createOrderOptimized(db, orderData) {
    return new Promise((resolve, reject) => {
      // Folosește transaction pentru atomicity
      db.serialize(() => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Insert order
          db.run(
            `INSERT INTO orders (
              type, order_source, platform, table_number, items, total, payment_method,
              status, general_notes, timestamp, is_paid,
              customer_name, customer_phone, delivery_address,
              client_identifier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)`,
            [
              orderData.type || 'dine_in',
              orderData.order_source || 'pos',
              orderData.platform || 'POS',
              orderData.table_number || null,
              JSON.stringify(orderData.items || []),
              orderData.total || 0,
              orderData.payment_method || null,
              'pending',
              orderData.notes || null,
              orderData.payment_method ? 1 : 0,
              orderData.customer_name || null,
              orderData.customer_phone || null,
              orderData.delivery_address || null,
              orderData.client_identifier || null,
            ],
            function(err) {
              if (err) {
                db.run('ROLLBACK', () => {});
                reject(err);
                return;
              }

              const orderId = this.lastID;

              // Commit transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK', () => {});
                  reject(err);
                  return;
                }

                // Emite Socket.IO event (async, nu blochează)
                setImmediate(() => {
                  if (global.io) {
                    global.io.emit('order:created', {
                      order_id: orderId,
                      table_number: orderData.table_number,
                      platform: orderData.platform,
                      total: orderData.total,
                    });
                  }
                });

                resolve(orderId);
              });
            }
          );
        });
      });
    });
  }

  /**
   * Batch process orders (pentru high concurrency)
   */
  async batchProcessOrders(ordersData) {
    const startTime = Date.now();
    const results = [];

    // Procesează în batch-uri
    for (let i = 0; i < ordersData.length; i += this.batchSize) {
      const batch = ordersData.slice(i, i + this.batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(order => this.processOrderOptimized(order))
      );

      results.push(...batchResults);
    }

    const totalTime = Date.now() - startTime;
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      total: ordersData.length,
      successful,
      failed,
      total_time_ms: totalTime,
      avg_time_per_order_ms: totalTime / ordersData.length,
    };
  }

  /**
   * Actualizează average processing time
   */
  _updateAvgProcessingTime(newTime) {
    const total = this.stats.totalProcessed;
    this.stats.avgProcessingTime = 
      (this.stats.avgProcessingTime * (total - 1) + newTime) / total;
  }

  /**
   * Obține statistici
   */
  getStats() {
    return {
      ...this.stats,
      queue_size: orderQueueService.getStats().currentQueueSize,
    };
  }
}

// Singleton
const highConcurrencyOrderService = new HighConcurrencyOrderService();

module.exports = highConcurrencyOrderService;
