/**
 * ENTERPRISE MODULE - AUTH
 * Phase: E9.7 - Auth Routes (Kiosk/Admin Login)
 * 
 * Handles authentication for both admin and kiosk users
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');
const crypto = require('crypto');
const authService = require('./auth.service');
const { validate, handleValidationErrors } = require('../../middleware/validation.middleware');
const { body } = require('express-validator');
const { verifyRefreshToken } = require('../../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting pentru login (previne brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // Max 5 încercări
  message: { success: false, error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/admin/auth/login
 * Authenticate user (admin or kiosk)
 * 
 * NOTE: Route is mounted directly (not under prefix), so full path is required
 */
router.post('/api/admin/auth/login', 
  loginLimiter,
  (req, res, next) => {
    // Log BEFORE validation
    console.log('🔐 [LOGIN] PRE-VALIDATION - req.body:', JSON.stringify(req.body));
    console.log('🔐 [LOGIN] PRE-VALIDATION - req.headers Content-Type:', req.headers['content-type']);
    next();
  },
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    console.log('🔐 [LOGIN] POST-VALIDATION - req.body raw:', JSON.stringify(req.body));
    console.log('🔐 [LOGIN] POST-VALIDATION - req.body keys:', Object.keys(req.body));
    const { username, password } = req.body;
    console.log('🔐 [LOGIN] Destructured - username:', username, 'password:', password);
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username și parola sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Caută utilizatorul în kiosk_users
    db.get(
      'SELECT * FROM kiosk_users WHERE username = ? AND is_active = 1',
      [username],
      async (err, user) => {
        if (err) {
          console.error('❌ Eroare la query utilizator KIOSK:', err);
          return res.status(500).json({ success: false, error: 'Eroare la autentificare' });
        }
        
        if (!user) {
          return res.status(401).json({ success: false, error: 'Credențiale invalide' });
        }
        
        // Verifică parola
        // Verifică formatul hash-ului (trebuie să fie salt:hash)
        if (!user.password_hash || !user.password_hash.includes(':')) {
          console.error('❌ Format hash invalid pentru utilizator:', user.username);
          return res.status(500).json({ success: false, error: 'Eroare la verificarea parolei' });
        }
        
        const [salt, hash] = user.password_hash.split(':');
        
        if (!salt || !hash) {
          console.error('❌ Salt sau hash lipsă pentru utilizator:', user.username);
          return res.status(500).json({ success: false, error: 'Eroare la verificarea parolei' });
        }
        
        const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        
        if (verifyHash !== hash) {
          console.log(`❌ Parolă incorectă pentru utilizator: ${user.username}`);
          return res.status(401).json({ success: false, error: 'Credențiale invalide' });
        }
        
        console.log(`✅ Autentificare reușită pentru utilizator: ${user.username}, rol: ${user.role}`);
        
        // Actualizează ultima autentificare
        db.run('UPDATE kiosk_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        // Log login history
        const deviceId = req.body.device_id || 'KIOSK_1';
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        
        db.run(
          'INSERT INTO kiosk_login_history (user_id, username, role, device_id, ip) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.username, user.role, deviceId, clientIp],
          function(err) {
            if (err) {
              console.error('❌ Eroare la logarea istoricului login:', err);
            } else {
              // Returnează login_history_id în răspuns
              const loginHistoryId = this.lastID;
              
              // Generează JWT tokens cu expirare
              const tokenPayload = {
                userId: user.id,
                username: user.username,
                role: user.role,
                loginHistoryId: loginHistoryId
              };
              
              const accessToken = authService.generateAccessToken(tokenPayload);
              const refreshToken = authService.generateRefreshToken({ userId: user.id });
              
              res.json({
                success: true,
                username: user.username,
                role: user.role,
                token: accessToken, // JWT access token
                refreshToken: refreshToken, // JWT refresh token
                full_name: user.full_name,
                login_history_id: loginHistoryId,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('❌ Eroare la login KIOSK:', error);
    res.status(500).json({ success: false, error: 'Eroare la autentificare' });
  }
});

/**
 * POST /api/admin/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/api/admin/auth/refresh', 
  verifyRefreshToken,
  async (req, res) => {
    try {
      const { userId } = req.refreshTokenData;
      
      // Generează access token nou
      const newAccessToken = authService.generateAccessToken({ 
        userId,
        username: req.refreshTokenData.username || null,
        role: req.refreshTokenData.role || null
      });
      
      res.json({
        success: true,
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      });
    } catch (error) {
      console.error('[Auth] Refresh token error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to refresh token' 
      });
    }
  }
);

/**
 * POST /api/admin/auth/logout
 * Logout (invalidate refresh token)
 * TODO: Implement token blacklist (Redis/DB) if needed
 */
router.post('/api/admin/auth/logout', 
  verifyRefreshToken,
  async (req, res) => {
    try {
      // TODO: Adaugă token în blacklist (Redis/DB)
      // await tokenBlacklist.add(req.refreshToken);
      
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Logout failed' 
      });
    }
  }
);

// Mount 2FA routes
const routes2FA = require('./routes.2fa');
router.use('/2fa', routes2FA);

// Mount SSO routes
const routesSSO = require('./routes.sso');
router.use('/sso', routesSSO);

module.exports = router;

