/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UBER EATS SERVICE
 * 
 * Integrare cu Uber Eats API pentru livrare
 * ═══════════════════════════════════════════════════════════════════════════
 */

const axios = require('axios');
// Use console for now - logger will be implemented later
const uberLogger = {
  info: (...args) => console.log('[UBER_EATS]', ...args),
  error: (...args) => console.error('[UBER_EATS ERROR]', ...args),
  warn: (...args) => console.warn('[UBER_EATS WARN]', ...args),
  child: () => uberLogger
};

class UberEatsService {
  constructor(apiKey, apiSecret, restaurantId) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.restaurantId = restaurantId;
    this.baseUrl = 'https://api.uber.com/v1/eats'; // Placeholder URL
    this.accessToken = null;
  }

  /**
   * Autentificare cu Uber Eats API
   */
  async authenticate() {
    try {
      // Placeholder pentru autentificare OAuth 2.0
      // În producție, ar trebui să folosească client credentials flow
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      });

      this.accessToken = response.data.access_token;
      uberLogger.info('Uber Eats authentication successful');
      return true;
    } catch (error) {
      uberLogger.error('Uber Eats authentication failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Creează o comandă în Uber Eats
   */
  async createOrder(orderData) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Transformă comanda internă în format Uber Eats
      const uberOrder = this.transformOrderToUberFormat(orderData);

      const response = await axios.post(
        `${this.baseUrl}/orders`,
        uberOrder,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      uberLogger.info('Uber Eats order created', { orderId: response.data.id });
      return response.data;
    } catch (error) {
      uberLogger.error('Uber Eats order creation failed', { error: error.message, orderData });
      throw error;
    }
  }

  /**
   * Obține statusul unei comenzi
   */
  async getOrderStatus(externalOrderId) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.get(
        `${this.baseUrl}/orders/${externalOrderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return this.normalizeStatus(response.data.status);
    } catch (error) {
      uberLogger.error('Uber Eats get order status failed', { error: error.message, externalOrderId });
      throw error;
    }
  }

  /**
   * Anulează o comandă
   */
  async cancelOrder(externalOrderId, reason) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await axios.post(
        `${this.baseUrl}/orders/${externalOrderId}/cancel`,
        { reason },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      uberLogger.info('Uber Eats order cancelled', { externalOrderId, reason });
      return response.data;
    } catch (error) {
      uberLogger.error('Uber Eats cancel order failed', { error: error.message, externalOrderId });
      throw error;
    }
  }

  /**
   * Sincronizează meniul cu Uber Eats
   */
  async syncMenu(menuItems) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Transformă meniul intern în format Uber Eats
      const uberMenu = this.transformMenuToUberFormat(menuItems);

      const response = await axios.put(
        `${this.baseUrl}/restaurants/${this.restaurantId}/menu`,
        uberMenu,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      uberLogger.info('Uber Eats menu synced', { itemsCount: menuItems.length });
      return response.data;
    } catch (error) {
      uberLogger.error('Uber Eats menu sync failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Transformă comanda internă în format Uber Eats
   */
  transformOrderToUberFormat(orderData) {
    return {
      restaurant_id: this.restaurantId,
      items: orderData.items.map(item => ({
        external_id: item.product_id.toString(),
        title: item.name,
        quantity: item.quantity,
        price: {
          amount: item.price,
          currency: 'RON',
        },
      })),
      delivery: {
        address: orderData.deliveryAddress,
        coordinates: {
          latitude: orderData.deliveryLatitude,
          longitude: orderData.deliveryLongitude,
        },
      },
      customer: {
        name: orderData.customerName,
        phone: orderData.customerPhone,
        email: orderData.customerEmail,
      },
    };
  }

  /**
   * Transformă meniul intern în format Uber Eats
   */
  transformMenuToUberFormat(menuItems) {
    return {
      items: menuItems.map(item => ({
        external_id: item.id.toString(),
        title: item.name,
        description: item.description,
        price: {
          amount: item.price,
          currency: 'RON',
        },
        image_url: item.image,
        available: item.is_active === 1,
        category: item.category,
      })),
    };
  }

  /**
   * Normalizează statusul Uber Eats la status intern
   */
  normalizeStatus(uberStatus) {
    const statusMap = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'preparing': 'preparing',
      'ready': 'ready',
      'picked_up': 'in_transit',
      'delivered': 'completed',
      'cancelled': 'cancelled',
    };

    return statusMap[uberStatus] || 'pending';
  }
}

module.exports = UberEatsService;
