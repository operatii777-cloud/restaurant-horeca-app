/**
 * PHASE S12 - Payment Validators
 * 
 * Validation logic for payments.
 */

/**
 * Validate payment amount
 */
function validateAmount(amount, orderTotal, alreadyPaid = 0, tolerance = 0.01) {
  if (typeof amount !== 'number' || amount <= 0) {
    return { valid: false, error: 'Suma trebuie să fie un număr pozitiv' };
  }

  const remaining = orderTotal - alreadyPaid;
  const maxAllowed = remaining + tolerance;

  if (amount > maxAllowed) {
    return {
      valid: false,
      error: `Suma (${amount.toFixed(2)}) depășește restul de plată (${remaining.toFixed(2)})`,
    };
  }

  return { valid: true };
}

/**
 * Validate payment method
 */
function validateMethod(method, availableMethods) {
  if (!method) {
    return { valid: false, error: 'Metoda de plată este obligatorie' };
  }

  if (!availableMethods.includes(method)) {
    return { valid: false, error: `Metoda de plată "${method}" nu este disponibilă` };
  }

  return { valid: true };
}

/**
 * Validate order is payable
 */
function validateOrderPayable(order) {
  if (!order) {
    return { valid: false, error: 'Comanda nu există' };
  }

  if (order.status === 'cancelled') {
    return { valid: false, error: 'Comanda este anulată' };
  }

  if (order.is_paid && Number(order.total_paid || 0) >= Number(order.total || 0)) {
    return { valid: false, error: 'Comanda este deja plătită complet' };
  }

  return { valid: true };
}

module.exports = {
  validateAmount,
  validateMethod,
  validateOrderPayable,
};

