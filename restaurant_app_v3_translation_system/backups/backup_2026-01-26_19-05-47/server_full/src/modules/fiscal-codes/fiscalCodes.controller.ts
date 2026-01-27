/**
 * PHASE S8.6 - Fiscal Codes Controller
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API endpoints for NCM/CN fiscal codes
 */

const FiscalCodesService = require('./fiscalCodes.service');

/**
 * GET /api/fiscal-codes/search?q=tomato
 * Search NCM/CN codes
 */
async function searchFiscalCodes(req: any, res: any, next: any) {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const results = await FiscalCodesService.searchFiscalCodes(q, parseInt(limit, 10));
    
    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('[Fiscal Codes] Error searching:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search fiscal codes'
    });
  }
}

/**
 * POST /api/fiscal-codes/assign
 * Assign fiscal code to product
 */
async function assignFiscalCode(req: any, res: any, next: any) {
  try {
    const { productId, ncmCode, cnCode, validFrom, validTo, reason } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const result = await FiscalCodesService.assignFiscalCode(
      productId,
      ncmCode || null,
      cnCode || null,
      validFrom || null,
      validTo || null,
      reason || null
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('[Fiscal Codes] Error assigning code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign fiscal code'
    });
  }
}

/**
 * GET /api/fiscal-codes/:productId
 * Get fiscal code for product
 */
async function getFiscalCode(req: any, res: any, next: any) {
  try {
    const { productId } = req.params;
    const date = req.query.date ? new Date(req.query.date) : new Date();
    
    const code = await FiscalCodesService.getFiscalCodeForProduct(parseInt(productId, 10), date);
    
    res.json({
      success: true,
      data: code
    });
  } catch (error: any) {
    console.error('[Fiscal Codes] Error getting code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get fiscal code'
    });
  }
}

/**
 * GET /api/fiscal-codes/:productId/history
 * Get fiscal code history for product
 */
async function getFiscalCodeHistory(req: any, res: any, next: any) {
  try {
    const { productId } = req.params;
    
    const history = await FiscalCodesService.getFiscalCodeHistory(parseInt(productId, 10));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    console.error('[Fiscal Codes] Error getting history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get fiscal code history'
    });
  }
}

module.exports = {
  searchFiscalCodes,
  assignFiscalCode,
  getFiscalCode,
  getFiscalCodeHistory
};


