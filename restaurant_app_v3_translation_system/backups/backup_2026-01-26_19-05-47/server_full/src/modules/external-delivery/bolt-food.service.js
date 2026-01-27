/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BOLT FOOD SERVICE
 * 
 * Integrare cu Bolt Food API pentru livrare
 * ═══════════════════════════════════════════════════════════════════════════
 */

const axios = require('axios');
// Use console for now - logger will be implemented later
const boltLogger = {
  info: (...args) => console.log('[BOLT_FOOD]', ...args),
  error: (...args) => console.error('[BOLT_FOOD ERROR]', ...args),
  warn: (...args) => console.warn('[BOLT_FOOD WARN]', ...args),
  child: () => boltLogger
};

class BoltFoodService {
  constructor(apiKey, apiSecret, restaurantId) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.restaurantId = restaurantId;
    this.baseUrl = 'https://api.bolt.eu/v1/food'; // Placeholder URL
    this.accessToken = null;
  }

  /**
   * Autentificare cu Bolt Food API
   */
  async authenticate() {
    try {
      // Placeholder pentru autentificare OAuth 2.0
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      });

      this.accessToken = response.data.access_token;
      boltLogger.info('Bolt Food authentication successful');
      return true;
    } catch (error) {
      boltLogger.error('Bolt Food authentication failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Creează o comandă în Bolt Food
   */
  async createOrder(orderData) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Transformă comanda internă în format Bolt Food
      const boltOrder = this.transformOrderToBoltFormat(orderData);

      const response = await axios.post(
        `${this.baseUrl}/orders`,
        boltOrder,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      boltLogger.info('Bolt Food order created', { orderId: response.data.id });
      return response.data;
    } catch (error) {
      boltLogger.error('Bolt Food order creation failed', { error: error.message, orderData });
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
      boltLogger.error('Bolt Food get order status failed', { error: error.message, externalOrderId });
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

      boltLogger.info('Bolt Food order cancelled', { externalOrderId, reason });
      return response.data;
    } catch (error) {
      boltLogger.error('Bolt Food cancel order failed', { error: error.message, externalOrderId });
      throw error;
    }
  }

  /**
   * Sincronizează meniul cu Bolt Food
   */
  async syncMenu(menuItems) {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Transformă meniul intern în format Bolt Food
      const boltMenu = this.transformMenuToBoltFormat(menuItems);

      const response = await axios.put(
        `${this.baseUrl}/restaurants/${this.restaurantId}/menu`,
        boltMenu,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      boltLogger.info('Bolt Food menu synced', { itemsCount: menuItems.length });
      return response.data;
    } catch (error) {
      boltLogger.error('Bolt Food menu sync failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Transformă comanda internă în format Bolt Food
   */
  transformOrderToBoltFormat(orderData) {
    return {
      restaurant_id: this.restaurantId,
      items: orderData.items.map(item => ({
        external_id: item.product_id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        currency: 'RON',
      })),
      delivery_address: {
        street: orderData.deliveryAddress,
        coordinates: {
          lat: orderData.deliveryLatitude,
          lng: orderData.deliveryLongitude,
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
   * Transformă meniul intern în format Bolt Food
   */
  transformMenuToBoltFormat(menuItems) {
    return {
      items: menuItems.map(item => ({
        external_id: item.id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        currency: 'RON',
        image_url: item.image,
        available: item.is_active === 1,
        category: item.category,
      })),
    };
  }

  /**
   * Normalizează statusul Bolt Food la status intern
   */
  normalizeStatus(boltStatus) {
    const statusMap = {
      'pending': 'pending',
      'accepted': 'confirmed',
      'preparing': 'preparing',
      'ready': 'ready',
      'picked_up': 'in_transit',
      'delivered': 'completed',
      'cancelled': 'cancelled',
    };

    return statusMap[boltStatus] || 'pending';
  }
}

module.exports = BoltFoodService;
