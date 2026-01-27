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
  async handleFriendsrideWebhook(webhookData) {
    try {
      const { delivery_id, status, courier_id, estimated_delivery_time } = webhookData;

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

      return { success: true };
    } catch (error) {
      console.error('❌ Error handling Friendsride webhook:', error);
      throw error;
    }
  }

  /**
   * Obține tracking info pentru delivery
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
}

// Singleton
const friendsrideIntegrationService = new FriendsrideIntegrationService();

module.exports = friendsrideIntegrationService;
