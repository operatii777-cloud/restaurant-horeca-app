/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IDEMPOTENCY SERVICE - Protecție împotriva duplicate payments
 * 
 * Funcționalități:
 * - Generare idempotency keys
 * - Validare și deduplicare payments
 * - Storage în database cu TTL
 * - Returnează payment existent dacă key duplicat
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');
const crypto = require('crypto');

class IdempotencyService {
  /**
   * Generează un idempotency key unic
   * @param {Object} paymentData - Datele plății
   * @returns {string} Idempotency key
   */
  static generateKey(paymentData) {
    const { order_id, amount, method, timestamp } = paymentData;
    const hashInput = `${order_id}-${amount}-${method}-${timestamp || Date.now()}`;
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Verifică dacă un idempotency key există deja
   * @param {string} idempotencyKey - Key-ul de verificat
   * @returns {Promise<Object|null>} Payment existent sau null
   */
  static async checkKey(idempotencyKey) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          payment_id,
          order_id,
          amount,
          method,
          status,
          created_at
        FROM idempotency_keys
        WHERE idempotency_key = ?
          AND expires_at > datetime('now')
        ORDER BY created_at DESC
        LIMIT 1`,
        [idempotencyKey],
        (err, row) => {
          if (err) {
            console.error('❌ Error checking idempotency key:', err);
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Salvează un idempotency key cu payment asociat
   * @param {string} idempotencyKey - Key-ul
   * @param {number} paymentId - ID-ul payment-ului creat
   * @param {Object} paymentData - Datele plății
   * @param {number} ttlSeconds - Time-to-live în secunde (default: 24 ore)
   * @returns {Promise<void>}
   */
  static async saveKey(idempotencyKey, paymentId, paymentData, ttlSeconds = 86400) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
      
      db.run(
        `INSERT INTO idempotency_keys (
          idempotency_key,
          payment_id,
          order_id,
          amount,
          method,
          status,
          payment_data,
          expires_at,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          idempotencyKey,
          paymentId,
          paymentData.order_id,
          paymentData.amount,
          paymentData.method,
          paymentData.status || 'PENDING',
          JSON.stringify(paymentData),
          expiresAt
        ],
        function(err) {
          if (err) {
            console.error('❌ Error saving idempotency key:', err);
            reject(err);
          } else {
            console.log('✅ Idempotency key saved:', idempotencyKey);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Procesează un payment cu idempotency
   * @param {Object} paymentData - Datele plății
   * @param {string} providedKey - Idempotency key furnizat de client (opțional)
   * @param {Function} createPaymentFn - Funcție pentru crearea payment-ului
   * @returns {Promise<Object>} Payment creat sau existent
   */
  static async processWithIdempotency(paymentData, providedKey, createPaymentFn) {
    // Generează sau folosește key-ul furnizat
    const idempotencyKey = providedKey || this.generateKey(paymentData);
    
    // Verifică dacă key-ul există deja
    const existingPayment = await this.checkKey(idempotencyKey);
    
    if (existingPayment) {
      console.log('⚠️ Duplicate payment detected, returning existing payment:', existingPayment.payment_id);
      
      // Returnează payment-ul existent
      return {
        id: existingPayment.payment_id,
        order_id: existingPayment.order_id,
        amount: existingPayment.amount,
        method: existingPayment.method,
        status: existingPayment.status,
        created_at: existingPayment.created_at,
        idempotency_key: idempotencyKey,
        is_duplicate: true
      };
    }
    
    // Creează payment-ul nou
    const newPayment = await createPaymentFn();
    
    // Salvează idempotency key
    await this.saveKey(idempotencyKey, newPayment.id, paymentData);
    
    return {
      ...newPayment,
      idempotency_key: idempotencyKey,
      is_duplicate: false
    };
  }

  /**
   * Șterge idempotency keys expirate (cleanup)
   * @returns {Promise<number>} Numărul de keys șterse
   */
  static async cleanupExpiredKeys() {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM idempotency_keys
        WHERE expires_at < datetime('now')`,
        [],
        function(err) {
          if (err) {
            console.error('❌ Error cleaning up expired keys:', err);
            reject(err);
          } else {
            console.log(`✅ Cleaned up ${this.changes} expired idempotency keys`);
            resolve(this.changes);
          }
        }
      );
    });
  }
}

module.exports = IdempotencyService;
