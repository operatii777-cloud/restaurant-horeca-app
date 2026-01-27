/**
 * PHASE S5.1 - Raport X Validators
 */

const { validateHeader, validateFiscalHeader } = require('./tipizate.validators');

function validateRaportX(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.reportDate) {
    throw new Error('Data raportului este obligatorie pentru Raport X');
  }
  if (typeof doc.openingAmount !== 'number') {
    throw new Error('Suma inițială este obligatorie pentru Raport X');
  }
  if (typeof doc.closingAmount !== 'number') {
    throw new Error('Suma finală este obligatorie pentru Raport X');
  }

  if (!doc.entries || doc.entries.length === 0) {
    throw new Error('Raport X trebuie să aibă cel puțin o intrare');
  }

  // Calculate totals
  let totalSales = 0;
  let totalPayments = 0;

  doc.entries.forEach((entry, index) => {
    if (!entry.paymentMethod) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă o metodă de plată`);
    }
    if (typeof entry.count !== 'number' || entry.count < 0) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă un count valid`);
    }
    if (typeof entry.amount !== 'number' || entry.amount < 0) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă un amount valid`);
    }

    totalSales += entry.amount;
    totalPayments += entry.amount;
  });

  const variance = doc.closingAmount - (doc.openingAmount + totalSales - totalPayments);

  return {
    ...doc,
    type: 'RAPORT_X',
    status: doc.status || 'DRAFT',
    totals: {
      totalSales,
      totalPayments,
      variance,
    },
    version: doc.version || 1,
  };
}

module.exports = { validateRaportX };

