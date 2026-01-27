/**
 * Compatibility Layer - Versionare API
 * 
 * Regula #2: Pentru API-uri critice POS/Kiosk:
 * - v1 rămâne STABLE (nu se modifică)
 * - v2 adaugă/modernizează (poate evolua)
 * 
 * Exemplu:
 * - getOrderForPosV1() - STABLE, folosit de POS
 * - getOrderForAdminV2() - Evoluează, folosit de Admin-Vite
 */

/**
 * Detectează surface area din request
 */
function detectSurface(req) {
  const path = req.path || req.url || '';
  const userAgent = req.headers?.['user-agent'] || '';
  
  if (path.startsWith('/api/pos/')) return 'POS';
  if (path.startsWith('/api/kiosk/')) return 'KIOSK';
  if (path.startsWith('/api/qr/')) return 'QR';
  if (path.startsWith('/admin-vite/') || path.startsWith('/api/admin/')) return 'ADMIN';
  
  // Fallback: verifică header-uri custom
  if (req.headers?.['x-app-surface']) {
    return req.headers['x-app-surface'];
  }
  
  return 'ADMIN'; // Default
}

/**
 * Middleware pentru Compatibility Layer
 * 
 * Folosește v1 pentru POS/Kiosk (stable)
 * Folosește v2 pentru Admin (evoluează)
 */
function compatibilityLayerMiddleware(req, res, next) {
  const surface = detectSurface(req);
  
  // Adaugă surface în request pentru folosire în controllers
  req.appSurface = surface;
  
  // Log pentru debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Compatibility Layer] Surface detected: ${surface} for ${req.path}`);
  }
  
  next();
}

/**
 * Helper pentru a obține funcția corectă bazat pe surface
 * 
 * @param {Object} options - Opțiuni
 * @param {Function} options.v1 - Funcția v1 (stable pentru POS/Kiosk)
 * @param {Function} options.v2 - Funcția v2 (evoluează pentru Admin)
 * @param {string} options.surface - Surface area (POS, KIOSK, QR, ADMIN)
 * @returns {Function} Funcția corectă bazat pe surface
 */
function getVersionedFunction({ v1, v2, surface }) {
  // POS, KIOSK, QR folosesc v1 (stable)
  if (['POS', 'KIOSK', 'QR'].includes(surface)) {
    return v1;
  }
  
  // ADMIN folosește v2 (evoluează)
  return v2;
}

/**
 * Wrapper pentru endpoint-uri care trebuie să folosească versionare
 * 
 * Exemplu de folosire:
 * 
 * app.get('/api/order/:id', versionedEndpoint({
 *   v1: getOrderForPosV1,
 *   v2: getOrderForAdminV2,
 * }));
 */
function versionedEndpoint({ v1, v2 }) {
  return async (req, res, next) => {
    try {
      const surface = detectSurface(req);
      const fn = getVersionedFunction({ v1, v2, surface });
      
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  detectSurface,
  compatibilityLayerMiddleware,
  getVersionedFunction,
  versionedEndpoint,
};

