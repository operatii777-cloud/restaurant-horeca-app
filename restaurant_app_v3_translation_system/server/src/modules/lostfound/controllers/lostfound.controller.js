/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/lostfound.js
 * 
 * NOTE: Uses bridge to original handlers. Full extraction in PHASE E8.
 */

const originalRouter = require('../../../../routes/lostfound');

async function getItems(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items' && layer.route.methods.get
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function getItemById(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id' && layer.route.methods.get
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function createItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function updateItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id' && layer.route.methods.put
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function returnItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id/return' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function discardItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id/discard' && layer.route.methods.post
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
  getItems,
  getItemById,
  createItem,
  updateItem,
  returnItem,
  discardItem,
  getStats
};
