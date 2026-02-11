const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Multi-Factor Authentication Service
 */
class MFAService {
    /**
     * Generate MFA secret for a user
     * @param {string} username - Username
     * @returns {Promise<{secret: string, qrCode: string}>}
     */
    static async generateMFASecret(username) {
        const secret = speakeasy.generateSecret({
            name: `Restaurant App (${username})`,
            issuer: 'Restaurant Management System v3'
        });

        // Generate QR code for easy scanning
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        return {
            secret: secret.base32,
            qrCode
        };
    }

    /**
     * Enable MFA for a user
     * @param {number} userId - User ID
     * @param {string} secret - MFA secret
     * @returns {Promise<void>}
     */
    static async enableMFA(userId, secret) {
        const db = await dbPromise;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET mfa_secret = ?, mfa_enabled = 1 WHERE id = ?`,
                [secret, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Disable MFA for a user
     * @param {number} userId - User ID
     * @returns {Promise<void>}
     */
    static async disableMFA(userId) {
        const db = await dbPromise;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET mfa_secret = NULL, mfa_enabled = 0 WHERE id = ?`,
                [userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Verify MFA token
     * @param {string} secret - User's MFA secret
     * @param {string} token - 6-digit token from authenticator app
     * @returns {boolean} True if token is valid
     */
    static verifyToken(secret, token) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps before/after for clock drift
        });
    }

    /**
     * Check if user has MFA enabled
     * @param {number} userId - User ID
     * @returns {Promise<{enabled: boolean, secret: string|null}>}
     */
    static async getMFAStatus(userId) {
        const db = await dbPromise;

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT mfa_enabled, mfa_secret FROM users WHERE id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve({
                        enabled: row?.mfa_enabled === 1,
                        secret: row?.mfa_secret || null
                    });
                }
            );
        });
    }

    /**
     * Generate backup codes for MFA
     * @param {number} userId - User ID
     * @returns {Promise<string[]>} Array of backup codes
     */
    static async generateBackupCodes(userId) {
        const crypto = require('crypto');
        const codes = [];

        // Generate 10 backup codes
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }

        const db = await dbPromise;

        // Store hashed backup codes
        const hashedCodes = codes.map(code =>
            crypto.createHash('sha256').update(code).digest('hex')
        );

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET mfa_backup_codes = ? WHERE id = ?`,
                [JSON.stringify(hashedCodes), userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        return codes;
    }

    /**
     * Verify backup code
     * @param {number} userId - User ID
     * @param {string} code - Backup code
     * @returns {Promise<boolean>} True if code is valid
     */
    static async verifyBackupCode(userId, code) {
        const crypto = require('crypto');
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        const db = await dbPromise;

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT mfa_backup_codes FROM users WHERE id = ?`,
                [userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!row?.mfa_backup_codes) {
                        resolve(false);
                        return;
                    }

                    const codes = JSON.parse(row.mfa_backup_codes);
                    const index = codes.indexOf(hashedCode);

                    if (index === -1) {
                        resolve(false);
                        return;
                    }

                    // Remove used backup code
                    codes.splice(index, 1);

                    db.run(
                        `UPDATE users SET mfa_backup_codes = ? WHERE id = ?`,
                        [JSON.stringify(codes), userId],
                        (updateErr) => {
                            if (updateErr) reject(updateErr);
                            else resolve(true);
                        }
                    );
                }
            );
        });
    }
}

module.exports = MFAService;
