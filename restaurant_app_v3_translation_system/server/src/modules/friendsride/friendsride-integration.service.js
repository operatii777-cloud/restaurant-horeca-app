/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FRIENDSRIDE INTEGRATION SERVICE
 * 
 * Integrare completă cu delivery din Friendsride
 * - Order sync
 * - Status updates
 * - Courier assignment
 * - Real-time tracking
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');
// Use standard http/https instead of SecureHttpClient for Friendsride (simpler integration)
const https = require('https');
const http = require('http');

class FriendsrideIntegrationService {
  constructor() {
    this.friendsrideApiUrl = process.env.FRIENDSRIDE_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.FRIENDSRIDE_API_KEY || '';
  }

  /**
   * Simple HTTP request helper
   */
  async httpRequest(method, url, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Sincronizează comandă cu Friendsride
   */
  async syncOrderToFriendsride(orderId) {
    try {
      const db = await dbPromise;

      // Obține comanda
      const order = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Verifică dacă comanda este pentru delivery
      if (order.type !== 'delivery' && order.order_source !== 'delivery') {
        return { success: true, message: 'Order is not a delivery order' };
      }

      // Creează delivery request pentru Friendsride
      const deliveryRequest = {
        order_id: order.id,
        restaurant_id: 1, // TODO: Din config
        customer: {
          name: order.customer_name || 'Client',
          phone: order.customer_phone || '',
          address: order.delivery_address || '',
        },
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        total: order.total,
        notes: order.general_notes || '',
        platform: 'RESTAURANT_APP',
      };

      // Trimite la Friendsride API
      const response = await this.httpRequest(
        'POST',
        `${this.friendsrideApiUrl}/api/delivery/request`,
        deliveryRequest,
        {
          'X-API-Key': this.apiKey,
        }
      );

      if (response.status === 200 || response.status === 201) {
        const deliveryData = response.data;

        // Salvează delivery ID în order
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE orders SET external_delivery_id = ?, external_platform = ? WHERE id = ?',
            [deliveryData.delivery_id || deliveryData.id, 'FRIENDSRIDE', orderId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        // Emite Socket.IO event
        if (global.io) {
          global.io.emit('delivery:assigned', {
            order_id: orderId,
            delivery_id: deliveryData.delivery_id || deliveryData.id,
            platform: 'FRIENDSRIDE',
          });
        }

        return {
          success: true,
          delivery_id: deliveryData.delivery_id || deliveryData.id,
          message: 'Order synced to Friendsride',
        };
      }

      throw new Error(`Friendsride API returned status ${response.status}`);
    } catch (error) {
      console.error('❌ Error syncing order to Friendsride:', error);
      throw error;
    }
  }

  /**
   * Actualizează status delivery din Friendsride
   */
  async updateDeliveryStatusFromFriendsride(deliveryId, status) {
    try {
      const db = await dbPromise;

      // Găsește order-ul asociat
      const order = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM orders WHERE external_delivery_id = ? AND external_platform = ?',
          [deliveryId, 'FRIENDSRIDE'],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!order) {
        throw new Error(`Order not found for delivery ${deliveryId}`);
      }

      // Mapare status Friendsride -> Restaurant App
      const statusMap = {
        'pending': 'pending',
        'assigned': 'assigned',
        'picked_up': 'picked_up',
        'in_transit': 'in_transit',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
      };

      const appStatus = statusMap[status] || status;

      // Actualizează status în order
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE orders SET status = ? WHERE id = ?',
          [appStatus, order.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Emite Socket.IO event
      if (global.io) {
        global.io.emit('order:status_updated', {
          order_id: order.id,
          status: appStatus,
          platform: 'FRIENDSRIDE',
        });
      }

      return {
        success: true,
        order_id: order.id,
        status: appStatus,
      };
    } catch (error) {
      console.error('❌ Error updating delivery status from Friendsride:', error);
      throw error;
    }
  }

  /**
   * Webhook pentru primirea status updates de la Friendsride
   */
  /**
   * Webhook pentru primirea status updates SAU comenzi noi de la Friendsride
   */
  async handleFriendsrideWebhook(webhookData) {
    try {
      // 1. DETECT COMANDĂ NOUĂ (Real-Time Listening)
      // Dacă webhook-ul conține 'items', 'total' și 'customer', este o comandă nouă.
      if (webhookData.items && webhookData.total && webhookData.customer) {
        console.log('📨 [FriendsRide] Webhook received NEW ORDER payload');
        const orderResult = await this.processIncomingOrder(webhookData);

        if (orderResult) {
          return { success: true, order_id: orderResult.id, message: 'Order created via webhook' };
        } else {
          return { success: true, message: 'Order already exists (idempotency check)' };
        }
      }

      // 2. STATUS UPDATES (Logica existentă perntru livrări)
      const { delivery_id, status, courier_id, estimated_delivery_time } = webhookData;

      if (delivery_id && status) {
        // Actualizează status
        await this.updateDeliveryStatusFromFriendsride(delivery_id, status);

        // Dacă există courier_id, actualizează și în orders
        if (courier_id) {
          const db = await dbPromise;
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE orders 
               SET courier_id = ?, estimated_delivery_time = ?
               WHERE external_delivery_id = ? AND external_platform = ?`,
              [courier_id, estimated_delivery_time, delivery_id, 'FRIENDSRIDE'],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
        return { success: true, message: 'Status updated' };
      }

      console.warn('⚠️ [FriendsRide] Webhook payload unrecognized:', webhookData);
      return { success: false, error: 'Unrecognized payload format' };

    } catch (error) {
      console.error('❌ Error handling Friendsride webhook:', error);
      throw error;
    }
  }

  /**
   * Handle incoming order from FriendsRide Delivery App (Standard API)
   * This adapts the Delivery App payload format to our internal format
   */
  async handleDeliveryAppOrder(payload) {
    try {
      console.log('📨 [FriendsRide] NEW ORDER received via Delivery API');

      // Adapt payload to match what processIncomingOrder expects
      // FriendsRide App payload: { friendsrideOrderId, items, customerId, deliveryAddress, total, customerName, customerPhone ... }

      const adaptedOrder = {
        id: payload.friendsrideOrderId || payload.id || `fr_${Date.now()}`,
        items: payload.items || [],
        total: payload.total || 0,
        customer: {
          name: payload.customerName || payload.contactName || 'FriendsRide Client',
          phone: payload.customerPhone || payload.contactPhone || '',
          address: payload.deliveryAddress ? (payload.deliveryAddress.address || '') : ''
        },
        payment_method: payload.paymentMethod || 'card',
        is_paid: payload.paymentMethod === 'card' || payload.paymentMethod === 'online', // Assumption for online orders
        notes: payload.notes || ''
      };

      const result = await this.processIncomingOrder(adaptedOrder);

      if (result) {
        return {
          success: true,
          restaurantOrderId: result.id, // Return internal ID as expected by FriendsRide App
          message: 'Order created successfully'
        };
      } else {
        // Find existing order ID to return it
        const db = await dbPromise;
        const existing = await new Promise((resolve) => {
          db.get(
            'SELECT id FROM orders WHERE external_provider = ? AND external_order_id = ?',
            ['FRIENDSRIDE', adaptedOrder.id],
            (err, row) => resolve(row)
          );
        });

        return {
          success: true,
          restaurantOrderId: existing ? existing.id : null,
          message: 'Order already exists'
        };
      }
    } catch (error) {
      console.error('❌ Error handling Delivery App order:', error);
      throw error;
    }
  }

  /**
   * Get delivery tracking info
   */
  async getDeliveryTracking(deliveryId) {
    try {
      const response = await this.httpRequest(
        'GET',
        `${this.friendsrideApiUrl}/api/delivery/${deliveryId}/tracking`,
        null,
        {
          'X-API-Key': this.apiKey,
        }
      );

      if (response.status === 200) {
        return response.data;
      }

      throw new Error(`Friendsride API returned status ${response.status}`);
    } catch (error) {
      console.error('❌ Error getting delivery tracking:', error);
      throw error;
    }
  }
  /**
   * Poll for new orders from Friendsride
   */
  async pollNewOrders() {
    try {
      // 1. Fetch pending orders using API Key
      // Assuming endpoint GET /api/orders/pending exists on FriendsRide side
      const response = await this.httpRequest(
        'GET',
        `${this.friendsrideApiUrl}/api/orders/pending`,
        null,
        { 'X-API-Key': this.apiKey }
      );

      if (response.status !== 200) {
        console.warn(`Friendsride polling returned status ${response.status}`);
        return [];
      }

      const externalOrders = response.data && (Array.isArray(response.data) ? response.data : response.data.orders);

      if (!externalOrders || !Array.isArray(externalOrders)) {
        return [];
      }

      const processedOrders = [];

      for (const extOrder of externalOrders) {
        try {
          const result = await this.processIncomingOrder(extOrder);
          if (result) {
            processedOrders.push(result);
          }
        } catch (err) {
          console.error(`Error processing incoming Friendsride order ${extOrder.id}:`, err);
        }
      }

      return processedOrders;
    } catch (error) {
      console.error('Error polling Friendsride orders:', error.message);
      // Return empty array to avoid crashing the polling loop
      return [];
    }
  }

  /**
   * Process a single incoming order
   */
  async processIncomingOrder(extOrder) {
    const db = await dbPromise;

    // 1. Check if already exists to ensure idempotency
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM orders WHERE external_provider = ? AND external_order_id = ?',
        ['FRIENDSRIDE', extOrder.id],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    if (existing) {
      return null; // Already processed
    }

    // 2. Insert into DB
    // Mapping external fields to internal schema
    const orderId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO orders (
          type, order_source, platform, external_provider, external_order_id,
          customer_name, customer_phone, delivery_address,
          items, total, payment_method, is_paid,
          status, general_notes, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        'delivery',
        'DELIVERY',
        'FRIENDSRIDE',
        'FRIENDSRIDE',
        extOrder.id,
        extOrder.customer?.name || 'FriendsRide Client',
        extOrder.customer?.phone || '',
        extOrder.customer?.address || '',
        JSON.stringify(extOrder.items || []),
        extOrder.total || 0,
        extOrder.payment_method || 'card', // Default assumption if missing
        extOrder.is_paid ? 1 : 0,
        'pending',
        extOrder.notes || ''
      ], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log(`✅ Created local order ${orderId} from FriendsRide #${extOrder.id}`);

    // 3. Trigger Pipeline (CRITICAL for Stock & Fiscal)
    try {
      // Dynamic require to ensure we get the initialized service
      const orderProcessingPipeline = require('../orders/services/order-processing-pipeline.service');

      await orderProcessingPipeline.processOrderAfterCreation(orderId, {
        id: orderId,
        platform: 'FRIENDSRIDE',
        order_source: 'DELIVERY',
        items: JSON.stringify(extOrder.items || []),
        total: extOrder.total || 0,
        is_paid: extOrder.is_paid ? 1 : 0,
        status: 'pending'
      });
    } catch (pipelineError) {
      console.error(`⚠️ Pipeline processing failed for FriendsRide order ${orderId}:`, pipelineError);
      // We do NOT rollback transaction here because the order IS created. 
      // Stock/Fiscal errors are logged but shouldn't delete the order.
    }

    // 4. Acknowledge to FriendsRide (optional, mock implementation)
    // await this.httpRequest('POST', `${this.friendsrideApiUrl}/api/orders/${extOrder.id}/ack`, {}, { 'X-API-Key': this.apiKey });

    return {
      id: orderId,
      external_id: extOrder.id,
      status: 'created'
    };
  }
}


// Singleton
const friendsrideIntegrationService = new FriendsrideIntegrationService();

module.exports = friendsrideIntegrationService;
