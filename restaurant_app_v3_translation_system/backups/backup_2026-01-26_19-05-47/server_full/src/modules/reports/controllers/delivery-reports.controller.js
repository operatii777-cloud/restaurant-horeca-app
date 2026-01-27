/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/delivery-reports.js
 * 
 * NOTE: Uses bridge to original handler. Full extraction in PHASE E8.
 */

const originalRouter = require('../../../../routes/delivery-reports');

async function getDeliveryPerformance(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/delivery-performance' && layer.route.methods.get
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

module.exports = {
  getDeliveryPerformance
};
