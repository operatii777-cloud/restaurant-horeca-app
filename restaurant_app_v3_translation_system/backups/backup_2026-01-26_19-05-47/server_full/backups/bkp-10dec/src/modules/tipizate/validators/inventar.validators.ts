/**
 * PHASE S4.3 - Inventar Validators
 */

const { validateHeader, validateFiscalHeader } = require('./tipizate.validators');

function validateInventar(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.inventoryType || !['FULL', 'PARTIAL', 'CYCLE'].includes(doc.inventoryType)) {
    throw new Error('Tipul inventarului este obligatoriu (FULL, PARTIAL, CYCLE)');
  }
  if (!doc.startDate) {
    throw new Error('Data început inventar este obligatorie');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Inventar trebuie să aibă cel puțin o linie');
  }
  
  // PHASE S5.5 - Validare inventar cu cantități negative
  doc.lines.forEach((line, index) => {
    if (line.physicalQuantity < 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea fizică nu poate fi negativă`);
    }
    if (line.bookQuantity < 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea din carte nu poate fi negativă`);
    }
    if (!line.productId && !line.productName) {
      throw new Error(`Linia ${index + 1}: Produsul este obligatoriu`);
    }
    if (line.unitPrice < 0) {
      throw new Error(`Linia ${index + 1}: Prețul unitar nu poate fi negativ`);
    }
  });

  // Calculate totals for inventory
  let bookTotal = 0;
  let physicalTotal = 0;
  let differenceTotal = 0;
  const vatMap = new Map();

  doc.lines.forEach((line) => {
    bookTotal += line.bookQuantity * line.unitPrice;
    physicalTotal += line.physicalQuantity * line.unitPrice;
    differenceTotal += line.difference * line.unitPrice;

    const lineTotalWithoutVat = line.physicalQuantity * line.unitPrice;
    const lineVat = (lineTotalWithoutVat * line.vatRate) / 100;
    const existing = vatMap.get(line.vatRate) || { base: 0, vat: 0 };
    vatMap.set(line.vatRate, {
      base: existing.base + lineTotalWithoutVat,
      vat: existing.vat + lineVat,
    });
  });

  const totalVat = Array.from(vatMap.values()).reduce((sum, v) => sum + v.vat, 0);
  const subtotal = physicalTotal;
  const total = subtotal + totalVat;

  const vatBreakdown = Array.from(vatMap.entries()).map(([vatRate, amounts]) => ({
    vatRate,
    baseAmount: amounts.base,
    vatAmount: amounts.vat,
  }));

  return {
    ...doc,
    type: 'INVENTAR',
    status: doc.status || 'DRAFT',
    totals: {
      subtotal,
      vatAmount: totalVat,
      total,
      bookTotal,
      physicalTotal,
      differenceTotal,
      vatBreakdown,
    },
    version: doc.version || 1,
  };
}

module.exports = { validateInventar };

