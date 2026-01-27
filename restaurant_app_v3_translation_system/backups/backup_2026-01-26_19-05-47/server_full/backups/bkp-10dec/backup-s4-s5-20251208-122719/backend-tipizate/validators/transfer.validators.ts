/**
 * PHASE S4.3 - Transfer Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateTransfer(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.fromLocationId || !doc.toLocationId) {
    throw new Error('Locațiile sursă și destinație sunt obligatorii pentru Transfer');
  }
  if (doc.fromLocationId === doc.toLocationId) {
    throw new Error('Locația sursă și destinația trebuie să fie diferite');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Transfer trebuie să aibă cel puțin o linie');
  }
  
  // PHASE S5.5 - Validare transfer fără loturi (dacă e necesar)
  doc.lines.forEach((line, index) => {
    if (line.quantity <= 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea trebuie să fie pozitivă`);
    }
    if (!line.productId && !line.productName) {
      throw new Error(`Linia ${index + 1}: Produsul este obligatoriu`);
    }
    // Notă: batchNumber este opțional pentru transfer, dar dacă există, trebuie să fie valid
    if (line.batchNumber && line.batchNumber.trim() === '') {
      throw new Error(`Linia ${index + 1}: Numărul lotului nu poate fi gol dacă este specificat`);
    }
  });
  
  validateLines(doc.lines);

  const totals = calculateTotals(doc.lines);

  return {
    ...doc,
    type: 'TRANSFER',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateTransfer };

