/**
 * PHASE S4.3 - Waste Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateWaste(doc) {
  validateHeader(doc);
  // Waste e document intern - fiscalHeader opțional
  validateFiscalHeader(doc.fiscalHeader || {}, { requireAll: false });

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Waste trebuie să aibă cel puțin o linie');
  }
  
  // Validare cantitate pozitivă
  doc.lines.forEach((line, index) => {
    if (line.quantity <= 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea trebuie să fie pozitivă`);
    }
    if (!line.ingredientId && !line.ingredientName) {
      throw new Error(`Linia ${index + 1}: Ingredientul este obligatoriu`);
    }
  });
  
  validateLines(doc.lines);

  const totals = calculateTotals(doc.lines);

  return {
    ...doc,
    type: 'WASTE',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateWaste };

