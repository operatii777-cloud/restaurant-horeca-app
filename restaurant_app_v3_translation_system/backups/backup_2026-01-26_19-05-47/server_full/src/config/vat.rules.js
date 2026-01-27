/**
 * PHASE E9.5 - TVA SYSTEM v2
 * 
 * Dynamic VAT rules engine.
 * Supports:
 * - Date-based VAT changes (1 Aug 2025 → 11%/21%)
 * - Per-product VAT override
 * - Per-category VAT
 * - Multi-country VAT (preparation for international)
 */

/**
 * VAT Rules Configuration
 * 
 * Structure:
 * {
 *   country: "RO",
 *   from: "2025-08-01",
 *   to: null, // null = current
 *   standard: 21,
 *   reduced: 11,
 *   superReduced: 5,
 *   zero: 0
 * }
 */
const vatRules = [
  // Current Romanian VAT (from 1 Aug 2025)
  {
    country: 'RO',
    from: '2025-08-01',
    to: null,
    standard: 21,
    reduced: 11,
    superReduced: 5,
    zero: 0
  },
  
  // Previous Romanian VAT (before 1 Aug 2025)
  {
    country: 'RO',
    from: '2020-01-01',
    to: '2025-07-31',
    standard: 19,
    reduced: 9,
    superReduced: 5,
    zero: 0
  }
];

/**
 * Product VAT overrides
 * Structure: { productId: vatRate }
 */
const productVatOverrides = {};

/**
 * Category VAT overrides
 * Structure: { categoryId: vatRate }
 */
const categoryVatOverrides = {};

/**
 * Get VAT rate for product on specific date
 * @param {number} productId - Product ID
 * @param {Date|string} date - Date to check (default: today)
 * @param {string} country - Country code (default: 'RO')
 * @returns {number} VAT rate (0-100)
 */
function getVatRate(productId = null, date = new Date(), country = 'RO') {
  // Convert date to Date object if string
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // Check product override
  if (productId && productVatOverrides[productId] !== undefined) {
    return productVatOverrides[productId];
  }
  
  // Find applicable rule for date and country
  const applicableRule = vatRules
    .filter(rule => rule.country === country)
    .filter(rule => {
      const fromDate = new Date(rule.from);
      const toDate = rule.to ? new Date(rule.to) : new Date('2099-12-31');
      return date >= fromDate && date <= toDate;
    })
    .sort((a, b) => new Date(b.from) - new Date(a.from))[0]; // Most recent rule
  
  if (!applicableRule) {
    // Default to current standard rate
    const currentRule = vatRules
      .filter(rule => rule.country === country && rule.to === null)[0];
    return currentRule ? currentRule.standard : 19; // Fallback
  }
  
  // Return standard rate (can be enhanced to check product category for reduced rate)
  return applicableRule.standard;
}

/**
 * Get VAT rate for category
 * @param {string} category - Category name
 * @param {Date|string} date - Date to check
 * @param {string} country - Country code
 * @returns {number} VAT rate
 */
function getCategoryVatRate(category, date = new Date(), country = 'RO') {
  // Check category override
  if (categoryVatOverrides[category] !== undefined) {
    return categoryVatOverrides[category];
  }
  
  // Reduced VAT categories (Romania)
  const reducedVatCategories = [
    'băuturi',
    'produse alimentare de bază',
    'medicamente'
  ];
  
  if (reducedVatCategories.includes(category.toLowerCase())) {
    // Get reduced rate for date
    const applicableRule = vatRules
      .filter(rule => rule.country === country)
      .filter(rule => {
        const fromDate = new Date(rule.from);
        const toDate = rule.to ? new Date(rule.to) : new Date('2099-12-31');
        const checkDate = typeof date === 'string' ? new Date(date) : date;
        return checkDate >= fromDate && checkDate <= toDate;
      })
      .sort((a, b) => new Date(b.from) - new Date(a.from))[0];
    
    return applicableRule ? applicableRule.reduced : 9;
  }
  
  // Default to standard rate
  return getVatRate(null, date, country);
}

/**
 * Calculate price with VAT
 * @param {number} priceWithoutVat - Price without VAT
 * @param {number} vatRate - VAT rate (0-100)
 * @returns {number} Price with VAT
 */
function calculatePriceWithVat(priceWithoutVat, vatRate) {
  return priceWithoutVat * (1 + vatRate / 100);
}

/**
 * Calculate price without VAT
 * @param {number} priceWithVat - Price with VAT
 * @param {number} vatRate - VAT rate (0-100)
 * @returns {number} Price without VAT
 */
function calculatePriceWithoutVat(priceWithVat, vatRate) {
  return priceWithVat / (1 + vatRate / 100);
}

/**
 * Calculate VAT amount
 * @param {number} priceWithoutVat - Price without VAT
 * @param {number} vatRate - VAT rate (0-100)
 * @returns {number} VAT amount
 */
function calculateVatAmount(priceWithoutVat, vatRate) {
  return priceWithoutVat * (vatRate / 100);
}

/**
 * Set product VAT override
 */
function setProductVatOverride(productId, vatRate) {
  productVatOverrides[productId] = vatRate;
}

/**
 * Set category VAT override
 */
function setCategoryVatOverride(category, vatRate) {
  categoryVatOverrides[category] = vatRate;
}

/**
 * Get VAT info for product
 */
function getProductVatInfo(productId, productCategory, date = new Date(), country = 'RO') {
  const vatRate = getVatRate(productId, date, country) || 
                  getCategoryVatRate(productCategory, date, country);
  
  return {
    productId,
    category: productCategory,
    vatRate,
    country,
    date: typeof date === 'string' ? date : date.toISOString().split('T')[0],
    isOverride: productVatOverrides[productId] !== undefined || 
                categoryVatOverrides[productCategory] !== undefined
  };
}

module.exports = {
  vatRules,
  productVatOverrides,
  categoryVatOverrides,
  getVatRate,
  getCategoryVatRate,
  calculatePriceWithVat,
  calculatePriceWithoutVat,
  calculateVatAmount,
  setProductVatOverride,
  setCategoryVatOverride,
  getProductVatInfo
};

