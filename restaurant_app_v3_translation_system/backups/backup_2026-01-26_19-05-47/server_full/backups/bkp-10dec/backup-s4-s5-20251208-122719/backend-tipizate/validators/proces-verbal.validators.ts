/**
 * PHASE S5.1 - Proces Verbal Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateProcesVerbal(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.procesVerbalType || !['DIFFERENCE', 'LOSS', 'DAMAGE', 'THEFT', 'OTHER'].includes(doc.procesVerbalType)) {
    throw new Error('Tipul procesului verbal este obligatoriu (DIFFERENCE, LOSS, DAMAGE, THEFT, OTHER)');
  }
  if (!doc.reason) {
    throw new Error('Motivul procesului verbal este obligatoriu');
  }
  if (!doc.locationName) {
    throw new Error('Numele locației este obligatoriu pentru Proces Verbal');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Proces Verbal trebuie să aibă cel puțin o linie');
  }
  validateLines(doc.lines);

  // Validate responsible person if provided
  if (doc.responsiblePersonId && !doc.responsiblePersonName) {
    throw new Error('Numele persoanei responsabile este obligatoriu dacă responsiblePersonId este setat');
  }

  const totals = calculateTotals(doc.lines);

  return {
    ...doc,
    type: 'PROCES_VERBAL',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateProcesVerbal };
