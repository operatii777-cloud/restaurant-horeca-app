/**
 * HTTPS Enforcement Middleware
 * Redirects all HTTP requests to HTTPS in production
 */

function enforceHTTPS(req, res, next) {
    // Skip in development mode
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    // Check if request is already HTTPS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
    }

    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    console.log(`[HTTPS] Redirecting HTTP request to: ${httpsUrl}`);
    return res.redirect(301, httpsUrl);
}

/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */
function securityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security (HSTS) - Force HTTPS for 1 year
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Content Security Policy
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https:; " +
        "frame-ancestors 'self';"
    );

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature Policy)
    res.setHeader('Permissions-Policy',
        'geolocation=(self), ' +
        'microphone=(), ' +
        'camera=(), ' +
        'payment=(self)'
    );

    next();
}

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks
 */
const rateLimitStore = new Map();

function rateLimit(options = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // Max requests per window
        message = 'Too many requests, please try again later.',
        skipSuccessfulRequests = false
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        // Clean up old entries
        for (const [ip, data] of rateLimitStore.entries()) {
            if (now - data.resetTime > windowMs) {
                rateLimitStore.delete(ip);
            }
        }

        // Get or create rate limit data for this IP
        let limitData = rateLimitStore.get(key);

        if (!limitData || now - limitData.resetTime > windowMs) {
            limitData = {
                count: 0,
                resetTime: now
            };
            rateLimitStore.set(key, limitData);
        }

        // Increment request count
        limitData.count++;

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - limitData.count));
        res.setHeader('X-RateLimit-Reset', new Date(limitData.resetTime + windowMs).toISOString());

        // Check if limit exceeded
        if (limitData.count > max) {
            console.warn(`[RATE LIMIT] IP ${key} exceeded rate limit (${limitData.count}/${max})`);
            return res.status(429).json({
                error: message,
                retryAfter: Math.ceil((limitData.resetTime + windowMs - now) / 1000)
            });
        }

        // Reset count on successful request if configured
        if (skipSuccessfulRequests) {
            res.on('finish', () => {
                if (res.statusCode < 400) {
                    limitData.count--;
                }
            });
        }

        next();
    };
}

/**
 * Session Security Middleware
 * Adds session timeout and regeneration
 */
function sessionSecurity(req, res, next) {
    if (!req.session) {
        return next();
    }

    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    // Check if session has timed out
    if (req.session.lastActivity && (now - req.session.lastActivity > sessionTimeout)) {
        console.log(`[SESSION] Session timeout for user: ${req.session.userId || 'unknown'}`);
        req.session.destroy();
        return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    // Update last activity time
    req.session.lastActivity = now;

    // Regenerate session ID periodically (every 5 minutes)
    const regenerateInterval = 5 * 60 * 1000;
    if (!req.session.createdAt) {
        req.session.createdAt = now;
    } else if (now - req.session.createdAt > regenerateInterval) {
        req.session.regenerate((err) => {
            if (err) {
                console.error('[SESSION] Error regenerating session:', err);
            } else {
                req.session.createdAt = now;
                req.session.lastActivity = now;
            }
            next();
        });
        return;
    }

    next();
}

module.exports = {
    enforceHTTPS,
    securityHeaders,
    rateLimit,
    sessionSecurity
};
