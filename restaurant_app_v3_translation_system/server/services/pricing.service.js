/**
 * PRICING SERVICE - Dynamic Pricing (Happy Hour, Peak Hours)
 * Data: 03 Decembrie 2025
 */

const db = require('../config/database');

class PricingService {
  
  /**
   * Calculează preț dinamic bazat pe ora zilei
   */
  async getDynamicPrice(productId, portionId = null) {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    
    // Obține prețul de bază
    let basePrice;
    
    if (portionId) {
      const portion = await this.getPortionById(portionId);
      basePrice = portion.price;
    } else {
      const product = await this.getProductById(productId);
      basePrice = product.price;
    }
    
    // Reguli de pricing
    let multiplier = 1.0;
    let reason = 'Standard price';
    
    // Happy Hour (14:00-17:00) - 20% discount
    if (currentHour >= 14 && currentHour < 17) {
      multiplier = 0.8;
      reason = 'Happy Hour (20% discount)';
    }
    
    // Peak Hours (19:00-22:00 Vineri-Sâmbătă) - 10% premium
    if ((currentDay === 5 || currentDay === 6) && currentHour >= 19 && currentHour < 22) {
      multiplier = 1.1;
      reason = 'Peak Hours (10% premium)';
    }
    
    // Lunch Special (12:00-14:00 Luni-Vineri) - 15% discount
    if (currentDay >= 1 && currentDay <= 5 && currentHour >= 12 && currentHour < 14) {
      multiplier = 0.85;
      reason = 'Lunch Special (15% discount)';
    }
    
    const finalPrice = parseFloat((basePrice * multiplier).toFixed(2));
    
    return {
      product_id: productId,
      portion_id: portionId,
      base_price: basePrice,
      multiplier,
      final_price: finalPrice,
      discount_percentage: (1 - multiplier) * 100,
      reason,
      valid_until: this.getValidUntil(currentHour)
    };
  }
  
  getValidUntil(currentHour) {
    const now = new Date();
    
    // Happy Hour până la 17:00
    if (currentHour >= 14 && currentHour < 17) {
      return new Date(now.setHours(17, 0, 0, 0)).toISOString();
    }
    
    // Peak Hours până la 22:00
    if (currentHour >= 19 && currentHour < 22) {
      return new Date(now.setHours(22, 0, 0, 0)).toISOString();
    }
    
    // Lunch Special până la 14:00
    if (currentHour >= 12 && currentHour < 14) {
      return new Date(now.setHours(14, 0, 0, 0)).toISOString();
    }
    
    return null;
  }
  
  async getPortionById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM product_portions WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
  
  async getProductById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
}

module.exports = new PricingService();

