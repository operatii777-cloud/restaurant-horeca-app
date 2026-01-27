/**
 * ENTERPRISE MODULE - 2FA Routes
 * 
 * Handles Two-Factor Authentication endpoints
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');
const twoFactorAuthService = require('./2fa.service');
const qrcode = require('qrcode');
const auditService = require('../audit/audit.service');

/**
 * POST /api/auth/2fa/enable
 * Enable 2FA for user
 */
router.post('/enable', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const db = await dbPromise;
    
    // Get user email for QR code
    db.get('SELECT email, username FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err || !user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Generate secret
      const secret = twoFactorAuthService.generateSecret();
      
      // Enable 2FA
      const result = await twoFactorAuthService.enable2FA(userId, secret);
      
      // Generate QR code URL
      const qrCodeURL = twoFactorAuthService.generateQRCodeURL(
        secret,
        user.email || user.username,
        'Restaurant App'
      );
      
      // Generate QR code image
      const qrCodeDataURL = await qrcode.toDataURL(qrCodeURL);
      
      // Log action
      await auditService.logAuthentication({
        userId,
        action: '2fa_enabled',
        success: true,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        success: true,
        secret,
        qrCodeURL,
        qrCodeDataURL,
        backupCodes: result.backupCodes,
        message: '2FA enabled successfully. Save backup codes in a safe place!'
      });
    });
  } catch (error) {
    console.error('[2FA] Enable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable 2FA'
    });
  }
});

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA code during setup
 */
router.post('/verify', async (req, res) => {
  try {
    const { token, userId } = req.body;
    const actualUserId = req.user?.id || userId;
    
    if (!token || !actualUserId) {
      return res.status(400).json({
        success: false,
        error: 'Token and userId are required'
      });
    }
    
    const db = await dbPromise;
    
    db.get('SELECT two_factor_secret FROM users WHERE id = ?', [actualUserId], (err, user) => {
      if (err || !user || !user.two_factor_secret) {
        return res.status(400).json({
          success: false,
          error: '2FA not enabled for this user'
        });
      }
      
      const isValid = twoFactorAuthService.verifyToken(user.two_factor_secret, token);
      
      if (isValid) {
        res.json({
          success: true,
          message: '2FA verified successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid 2FA code'
        });
      }
    });
  } catch (error) {
    console.error('[2FA] Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify 2FA code'
    });
  }
});

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for user
 */
router.post('/disable', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { password } = req.body; // Require password confirmation
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // TODO: Verify password before disabling
    
    await twoFactorAuthService.disable2FA(userId);
    
    // Log action
    await auditService.logAuthentication({
      userId,
      action: '2fa_disabled',
      success: true,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('[2FA] Disable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable 2FA'
    });
  }
});

/**
 * POST /api/auth/2fa/login
 * Verify 2FA code during login
 */
router.post('/login', async (req, res) => {
  try {
    const { userId, token, backupCode } = req.body;
    
    if (!userId || (!token && !backupCode)) {
      return res.status(400).json({
        success: false,
        error: 'userId and token (or backupCode) are required'
      });
    }
    
    const isValid = await twoFactorAuthService.verify2FA(userId, token, backupCode);
    
    if (isValid) {
      // Log successful 2FA verification
      await auditService.logAuthentication({
        userId,
        action: '2fa_verified',
        success: true,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        success: true,
        message: '2FA verified successfully'
      });
    } else {
      // Log failed 2FA attempt
      await auditService.logAuthentication({
        userId,
        action: '2fa_verification_failed',
        success: false,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(400).json({
        success: false,
        error: 'Invalid 2FA code'
      });
    }
  } catch (error) {
    console.error('[2FA] Login verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify 2FA code'
    });
  }
});

module.exports = router;

