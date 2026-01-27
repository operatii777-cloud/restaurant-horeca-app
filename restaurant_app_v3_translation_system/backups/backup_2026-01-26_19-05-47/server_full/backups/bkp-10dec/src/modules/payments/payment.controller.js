/**
 * PHASE S12 - Payment Controller
 * 
 * HTTP endpoints for payment operations.
 */

const paymentService = require('./payment.service');
const paymentMethods = require('./payment.methods');

class PaymentController {
  /**
   * GET /api/orders/:id/payments
   * Get all payments for an order
   */
  async getOrderPayments(req, res) {
    try {
      const { id } = req.params;
      const payments = await paymentService.getOrderPayments(Number(id));
      res.json({ payments });
    } catch (error) {
      console.error('[PaymentController] Error getting order payments:', error);
      res.status(500).json({ error: error.message || 'Eroare la încărcarea plăților' });
    }
  }

  /**
   * POST /api/orders/:id/payments
   * Create a new payment for an order
   */
  async createPayment(req, res) {
    try {
      const { id } = req.params;
      const { amount, currency, method, provider, reference, meta } = req.body;

      if (!amount || !method) {
        return res.status(400).json({ error: 'Suma și metoda de plată sunt obligatorii' });
      }

      const payment = await paymentService.createPayment(Number(id), {
        amount: Number(amount),
        currency: currency || 'RON',
        method,
        provider,
        reference,
        meta,
        created_by: req.user?.id || null,
      });

      res.status(201).json({ payment });
    } catch (error) {
      console.error('[PaymentController] Error creating payment:', error);
      res.status(400).json({ error: error.message || 'Eroare la crearea plății' });
    }
  }

  /**
   * GET /api/payments/:id
   * Get payment by ID
   */
  async getPayment(req, res) {
    try {
      const { id } = req.params;
      const paymentRepository = require('./payment.repository');
      const payment = await paymentRepository.getById(Number(id));

      if (!payment) {
        return res.status(404).json({ error: 'Plata nu există' });
      }

      res.json({ payment });
    } catch (error) {
      console.error('[PaymentController] Error getting payment:', error);
      res.status(500).json({ error: error.message || 'Eroare la încărcarea plății' });
    }
  }

  /**
   * POST /api/payments/:id/capture
   * Capture a payment (finalize it)
   */
  async capturePayment(req, res) {
    try {
      const { id } = req.params;
      const payment = await paymentService.capturePayment(Number(id));
      res.json({ payment });
    } catch (error) {
      console.error('[PaymentController] Error capturing payment:', error);
      res.status(400).json({ error: error.message || 'Eroare la finalizarea plății' });
    }
  }

  /**
   * POST /api/payments/:id/cancel
   * Cancel a payment
   */
  async cancelPayment(req, res) {
    try {
      const { id } = req.params;
      const payment = await paymentService.cancelPayment(Number(id));
      res.json({ payment });
    } catch (error) {
      console.error('[PaymentController] Error cancelling payment:', error);
      res.status(400).json({ error: error.message || 'Eroare la anularea plății' });
    }
  }

  /**
   * GET /api/payments/methods
   * Get available payment methods
   */
  async getPaymentMethods(req, res) {
    try {
      const methods = paymentMethods.getAllMethods();
      res.json({ methods });
    } catch (error) {
      console.error('[PaymentController] Error getting payment methods:', error);
      res.status(500).json({ error: 'Eroare la încărcarea metodelor de plată' });
    }
  }
}

module.exports = new PaymentController();

