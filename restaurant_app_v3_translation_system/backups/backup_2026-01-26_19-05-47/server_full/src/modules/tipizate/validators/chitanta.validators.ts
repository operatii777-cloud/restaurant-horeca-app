/**
 * PHASE S5.1 - Chitanță Validators
 * PHASE S6.1 - Added amount validation and amountInWords requirement
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');
const { numberToWords } = require('../utils/numberToWords.js');

function validateChitanta(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.clientName) {
    throw new Error('Numele clientului este obligatoriu pentru Chitanță');
  }
  if (!doc.paymentMethod) {
    throw new Error('Metoda de plată este obligatorie pentru Chitanță');
  }
  if (!doc.paymentDate) {
    throw new Error('Data plății este obligatorie pentru Chitanță');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Chitanța trebuie să aibă cel puțin o linie');
  }
  validateLines(doc.lines);

  const totals = calculateTotals(doc.lines);

  // PHASE S6.1 - Validate total amount > 0
  if (!totals.total || totals.total <= 0) {
    throw new Error('Suma chitanței trebuie să fie mai mare decât zero');
  }

  // PHASE S6.3 - Validate payment method
  const validPaymentMethods = ['cash', 'card', 'transfer', 'check'];
  if (doc.paymentMethod && !validPaymentMethods.includes(doc.paymentMethod)) {
    throw new Error(`Metoda de plată invalidă. Valide: ${validPaymentMethods.join(', ')}`);
  }

  // PHASE S6.3 - Validate payment status
  if (doc.paymentStatus && !['partial', 'complete'].includes(doc.paymentStatus)) {
    throw new Error('Status plată invalid. Valide: partial, complete');
  }

  // PHASE S6.3 - Auto-calculate amountCredited and changeAmount
  if (doc.amountReceived !== null && doc.amountReceived !== undefined) {
    if (doc.amountReceived < totals.total) {
      throw new Error(`Suma primită (${doc.amountReceived}) este mai mică decât suma chitanței (${totals.total})`);
    }
    doc.amountCredited = totals.total;
    doc.changeAmount = doc.amountReceived - totals.total;
    if (doc.changeAmount < 0) doc.changeAmount = 0;
    
    // Auto-set paymentStatus
    if (!doc.paymentStatus) {
      doc.paymentStatus = 'complete';
    }
  } else {
    // Set default amountReceived = total
    doc.amountReceived = totals.total;
    doc.amountCredited = totals.total;
    doc.changeAmount = 0;
    doc.paymentStatus = 'complete';
  }

  // PHASE S6.3 - Validate IBAN format (dacă există)
  if (doc.bankAccountNumber) {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/;
    if (!ibanRegex.test(doc.bankAccountNumber.replace(/\s/g, ''))) {
      throw new Error('IBAN invalid. Format: RO12ABCD0000000000001');
    }
  }

  // PHASE S6.1 - Ensure amountInWords is set (obligatory legal requirement)
  const documentData = doc.documentData || {};
  if (!documentData.amountInWords) {
    // Auto-generate if missing
    documentData.amountInWords = numberToWords(totals.total);
  }

  return {
    ...doc,
    type: 'CHITANTA',
    status: doc.status || 'DRAFT',
    totals,
    documentData,
    version: doc.version || 1,
  };
}

module.exports = { validateChitanta };

