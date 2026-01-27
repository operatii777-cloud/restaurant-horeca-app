/**
 * PHASE S8.1 - UBL Core Types (DTOs)
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * TypeScript-style JSDoc types for UBL Invoice DTOs
 */

/**
 * @typedef {Object} AddressDTO
 * @property {string} street - Street name
 * @property {string} [city] - City name
 * @property {string} [postalCode] - Postal code
 * @property {string} [county] - County/State
 * @property {string} [countryCode] - ISO country code (default: 'RO')
 */

/**
 * @typedef {Object} ContactDTO
 * @property {string} [name] - Contact person name
 * @property {string} [telephone] - Phone number
 * @property {string} [email] - Email address
 */

/**
 * @typedef {Object} PartyDTO
 * @property {string} name - Party name
 * @property {string} [cui] - CUI (Company ID)
 * @property {string} [registrationNumber] - Registration number
 * @property {AddressDTO} [address] - Postal address
 * @property {ContactDTO} [contact] - Contact information
 */

/**
 * @typedef {Object} InvoiceLineDTO
 * @property {string} name - Product/service name
 * @property {string} [description] - Product description
 * @property {number} quantity - Quantity
 * @property {string} [unitCode] - Unit code (default: 'C62')
 * @property {number} unitPrice - Unit price (without VAT)
 * @property {number} lineExtensionAmount - Line total (without VAT)
 * @property {number} vatRate - VAT rate percentage
 * @property {string} [taxCategoryCode] - Tax category code (default: 'S')
 */

/**
 * @typedef {Object} TaxSubtotalDTO
 * @property {number} taxableAmount - Taxable amount
 * @property {number} taxAmount - Tax amount
 * @property {number} percent - VAT rate percentage
 * @property {string} [categoryCode] - Tax category code (default: 'S')
 */

/**
 * @typedef {Object} PaymentMeansDTO
 * @property {string} [code] - Payment means code (default: '30')
 * @property {string} [details] - Payment details
 */

/**
 * @typedef {Object} PaymentTermsDTO
 * @property {string} [note] - Payment terms note
 * @property {number} [days] - Payment days
 */

/**
 * @typedef {Object} InvoiceDTO
 * @property {string} invoiceNumber - Invoice number
 * @property {Date|string} issueDate - Issue date
 * @property {Date|string} [dueDate] - Due date
 * @property {string} [invoiceTypeCode] - Invoice type code (default: '380')
 * @property {string} [documentCurrencyCode] - Currency code (default: 'RON')
 * @property {PartyDTO} supplier - Supplier party
 * @property {PartyDTO} customer - Customer party
 * @property {InvoiceLineDTO[]} invoiceLines - Invoice lines
 * @property {number} taxExclusiveAmount - Total without VAT
 * @property {number} taxInclusiveAmount - Total with VAT
 * @property {number} payableAmount - Payable amount
 * @property {TaxSubtotalDTO[]} taxSubtotals - Tax breakdown
 * @property {PaymentMeansDTO} [paymentMeans] - Payment means
 * @property {PaymentTermsDTO} [paymentTerms] - Payment terms
 * @property {string} [note] - Additional note
 * @property {string} [orderReference] - Order reference
 */

module.exports = {
  // Types exported for JSDoc only
};


