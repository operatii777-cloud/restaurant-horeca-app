/**
 * PHASE S5.1 - Raport Gestiune Validators
 */

const { validateHeader, validateFiscalHeader } = require('./tipizate.validators');

function validateRaportGestiune(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.periodStart) {
    throw new Error('Perioada început este obligatorie pentru Raport Gestiune');
  }
  if (!doc.periodEnd) {
    throw new Error('Perioada sfârșit este obligatorie pentru Raport Gestiune');
  }
  if (doc.periodStart > doc.periodEnd) {
    throw new Error('Perioada început trebuie să fie înainte de perioada sfârșit');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Raport Gestiune trebuie să aibă cel puțin o linie');
  }

  // Calculate totals
  let openingStockValue = 0;
  let receivedValue = 0;
  let consumedValue = 0;
  let transferredValue = 0;
  let adjustedValue = 0;
  let closingStockValue = 0;

  doc.lines.forEach((line, index) => {
    if (!line.ingredientId) {
      throw new Error(`Linia ${index + 1} trebuie să aibă un ingredientId`);
    }
    if (typeof line.openingStock !== 'number') {
      throw new Error(`Linia ${index + 1} trebuie să aibă openingStock`);
    }
    if (typeof line.closingStock !== 'number') {
      throw new Error(`Linia ${index + 1} trebuie să aibă closingStock`);
    }

    openingStockValue += line.openingStock * (line.unitPrice || 0);
    receivedValue += (line.received || 0) * (line.unitPrice || 0);
    consumedValue += (line.consumed || 0) * (line.unitPrice || 0);
    transferredValue += (line.transferred || 0) * (line.unitPrice || 0);
    adjustedValue += (line.adjusted || 0) * (line.unitPrice || 0);
    closingStockValue += line.closingStock * (line.unitPrice || 0);

    line.stockValue = line.closingStock * (line.unitPrice || 0);
  });

  const variance = closingStockValue - (openingStockValue + receivedValue - consumedValue - transferredValue + adjustedValue);

  return {
    ...doc,
    type: 'RAPORT_GESTIUNE',
    status: doc.status || 'DRAFT',
    totals: {
      openingStockValue,
      receivedValue,
      consumedValue,
      transferredValue,
      adjustedValue,
      closingStockValue,
      variance,
    },
    version: doc.version || 1,
  };
}

module.exports = { validateRaportGestiune };

