/**
 * PHASE S8.4 - TVA Controller
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API endpoints for TVA System v2 management
 */

const TVAService = require('./tva.service');
const { dbPromise } = require('../../../database');

/**
 * Get VAT rate for a product
 * GET /api/tva/product/:productId/rate?date=2025-01-15
 */
async function getVatRateForProduct(req: any, res: any, next: any) {
  try {
    const { productId } = req.params;
    const date = req.query.date ? new Date(req.query.date) : new Date();
    
    const vatRate = await TVAService.getVatRateForProduct(parseInt(productId, 10), date);
    
    res.json({
      success: true,
      data: {
        productId: parseInt(productId, 10),
        vatRate,
        date: date.toISOString()
      }
    });
  } catch (error: any) {
    console.error('[TVA Controller] Error getting VAT rate:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get VAT rate'
    });
  }
}

/**
 * Get VAT breakdown for items
 * POST /api/tva/breakdown
 * Body: { items: [{ amount, productId?, date? }] }
 */
async function getVatBreakdown(req: any, res: any, next: any) {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items must be an array'
      });
    }
    
    const breakdown = await TVAService.getVatBreakdown(items);
    
    res.json({
      success: true,
      data: breakdown
    });
  } catch (error: any) {
    console.error('[TVA Controller] Error calculating VAT breakdown:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate VAT breakdown'
    });
  }
}

/**
 * Get VAT rules
 * GET /api/tva/rules?date=2025-01-15
 */
async function getVatRules(req: any, res: any, next: any) {
  try {
    const { getVatRuleForCategory } = require('./tva.rules');
    const date = req.query.date ? new Date(req.query.date) : new Date();
    
    const categories = ['food', 'standard', 'reduced', 'zero'];
    const rules = categories.map(category => ({
      category,
      rule: getVatRuleForCategory(category, date)
    }));
    
    res.json({
      success: true,
      data: {
        date: date.toISOString(),
        rules
      }
    });
  } catch (error: any) {
    console.error('[TVA Controller] Error getting VAT rules:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get VAT rules'
    });
  }
}

module.exports = {
  getVatRateForProduct,
  getVatBreakdown,
  getVatRules
};


