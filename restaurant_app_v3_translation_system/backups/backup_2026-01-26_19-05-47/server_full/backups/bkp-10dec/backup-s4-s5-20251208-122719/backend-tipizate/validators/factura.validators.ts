/**
 * PHASE S5.1 - Factură Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateFactura(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.clientName) {
    throw new Error('Numele clientului este obligatoriu pentru Factură');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Factura trebuie să aibă cel puțin o linie');
  }
  validateLines(doc.lines);

  const totals = calculateTotals(doc.lines);

  return {
    ...doc,
    type: 'FACTURA',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateFactura };

