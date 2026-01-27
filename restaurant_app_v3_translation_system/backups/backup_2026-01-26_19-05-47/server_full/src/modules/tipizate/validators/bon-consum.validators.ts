/**
 * PHASE S4.3 - Bon Consum Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateBonConsum(doc) {
  validateHeader(doc);
  // Bon Consum e document intern - nu e obligatoriu fiscalHeader complet
  validateFiscalHeader(doc.fiscalHeader || {}, { requireAll: false });

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

  // PHASE S6.3 - Validate warehouses
  if (doc.fromWarehouseId && doc.toWarehouseId && doc.fromWarehouseId === doc.toWarehouseId) {
    throw new Error('Gestiunea sursă și destinația trebuie să fie diferite');
  }

  // PHASE S6.3 - Validate consumption reason
  if (doc.consumptionReason) {
    const validReasons = ['kitchen_use', 'spoilage', 'sample', 'staff_meal', 'promotion', 'waste', 'other'];
    if (!validReasons.includes(doc.consumptionReason)) {
      throw new Error(`Motiv consum invalid. Valide: ${validReasons.join(', ')}`);
    }
    if (doc.consumptionReason === 'other' && (!doc.reason || doc.reason.trim() === '')) {
      throw new Error('Pentru motiv "other", câmpul reason este obligatoriu');
    }
  }

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

