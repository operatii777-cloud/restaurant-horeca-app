/**
 * PHASE S5.1 - Factură Validators
 * PHASE S6.1 - Added CUI validation and VAT validation
 */

const { validateHeader, validateLines, validateFiscalHeader, calculateTotals } = require('./tipizate.validators');
const { validateCUIOrThrow } = require('../utils/cuiValidator');

function validateFactura(doc) {
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  if (!doc.clientName) {
    throw new Error('Numele clientului este obligatoriu pentru Factură');
  }

  // PHASE S6.1 - Validate supplier CUI (obligatory)
  const supplierCUI = doc.fiscalHeader?.companyCUI || doc.supplierCUI;
  if (!supplierCUI) {
    throw new Error('CUI-ul furnizorului este obligatoriu pentru Factură');
  }
  validateCUIOrThrow(supplierCUI, 'CUI furnizor');

  // PHASE S6.1 - Validate client CUI (obligatory for B2B)
  const clientCUI = doc.clientCUI || doc.documentData?.clientCUI;
  if (clientCUI) {
    validateCUIOrThrow(clientCUI, 'CUI client');
  }

  // PHASE S6.3 - Validate factura type
  if (doc.facturaType === 'proforma' && doc.totals?.vatAmount && doc.totals.vatAmount > 0) {
    throw new Error('Factura proforma nu poate avea TVA');
  }

  // PHASE S6.3 - Validate sale type
  if (doc.saleType === 'b2b' && !clientCUI) {
    throw new Error('Factura B2B necesită CUI client');
  }

  // PHASE S6.3 - Validate IBAN format (dacă există)
  if (doc.bankAccountNumber) {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/;
    if (!ibanRegex.test(doc.bankAccountNumber.replace(/\s/g, ''))) {
      throw new Error('IBAN invalid. Format: RO12ABCD0000000000001');
    }
  }

  // PHASE S6.3 - Validate payment status
  if (doc.paymentStatus === 'paid' && doc.amountRemaining && doc.amountRemaining > 0.01) {
    throw new Error('Status plată "paid" dar sumă rămasă > 0');
  }
  if (doc.paymentStatus === 'partial' && (!doc.amountPaid || doc.amountPaid <= 0)) {
    throw new Error('Status plată "partial" dar sumă plătită <= 0');
  }
  if (doc.paymentStatus === 'unpaid' && doc.amountPaid && doc.amountPaid > 0.01) {
    throw new Error('Status plată "unpaid" dar sumă plătită > 0');
  }

  // PHASE S6.3 - Validate currency
  if (doc.currency && !['RON', 'EUR', 'USD'].includes(doc.currency)) {
    throw new Error('Monedă invalidă. Valide: RON, EUR, USD');
  }
  if (doc.currency && doc.currency !== 'RON' && (!doc.currencyRate || doc.currencyRate <= 0)) {
    throw new Error('Pentru monedă diferită de RON, cursul de schimb este obligatoriu');
  }

  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('Factura trebuie să aibă cel puțin o linie');
  }
  validateLines(doc.lines);

  const totals = calculateTotals(doc.lines);

  // PHASE S6.1 - Validate VAT calculation
  const calculatedVatAmount = doc.lines.reduce((sum, line) => {
    const lineTotal = (line.quantity || 0) * (line.unitPrice || 0);
    const vatRate = line.vatRate || 0;
    return sum + (lineTotal * vatRate / 100);
  }, 0);

  const providedVatAmount = totals.vatAmount || 0;
  const vatDifference = Math.abs(calculatedVatAmount - providedVatAmount);
  
  // Allow small rounding differences (0.01 RON)
  if (vatDifference > 0.01) {
    throw new Error(`Suma TVA calculată (${calculatedVatAmount.toFixed(2)}) nu corespunde cu suma TVA furnizată (${providedVatAmount.toFixed(2)})`);
  }

  // Validate VAT rates (must be valid Romanian rates: 0, 5, 9, 19, 24)
  const validVatRates = [0, 5, 9, 19, 24];
  doc.lines.forEach((line, index) => {
    const vatRate = line.vatRate || 0;
    if (!validVatRates.includes(vatRate)) {
      throw new Error(`Linia ${index + 1}: Cota TVA ${vatRate}% nu este validă. Cote valide: 0%, 5%, 9%, 19%, 24%`);
    }
  });

  // PHASE S6.3 - Auto-calculate amountRemaining if not set
  if (doc.paymentStatus && doc.totals?.total && doc.amountPaid !== null && doc.amountPaid !== undefined) {
    doc.amountRemaining = totals.total - doc.amountPaid;
    if (doc.amountRemaining < 0) doc.amountRemaining = 0;
  } else if (doc.paymentStatus === 'unpaid' && totals.total) {
    doc.amountRemaining = totals.total;
    doc.amountPaid = 0;
  } else if (doc.paymentStatus === 'paid' && totals.total) {
    doc.amountPaid = totals.total;
    doc.amountRemaining = 0;
  }

  // PHASE S6.3 - Set default currency to RON if not set
  if (!doc.currency) {
    doc.currency = 'RON';
    doc.currencyRate = 1;
  }

  return {
    ...doc,
    type: 'FACTURA',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

module.exports = { validateFactura };

