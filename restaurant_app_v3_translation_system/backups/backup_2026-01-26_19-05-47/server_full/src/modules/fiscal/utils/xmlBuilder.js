/**
 * PHASE E10.2 - XML Builder
 * PHASE S8.1 - Wrapper over UBL Core for backward compatibility
 * 
 * Builds UBL 2.1 compliant XML invoices.
 * 
 * NOTE: This file is kept for backward compatibility.
 * New code should use server/src/modules/ubl directly.
 */

const { buildUblInvoice } = require('../../ubl');
const { escapeXML } = require('./receiptFormatter');

/**
 * Build UBL 2.1 Invoice XML
 * 
 * @deprecated Use buildUblInvoice from server/src/modules/ubl directly
 */
function buildUBLInvoice({ order, client, company, invoiceId, issueDate }) {
  // PHASE S8.1 - Map to InvoiceDTO and use UBL Core
  const invoiceLines = order.items.map((item, index) => {
    const lineExtensionAmount = item.price * item.quantity;
    const vatRate = item.vat_rate || 19;
    
    return {
      name: item.product_name || `Product ${index + 1}`,
      quantity: item.quantity,
      unitPrice: item.price,
      lineExtensionAmount: lineExtensionAmount,
      vatRate: vatRate,
      taxCategoryCode: 'S'
    };
  });

  const taxExclusiveAmount = invoiceLines.reduce((sum, line) => sum + line.lineExtensionAmount, 0);
  const totalVAT = invoiceLines.reduce((sum, line) => {
    return sum + (line.lineExtensionAmount * line.vatRate / 100);
  }, 0);
  const taxInclusiveAmount = taxExclusiveAmount + totalVAT;

  // Group tax subtotals by VAT rate
  const taxSubtotalsMap = new Map();
  invoiceLines.forEach(line => {
    const vatRate = line.vatRate;
    if (!taxSubtotalsMap.has(vatRate)) {
      taxSubtotalsMap.set(vatRate, {
        taxableAmount: 0,
        taxAmount: 0,
        percent: vatRate,
        categoryCode: 'S'
      });
    }
    const subtotal = taxSubtotalsMap.get(vatRate);
    subtotal.taxableAmount += line.lineExtensionAmount;
    subtotal.taxAmount += line.lineExtensionAmount * vatRate / 100;
  });
  const taxSubtotals = Array.from(taxSubtotalsMap.values());

  const invoiceDTO = {
    invoiceNumber: invoiceId,
    issueDate: issueDate,
    invoiceTypeCode: '380',
    documentCurrencyCode: 'RON',
    supplier: {
      name: company.name,
      cui: company.cui,
      address: {
        street: company.address,
        countryCode: 'RO'
      },
      contact: {
        telephone: company.phone,
        email: company.email
      }
    },
    customer: {
      name: client.name || 'Client',
      cui: client.cui || null,
      address: {
        street: client.address || '',
        countryCode: 'RO'
      }
    },
    invoiceLines: invoiceLines,
    taxExclusiveAmount: taxExclusiveAmount,
    taxInclusiveAmount: taxInclusiveAmount,
    payableAmount: taxInclusiveAmount,
    taxSubtotals: taxSubtotals,
    paymentMeans: {
      code: '30'
    }
  };

  return buildUblInvoice(invoiceDTO);
}

module.exports = {
  buildUBLInvoice
};

