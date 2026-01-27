/**
 * ENTERPRISE MODULE - Audit Logging Middleware
 * 
 * Automatically logs all API requests and responses
 */

const auditService = require('../modules/audit/audit.service');

/**
 * Audit logging middleware
 * Logs all requests to audit_log table
 */
function auditMiddleware(req, res, next) {
  // Skip audit for health checks and static files
  if (req.path === '/api/health' || req.path.startsWith('/static/')) {
    return next();
  }
  
  const startTime = Date.now();
  const userId = req.user?.id || null;
  const action = `${req.method} ${req.path}`;
  const module = req.path.split('/')[2] || 'unknown';
  
  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const status = res.statusCode >= 400 ? 'error' : 'success';
    
    // Log asynchronously (don't block response)
    auditService.logAction({
      userId,
      action,
      module,
      entityType: req.body?.entityType || null,
      entityId: req.body?.entityId || null,
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        statusCode: res.statusCode,
        duration,
        responseSize: JSON.stringify(data).length
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      status
    }).catch(err => {
      console.error('[Audit] Failed to log action:', err);
    });
    
    return originalJson(data);
  };
  
  next();
}

/**
 * Audit logging middleware for specific actions
 * Use this for critical actions that need detailed logging
 */
function auditActionMiddleware(actionName, moduleName) {
  return async (req, res, next) => {
    const userId = req.user?.id || null;
    
    try {
      await auditService.logAction({
        userId,
        action: actionName,
        module: moduleName,
        entityType: req.body?.entityType || null,
        entityId: req.body?.entityId || null,
        details: {
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'success'
      });
    } catch (error) {
      console.error('[Audit] Failed to log action:', error);
    }
    
    next();
  };
}

module.exports = {
  auditMiddleware,
  auditActionMiddleware
};

