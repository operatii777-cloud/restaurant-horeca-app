/**
 * PHASE S5.1 - Registru Casă Validators
 */

const { validateHeader, validateFiscalHeader } = require('./tipizate.validators');

function validateRegistruCasa(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.startDate) {
    throw new Error('Data început este obligatorie pentru Registru de Casă');
  }
  if (!doc.endDate) {
    throw new Error('Data sfârșit este obligatorie pentru Registru de Casă');
  }
  if (doc.startDate > doc.endDate) {
    throw new Error('Data început trebuie să fie înainte de data sfârșit');
  }
  if (typeof doc.openingBalance !== 'number') {
    throw new Error('Soldul inițial este obligatoriu pentru Registru de Casă');
  }

  if (!doc.entries || doc.entries.length === 0) {
    throw new Error('Registru de Casă trebuie să aibă cel puțin o intrare');
  }

  // Calculate totals
  let totalIncome = 0;
  let totalExpenses = 0;
  let currentBalance = doc.openingBalance;

  doc.entries.forEach((entry, index) => {
    if (!entry.description) {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă o descriere`);
    }
    if (typeof entry.income !== 'number' && typeof entry.expense !== 'number') {
      throw new Error(`Intrarea ${index + 1} trebuie să aibă fie income, fie expense`);
    }
    if (entry.income && entry.expense) {
      throw new Error(`Intrarea ${index + 1} nu poate avea atât income cât și expense`);
    }

    const income = entry.income || 0;
    const expense = entry.expense || 0;
    totalIncome += income;
    totalExpenses += expense;
    currentBalance = currentBalance + income - expense;
    entry.balance = currentBalance;
  });

  const netBalance = totalIncome - totalExpenses;
  const closingBalance = doc.openingBalance + netBalance;

  return {
    ...doc,
    type: 'REGISTRU_CASA',
    status: doc.status || 'DRAFT',
    closingBalance,
    totals: {
      totalIncome,
      totalExpenses,
      netBalance,
    },
    version: doc.version || 1,
  };
}

module.exports = { validateRegistruCasa };

