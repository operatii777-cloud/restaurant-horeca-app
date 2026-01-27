/**
 * PHASE S8.8 - Fiscal Engine Controller
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Unified API controller for fiscal engine
 */

const fiscalEngine = require('../engine/fiscalEngine');

/**
 * POST /api/fiscal-engine/fiscalize
 * Fiscalize order
 */
async function fiscalize(req: any, res: any, next: any) {
  try {
    const { orderId, payment } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    const result = await fiscalEngine.fiscalizeOrder(orderId, payment || { method: 'cash' });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('[Fiscal Engine] Error fiscalizing:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fiscalize order'
    });
  }
}

/**
 * POST /api/fiscal-engine/ubl
 * Generate UBL
 */
async function generateUBL(req: any, res: any, next: any) {
  try {
    const { documentType, documentId, orderId } = req.body;
    
    let xml: string;
    if (documentType && documentId) {
      // Tipizate document
      xml = await fiscalEngine.generateUBLForTipizate(documentType, documentId);
    } else if (orderId) {
      // Order
      const { UBLEngine } = require('../engine/ublEngine');
      const ublEngine = new UBLEngine();
      xml = await ublEngine.generateUBLForOrder(orderId, {});
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either (documentType, documentId) or orderId is required'
      });
    }
    
    res.json({
      success: true,
      data: { xml }
    });
  } catch (error: any) {
    console.error('[Fiscal Engine] Error generating UBL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate UBL'
    });
  }
}

/**
 * POST /api/fiscal-engine/submit-anaf
 * Submit document to ANAF
 */
async function submitANAF(req: any, res: any, next: any) {
  try {
    const { documentType, documentId, xml } = req.body;
    
    if (!documentType || !documentId || !xml) {
      return res.status(400).json({
        success: false,
        error: 'documentType, documentId, and xml are required'
      });
    }

    const result = await fiscalEngine.submitToANAF(documentType, documentId, xml);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('[Fiscal Engine] Error submitting to ANAF:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit to ANAF'
    });
  }
}

/**
 * GET /api/fiscal-engine/status
 * Get fiscal engine status
 */
async function getStatus(req: any, res: any, next: any) {
  try {
    const status = await fiscalEngine.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('[Fiscal Engine] Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get status'
    });
  }
}

module.exports = {
  fiscalize,
  generateUBL,
  submitANAF,
  getStatus
};

