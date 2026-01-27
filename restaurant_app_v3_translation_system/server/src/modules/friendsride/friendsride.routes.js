/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FRIENDSRIDE ROUTES
 * 
 * API routes pentru integrarea cu Friendsride
 * ═══════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const friendsrideIntegrationService = require('./friendsride-integration.service');

/**
 * POST /api/friendsride/sync-order/:orderId
 * Sincronizează comandă cu Friendsride
 */
router.post('/sync-order/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await friendsrideIntegrationService.syncOrderToFriendsride(Number(orderId));
    res.json(result);
  } catch (error) {
    console.error('❌ Error in sync-order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error syncing order to Friendsride',
    });
  }
});

/**
 * POST /api/friendsride/webhook
 * Webhook pentru primirea status updates de la Friendsride
 */
router.post('/webhook', async (req, res, next) => {
  try {
    // Verifică autentificare webhook (API key)
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.FRIENDSRIDE_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await friendsrideIntegrationService.handleFriendsrideWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in Friendsride webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error handling webhook',
    });
  }
});

/**
 * GET /api/friendsride/tracking/:deliveryId
 * Obține tracking info pentru delivery
 */
router.get('/tracking/:deliveryId', async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const tracking = await friendsrideIntegrationService.getDeliveryTracking(deliveryId);
    res.json({
      success: true,
      tracking,
    });
  } catch (error) {
    console.error('❌ Error getting tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error getting tracking info',
    });
  }
});

/**
 * GET /api/friendsride/orders
 * Polling endpoint - preia comenzile noi de la Friends Ride
 */
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await friendsrideIntegrationService.pollNewOrders();
    res.json({
      success: true,
      orders: orders || [],
      count: orders ? orders.length : 0
    });
  } catch (error) {
    console.error('❌ Error polling orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error polling orders from Friends Ride',
    });
  }
});

module.exports = router;
