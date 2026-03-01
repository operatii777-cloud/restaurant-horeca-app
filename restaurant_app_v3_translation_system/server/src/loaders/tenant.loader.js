/**
 * FAZA MT.1 - Tenant Middleware Loader
 * 
 * Loads tenant middleware for all API routes.
 * Excludes public endpoints (login, register, etc.) that don't require tenant.
 */

const { tenantMiddleware } = require('../middleware/tenant.middleware');

function loadTenantMiddleware(app) {
  // Apply tenant middleware to all API routes EXCEPT public endpoints
  // This must be loaded AFTER bodyParser but BEFORE routes
  
  // Public endpoints that don't require tenant
  // Endpoint-urile /api/couriers/me/* folosesc token pentru autentificare, nu tenant
  // Endpoint-ul /api/reservations este folosit de admin.html și nu necesită location_id obligatoriu
  const publicEndpoints = [
    '/api/couriers/login',
    '/api/couriers/me',  // Exclude toate endpoint-urile /api/couriers/me/*
    '/api/auth/login',
    '/api/auth/register',
    '/api/public',
    '/api/mobile/auth/register',  // Mobile app customer registration
    '/api/mobile/auth/login',     // Mobile app customer login
    '/api/config',                // Mobile app configuration endpoint
    '/api/kiosk/menu',            // Kiosk menu (public pentru meniu)
    '/api/server-info',           // Server info pentru auto-discovery
    '/api/auth/pin/direct-login', // Electron launcher PIN login
    '/api/auth/pin/pin-users',    // PIN users management
  ];
  
  // Endpoints that should not have location_id filter applied automatically
  // These endpoints handle location filtering themselves or don't need it
  const noLocationFilterEndpoints = [
    '/api/reservations',  // Handles location filtering manually with NULL fallback
  ];
  
  // Apply tenant middleware with exclusion for public endpoints
  app.use('/api', (req, res, next) => {
    // Skip tenant middleware for public endpoints
    // req.path este fără /api (ex: /couriers/me/assignments)
    const path = req.path; // Ex: /couriers/me/assignments sau /couriers/login
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      // Elimină /api din endpoint pentru comparație
      const endpointPath = endpoint.replace('/api', ''); // Ex: /couriers/login sau /mobile/auth/register
      
      // Verifică dacă path-ul începe exact cu endpoint-ul public sau este exact match
      // Ex: /mobile/auth/register trebuie să se potrivească exact cu path-ul
      return path === endpointPath || path.startsWith(endpointPath + '/') || path.startsWith(endpointPath + '?');
    });
    
    if (isPublicEndpoint) {
      console.log(`[TenantMiddleware] Skipping tenant check for public endpoint: ${path}`);
      return next();
    }
    // Apply tenant middleware for all other endpoints
    return tenantMiddleware(req, res, next);
  });
  
  console.log('✅ Tenant middleware loaded (public endpoints excluded)');
}

module.exports = { loadTenantMiddleware };

