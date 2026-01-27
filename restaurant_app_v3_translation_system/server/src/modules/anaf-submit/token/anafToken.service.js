/**
 * FAZA 1.1 - ANAF Token Management Service
 * 
 * Handles ANAF SPV token lifecycle:
 * - Token validation
 * - Automatic refresh (30 days)
 * - Secure storage (encrypted in DB)
 * - Expiration checking
 */

const { dbPromise } = require('../../../../database');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Encryption key for token storage (REQUIRED in production)
 */
const ENCRYPTION_KEY = process.env.ANAF_TOKEN_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ANAF_TOKEN_ENCRYPTION_KEY environment variable is required in production');
}
// Fallback only for development
const ENCRYPTION_KEY_FALLBACK = ENCRYPTION_KEY || 'default-key-change-in-production-32chars!!';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt token before storing
 */
function encryptToken(token) {
  try {
    const key = crypto.scryptSync((ENCRYPTION_KEY || ENCRYPTION_KEY_FALLBACK).slice(0, 32), 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('[ANAF Token] Encryption error:', err);
    // Fallback: simple base64 (not secure, but better than plain text)
    return 'plain:' + Buffer.from(token).toString('base64');
  }
}

/**
 * Decrypt token after retrieving
 */
function decryptToken(encryptedToken) {
  try {
    if (encryptedToken.startsWith('plain:')) {
      // Fallback for old tokens
      return Buffer.from(encryptedToken.slice(6), 'base64').toString('utf8');
    }
    
    const parts = encryptedToken.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.scryptSync((ENCRYPTION_KEY || ENCRYPTION_KEY_FALLBACK).slice(0, 32), 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[ANAF Token] Decryption error:', err);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Get current token from database
 */
async function getCurrentToken() {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        encrypted_token,
        expires_at,
        created_at,
        last_refreshed_at
      FROM anaf_tokens
      WHERE is_active = 1
      ORDER BY created_at DESC
      LIMIT 1
    `, [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row || !row.encrypted_token) {
        resolve(null);
        return;
      }
      
      try {
        const decryptedToken = decryptToken(row.encrypted_token);
        resolve({
          token: decryptedToken,
          expiresAt: new Date(row.expires_at),
          createdAt: new Date(row.created_at),
          lastRefreshedAt: row.last_refreshed_at ? new Date(row.last_refreshed_at) : new Date(row.created_at)
        });
      } catch (decryptErr) {
        console.error('[ANAF Token] Decryption error:', decryptErr);
        resolve(null);
      }
    });
  });
}

/**
 * Check if token is expired or expires soon (within 7 days)
 */
async function isTokenExpiredOrExpiringSoon() {
  const tokenInfo = await getCurrentToken();
  
  if (!tokenInfo) {
    return true; // No token = expired
  }
  
  const now = new Date();
  const expiresAt = tokenInfo.expiresAt;
  const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  // Expired or expires within 7 days
  return daysUntilExpiry <= 7;
}

/**
 * Validate token with ANAF SPV
 */
async function validateToken(token) {
  if (!process.env.ANAF_SPV_URL) {
    console.warn('[ANAF Token] ANAF_SPV_URL not configured, skipping validation');
    return true; // Assume valid if not configured
  }
  
  try {
    const response = await axios.get(
      `${process.env.ANAF_SPV_URL}/api/v2/health`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('[ANAF Token] Validation error:', error.message);
    return false;
  }
}

/**
 * Refresh token (obtain new token from ANAF SPV)
 * 
 * NOTE: This is a placeholder - actual implementation depends on ANAF SPV OAuth flow
 */
async function refreshToken() {
  if (!process.env.ANAF_SPV_URL || !process.env.ANAF_SPV_CLIENT_ID || !process.env.ANAF_SPV_CLIENT_SECRET) {
    console.warn('[ANAF Token] ANAF SPV credentials not configured, cannot refresh token');
    return null;
  }
  
  try {
    // TODO: Implement actual OAuth 2.0 flow for ANAF SPV
    // For now, this is a placeholder that would call ANAF OAuth endpoint
    const response = await axios.post(
      `${process.env.ANAF_SPV_URL}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: process.env.ANAF_SPV_CLIENT_ID,
        client_secret: process.env.ANAF_SPV_CLIENT_SECRET,
        scope: 'e-factura'
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
    );
    
    const newToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 2592000; // Default 30 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    // Store new token
    await storeToken(newToken, expiresAt);
    
    return newToken;
  } catch (error) {
    console.error('[ANAF Token] Refresh error:', error.message);
    return null;
  }
}

/**
 * Store token in database (encrypted)
 */
async function storeToken(token, expiresAt) {
  const db = await dbPromise;
  const encryptedToken = encryptToken(token);
  const now = new Date().toISOString();
  const expiresAtISO = expiresAt.toISOString();
  
  return new Promise((resolve, reject) => {
    // Deactivate old tokens
    db.run(`
      UPDATE anaf_tokens SET is_active = 0 WHERE is_active = 1
    `, [], (err) => {
      if (err) {
        console.warn('[ANAF Token] Error deactivating old tokens:', err);
      }
      
      // Insert new token
      db.run(`
        INSERT INTO anaf_tokens (
          encrypted_token,
          expires_at,
          created_at,
          last_refreshed_at,
          is_active
        ) VALUES (?, ?, ?, ?, 1)
      `, [encryptedToken, expiresAtISO, now, now], (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('[ANAF Token] ✅ Token stored successfully');
          resolve();
        }
      });
    });
  });
}

/**
 * Get valid token (refresh if needed)
 */
async function getValidToken() {
  const tokenInfo = await getCurrentToken();
  
  if (!tokenInfo) {
    console.log('[ANAF Token] No token found, attempting to refresh...');
    return await refreshToken();
  }
  
  // Check if expired or expiring soon
  if (await isTokenExpiredOrExpiringSoon()) {
    console.log('[ANAF Token] Token expired or expiring soon, refreshing...');
    const newToken = await refreshToken();
    if (newToken) {
      return newToken;
    }
    // If refresh fails, try to use old token (might still work)
    console.warn('[ANAF Token] Refresh failed, using existing token (may be expired)');
  }
  
  // Validate token
  const isValid = await validateToken(tokenInfo.token);
  if (!isValid) {
    console.log('[ANAF Token] Token validation failed, refreshing...');
    const newToken = await refreshToken();
    return newToken || tokenInfo.token; // Fallback to old token
  }
  
  return tokenInfo.token;
}

/**
 * Initialize token refresh cron (runs daily to check expiration)
 */
function startTokenRefreshCron() {
  // Check token expiration daily
  setInterval(async () => {
    try {
      if (await isTokenExpiredOrExpiringSoon()) {
        console.log('[ANAF Token] Cron: Token expiring soon, refreshing...');
        await refreshToken();
      }
    } catch (error) {
      console.error('[ANAF Token] Cron error:', error.message);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours
  
  console.log('[ANAF Token] ✅ Token refresh cron started (daily check)');
}

module.exports = {
  getCurrentToken,
  getValidToken,
  isTokenExpiredOrExpiringSoon,
  validateToken,
  refreshToken,
  storeToken,
  startTokenRefreshCron
};
