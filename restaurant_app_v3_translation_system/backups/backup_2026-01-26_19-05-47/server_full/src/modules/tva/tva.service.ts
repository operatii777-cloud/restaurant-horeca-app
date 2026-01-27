/**
 * PHASE S8.4 - TVA Service v2
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Date-based, product-based VAT resolution
 */

const { dbPromise } = require('../../../database');
const { getVatRateForCategory, getVatRuleForCategory } = require('./tva.rules');

/**
 * PHASE S8.4 - Get VAT rate for a product at a specific date
 * 
 * Priority:
 * 1. Product-specific override (product_tva_history)
 * 2. Product category VAT rule
 * 3. Default VAT rule
 * 
 * @param {number} productId - Product ID
 * @param {Date} date - Date to check (default: today)
 * @returns {Promise<number>} VAT rate (0-100)
 */
async function getVatRateForProduct(productId: number, date: Date = new Date()): Promise<number> {
  const db = await dbPromise;
  const dateStr = date.toISOString().split('T')[0];
  
  // 1. Check product-specific override
  const productOverride = await new Promise((resolve, reject) => {
    db.get(
      `SELECT vat_rate FROM product_tva_history 
       WHERE product_id = ? 
         AND (valid_from IS NULL OR valid_from <= ?)
         AND (valid_to IS NULL OR valid_to >= ?)
       ORDER BY valid_from DESC
       LIMIT 1`,
      [productId, dateStr, dateStr],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  if (productOverride && productOverride.vat_rate !== null) {
    return productOverride.vat_rate;
  }
  
  // 2. Get product category
  const product = await new Promise((resolve, reject) => {
    db.get(
      `SELECT category, vat_category FROM menu WHERE id = ?`,
      [productId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  if (product && product.vat_category) {
    return getVatRateForCategory(product.vat_category, date);
  }
  
  // 3. Default to standard rate
  return getVatRateForCategory('standard', date);
}

/**
 * PHASE S8.4 - Get VAT rate at a specific date (for historical calculations)
 * 
 * @param {Date} date - Date to check
 * @param {string} category - VAT category (optional)
 * @returns {number} VAT rate
 */
function getVatRateAt(date: Date, category: string = 'standard'): number {
  return getVatRateForCategory(category, date);
}

/**
 * PHASE S8.4 - Calculate VAT amounts
 * 
 * @param {number} amount - Base amount (without VAT)
 * @param {number} vatRate - VAT rate (0-100)
 * @returns {Object} VAT breakdown
 */
function calculateVat(amount: number, vatRate: number): {
  baseAmount: number;
  vatAmount: number;
  totalAmount: number;
} {
  const vatAmount = (amount * vatRate) / 100;
  const totalAmount = amount + vatAmount;
  
  return {
    baseAmount: amount,
    vatAmount: vatAmount,
    totalAmount: totalAmount
  };
}

/**
 * PHASE S8.4 - Get VAT breakdown for multiple items
 * 
 * @param {Array} items - Array of {amount, productId, date}
 * @returns {Promise<Object>} VAT breakdown by rate
 */
async function getVatBreakdown(items: Array<{amount: number, productId?: number, date?: Date}>): Promise<{
  [vatRate: number]: {
    baseAmount: number;
    vatAmount: number;
    itemCount: number;
  };
}> {
  const breakdown: { [key: number]: { baseAmount: number; vatAmount: number; itemCount: number } } = {};
  
  for (const item of items) {
    const date = item.date || new Date();
    const vatRate = item.productId 
      ? await getVatRateForProduct(item.productId, date)
      : getVatRateForCategory('standard', date);
    
    if (!breakdown[vatRate]) {
      breakdown[vatRate] = {
        baseAmount: 0,
        vatAmount: 0,
        itemCount: 0
      };
    }
    
    const calc = calculateVat(item.amount, vatRate);
    breakdown[vatRate].baseAmount += calc.baseAmount;
    breakdown[vatRate].vatAmount += calc.vatAmount;
    breakdown[vatRate].itemCount += 1;
  }
  
  return breakdown;
}

module.exports = {
  getVatRateForProduct,
  getVatRateAt,
  calculateVat,
  getVatBreakdown
};


