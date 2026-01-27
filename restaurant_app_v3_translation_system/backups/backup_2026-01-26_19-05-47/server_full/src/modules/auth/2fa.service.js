/**
 * ENTERPRISE MODULE - Two-Factor Authentication (2FA) Service
 * 
 * Implements TOTP (Time-based One-Time Password) using RFC 6238
 * Compatible with Google Authenticator, Authy, Microsoft Authenticator, etc.
 */

const crypto = require('crypto');
const { dbPromise } = require('../../../database');

class TwoFactorAuthService {
  /**
   * Generate secret key for 2FA
   * @returns {String} Base32 encoded secret
   */
  generateSecret() {
    const secret = crypto.randomBytes(20);
    return this.base32Encode(secret);
  }

  /**
   * Generate QR code URL for authenticator app
   * @param {String} secret - Base32 encoded secret
   * @param {String} email - User email
   * @param {String} issuer - App name
   * @returns {String} otpauth:// URL
   */
  generateQRCodeURL(secret, email, issuer = 'Restaurant App') {
    const encodedEmail = encodeURIComponent(email);
    const encodedIssuer = encodeURIComponent(issuer);
    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Verify TOTP code
   * @param {String} secret - Base32 encoded secret
   * @param {String} token - 6-digit code from authenticator
   * @param {Number} window - Time window in steps (default: 1, allows ±30 seconds)
   * @returns {Boolean} True if token is valid
   */
  verifyToken(secret, token, window = 1) {
    const timeStep = Math.floor(Date.now() / 1000 / 30);
    
    for (let i = -window; i <= window; i++) {
      const step = timeStep + i;
      const expectedToken = this.generateTOTP(secret, step);
      if (expectedToken === token) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate TOTP code for a specific time step
   * @param {String} secret - Base32 encoded secret
   * @param {Number} timeStep - Time step (default: current)
   * @returns {String} 6-digit code
   */
  generateTOTP(secret, timeStep = null) {
    if (timeStep === null) {
      timeStep = Math.floor(Date.now() / 1000 / 30);
    }
    
    const key = this.base32Decode(secret);
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeUInt32BE(timeStep, 4);
    
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    const hash = hmac.digest();
    
    const offset = hash[hash.length - 1] & 0x0f;
    const code = ((hash[offset] & 0x7f) << 24) |
                 ((hash[offset + 1] & 0xff) << 16) |
                 ((hash[offset + 2] & 0xff) << 8) |
                 (hash[offset + 3] & 0xff);
    
    return String(code % 1000000).padStart(6, '0');
  }

  /**
   * Enable 2FA for user
   * @param {Number} userId - User ID
   * @param {String} secret - Base32 encoded secret
   * @returns {Promise<Object>} QR code URL and backup codes
   */
  async enable2FA(userId, secret) {
    const db = await dbPromise;
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    const backupCodesHash = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );
    
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET 
          two_factor_secret = ?,
          two_factor_enabled = 1,
          two_factor_backup_codes = ?
        WHERE id = ?
      `, [secret, JSON.stringify(backupCodesHash), userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            secret,
            backupCodes,
            enabled: true
          });
        }
      });
    });
  }

  /**
   * Disable 2FA for user
   * @param {Number} userId - User ID
   * @returns {Promise<Boolean>}
   */
  async disable2FA(userId) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET 
          two_factor_secret = NULL,
          two_factor_enabled = 0,
          two_factor_backup_codes = NULL
        WHERE id = ?
      `, [userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Verify 2FA code during login
   * @param {Number} userId - User ID
   * @param {String} token - 6-digit code
   * @param {String} backupCode - Backup code (alternative)
   * @returns {Promise<Boolean>}
   */
  async verify2FA(userId, token, backupCode = null) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT two_factor_secret, two_factor_backup_codes
        FROM users
        WHERE id = ? AND two_factor_enabled = 1
      `, [userId], async (err, user) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!user) {
          resolve(false);
          return;
        }
        
        // Try backup code first
        if (backupCode) {
          const backupCodes = JSON.parse(user.two_factor_backup_codes || '[]');
          const backupCodeHash = crypto.createHash('sha256').update(backupCode).digest('hex');
          
          if (backupCodes.includes(backupCodeHash)) {
            // Remove used backup code
            const updatedCodes = backupCodes.filter(code => code !== backupCodeHash);
            db.run(`
              UPDATE users 
              SET two_factor_backup_codes = ?
              WHERE id = ?
            `, [JSON.stringify(updatedCodes), userId]);
            
            resolve(true);
            return;
          }
        }
        
        // Verify TOTP token
        const isValid = this.verifyToken(user.two_factor_secret, token);
        resolve(isValid);
      });
    });
  }

  /**
   * Generate backup codes
   * @param {Number} count - Number of codes (default: 10)
   * @returns {Array<String>} Array of backup codes
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.match(/.{1,4}/g).join('-'));
    }
    return codes;
  }

  /**
   * Base32 encode
   * @param {Buffer} buffer - Buffer to encode
   * @returns {String} Base32 encoded string
   */
  base32Encode(buffer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    
    return output;
  }

  /**
   * Base32 decode
   * @param {String} str - Base32 encoded string
   * @returns {Buffer} Decoded buffer
   */
  base32Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output = [];
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i].toUpperCase();
      const index = alphabet.indexOf(char);
      
      if (index === -1) continue;
      
      value = (value << 5) | index;
      bits += 5;
      
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    
    return Buffer.from(output);
  }
}

module.exports = new TwoFactorAuthService();

