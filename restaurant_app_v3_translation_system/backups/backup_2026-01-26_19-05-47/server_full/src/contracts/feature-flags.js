/**
 * Feature Flags System - Surface Area Detection
 * 
 * Regula #3: Cursor nu are voie să bage if (something) random.
 * Doar:
 * - if (surface === 'KIOSK')
 * - if (surface !== 'ADMIN')
 * 
 * Asta reduce enorm bug-urile "am schimbat ceva în Admin și a afectat Kiosk".
 */

/**
 * App Surface Types
 */
const APP_SURFACE = {
  ADMIN: 'ADMIN',
  POS: 'POS',
  KIOSK: 'KIOSK',
  QR: 'QR',
} as const;

/**
 * Detectează surface area din request
 */
function detectSurface(req) {
  // 1. Verifică header custom
  if (req.headers?.['x-app-surface']) {
    const surface = req.headers['x-app-surface'].toUpperCase();
    if (Object.values(APP_SURFACE).includes(surface)) {
      return surface;
    }
  }
  
  // 2. Verifică path
  const path = req.path || req.url || '';
  
  if (path.startsWith('/api/pos/') || path.startsWith('/pos.html')) {
    return APP_SURFACE.POS;
  }
  
  if (path.startsWith('/api/kiosk/') || path.startsWith('/kiosk/')) {
    return APP_SURFACE.KIOSK;
  }
  
  if (path.startsWith('/api/qr/') || path.startsWith('/qr/')) {
    return APP_SURFACE.QR;
  }
  
  if (path.startsWith('/admin-vite/') || path.startsWith('/api/admin/')) {
    return APP_SURFACE.ADMIN;
  }
  
  // 3. Verifică user agent (fallback)
  const userAgent = req.headers?.['user-agent'] || '';
  if (userAgent.includes('Kiosk') || userAgent.includes('kiosk')) {
    return APP_SURFACE.KIOSK;
  }
  
  // 4. Default: ADMIN
  return APP_SURFACE.ADMIN;
}

/**
 * Middleware pentru a adăuga surface în request
 */
function surfaceAreaMiddleware(req, res, next) {
  req.appSurface = detectSurface(req);
  req.isKiosk = req.appSurface === APP_SURFACE.KIOSK;
  req.isPos = req.appSurface === APP_SURFACE.POS;
  req.isQr = req.appSurface === APP_SURFACE.QR;
  req.isAdmin = req.appSurface === APP_SURFACE.ADMIN;
  
  // Log pentru debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Surface Area] ${req.appSurface} detected for ${req.path}`);
  }
  
  next();
}

/**
 * Helper pentru a verifica surface area
 */
function isSurface(req, surface) {
  return req.appSurface === surface;
}

/**
 * Helper pentru a verifica dacă NU este surface area
 */
function isNotSurface(req, surface) {
  return req.appSurface !== surface;
}

/**
 * Helper pentru a verifica dacă este runtime critical (POS/Kiosk/QR)
 */
function isRuntimeCritical(req) {
  return [APP_SURFACE.POS, APP_SURFACE.KIOSK, APP_SURFACE.QR].includes(req.appSurface);
}

/**
 * Helper pentru a verifica dacă poate evolua liber (Admin)
 */
function canEvolveFreely(req) {
  return req.appSurface === APP_SURFACE.ADMIN;
}

module.exports = {
  APP_SURFACE,
  detectSurface,
  surfaceAreaMiddleware,
  isSurface,
  isNotSurface,
  isRuntimeCritical,
  canEvolveFreely,
};

