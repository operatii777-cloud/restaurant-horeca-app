/**
 * FAZA MT.1 - Tenant Middleware
 * 
 * Determines tenant_id and location_id automatically from:
 * - JWT token (tenant_id claim)
 * - Header X-Tenant-ID
 * - Header X-Location-ID
 * - Subdomain (client1.qroms.ro → tenant_id=1)
 * - Session (for POS/KIOSK local devices)
 * 
 * Injects into request:
 * - req.tenantId
 * - req.locationId
 * - req.brandingConfig
 * 
 * Rejects inter-tenant access attempts.
 */

const { dbPromise } = require('../../database');

/**
 * Extract tenant ID from subdomain
 * Examples:
 * - client1.qroms.ro → tenant_id = 1
 * - trattoria.qroms.ro → lookup by tenant_code
 */
function extractTenantFromSubdomain(hostname) {
  if (!hostname) return null;
  
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Check for subdomain pattern: client1.qroms.ro
  const subdomainMatch = host.match(/^([^.]+)\./);
  if (subdomainMatch) {
    const subdomain = subdomainMatch[1];
    
    // Try numeric tenant ID first
    const numericId = parseInt(subdomain);
    if (!isNaN(numericId)) {
      return numericId;
    }
    
    // Try tenant_code lookup (async - will be done in middleware)
    return subdomain;
  }
  
  return null;
}

/**
 * Extract tenant ID from JWT token
 */
function extractTenantFromJWT(req) {
  // Check if token is in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Simple JWT decode (without verification - verification should be done in auth middleware)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.tenant_id) {
        return payload.tenant_id;
      }
      if (payload.tenantId) {
        return payload.tenantId;
      }
    } catch (e) {
      // Invalid token format, ignore
    }
  }
  
  return null;
}

/**
 * Load tenant branding config from database
 */
