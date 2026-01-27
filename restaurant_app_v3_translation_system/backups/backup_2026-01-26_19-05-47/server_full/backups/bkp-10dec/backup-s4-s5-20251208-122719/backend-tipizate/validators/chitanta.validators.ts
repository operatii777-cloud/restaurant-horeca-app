/**
 * PHASE S5.1 - Chitanță Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

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

  return {
    ...doc,
    type: 'CHITANTA',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateChitanta };

