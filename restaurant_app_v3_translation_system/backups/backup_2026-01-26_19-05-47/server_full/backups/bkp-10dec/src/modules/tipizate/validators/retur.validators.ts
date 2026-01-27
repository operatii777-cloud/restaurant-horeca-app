/**
 * PHASE S5.1 - Retur Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateRetur(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.returType || !['SUPPLIER', 'CUSTOMER', 'INTERNAL'].includes(doc.returType)) {
    throw new Error('Tipul returului este obligatoriu (SUPPLIER, CUSTOMER, INTERNAL)');
  }
  if (!doc.reason) {
    throw new Error('Motivul returului este obligatoriu');
  }

  // Validate supplier/client based on returType
  if (doc.returType === 'SUPPLIER' && !doc.supplierId && !doc.supplierName) {
    throw new Error('Furnizorul este obligatoriu pentru retur către furnizor');
  }
  if (doc.returType === 'CUSTOMER' && !doc.clientId && !doc.clientName) {
    throw new Error('Clientul este obligatoriu pentru retur de la client');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Retur trebuie să aibă cel puțin o linie');
  }
  validateLines(doc.lines);

  // Validate original document if provided
  if (doc.originalDocumentId && !doc.originalDocumentType) {
    throw new Error('Tipul documentului original este obligatoriu dacă originalDocumentId este setat');
  }

  const totals = calculateTotals(doc.lines);

  return {
    ...doc,
    type: 'RETUR',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateRetur };

