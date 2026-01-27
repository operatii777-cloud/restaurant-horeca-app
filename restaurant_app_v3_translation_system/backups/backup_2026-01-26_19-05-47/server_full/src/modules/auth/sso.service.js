/**
 * ENTERPRISE MODULE - Single Sign-On (SSO) Service
 * 
 * Supports:
 * - SAML 2.0
 * - OAuth 2.0 (Google, Microsoft, etc.)
 * - OpenID Connect
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbPromise } = require('../../../database');

class SSOService {
  /**
   * Configure OAuth 2.0 provider
   * @param {String} provider - Provider name (google, microsoft, etc.)
   * @param {Object} config - OAuth configuration
   * @returns {Promise<Boolean>}
   */
  async configureOAuth(provider, config) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO sso_config (
          provider, 
          client_id, 
          client_secret, 
          redirect_uri, 
          scope,
          enabled,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        provider,
        config.clientId,
        config.clientSecret,
        config.redirectUri,
        config.scope || 'openid email profile',
        config.enabled !== false ? 1 : 0,
        new Date().toISOString()
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Get OAuth authorization URL
   * @param {String} provider - Provider name
   * @param {String} state - CSRF state token
   * @returns {Promise<String>} Authorization URL
   */
  async getAuthorizationURL(provider, state) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT client_id, redirect_uri, scope
        FROM sso_config
        WHERE provider = ? AND enabled = 1
      `, [provider], (err, config) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!config) {
          reject(new Error(`SSO provider ${provider} not configured`));
          return;
        }
        
        const authURLs = {
          google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=${encodeURIComponent(config.scope)}&state=${state}`,
          microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=${encodeURIComponent(config.scope)}&state=${state}`,
        };
        
        const url = authURLs[provider.toLowerCase()];
        if (!url) {
          reject(new Error(`Unsupported SSO provider: ${provider}`));
          return;
        }
        
        resolve(url);
      });
    });
  }

  /**
   * Exchange authorization code for access token
   * @param {String} provider - Provider name
   * @param {String} code - Authorization code
   * @returns {Promise<Object>} User information
   */
  async exchangeCodeForToken(provider, code) {
    const db = await dbPromise;
    const axios = require('axios');
    
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT client_id, client_secret, redirect_uri
        FROM sso_config
        WHERE provider = ? AND enabled = 1
      `, [provider], async (err, config) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!config) {
          reject(new Error(`SSO provider ${provider} not configured`));
          return;
        }
        
        try {
          // Exchange code for token
          const tokenResponse = await axios.post(
            this.getTokenURL(provider),
            {
              client_id: config.client_id,
              client_secret: config.client_secret,
              code,
              redirect_uri: config.redirect_uri,
              grant_type: 'authorization_code'
            },
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
          );
          
          const accessToken = tokenResponse.data.access_token;
          
          // Get user info
          const userInfo = await this.getUserInfo(provider, accessToken);
          
          resolve(userInfo);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get user information from provider
   * @param {String} provider - Provider name
   * @param {String} accessToken - Access token
   * @returns {Promise<Object>} User information
   */
  async getUserInfo(provider, accessToken) {
    const axios = require('axios');
    
    const userInfoURLs = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      microsoft: 'https://graph.microsoft.com/v1.0/me'
    };
    
    const url = userInfoURLs[provider.toLowerCase()];
    if (!url) {
      throw new Error(`Unsupported SSO provider: ${provider}`);
    }
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    // Normalize user info
    if (provider.toLowerCase() === 'google') {
      return {
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        provider: 'google',
        providerId: response.data.id
      };
    } else if (provider.toLowerCase() === 'microsoft') {
      return {
        email: response.data.mail || response.data.userPrincipalName,
        name: response.data.displayName,
        picture: null,
        provider: 'microsoft',
        providerId: response.data.id
      };
    }
    
    return response.data;
  }

  /**
   * Get token URL for provider
   * @param {String} provider - Provider name
   * @returns {String} Token URL
   */
  getTokenURL(provider) {
    const urls = {
      google: 'https://oauth2.googleapis.com/token',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    };
    
    return urls[provider.toLowerCase()] || null;
  }

  /**
   * Generate CSRF state token
   * @returns {String} State token
   */
  generateStateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF state token
   * @param {String} state - State token to verify
   * @param {String} storedState - Stored state token
   * @returns {Boolean}
   */
  verifyStateToken(state, storedState) {
    return crypto.timingSafeEqual(
      Buffer.from(state),
      Buffer.from(storedState)
    );
  }

  /**
   * Link SSO account to user
   * @param {Number} userId - User ID
   * @param {Object} ssoInfo - SSO user information
   * @returns {Promise<Boolean>}
   */
  async linkSSOAccount(userId, ssoInfo) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO user_sso (
          user_id,
          provider,
          provider_id,
          email,
          name,
          picture,
          linked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        ssoInfo.provider,
        ssoInfo.providerId,
        ssoInfo.email,
        ssoInfo.name,
        ssoInfo.picture,
        new Date().toISOString()
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Find user by SSO information
   * @param {Object} ssoInfo - SSO user information
   * @returns {Promise<Object|null>} User object or null
   */
  async findUserBySSO(ssoInfo) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT u.*
        FROM users u
        INNER JOIN user_sso sso ON u.id = sso.user_id
        WHERE sso.provider = ? AND sso.provider_id = ?
      `, [ssoInfo.provider, ssoInfo.providerId], (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }
}

module.exports = new SSOService();

