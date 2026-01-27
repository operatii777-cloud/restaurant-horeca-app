/**
 * PHASE S5.1 - Raport Lunar Validators
 */

const { validateHeader, validateFiscalHeader } = require('./tipizate.validators');

function validateRaportLunar(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (typeof doc.month !== 'number' || doc.month < 1 || doc.month > 12) {
    throw new Error('Luna trebuie să fie între 1 și 12 pentru Raport Lunar');
  }
  if (typeof doc.year !== 'number' || doc.year < 2000 || doc.year > 2100) {
    throw new Error('Anul trebuie să fie valid pentru Raport Lunar');
  }

  if (!doc.entries || doc.entries.length === 0) {
    throw new Error('Raport Lunar trebuie să aibă cel puțin o intrare');
  }

  // Calculate totals
  let totalSales = 0;
  let totalVat = 0;
  let totalDocuments = doc.entries.length;
  const breakdownByType = {};

  doc.entries.forEach((entry, index) => {
    if (!entry.date) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă o dată`);
    }
    if (!entry.documentType) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă un tip de document`);
    }
    if (!entry.documentNumber) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă un număr de document`);
    }
    if (typeof entry.amount !== 'number' || entry.amount < 0) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă un amount valid`);
    }
    if (typeof entry.vatAmount !== 'number' || entry.vatAmount < 0) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă un vatAmount valid`);
    }

    totalSales += entry.amount;
    totalVat += entry.vatAmount;

    if (!breakdownByType[entry.documentType]) {
      breakdownByType[entry.documentType] = {
        count: 0,
        amount: 0,
        vatAmount: 0,
      };
    }
    breakdownByType[entry.documentType].count++;
    breakdownByType[entry.documentType].amount += entry.amount;
    breakdownByType[entry.documentType].vatAmount += entry.vatAmount;
  });

  return {
    ...doc,
    type: 'RAPORT_LUNAR',
    status: doc.status || 'DRAFT',
    totals: {
      totalSales,
      totalVat,
      totalDocuments,
      breakdownByType,
    },
    version: doc.version || 1,
  };
}

module.exports = { validateRaportLunar };

