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

/**
 * POST /api/admin/auth/login
 * Authenticate user (admin or kiosk)
 * 
 * NOTE: Route is mounted directly (not under prefix), so full path is required
 */
router.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
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
              
              // Generează token
              const token = 'kiosk_' + Date.now() + '_' + crypto.randomBytes(16).toString('hex');
              
              res.json({
                success: true,
                username: user.username,
                role: user.role,
                token: token,
                full_name: user.full_name,
                login_history_id: loginHistoryId,
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

module.exports = router;

