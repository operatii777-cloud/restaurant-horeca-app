/**
 * ENTERPRISE MODULE - Webhooks Service
 * 
 * Manages webhook subscriptions and event delivery
 */

const crypto = require('crypto');
const axios = require('axios');
const { dbPromise } = require('../../../database');

// Exponential Backoff Retry Intervals (in seconds)
// 30s, 1min, 5min, 15min, 1h, 6h, 24h
const RETRY_INTERVALS = [30, 60, 300, 900, 3600, 21600, 86400];
const MAX_RETRIES = 7;

class WebhookService {
  constructor() {
    this.retryWorkerInterval = null;
  }

  /**
   * Start the retry worker
   * Checks for failed deliveries and retries them with exponential backoff
   */
  startRetryWorker(intervalMs = 30000) {
    if (this.retryWorkerInterval) {
      console.log('[Webhook] Retry worker already running');
      return;
    }

    console.log('[Webhook] Starting retry worker (interval: ' + intervalMs + 'ms)');
    
    this.retryWorkerInterval = setInterval(async () => {
      try {
        await this.processRetryQueue();
      } catch (error) {
        console.error('[Webhook] Retry worker error:', error.message);
      }
    }, intervalMs);
  }

  /**
   * Stop the retry worker
   */
  stopRetryWorker() {
    if (this.retryWorkerInterval) {
      clearInterval(this.retryWorkerInterval);
      this.retryWorkerInterval = null;
      console.log('[Webhook] Retry worker stopped');
    }
  }

