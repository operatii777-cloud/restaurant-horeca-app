/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/coatroom.js
 * 
 * NOTE: Uses bridge to original handlers. Full extraction in PHASE E8.
 */

const originalRouter = require('../../../../routes/coatroom');

async function getTickets(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/tickets' && layer.route.methods.get
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function getTicketByCode(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/tickets/:code' && layer.route.methods.get
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function checkIn(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/checkin' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function checkOut(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/checkout' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function markLost(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/mark-lost' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function getStats(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/stats' && layer.route.methods.get
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

module.exports = {
  getTickets,
  getTicketByCode,
  checkIn,
  checkOut,
  markLost,
  getStats
};
