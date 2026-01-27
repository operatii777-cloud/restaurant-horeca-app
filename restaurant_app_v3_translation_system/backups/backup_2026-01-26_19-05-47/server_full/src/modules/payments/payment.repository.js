/**
 * PHASE S12 - Payment Repository
 * 
 * Database operations for payments table.
 */

const { dbPromise } = require('../../../database');

class PaymentRepository {
  /**
   * Create a new payment
   */
  async create(paymentData) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const {
        order_id,
        amount,
        currency = 'RON',
        method,
        provider = null,
        reference = null,
        status = 'PENDING',
        created_by = null,
        meta = null,
      } = paymentData;

      const metaJson = meta ? JSON.stringify(meta) : null;

      db.run(
        `INSERT INTO payments (
          order_id, amount, currency, method, provider, reference,
          status, created_by, meta, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [order_id, amount, currency, method, provider, reference, status, created_by, metaJson],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...paymentData });
          }
        }
      );
    });
  }

  /**
   * Get payment by ID
   */
  async getById(paymentId) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.meta) {
            try {
              row.meta = JSON.parse(row.meta);
            } catch (e) {
              row.meta = null;
            }
          }
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all payments for an order
   */
  async getByOrderId(orderId) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at ASC',
        [orderId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const payments = rows.map((row) => {
              if (row.meta) {
                try {
                  row.meta = JSON.parse(row.meta);
                } catch (e) {
                  row.meta = null;
                }
              }
              return row;
            });
            resolve(payments);
          }
        }
      );
    });
  }

  /**
   * Update payment status
   */
  async updateStatus(paymentId, status, reference = null) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE payments SET status = ?, reference = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, reference, paymentId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: paymentId, status, reference });
          }
        }
      );
    });
  }

  /**
   * Cancel payment
   */
  async cancel(paymentId) {
    return this.updateStatus(paymentId, 'CANCELLED');
  }

  /**
   * Get total paid for an order (sum of CAPTURED payments)
   */
  async getTotalPaid(orderId) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE order_id = ? AND status = ?',
        [orderId, 'CAPTURED'],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row?.total || 0);
          }
        }
      );
    });
  }

  /**
   * Get payment summary for an order (e.g., "CASH 50 + CARD 30")
   */
  async getPaymentSummary(orderId) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT method, SUM(amount) as total 
         FROM payments 
         WHERE order_id = ? AND status = 'CAPTURED' 
         GROUP BY method`,
        [orderId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const summary = rows.map((r) => `${r.method} ${r.total.toFixed(2)}`).join(' + ');
            resolve(summary || '');
          }
        }
      );
    });
  }
}

module.exports = new PaymentRepository();

