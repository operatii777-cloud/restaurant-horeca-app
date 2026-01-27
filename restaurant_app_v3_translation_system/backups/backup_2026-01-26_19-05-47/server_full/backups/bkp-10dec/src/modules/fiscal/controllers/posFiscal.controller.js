/**
 * PHASE S7.1 - POS Fiscal Controller
 * 
 * Handles fiscalization requests from POS/KIOSK frontend.
 * Normalizes payload and redirects to main fiscal controller.
 */

const FiscalController = require('./fiscal.controller');

class PosFiscalController {
  /**
   * POST /api/admin/pos/fiscalize
   * Fiscalize order from POS/KIOSK
   */
  async fiscalizeFromPos(req, res, next) {
    try {
      // Normalize payload: support both orderId and order_id
      const orderId = req.body.orderId || req.body.order_id;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: orderId",
          error: "ORDER_ID_REQUIRED"
        });
      }

      console.log('[POS Fiscal] Order ID:', orderId);
      console.log('[POS Fiscal] Payment:', req.body.payment);

      // Normalize request body for fiscal controller
      req.body.orderId = orderId;
      req.body.payment = req.body.payment || {};

      // Call main fiscal controller
      return await FiscalController.fiscalizeOrder(req, res, next);
    } catch (err) {
      console.error("POS Fiscalization error:", err);
      next(err);
    }
  }
}

module.exports = new PosFiscalController();