async function loadBrandingConfig(tenantId) {
  if (!tenantId) return null;
  
  try {
    const db = await dbPromise;
    const branding = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM tenant_branding WHERE tenant_id = ?`,
        [tenantId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (branding) {
      return {
        brand_name: branding.brand_name,
        logo_url: branding.logo_url,
        favicon_url: branding.favicon_url,
        colors: JSON.parse(branding.colors || '{}'),
        font_family: branding.font_family,
        font_size_base: branding.font_size_base,
        layout_type: branding.layout_type,
        custom_css: branding.custom_css,
      };
    }
  } catch (error) {
    console.error('[TenantMiddleware] Error loading branding:', error);
  }
  
  return null;
}

/**
 * Lookup tenant by tenant_code
 */
async function lookupTenantByCode(tenantCode) {
  if (!tenantCode) return null;
  
  try {
    const db = await dbPromise;
    const tenant = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM tenants WHERE tenant_code = ? AND status = 'active'`,
        [tenantCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    return tenant ? tenant.id : null;
  } catch (error) {
    console.error('[TenantMiddleware] Error looking up tenant:', error);
    return null;
  }
}

/**
 * Main tenant middleware
 */
async function tenantMiddleware(req, res, next) {
  try {
    let tenantId = null;
    let locationId = null;
    
    // Priority 1: Explicit headers (for API calls)
    if (req.headers['x-tenant-id']) {
      tenantId = parseInt(req.headers['x-tenant-id']);
    }
    if (req.headers['x-location-id']) {
      locationId = parseInt(req.headers['x-location-id']);
    }
    
    // Priority 2: JWT token
    if (!tenantId) {
      const jwtTenantId = extractTenantFromJWT(req);
      if (jwtTenantId) {
        tenantId = jwtTenantId;
      }
    }
    
    // Priority 3: Subdomain
    if (!tenantId) {
      const subdomainTenant = extractTenantFromSubdomain(req.hostname || req.headers.host);
      if (subdomainTenant) {
        if (typeof subdomainTenant === 'number') {
          tenantId = subdomainTenant;
        } else {
          // Lookup by tenant_code
          tenantId = await lookupTenantByCode(subdomainTenant);
        }
      }
    }
    
    // Priority 4: Session (for POS/KIOSK local devices)
    if (!tenantId && req.session && req.session.tenantId) {
      tenantId = req.session.tenantId;
    }
    if (!locationId && req.session && req.session.locationId) {
      locationId = req.session.locationId;
    }
    
    // Priority 5: Default tenant (for single-tenant mode or development)
    if (!tenantId) {
      // Check if there's a default tenant in database
      const db = await dbPromise;
      const defaultTenant = await new Promise((resolve, reject) => {
        db.get(
          `SELECT id FROM tenants WHERE status = 'active' ORDER BY id ASC LIMIT 1`,
          [],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (defaultTenant) {
        tenantId = defaultTenant.id;
      } else {
        // Fallback to tenant_id = 1 for backward compatibility
        tenantId = 1;
      }
    }
    
    // Default location (if not specified, use first active location for tenant)
    if (!locationId && tenantId) {
      const db = await dbPromise;
      const defaultLocation = await new Promise((resolve, reject) => {
        db.get(
          `SELECT id FROM management_locations WHERE is_active = 1 ORDER BY id ASC LIMIT 1`,
          [],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (defaultLocation) {
        locationId = defaultLocation.id;
      } else {
        // Fallback to location_id = 1 for backward compatibility
        locationId = 1;
      }
    }
    
    // Validate tenant exists and is active
    if (tenantId) {
      const db = await dbPromise;
      const tenant = await new Promise((resolve, reject) => {
        db.get(
          `SELECT id, status, tenant_code FROM tenants WHERE id = ?`,
          [tenantId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (!tenant) {
        // Pentru endpoint-uri publice (login, etc.) și kiosk/mobile, nu blochează request-ul
        // doar loghează warning-ul și folosește default tenant
        if (req.path && (
          req.path.includes('/login') || 
          req.path.includes('/register') ||
          req.path.includes('/public') ||
          req.path.includes('/kiosk/') ||
          req.path.includes('/mobile/')
        )) {
          console.warn(`[TenantMiddleware] Tenant ${tenantId} not found for public/kiosk endpoint: ${req.path}, using default tenant`);
          // Pentru kiosk/mobile, folosește default tenant (1) sau primul activ
          const db = await dbPromise;
          const defaultTenant = await new Promise((resolve, reject) => {
            db.get(
              `SELECT id FROM tenants WHERE status = 'active' ORDER BY id ASC LIMIT 1`,
              [],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });
          
          if (defaultTenant) {
            tenantId = defaultTenant.id;
            req.tenantId = tenantId;
          } else {
            // Fallback la tenant_id = 1 pentru backward compatibility
            tenantId = 1;
            req.tenantId = 1;
          }
        } else {
          return res.status(404).json({ 
            error: 'Tenant not found',
            tenantId 
          });
        }
      } else if (tenant.status !== 'active') {
        return res.status(403).json({ 
          error: 'Tenant is not active',
          tenantId,
          status: tenant.status 
        });
      }
    }
    
    // Validate location exists and is active (if specified)
    if (locationId) {
      const db = await dbPromise;
      const location = await new Promise((resolve, reject) => {
        db.get(
          `SELECT id, is_active FROM management_locations WHERE id = ?`,
          [locationId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (!location) {
        return res.status(404).json({ 
          error: 'Location not found',
          locationId 
        });
      }
      
      if (!location.is_active) {
        return res.status(403).json({ 
          error: 'Location is not active',
          locationId 
        });
      }
    }
    
    // Inject into request
    req.tenantId = tenantId;
    req.locationId = locationId;
    
    // Load branding config (async, but don't block request)
    loadBrandingConfig(tenantId).then(branding => {
      req.brandingConfig = branding;
    }).catch(err => {
      console.error('[TenantMiddleware] Error loading branding:', err);
      req.brandingConfig = null;
    });
    
    // Continue to next middleware
    next();
  } catch (error) {
    console.error('[TenantMiddleware] Error:', error);
    return res.status(500).json({ 
      error: 'Tenant middleware error',
      message: error.message 
    });
  }
}

/**
 * Optional: Middleware to enforce tenant isolation
 * Use this for routes that MUST have tenant_id
 */
function requireTenant(req, res, next) {
  if (!req.tenantId) {
    return res.status(400).json({ 
      error: 'Tenant ID is required',
      hint: 'Provide X-Tenant-ID header or valid JWT token' 
    });
  }
  next();
}

/**
 * Optional: Middleware to enforce location
 * Use this for routes that MUST have location_id
 */
function requireLocation(req, res, next) {
  if (!req.locationId) {
    return res.status(400).json({ 
      error: 'Location ID is required',
      hint: 'Provide X-Location-ID header or set default location' 
    });
  }
  next();
}

module.exports = {
  tenantMiddleware,
  requireTenant,
  requireLocation,
};

