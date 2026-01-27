/**
 * PHASE S8.1 - UBL Core Builder
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Unified UBL 2.1 + CIUS-RO invoice builder
 */

const { create } = require('xmlbuilder2');
const {
  UBL_NAMESPACES,
  CIUS_RO,
  INVOICE_TYPE_CODES,
  PAYMENT_MEANS_CODES,
  TAX_CATEGORY_CODES,
  UNIT_CODES,
  DEFAULT_CURRENCY
} = require('./ubl.config');

/**
 * Build UBL 2.1 Invoice XML from DTO
 * 
 * @param {InvoiceDTO} dto - Invoice DTO
 * @returns {string} UBL 2.1 XML string
 */
function buildUblInvoice(dto) {
  // Validate DTO
  validateInvoiceDTO(dto);

  // Extract DTO fields
  const {
    invoiceNumber,
    issueDate,
    dueDate = null,
    invoiceTypeCode = INVOICE_TYPE_CODES.COMMERCIAL,
    documentCurrencyCode = DEFAULT_CURRENCY,
    supplier,
    customer,
    invoiceLines,
    taxExclusiveAmount,
    taxInclusiveAmount,
    payableAmount,
    taxSubtotals = [],
    paymentMeans = {},
    paymentTerms = null,
    note = null,
    orderReference = null
  } = dto;

  // Create XML root
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Invoice', {
      xmlns: UBL_NAMESPACES.invoice,
      'xmlns:cac': UBL_NAMESPACES.cac,
      'xmlns:cbc': UBL_NAMESPACES.cbc
    });

  // ==================== DOCUMENT HEADER ====================
  
  // Customization ID (CIUS-RO)
  root.ele('cbc:CustomizationID').txt(CIUS_RO.customizationID);
  
  // Profile ID
  root.ele('cbc:ProfileID').txt(CIUS_RO.profileID);
  
  // Invoice Number
  root.ele('cbc:ID').txt(String(invoiceNumber));
  
  // Issue Date
  root.ele('cbc:IssueDate').txt(formatDate(issueDate));
  
  // Due Date (optional)
  if (dueDate) {
    root.ele('cbc:DueDate').txt(formatDate(dueDate));
  }
  
  // Invoice Type Code
  root.ele('cbc:InvoiceTypeCode').txt(invoiceTypeCode);
  
  // Note (optional)
  if (note) {
    root.ele('cbc:Note').txt(escapeXML(note));
  }
  
  // Document Currency Code
  root.ele('cbc:DocumentCurrencyCode').txt(documentCurrencyCode);
  
  // Order Reference (optional)
  if (orderReference) {
    root.ele('cac:OrderReference')
      .ele('cbc:ID').txt(String(orderReference));
  }

  // ==================== SUPPLIER PARTY ====================
  
  buildParty(root.ele('cac:AccountingSupplierParty'), supplier);

  // ==================== CUSTOMER PARTY ====================
  
  buildParty(root.ele('cac:AccountingCustomerParty'), customer);

  // ==================== PAYMENT MEANS ====================
  
  const paymentMeansCode = paymentMeans.code || PAYMENT_MEANS_CODES.CREDIT_TRANSFER;
  root.ele('cac:PaymentMeans')
    .ele('cbc:PaymentMeansCode').txt(paymentMeansCode);

  // ==================== PAYMENT TERMS ====================
  
  if (paymentTerms) {
    const terms = root.ele('cac:PaymentTerms');
    if (paymentTerms.note) {
      terms.ele('cbc:Note').txt(escapeXML(paymentTerms.note));
    }
  }

  // ==================== TAX TOTAL ====================
  
  const taxTotal = root.ele('cac:TaxTotal');
  const totalTaxAmount = taxSubtotals.reduce((sum, subtotal) => sum + subtotal.taxAmount, 0);
  
  taxTotal.ele('cbc:TaxAmount', { currencyID: documentCurrencyCode })
    .txt(formatAmount(totalTaxAmount));
  
  // Tax Subtotals
  taxSubtotals.forEach(subtotal => {
    const taxSubtotal = taxTotal.ele('cac:TaxSubtotal');
    
    taxSubtotal.ele('cbc:TaxableAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(subtotal.taxableAmount));
    
    taxSubtotal.ele('cbc:TaxAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(subtotal.taxAmount));
    
    const taxCategory = taxSubtotal.ele('cac:TaxCategory');
    taxCategory.ele('cbc:ID').txt(subtotal.categoryCode || TAX_CATEGORY_CODES.STANDARD);
    taxCategory.ele('cbc:Percent').txt(formatAmount(subtotal.percent));
    
    const taxScheme = taxCategory.ele('cac:TaxScheme');
    taxScheme.ele('cbc:ID').txt('VAT');
  });

  // ==================== LEGAL MONETARY TOTAL ====================
  
  const legalMonetaryTotal = root.ele('cac:LegalMonetaryTotal');
  
  const lineExtensionAmount = invoiceLines.reduce((sum, line) => sum + line.lineExtensionAmount, 0);
  
  legalMonetaryTotal.ele('cbc:LineExtensionAmount', { currencyID: documentCurrencyCode })
    .txt(formatAmount(lineExtensionAmount));
  
  legalMonetaryTotal.ele('cbc:TaxExclusiveAmount', { currencyID: documentCurrencyCode })
    .txt(formatAmount(taxExclusiveAmount));
  
  legalMonetaryTotal.ele('cbc:TaxInclusiveAmount', { currencyID: documentCurrencyCode })
    .txt(formatAmount(taxInclusiveAmount));
  
  legalMonetaryTotal.ele('cbc:PayableAmount', { currencyID: documentCurrencyCode })
    .txt(formatAmount(payableAmount));

  // ==================== INVOICE LINES ====================
  
  invoiceLines.forEach((line, index) => {
    const invoiceLine = root.ele('cac:InvoiceLine');
    
    // Line ID
    invoiceLine.ele('cbc:ID').txt(String(index + 1));
    
    // Invoiced Quantity
    invoiceLine.ele('cbc:InvoicedQuantity', { unitCode: line.unitCode || UNIT_CODES.PIECE })
      .txt(formatAmount(line.quantity));
    
    // Line Extension Amount
    invoiceLine.ele('cbc:LineExtensionAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(line.lineExtensionAmount));
    
    // Item
    const item = invoiceLine.ele('cac:Item');
    
    if (line.description) {
      item.ele('cbc:Description').txt(escapeXML(line.description));
    }
    
    item.ele('cbc:Name').txt(escapeXML(line.name));
    
    // PHASE S8.6 - Commodity Code (NCM/CN)
    if (line.commodityCode) {
      item.ele('cbc:CommodityCode').txt(escapeXML(line.commodityCode));
    }
    
    // Item Tax Category
    const itemTaxCategory = item.ele('cac:ClassifiedTaxCategory');
    itemTaxCategory.ele('cbc:ID').txt(line.taxCategoryCode || TAX_CATEGORY_CODES.STANDARD);
    itemTaxCategory.ele('cbc:Percent').txt(formatAmount(line.vatRate));
    
    const itemTaxScheme = itemTaxCategory.ele('cac:TaxScheme');
    itemTaxScheme.ele('cbc:ID').txt('VAT');
    
    // Price
    const price = invoiceLine.ele('cac:Price');
    price.ele('cbc:PriceAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(line.unitPrice));
  });

  // Generate XML string
  return root.end({ prettyPrint: true });
}

/**
 * Build Party XML element
 */
function buildParty(partyElement, party) {
  const partyNode = partyElement.ele('cac:Party');
  
  // Party Name
  if (party.name) {
    partyNode.ele('cac:PartyName')
      .ele('cbc:Name').txt(escapeXML(party.name));
  }
  
  // Postal Address
  if (party.address) {
    const address = partyNode.ele('cac:PostalAddress');
    
    if (party.address.street) {
      address.ele('cbc:StreetName').txt(escapeXML(party.address.street));
    }
    
    if (party.address.city) {
      address.ele('cbc:CityName').txt(escapeXML(party.address.city));
    }
    
    if (party.address.postalCode) {
      address.ele('cbc:PostalZone').txt(escapeXML(party.address.postalCode));
    }
    
    if (party.address.county) {
      address.ele('cbc:CountrySubentity').txt(escapeXML(party.address.county));
    }
    
    const country = address.ele('cac:Country');
    country.ele('cbc:IdentificationCode').txt(party.address.countryCode || 'RO');
  }
  
  // Party Tax Scheme (CUI)
  if (party.cui) {
    const taxScheme = partyNode.ele('cac:PartyTaxScheme');
    taxScheme.ele('cbc:CompanyID').txt(escapeXML(party.cui));
    
    const taxSchemeNode = taxScheme.ele('cac:TaxScheme');
    taxSchemeNode.ele('cbc:ID').txt('VAT');
  }
  
  // Party Legal Entity
  if (party.registrationNumber || party.name) {
    const legalEntity = partyNode.ele('cac:PartyLegalEntity');
    
    if (party.name) {
      legalEntity.ele('cbc:RegistrationName').txt(escapeXML(party.name));
    }
    
    if (party.registrationNumber) {
      legalEntity.ele('cbc:CompanyID').txt(escapeXML(party.registrationNumber));
    }
  }
  
  // Contact
  if (party.contact) {
    const contact = partyNode.ele('cac:Contact');
    
    if (party.contact.name) {
      contact.ele('cbc:Name').txt(escapeXML(party.contact.name));
    }
    
    if (party.contact.telephone) {
      contact.ele('cbc:Telephone').txt(escapeXML(party.contact.telephone));
    }
    
    if (party.contact.email) {
      contact.ele('cbc:ElectronicMail').txt(escapeXML(party.contact.email));
    }
  }
}

/**
 * Validate Invoice DTO
 */
function validateInvoiceDTO(dto) {
  const required = ['invoiceNumber', 'issueDate', 'supplier', 'customer', 'invoiceLines'];
  
  required.forEach(field => {
    if (!dto[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
  
  if (!dto.supplier.name || !dto.supplier.cui) {
    throw new Error('Supplier must have name and CUI');
  }
  
  if (!dto.customer.name) {
    throw new Error('Customer must have name');
  }
  
  if (dto.invoiceLines.length === 0) {
    throw new Error('Invoice must have at least one line');
  }
  
  dto.invoiceLines.forEach((line, idx) => {
    if (!line.name || line.quantity === undefined || line.unitPrice === undefined) {
      throw new Error(`Invoice line ${idx + 1} missing required fields`);
    }
  });
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format amount to 2 decimals
 */
function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

/**
 * Escape XML special characters
 */
function escapeXML(str) {
  if (typeof str !== 'string') {
    return String(str);
  }
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  buildUblInvoice,
  validateInvoiceDTO,
  formatDate,
  formatAmount,
  escapeXML
};


