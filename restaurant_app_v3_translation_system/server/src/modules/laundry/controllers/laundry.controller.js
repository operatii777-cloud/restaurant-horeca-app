/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/laundry.js
 * 
 * NOTE: Uses bridge to original handlers. Full extraction in PHASE E8.
 */

const originalRouter = require('../../../../routes/laundry');

// Bridge methods - delegate to original handlers
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

async function washItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id/wash' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function assignItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id/assign' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function unassignItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id/unassign' && layer.route.methods.post
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

async function deleteItem(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/items/:id' && layer.route.methods.delete
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  washItem,
  assignItem,
  unassignItem,
  getStats,
  deleteItem
};
