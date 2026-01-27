/**
 * ENTERPRISE MODULE - SSO Routes
 * 
 * Handles Single Sign-On endpoints
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');
const ssoService = require('./sso.service');
const auditService = require('../audit/audit.service');
const authService = require('./auth.service');

/**
 * GET /api/auth/sso/providers
 * Get available SSO providers
 */
router.get('/providers', async (req, res) => {
  try {
    const db = await dbPromise;
    
    db.all('SELECT provider, enabled FROM sso_config WHERE enabled = 1', [], (err, providers) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch SSO providers'
        });
      }
      
      res.json({
        success: true,
        providers: providers.map(p => p.provider)
      });
    });
  } catch (error) {
    console.error('[SSO] Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SSO providers'
    });
  }
});

/**
 * GET /api/auth/sso/authorize/:provider
 * Initiate SSO login
 */
router.get('/authorize/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    // Generate state token for CSRF protection
    const state = ssoService.generateStateToken();
    
    // Store state in session (or Redis for production)
    req.session = req.session || {};
    req.session.ssoState = state;
    
    // Get authorization URL
    const authURL = await ssoService.getAuthorizationURL(provider, state);
    
    res.redirect(authURL);
  } catch (error) {
    console.error('[SSO] Authorize error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate SSO login'
    });
  }
});

/**
 * GET /api/auth/sso/callback/:provider
 * Handle SSO callback
 */
router.get('/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({
        success: false,
        error: 'Missing code or state parameter'
      });
    }
    
    // Verify state token
    const storedState = req.session?.ssoState;
    if (!storedState || !ssoService.verifyStateToken(state, storedState)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid state token'
      });
    }
    
    // Exchange code for token and get user info
    const userInfo = await ssoService.exchangeCodeForToken(provider, code);
    
    // Find or create user
    let user = await ssoService.findUserBySSO(userInfo);
    
    if (!user) {
      // User doesn't exist, create new account or link to existing
      // For now, return error - user should link account first
      return res.status(404).json({
        success: false,
        error: 'SSO account not linked. Please contact administrator.'
      });
    }
    
    // Link SSO account if not already linked
    await ssoService.linkSSOAccount(user.id, userInfo);
    
    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role || 'user'
    };
    
    const accessToken = authService.generateAccessToken(tokenPayload);
    const refreshToken = authService.generateRefreshToken({ userId: user.id });
    
    // Log SSO login
    await auditService.logAuthentication({
      userId: user.id,
      action: 'sso_login',
      success: true,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { provider }
    });
    
    // Redirect to frontend with tokens
    const redirectURL = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin-vite/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectURL);
  } catch (error) {
    console.error('[SSO] Callback error:', error);
    res.status(500).json({
      success: false,
      error: 'SSO authentication failed'
    });
  }
});

/**
 * POST /api/auth/sso/configure
 * Configure SSO provider (Admin only)
 */
router.post('/configure', async (req, res) => {
  try {
    // TODO: Add admin authorization check
    
    const { provider, clientId, clientSecret, redirectUri, scope, enabled } = req.body;
    
    if (!provider || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    await ssoService.configureOAuth(provider, {
      clientId,
      clientSecret,
      redirectUri,
      scope,
      enabled
    });
    
    res.json({
      success: true,
      message: 'SSO provider configured successfully'
    });
  } catch (error) {
    console.error('[SSO] Configure error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure SSO provider'
    });
  }
});

module.exports = router;

