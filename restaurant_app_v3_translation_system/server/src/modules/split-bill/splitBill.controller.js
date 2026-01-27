/**
 * Split Bill Controller
 * 
 * Controller pentru API endpoints Split Bill
 */

const splitBillService = require('./splitBill.service');

class SplitBillController {
  /**
   * GET /api/split-bill/order/:orderId/status
   * Obține statusul plăților pentru o comandă cu split bill
   */
  async getPaymentStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      const status = await splitBillService.getSplitBillPaymentStatus(parseInt(orderId));
      
      res.json({
        success: true,
        ...status
      });
    } catch (error) {
      console.error('❌ Error getting split bill status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error getting split bill status'
      });
    }
  }

  /**
   * POST /api/split-bill/order/:orderId/pay
   * Procesează o plată pentru un grup specific
   */
  async processGroupPayment(req, res, next) {
    try {
      const { orderId } = req.params;
      const { groupId, amount, method } = req.body;

      if (!orderId || !groupId || !amount || !method) {
        return res.status(400).json({
          success: false,
          error: 'orderId, groupId, amount, and method are required'
        });
      }

      const result = await splitBillService.processGroupPayment(
        parseInt(orderId),
        parseInt(groupId),
        parseFloat(amount),
        method
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('❌ Error processing group payment:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Error processing group payment'
      });
    }
  }
}

module.exports = new SplitBillController();