  /**
   * Process the retry queue - find failed deliveries due for retry
   */
  async processRetryQueue() {
    const db = await dbPromise;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.all(`
        SELECT wd.*, w.url, w.secret, w.events
        FROM webhook_deliveries wd
        JOIN webhooks w ON wd.webhook_id = w.id
        WHERE wd.success = 0 
          AND wd.retry_count < ?
          AND (wd.next_retry_at IS NULL OR wd.next_retry_at <= ?)
          AND w.active = 1
        ORDER BY wd.delivered_at ASC
        LIMIT 10
      `, [MAX_RETRIES, now], async (err, rows) => {
        if (err) {
          if (err.message.includes('no such table') || err.message.includes('no such column')) {
            resolve([]);
          } else {
            reject(err);
          }
          return;
        }

        if (!rows || rows.length === 0) {
          resolve([]);
          return;
        }

        console.log(`[Webhook] Processing ${rows.length} retry deliveries`);

        for (const delivery of rows) {
          await this.retryDelivery(delivery);
        }

        resolve(rows);
      });
    });
  }

  /**
   * Retry a failed webhook delivery
   */
  async retryDelivery(delivery) {
    const db = await dbPromise;
    const retryCount = (delivery.retry_count || 0) + 1;

    try {
      // Parse the original payload from the event
      const payload = {
        event: delivery.event,
        data: JSON.parse(delivery.payload || '{}'),
        timestamp: new Date().toISOString(),
        retry_attempt: retryCount
      };

      const signature = this.generateSignature(JSON.stringify(payload), delivery.secret);

      const response = await axios.post(delivery.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event,
          'X-Webhook-Id': delivery.webhook_id.toString(),
          'X-Webhook-Retry': retryCount.toString()
        },
        timeout: 10000
      });

      // Success! Update the delivery record
      await new Promise((resolve) => {
        db.run(`
          UPDATE webhook_deliveries 
          SET success = 1, 
              status_code = ?, 
              retry_count = ?,
              last_retry_at = ?,
              next_retry_at = NULL,
              error = NULL
          WHERE id = ?
        `, [response.status, retryCount, new Date().toISOString(), delivery.id], resolve);
      });

      console.log(`[Webhook] Retry #${retryCount} SUCCESS for delivery ${delivery.id}`);

    } catch (error) {
      // Calculate next retry time with exponential backoff
      const nextRetrySeconds = RETRY_INTERVALS[Math.min(retryCount, RETRY_INTERVALS.length - 1)];
      const nextRetryAt = new Date(Date.now() + nextRetrySeconds * 1000).toISOString();

      await new Promise((resolve) => {
        db.run(`
          UPDATE webhook_deliveries 
          SET retry_count = ?,
              last_retry_at = ?,
              next_retry_at = ?,
              error = ?
          WHERE id = ?
        `, [
          retryCount, 
          new Date().toISOString(), 
          retryCount >= MAX_RETRIES ? null : nextRetryAt,
          error.message,
          delivery.id
        ], resolve);
      });

      if (retryCount >= MAX_RETRIES) {
        console.log(`[Webhook] Delivery ${delivery.id} FAILED permanently after ${MAX_RETRIES} retries`);
      } else {
        console.log(`[Webhook] Retry #${retryCount} FAILED for delivery ${delivery.id}, next retry in ${nextRetrySeconds}s`);
      }
    }
  }
  /**
   * Create webhook subscription
   * @param {Object} params - Webhook parameters
   * @returns {Promise<Object>} Webhook object
   */
  async createWebhook({
    url,
    events,
    secret = null,
    userId = null,
    active = true
  }) {
    const db = await dbPromise;
    
    // Generate secret if not provided
    if (!secret) {
      secret = crypto.randomBytes(32).toString('hex');
    }
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO webhooks (
          url,
          events,
          secret,
          user_id,
          active,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        url,
        JSON.stringify(events),
        secret,
        userId,
        active ? 1 : 0,
        new Date().toISOString()
      ], function(err) {
        if (err) {
          if (err.message.includes('no such table')) {
            this.createWebhooksTable().then(() => {
              this.createWebhook({ url, events, secret, userId, active })
                .then(resolve).catch(reject);
            }).catch(reject);
          } else {
            reject(err);
          }
        } else {
          resolve({
            id: this.lastID,
            url,
            events,
            secret,
            active
          });
        }
      }.bind(this));
    });
  }

  /**
   * Create webhooks table
   * @returns {Promise<Boolean>}
   */
  async createWebhooksTable() {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS webhooks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL,
          events TEXT NOT NULL,
          secret TEXT NOT NULL,
          user_id INTEGER,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Create indexes
          db.run(`CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active)`, () => {
            resolve(true);
          });
        }
      });
    });
  }

  /**
   * Get webhooks for event
   * @param {String} event - Event name
   * @returns {Promise<Array>} Webhooks
   */
  async getWebhooksForEvent(event) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM webhooks
        WHERE active = 1
      `, [], (err, webhooks) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          // Filter webhooks that subscribe to this event
          const filtered = webhooks.filter(webhook => {
            const events = JSON.parse(webhook.events || '[]');
            return events.includes(event) || events.includes('*');
          });
          
          resolve(filtered);
        }
      });
    });
  }

  /**
   * Trigger webhook event with retry support
   * @param {String} event - Event name
   * @param {Object} data - Event data
   * @returns {Promise<Array>} Delivery results
   */
  async triggerEvent(event, data) {
    const webhooks = await this.getWebhooksForEvent(event);
    const results = [];
    
    for (const webhook of webhooks) {
      try {
        const result = await this.deliverWebhook(webhook, event, data);
        results.push({
          webhookId: webhook.id,
          url: webhook.url,
          success: true,
          statusCode: result.status,
          response: result.data
        });
      } catch (error) {
        results.push({
          webhookId: webhook.id,
          url: webhook.url,
          success: false,
          error: error.message,
          willRetry: true // Indicates retry is scheduled
        });
        
        // Log failed delivery with payload for retry
        await this.logWebhookDelivery(webhook.id, event, false, error.message, null, data);
        
        console.log(`[Webhook] Delivery to ${webhook.url} failed, scheduled for retry`);
      }
    }
    
    return results;
  }

  /**
   * Deliver webhook to URL
   * @param {Object} webhook - Webhook object
   * @param {String} event - Event name
   * @param {Object} data - Event data
   * @returns {Promise<Object>} Response
   */
  async deliverWebhook(webhook, event, data) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Generate signature
    const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);
    
    // Send webhook
    const response = await axios.post(webhook.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'X-Webhook-Id': webhook.id.toString()
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    // Log successful delivery
    await this.logWebhookDelivery(webhook.id, event, true, null, response.status);
    
    return response;
  }

  /**
   * Generate webhook signature
   * @param {String} payload - Payload string
   * @param {String} secret - Webhook secret
   * @returns {String} Signature
   */
  generateSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   * @param {String} payload - Payload string
   * @param {String} signature - Received signature
   * @param {String} secret - Webhook secret
   * @returns {Boolean}
   */
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Log webhook delivery with retry support
   * @param {Number} webhookId - Webhook ID
   * @param {String} event - Event name
   * @param {Boolean} success - Success status
   * @param {String} error - Error message (if failed)
   * @param {Number} statusCode - HTTP status code (if successful)
   * @param {Object} payload - Original payload (for retry)
   * @returns {Promise<Boolean>}
   */
  async logWebhookDelivery(webhookId, event, success, error = null, statusCode = null, payload = null) {
    const db = await dbPromise;
    
    // Calculate next retry time for failed deliveries
    const nextRetryAt = !success ? new Date(Date.now() + RETRY_INTERVALS[0] * 1000).toISOString() : null;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO webhook_deliveries (
          webhook_id,
          event,
          payload,
          success,
          error,
          status_code,
          retry_count,
          next_retry_at,
          delivered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        webhookId,
        event,
        payload ? JSON.stringify(payload) : null,
        success ? 1 : 0,
        error,
        statusCode,
        0,
        nextRetryAt,
        new Date().toISOString()
      ], (err) => {
        if (err) {
          if (err.message.includes('no such table') || err.message.includes('no such column')) {
            this.createWebhookDeliveriesTable().then(() => {
              this.logWebhookDelivery(webhookId, event, success, error, statusCode, payload)
                .then(resolve).catch(reject);
            }).catch(reject);
          } else {
            reject(err);
          }
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Create webhook_deliveries table with retry support
   * @returns {Promise<Boolean>}
   */
  async createWebhookDeliveriesTable() {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS webhook_deliveries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          webhook_id INTEGER NOT NULL,
          event TEXT NOT NULL,
          payload TEXT,
          success INTEGER DEFAULT 1,
          error TEXT,
          status_code INTEGER,
          retry_count INTEGER DEFAULT 0,
          next_retry_at DATETIME,
          last_retry_at DATETIME,
          delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (webhook_id) REFERENCES webhooks(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Add retry columns if they don't exist (migration)
          db.run(`ALTER TABLE webhook_deliveries ADD COLUMN payload TEXT`, () => {});
          db.run(`ALTER TABLE webhook_deliveries ADD COLUMN retry_count INTEGER DEFAULT 0`, () => {});
          db.run(`ALTER TABLE webhook_deliveries ADD COLUMN next_retry_at DATETIME`, () => {});
          db.run(`ALTER TABLE webhook_deliveries ADD COLUMN last_retry_at DATETIME`, () => {});
          
          db.run(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id)`, () => {
            db.run(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event)`, () => {
              db.run(`CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON webhook_deliveries(success, retry_count, next_retry_at)`, () => {
                resolve(true);
              });
            });
          });
        }
      });
    });
  }

  /**
   * Get webhook delivery history
   * @param {Number} webhookId - Webhook ID
   * @param {Number} limit - Limit
   * @returns {Promise<Array>} Delivery history
   */
  async getDeliveryHistory(webhookId, limit = 100) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM webhook_deliveries
        WHERE webhook_id = ?
        ORDER BY delivered_at DESC
        LIMIT ?
      `, [webhookId, limit], (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = new WebhookService();

