/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/hostess.js
 * 
 * NOTE: This controller uses helper functions from the original route file.
 * TODO PHASE E8: Extract helpers to service layer
 */

const db = require('../../../config/database');

// Helper functions (copied from routes/hostess.js)
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runQuerySingle = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// For PHASE E7, we'll use the original router as a bridge
// TODO PHASE E8: Extract all handlers to individual controller methods
const originalRouter = require('../../../routes/hostess');

// Bridge methods that delegate to original handlers
async function getTables(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/tables' && layer.route.methods.get
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

async function startSession(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/sessions/start' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function closeSession(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/sessions/:id/close' && layer.route.methods.post
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

async function getSessions(req, res, next) {
  const handler = originalRouter.stack.find(layer => 
    layer.route && layer.route.path === '/sessions' && layer.route.methods.get
  );
  if (handler) return handler.route.stack[0].handle(req, res, next);
  res.status(500).json({ error: 'Handler not found' });
}

module.exports = {
  getTables,
  getStats,
  startSession,
  closeSession,
  getSessions
};
