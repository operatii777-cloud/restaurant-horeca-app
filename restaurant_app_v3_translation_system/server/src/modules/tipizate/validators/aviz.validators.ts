/**
 * PHASE S5.1 - Aviz Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateAviz(doc) {
  validateHeader(doc);
  // Aviz poate fi extern sau intern - fiscalHeader opțional
  validateFiscalHeader(doc.fiscalHeader || {}, { requireAll: false });

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Aviz trebuie să aibă cel puțin o linie');
  }
  validateLines(doc.lines);

  // Validate destination if provided
  if (doc.destinationLocationId && !doc.destinationLocationName) {
    throw new Error('Numele locației destinație este obligatoriu dacă destinationLocationId este setat');
  }

  const totals = calculateTotals(doc.lines);

  return {
    ...doc,
    type: 'AVIZ',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateAviz };

