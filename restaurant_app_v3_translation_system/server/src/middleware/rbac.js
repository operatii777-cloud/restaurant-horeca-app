/**
 * PHASE E9.4 - RBAC (Role-Based Access Control)
 * 
 * Enterprise RBAC system with role → permission → route mapping.
 */

/**
 * Role permissions mapping
 */
const rolePermissions = {
  admin: [
    '*', // All permissions
  ],
  
  manager: [
    'stocks.read',
    'stocks.write',
    'orders.read',
    'orders.write',
    'orders.cancel',
    'reports.read',
    'settings.read',
    'settings.write',
    'cash-register.*',
    'bi.read'
  ],
  
  supervisor: [
    'orders.read',
    'orders.write',
    'orders.cancel',
    'orders.discount',
    'orders.voucher',
    'tables.transfer',
    'tables.merge',
    'cash-register.open',
    'cash-register.close',
    'pos.payments'
  ],
  
  waiter: [
    'orders.read',
    'orders.write',
    'orders.pay',
    'tables.view',
    'pos.payments'
  ],
  
  cook: [
    'orders.view_active',
    'orders.update_status',
    'kds.view',
    'kds.update'
  ],
  
  cashier: [
    'cash-register.open',
    'cash-register.close',
    'pos.payments',
    'orders.pay',
    'reports.z'
  ],
  
  warehouse: [
    'stocks.read',
    'stocks.write',
    'nir.create',
    'nir.edit',
    'consume.create',
    'consume.edit',
    'inventory.*',
    'transfer.*',
    'suppliers.read',
    'suppliers.write'
  ],
  
  finance: [
    'reports.read',
    'reports.financial',
    'reports.fiscal',
    'cash-register.read',
    'invoices.read',
    'bi.read'
  ],
  
  delivery: [
    'orders.delivery.read',
    'orders.delivery.update',
    'orders.delivery.status'
  ],
  
  client: [
    'menu.read',
    'orders.create',
    'vouchers.validate',
    'vouchers.use'
  ]
};

/**
 * Route → Permission mapping
 */
const routePermissions = {
  '/api/stocks': 'stocks.read',
  'POST /api/stocks': 'stocks.write',
  'PUT /api/stocks': 'stocks.write',
  'DELETE /api/stocks': 'stocks.write',
  
  '/api/stocks/nir': 'nir.read',
  'POST /api/stocks/nir': 'nir.create',
  'PUT /api/stocks/nir': 'nir.edit',
  
  '/api/orders': 'orders.read',
  'POST /api/orders': 'orders.write',
  'PUT /api/orders': 'orders.write',
  'DELETE /api/orders': 'orders.cancel',
  
  '/api/admin': 'admin.*',
  'POST /api/admin': 'admin.write',
  'PUT /api/admin': 'admin.write',
  'DELETE /api/admin': 'admin.write',
  
  '/api/cash-register': 'cash-register.read',
  'POST /api/cash-register/open': 'cash-register.open',
  'POST /api/cash-register/close': 'cash-register.close',
  
  '/api/bi': 'bi.read',
  '/api/reports': 'reports.read',
  
  '/api/kiosk': 'kiosk.*',
  '/api/pos': 'pos.*'
};

/**
 * Check if user has permission
 */
function hasPermission(userRole, permission) {
  const permissions = rolePermissions[userRole] || [];
  
  // Admin has all permissions
  if (permissions.includes('*')) {
    return true;
  }
  
  // Exact match
  if (permissions.includes(permission)) {
    return true;
  }
  
  // Wildcard match (e.g., 'stocks.*' matches 'stocks.read')
  const wildcardPermission = permission.split('.')[0] + '.*';
  if (permissions.includes(wildcardPermission)) {
    return true;
  }
  
  return false;
}

/**
 * Get required permission for route
 */
function getRequiredPermission(method, route) {
  const key = `${method} ${route}`;
  if (routePermissions[key]) {
    return routePermissions[key];
  }
  
  // Try route prefix match
  for (const [routePattern, permission] of Object.entries(routePermissions)) {
    if (route.startsWith(routePattern)) {
      return permission;
    }
  }
  
  // Default permission based on method
  if (method === 'GET') {
    return route.split('/')[2] + '.read'; // e.g., 'stocks.read'
  }
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    return route.split('/')[2] + '.write'; // e.g., 'stocks.write'
  }
  
  return null;
}

/**
 * RBAC Middleware
 */
function requirePermission(permission) {
  return (req, res, next) => {
    // Get user role from request (assumes auth middleware sets req.user)
    const userRole = req.user?.role || 'client';
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        required: permission,
        userRole
      });
    }
    
    next();
  };
}

/**
 * RBAC Middleware - Auto-detect permission from route
 */
function requireAuth(req, res, next) {
  // Get user from session/auth
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }
  
  next();
}

/**
 * RBAC Middleware - Check permission for current route
 */
function checkRoutePermission(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }
  
  const method = req.method;
  const route = req.route?.path || req.path;
  const permission = getRequiredPermission(method, route);
  
  if (permission && !hasPermission(req.user.role, permission)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
      code: 'PERMISSION_DENIED',
      required: permission,
      userRole: req.user.role,
      route: `${method} ${route}`
    });
  }
  
  next();
}

module.exports = {
  rolePermissions,
  routePermissions,
  hasPermission,
  getRequiredPermission,
  requirePermission,
  requireAuth,
  checkRoutePermission
};

