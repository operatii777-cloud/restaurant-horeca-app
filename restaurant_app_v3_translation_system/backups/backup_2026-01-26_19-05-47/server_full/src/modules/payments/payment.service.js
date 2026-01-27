/**
 * PHASE S12 - Payment Service
 * 
 * Business logic for payment operations.
 */

const paymentRepository = require('./payment.repository');
const paymentValidators = require('./payment.validators');
const paymentMethods = require('./payment.methods');
const IdempotencyService = require('./idempotency.service');
const { dbPromise } = require('../../../database');
// PHASE PRODUCTION-READY: Use centralized validators and error handler
const { validatePayment } = require('../../utils/validators');
const { AppError, createNotFoundError, createBusinessRuleError } = require('../../utils/error-handler');
// Order events - try to load, fallback to null if fails
let emitOrderEvent = null;
try {
  const orderEvents = require('../orders/order.events');
  emitOrderEvent = orderEvents.emitOrderEvent || (() => {});
} catch (error) {
  console.warn('⚠️ Order events not available - continuing without event emission');
  emitOrderEvent = () => {};
}

class PaymentService {
  /**
   * Create a payment for an order (with idempotency support)
   */
  async createPayment(orderId, paymentData, idempotencyKey = null) {
    const db = await dbPromise;

    // Get order
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!order) {
      throw createNotFoundError('Order', orderId);
    }

    // PHASE PRODUCTION-READY: Use centralized validators
    const paymentValidation = validatePayment({
      order_id: orderId,
      amount: paymentData.amount,
      method: paymentData.method
    });

    if (!paymentValidation.valid) {
      throw new AppError(
        paymentValidation.errors.join(', '),
        400,
        'VALIDATION_ERROR',
        paymentValidation.errors
      );
    }

    // Validate order is payable (business rule)
    const orderValidation = paymentValidators.validateOrderPayable(order);
    if (!orderValidation.valid) {
      throw createBusinessRuleError(orderValidation.error);
    }

    // Get already paid amount
    const alreadyPaid = await paymentRepository.getTotalPaid(orderId);

    // Validate amount (business rule)
    const amountValidation = paymentValidators.validateAmount(
      paymentData.amount,
      Number(order.total || 0),
      alreadyPaid
    );
    if (!amountValidation.valid) {
      throw createBusinessRuleError(amountValidation.error);
    }

    // Validate method (business rule)
    const availableMethods = paymentMethods.getAllMethods().map((m) => m.key);
    const methodValidation = paymentValidators.validateMethod(paymentData.method, availableMethods);
    if (!methodValidation.valid) {
      throw createBusinessRuleError(methodValidation.error);
    }

    // Create payment with idempotency
    const paymentDataWithTimestamp = {
      ...paymentData,
      order_id: orderId,
      timestamp: Date.now()
    };

    const payment = await IdempotencyService.processWithIdempotency(
      paymentDataWithTimestamp,
      idempotencyKey,
      async () => {
        // Create payment
        const newPayment = await paymentRepository.create({
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
          await this.capturePayment(newPayment.id);
        }

        return newPayment;
      }
    );

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

