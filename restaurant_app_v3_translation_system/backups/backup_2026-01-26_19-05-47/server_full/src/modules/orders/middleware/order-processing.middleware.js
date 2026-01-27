/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORDER PROCESSING MIDDLEWARE
 * Automatically processes orders after creation (stock consumption, events, etc.)
 * 
 * Usage: Add this middleware AFTER order creation in all routes/controllers
 * ═══════════════════════════════════════════════════════════════════════════
 */

const orderProcessingPipeline = require('../services/order-processing-pipeline.service');
const logger = require('../../../../src/logging/logger') || console;

/**
 * Middleware to process order after creation
 * Automatically consumes stock and emits events
 */
async function processOrderAfterCreation(req, res, next) {
  // Only process if order was successfully created
  if (res.locals.orderId || req.orderId) {
    const orderId = res.locals.orderId || req.orderId;
    
    // Process order asynchronously (non-blocking)
    // Don't wait for stock consumption to complete
    orderProcessingPipeline.processOrderAfterCreation(orderId, req.body)
      .then(result => {
        if (result.success) {
          logger.info(`[OrderProcessing] Order ${orderId} processed successfully`, {
            orderId,
            platform: result.platform,
            stockConsumed: result.stockConsumed
          });
        } else {
          logger.error(`[OrderProcessing] Order ${orderId} processing failed:`, result.error);
        }
      })
      .catch(error => {
        logger.error(`[OrderProcessing] Order ${orderId} processing error:`, error);
      });
  }

  next();
}

/**
 * Middleware to process order after update
 */
async function processOrderAfterUpdate(req, res, next) {
  if (res.locals.orderId || req.params.id) {
    const orderId = res.locals.orderId || req.params.id;
    const oldOrder = res.locals.oldOrder;
    const newOrder = res.locals.newOrder || req.body;

    // Process order update asynchronously
    orderProcessingPipeline.processOrderAfterUpdate(orderId, oldOrder, newOrder)
      .catch(error => {
        logger.error(`[OrderProcessing] Order ${orderId} update processing error:`, error);
      });
  }

  next();
}

module.exports = {
  processOrderAfterCreation,
  processOrderAfterUpdate
};
