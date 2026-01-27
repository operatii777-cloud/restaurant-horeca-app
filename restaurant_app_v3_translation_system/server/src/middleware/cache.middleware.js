/**
 * Cache Middleware pentru API Responses
 * 
 * Adaugă cache headers pentru endpoint-uri statice sau care se schimbă rar
 */

/**
 * Cache middleware pentru răspunsuri statice
 * @param {number} maxAge - Cache duration în secunde (default: 300 = 5 minute)
 * @param {boolean} mustRevalidate - Dacă trebuie revalidat (default: true)
 */
function cacheMiddleware(maxAge = 300, mustRevalidate = true) {
  return (req, res, next) => {
    // Nu cache-ui răspunsurile la POST, PUT, DELETE
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Set cache headers
    const cacheControl = mustRevalidate
      ? `public, max-age=${maxAge}, must-revalidate`
      : `public, max-age=${maxAge}`;
    
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('ETag', `"${Date.now()}"`); // Simple ETag based on timestamp
    
    next();
  };
}

/**
 * No-cache middleware pentru răspunsuri dinamice
 */
function noCacheMiddleware() {
  return (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  };
}

/**
 * Long cache pentru date statice (ex: categorii, setări)
 */
function longCacheMiddleware() {
  return cacheMiddleware(3600, true); // 1 oră
}

/**
 * Short cache pentru date semi-statice (ex: meniu, produse)
 */
function shortCacheMiddleware() {
  return cacheMiddleware(60, true); // 1 minut
}

module.exports = {
  cacheMiddleware,
  noCacheMiddleware,
  longCacheMiddleware,
  shortCacheMiddleware
};

