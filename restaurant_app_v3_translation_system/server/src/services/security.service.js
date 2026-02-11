const bcrypt = require('bcryptjs');

/**
 * Security utilities for password hashing and validation
 */
class SecurityService {
    /**
     * Hash a password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    static async hashPassword(password) {
        const saltRounds = 12; // Higher = more secure but slower
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verify a password against a hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if password matches
     */
    static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Migrate existing plain text passwords to hashed passwords
     * @param {object} db - Database instance
     * @returns {Promise<{migrated: number, errors: number}>}
     */
    static async migratePasswords(db) {
        const results = { migrated: 0, errors: 0 };

        return new Promise((resolve, reject) => {
            // Get all users with plain text passwords (no $ prefix indicates bcrypt hash)
            db.all(`SELECT id, username, password FROM users WHERE password NOT LIKE '$2%'`, async (err, users) => {
                if (err) {
                    reject(err);
                    return;
                }

                for (const user of users) {
                    try {
                        const hashedPassword = await this.hashPassword(user.password);
                        await new Promise((res, rej) => {
                            db.run(
                                'UPDATE users SET password = ? WHERE id = ?',
                                [hashedPassword, user.id],
                                (updateErr) => {
                                    if (updateErr) rej(updateErr);
                                    else res();
                                }
                            );
                        });
                        results.migrated++;
                        console.log(`✅ Migrated password for user: ${user.username}`);
                    } catch (error) {
                        results.errors++;
                        console.error(`❌ Error migrating password for user ${user.username}:`, error);
                    }
                }

                resolve(results);
            });
        });
    }

    /**
     * Generate a secure random token
     * @param {number} length - Token length
     * @returns {string} Random token
     */
    static generateToken(length = 32) {
        const crypto = require('crypto');
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {{valid: boolean, errors: string[]}}
     */
    static validatePasswordStrength(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = SecurityService;
