/**
 * ENTERPRISE MODULE - AUTH SERVICE
 * Phase: E9.7 - JWT-based Authentication with Expiration
 * 
 * Handles JWT token generation, verification, and refresh tokens
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthService {
  /**
   * Generate JWT access token
   * @param {Object} payload - User data to encode
   * @returns {String} JWT token
   */
  generateAccessToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    return jwt.sign(
      {
        ...payload,
        type: 'access'
      },
      secret,
      {
        expiresIn,
        issuer: 'restaurant-app',
        audience: 'restaurant-app-users'
      }
    );
  }

  /**
   * Generate JWT refresh token
   * @param {Object} payload - User data to encode
   * @returns {String} Refresh token
   */
  generateRefreshToken(payload) {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET or JWT_REFRESH_SECRET environment variable is required');
    }
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    return jwt.sign(
      {
        ...payload,
        type: 'refresh'
      },
      secret,
      {
        expiresIn,
        issuer: 'restaurant-app',
        audience: 'restaurant-app-users'
      }
    );
  }

  /**
   * Verify JWT access token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyAccessToken(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    try {
      const decoded = jwt.verify(token, secret, {
        issuer: 'restaurant-app',
        audience: 'restaurant-app-users'
      });
      
      // Extra verificare manuală pentru expirare
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Verify JWT refresh token
   * @param {String} token - Refresh token to verify
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyRefreshToken(token) {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET or JWT_REFRESH_SECRET environment variable is required');
    }
    
    try {
      const decoded = jwt.verify(token, secret, {
        issuer: 'restaurant-app',
        audience: 'restaurant-app-users'
      });
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Generate legacy token (for backward compatibility)
   * @param {String} prefix - Token prefix (e.g., 'kiosk_')
   * @returns {String} Legacy token
   */
  generateLegacyToken(prefix = 'kiosk_') {
    return prefix + Date.now() + '_' + crypto.randomBytes(16).toString('hex');
  }
}

module.exports = new AuthService();

