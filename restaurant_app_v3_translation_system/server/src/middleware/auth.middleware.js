/**
 * ENTERPRISE MODULE - AUTH MIDDLEWARE
 * Phase: E9.7 - JWT Token Verification Middleware
 * 
 * Middleware for verifying JWT tokens on protected routes
 */

const authService = require('../modules/auth/auth.service');

/**
 * Verify JWT access token from Authorization header
 */
const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header provided'
      });
    }
    
    // Support both "Bearer <token>" and direct token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    // Verify token
    try {
      const decoded = authService.verifyAccessToken(token);
      
      // Attach user data to request
      req.user = decoded;
      req.token = token;
      
      next();
    } catch (error) {
      if (error.message === 'Token expired') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: error.message || 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Optional token verification (doesn't fail if token is missing)
 * Useful for routes that work with or without authentication
 */
const optionalToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : authHeader;
      
      if (token) {
        try {
          const decoded = authService.verifyAccessToken(token);
          req.user = decoded;
          req.token = token;
        } catch (error) {
          // Silently ignore token errors for optional auth
          req.user = null;
          req.token = null;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth if error
    req.user = null;
    req.token = null;
    next();
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }
    
    try {
      const decoded = authService.verifyRefreshToken(refreshToken);
      req.refreshTokenData = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  } catch (error) {
    console.error('❌ Refresh token middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Refresh token verification error'
    });
  }
};

module.exports = {
  verifyToken,
  optionalToken,
  verifyRefreshToken
};

