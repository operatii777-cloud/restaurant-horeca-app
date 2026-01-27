/**
 * PHASE S12 - Payment Service
 * 
 * Business logic for payment operations.
 */

const paymentRepository = require('./payment.repository');
const paymentValidators = require('./payment.validators');
const paymentMethods = require('./payment.methods');
const dbPromise = require('../../../database.js');
const { emitOrderEvent } = require('../../orders/order.events');

class PaymentService {
  /**
   * Create a payment for an order
   */
  async createPayment(orderId, paymentData) {
    const db = await dbPromise;

    // Get order
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!order) {
      throw new Error('Comanda nu există');
    }

    // Validate order is payable
    const orderValidation = paymentValidators.validateOrderPayable(order);
    if (!orderValidation.valid) {
      throw new Error(orderValidation.error);
    }

    // Get already paid amount
    const alreadyPaid = await paymentRepository.getTotalPaid(orderId);

    // Validate amount
    const amountValidation = paymentValidators.validateAmount(
      paymentData.amount,
      Number(order.total || 0),
      alreadyPaid
    );
    if (!amountValidation.valid) {
      throw new Error(amountValidation.error);
    }

    // Validate method
    const availableMethods = paymentMethods.getAllMethods().map((m) => m.key);
    const methodValidation = paymentValidators.validateMethod(paymentData.method, availableMethods);
    if (!methodValidation.valid) {
      throw new Error(methodValidation.error);
    }

    // Create payment
    const payment = await paymentRepository.create({
      order_id: orderId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'RON',
      method: paymentData.method,
      provider: paymentData.provider || null,
      reference: paymentData.reference || null,
      status: paymentData.status || 'PENDING',
      created_by: paymentData.created_by || null,
      meta: paymentData.meta || null,
    });

    // Auto-capture if method doesn't need external flow
    if (!paymentMethods.needsExternalFlow(paymentData.method)) {
      await this.capturePayment(payment.id);
    }

    return payment;
  }

  /**
   * Capture a payment (finalize it)
   */
  async capturePayment(paymentId) {
    const payment = await paymentRepository.getById(paymentId);
    if (!payment) {
      throw new Error('Plata nu există');
    }

    if (payment.status === 'CAPTURED') {
      return payment; // Already captured
    }

    if (payment.status === 'CANCELLED') {
      throw new Error('Plata este anulată');
    }

    // Update status to CAPTURED
    await paymentRepository.updateStatus(paymentId, 'CAPTURED', payment.reference);

    // Update order totals
    await this.updateOrderPaymentStatus(payment.order_id);

    return await paymentRepository.getById(paymentId);
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId) {
    const payment = await paymentRepository.getById(paymentId);
    if (!payment) {
      throw new Error('Plata nu există');
    }

    if (payment.status === 'CAPTURED') {
      throw new Error('Nu poți anula o plată finalizată. Folosește refund.');
    }

    await paymentRepository.cancel(paymentId);

    // Update order totals
    await this.updateOrderPaymentStatus(payment.order_id);

    return await paymentRepository.getById(paymentId);
  }

  /**
   * Update order payment status (total_paid, is_paid, payment_summary)
   */
  async updateOrderPaymentStatus(orderId) {
    const db = await dbPromise;

    // Get total paid
    const totalPaid = await paymentRepository.getTotalPaid(orderId);

    // Get payment summary
    const paymentSummary = await paymentRepository.getPaymentSummary(orderId);

    // Get order total
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT total FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const orderTotal = Number(order?.total || 0);
    const tolerance = 0.01; // Allow 1 cent tolerance
    const isPaid = totalPaid >= orderTotal - tolerance;

    // Update order
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders 
         SET total_paid = ?, 
             is_paid = ?, 
             payment_summary = ?,
             paid_timestamp = CASE WHEN ? = 1 AND paid_timestamp IS NULL THEN CURRENT_TIMESTAMP ELSE paid_timestamp END
         WHERE id = ?`,
        [totalPaid, isPaid ? 1 : 0, paymentSummary, isPaid ? 1 : 0, orderId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Emit order:paid event if order is now paid
    if (isPaid) {
      const fullOrder = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (fullOrder) {
        emitOrderEvent('order:paid', {
          order: fullOrder,
          totalPaid,
          paymentSummary,
        });
      }
    }

    return { totalPaid, isPaid, paymentSummary };
  }

  /**
   * Get payments for an order
   */
  async getOrderPayments(orderId) {
    return paymentRepository.getByOrderId(orderId);
  }
}

module.exports = new PaymentService();

