/**
 * PHASE S4.3 - Transfer Validators
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');

function validateTransfer(doc) {
  validateHeader(doc);
  // Transfer e document intern - fiscalHeader opțional
  validateFiscalHeader(doc.fiscalHeader || {}, { requireAll: false });

  if (!doc.fromLocationId || !doc.toLocationId) {
    throw new Error('Locațiile sursă și destinație sunt obligatorii pentru Transfer');
  }
  if (doc.fromLocationId === doc.toLocationId) {
    throw new Error('Locația sursă și destinația trebuie să fie diferite');
  }

  // PHASE S6.3 - Validate warehouses
  if (doc.fromWarehouseId && doc.toWarehouseId && doc.fromWarehouseId === doc.toWarehouseId) {
    throw new Error('Gestiunea sursă și destinația trebuie să fie diferite');
  }

  // PHASE S6.3 - Validate transport method
  if (doc.transportMethod) {
    const validMethods = ['internal', 'courier', 'own_vehicle'];
    if (!validMethods.includes(doc.transportMethod)) {
      throw new Error(`Metodă transport invalidă. Valide: ${validMethods.join(', ')}`);
    }
    if (doc.transportMethod === 'own_vehicle' && (!doc.driverName || !doc.vehicleInfo)) {
      throw new Error('Pentru transport cu vehicul propriu, șofer și mașină sunt obligatorii');
    }
  }

  // PHASE S6.3 - Validate estimated arrival
  if (doc.estimatedArrival && doc.date) {
    const estimatedDate = new Date(doc.estimatedArrival);
    const transferDate = new Date(doc.date);
    if (estimatedDate < transferDate) {
      throw new Error('Data estimată sosire nu poate fi înainte de data transferului');
    }
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Transfer trebuie să aibă cel puțin o linie');
  }
  
  // PHASE S6.3 - Auto-calculate totalItems
  if (!doc.totalItems) {
    doc.totalItems = doc.lines.length;
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

