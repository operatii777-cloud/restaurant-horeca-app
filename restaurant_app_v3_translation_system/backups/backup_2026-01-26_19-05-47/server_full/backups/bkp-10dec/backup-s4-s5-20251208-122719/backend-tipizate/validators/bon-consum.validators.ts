/**
 * PHASE S4.3 - Bon Consum Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateBonConsum(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Bon Consum trebuie să aibă cel puțin o linie');
  }
  
  // PHASE S5.5 - Validare consum negativ
  doc.lines.forEach((line, index) => {
    if (line.quantity <= 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea trebuie să fie pozitivă (consum negativ nu este permis)`);
    }
    if (!line.productId && !line.productName) {
      throw new Error(`Linia ${index + 1}: Produsul este obligatoriu`);
    }
  });
  
  validateLines(doc.lines);

  const totals = calculateTotals(doc.lines);

  return {
    ...doc,
    type: 'BON_CONSUM',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateBonConsum };

