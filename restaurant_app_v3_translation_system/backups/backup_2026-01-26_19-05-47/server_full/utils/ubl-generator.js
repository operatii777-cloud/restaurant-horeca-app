/**
 * UBL GENERATOR - Generare XML UBL 2.1 pentru e-Factura ANAF
 * Data: 03 Decembrie 2025
 * Standard: UBL 2.1 (Universal Business Language)
 * Conformitate: CIUS-RO (Core Invoice Usage Specification - Romania)
 * 
 * PHASE S8.1 - Wrapper peste UBL Core pentru compatibilitate
 * 
 * Referințe:
 * - https://www.anaf.ro/
 * - https://docs.peppol.eu/poacc/billing/3.0/
 * - https://www.anaf.ro/anaf/internet/ANAF/despre_anaf/strategii_anaf/proiecte_digitalizare/e_factura/
 */

const { buildUblInvoice } = require('./src/modules/ubl');

/**
 * Generează XML UBL 2.1 pentru factură
 * @param {Object} invoiceData - Date factură
 * @returns {string} XML UBL 2.1
 */
function generateInvoiceUBL(invoiceData) {
  const {
    // Document info
    invoiceNumber,
    issueDate,
    dueDate = null,
    invoiceTypeCode = '380', // 380 = Commercial Invoice
    documentCurrencyCode = 'RON',
    
    // Supplier (Furnizor)
    supplier = {},
    
    // Customer (Client)
    customer = {},
    
    // Invoice lines (Articole)
    invoiceLines = [],
    
    // Totals
    taxExclusiveAmount = 0, // Total fără TVA
    taxInclusiveAmount = 0, // Total cu TVA
    payableAmount = 0,      // Total de plată
    
    // Tax breakdown (Defalcare TVA)
    taxSubtotals = [],
    
    // Payment info
    paymentMeansCode = '30', // 30 = Credit transfer (virament)
    paymentTerms = null,
    
    // Additional info
    note = null,
    orderReference = null,
    
  } = invoiceData;
  
  // Validare date obligatorii
  validateInvoiceData(invoiceData);
  
  // Construire XML UBL 2.1
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Invoice', {
      xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
    });
  
  // ==================== DOCUMENT HEADER ====================
  
  // Customization ID (CIUS-RO)
  root.ele('cbc:CustomizationID')
    .txt('urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1');
  
  // Profile ID
  root.ele('cbc:ProfileID')
    .txt('urn:fdc:peppol.eu:2017:poacc:billing:01:1.0');
  
  // Invoice Number
  root.ele('cbc:ID').txt(invoiceNumber);
  
  // Issue Date (format: YYYY-MM-DD)
  root.ele('cbc:IssueDate').txt(formatDate(issueDate));
  
  // Due Date (optional)
  if (dueDate) {
    root.ele('cbc:DueDate').txt(formatDate(dueDate));
  }
  
  // Invoice Type Code
  root.ele('cbc:InvoiceTypeCode').txt(invoiceTypeCode);
  
  // Note (optional)
  if (note) {
    root.ele('cbc:Note').txt(note);
  }
  
  // Document Currency Code
  root.ele('cbc:DocumentCurrencyCode').txt(documentCurrencyCode);
  
  // Order Reference (optional)
  if (orderReference) {
    const orderRef = root.ele('cac:OrderReference');
    orderRef.ele('cbc:ID').txt(orderReference);
  }
  
  // ==================== SUPPLIER (ACCOUNTING SUPPLIER PARTY) ====================
  
  const supplierParty = root.ele('cac:AccountingSupplierParty').ele('cac:Party');
  
  // Supplier Name
  if (supplier.name) {
    supplierParty.ele('cac:PartyName')
      .ele('cbc:Name').txt(supplier.name);
  }
  
  // Supplier Address
  if (supplier.address) {
    const supplierAddress = supplierParty.ele('cac:PostalAddress');
    
    if (supplier.address.street) {
      supplierAddress.ele('cbc:StreetName').txt(supplier.address.street);
    }
    
    if (supplier.address.city) {
      supplierAddress.ele('cbc:CityName').txt(supplier.address.city);
    }
    
    if (supplier.address.postalCode) {
      supplierAddress.ele('cbc:PostalZone').txt(supplier.address.postalCode);
    }
    
    if (supplier.address.county) {
      supplierAddress.ele('cbc:CountrySubentity').txt(supplier.address.county);
    }
    
    const country = supplierAddress.ele('cac:Country');
    country.ele('cbc:IdentificationCode').txt(supplier.address.countryCode || 'RO');
  }
  
  // Supplier Tax Scheme (CUI)
  if (supplier.cui) {
    const supplierTaxScheme = supplierParty.ele('cac:PartyTaxScheme');
    supplierTaxScheme.ele('cbc:CompanyID').txt(supplier.cui);
    
    const taxScheme = supplierTaxScheme.ele('cac:TaxScheme');
    taxScheme.ele('cbc:ID').txt('VAT');
  }
  
  // Supplier Legal Entity
  if (supplier.registrationNumber) {
    const supplierLegalEntity = supplierParty.ele('cac:PartyLegalEntity');
    supplierLegalEntity.ele('cbc:RegistrationName').txt(supplier.name);
    supplierLegalEntity.ele('cbc:CompanyID').txt(supplier.registrationNumber);
  }
  
  // Supplier Contact
  if (supplier.contact) {
    const supplierContact = supplierParty.ele('cac:Contact');
    
    if (supplier.contact.name) {
      supplierContact.ele('cbc:Name').txt(supplier.contact.name);
    }
    
    if (supplier.contact.telephone) {
      supplierContact.ele('cbc:Telephone').txt(supplier.contact.telephone);
    }
    
    if (supplier.contact.email) {
      supplierContact.ele('cbc:ElectronicMail').txt(supplier.contact.email);
    }
  }
  
  // ==================== CUSTOMER (ACCOUNTING CUSTOMER PARTY) ====================
  
  const customerParty = root.ele('cac:AccountingCustomerParty').ele('cac:Party');
  
  // Customer Name
  if (customer.name) {
    customerParty.ele('cac:PartyName')
      .ele('cbc:Name').txt(customer.name);
  }
  
  // Customer Address
  if (customer.address) {
    const customerAddress = customerParty.ele('cac:PostalAddress');
    
    if (customer.address.street) {
      customerAddress.ele('cbc:StreetName').txt(customer.address.street);
    }
    
    if (customer.address.city) {
      customerAddress.ele('cbc:CityName').txt(customer.address.city);
    }
    
    if (customer.address.postalCode) {
      customerAddress.ele('cbc:PostalZone').txt(customer.address.postalCode);
    }
    
    if (customer.address.county) {
      customerAddress.ele('cbc:CountrySubentity').txt(customer.address.county);
    }
    
    const country = customerAddress.ele('cac:Country');
    country.ele('cbc:IdentificationCode').txt(customer.address.countryCode || 'RO');
  }
  
  // Customer Tax Scheme (CUI)
  if (customer.cui) {
    const customerTaxScheme = customerParty.ele('cac:PartyTaxScheme');
    customerTaxScheme.ele('cbc:CompanyID').txt(customer.cui);
    
    const taxScheme = customerTaxScheme.ele('cac:TaxScheme');
    taxScheme.ele('cbc:ID').txt('VAT');
  }
  
  // Customer Legal Entity
  if (customer.registrationNumber) {
    const customerLegalEntity = customerParty.ele('cac:PartyLegalEntity');
    customerLegalEntity.ele('cbc:RegistrationName').txt(customer.name);
    customerLegalEntity.ele('cbc:CompanyID').txt(customer.registrationNumber);
  }
  
  // Customer Contact
  if (customer.contact) {
    const customerContact = customerParty.ele('cac:Contact');
    
    if (customer.contact.name) {
      customerContact.ele('cbc:Name').txt(customer.contact.name);
    }
    
    if (customer.contact.telephone) {
      customerContact.ele('cbc:Telephone').txt(customer.contact.telephone);
    }
    
    if (customer.contact.email) {
      customerContact.ele('cbc:ElectronicMail').txt(customer.contact.email);
    }
  }
  
  // ==================== PAYMENT MEANS ====================
  
  const paymentMeans = root.ele('cac:PaymentMeans');
  paymentMeans.ele('cbc:PaymentMeansCode').txt(paymentMeansCode);
  
  // Payment Terms (optional)
  if (paymentTerms) {
    const terms = root.ele('cac:PaymentTerms');
    terms.ele('cbc:Note').txt(paymentTerms);
  }
  
  // ==================== TAX TOTAL ====================
  
  const taxTotal = root.ele('cac:TaxTotal');
  const totalTaxAmount = taxSubtotals.reduce((sum, subtotal) => sum + subtotal.taxAmount, 0);
  
  taxTotal.ele('cbc:TaxAmount', { currencyID: documentCurrencyCode })
    .txt(formatAmount(totalTaxAmount));
  
  // Tax Subtotals (per TVA rate)
  taxSubtotals.forEach(subtotal => {
    const taxSubtotal = taxTotal.ele('cac:TaxSubtotal');
    
    taxSubtotal.ele('cbc:TaxableAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(subtotal.taxableAmount));
    
    taxSubtotal.ele('cbc:TaxAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(subtotal.taxAmount));
    
    const taxCategory = taxSubtotal.ele('cac:TaxCategory');
    taxCategory.ele('cbc:ID').txt(subtotal.categoryCode || 'S'); // S = Standard rate
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
    invoiceLine.ele('cbc:InvoicedQuantity', { unitCode: line.unitCode || 'C62' })
      .txt(formatAmount(line.quantity));
    
    // Line Extension Amount (total line without VAT)
    invoiceLine.ele('cbc:LineExtensionAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(line.lineExtensionAmount));
    
    // Item
    const item = invoiceLine.ele('cac:Item');
    
    if (line.description) {
      item.ele('cbc:Description').txt(line.description);
    }
    
    item.ele('cbc:Name').txt(line.name);
    
    // Item Tax Category
    const itemTaxCategory = item.ele('cac:ClassifiedTaxCategory');
    itemTaxCategory.ele('cbc:ID').txt(line.taxCategoryCode || 'S');
    itemTaxCategory.ele('cbc:Percent').txt(formatAmount(line.vatRate));
    
    const itemTaxScheme = itemTaxCategory.ele('cac:TaxScheme');
    itemTaxScheme.ele('cbc:ID').txt('VAT');
    
    // Price
    const price = invoiceLine.ele('cac:Price');
    price.ele('cbc:PriceAmount', { currencyID: documentCurrencyCode })
      .txt(formatAmount(line.unitPrice));
  });
  
  // Generate XML string
  const xml = root.end({ prettyPrint: true });
  
  return xml;
}

/**
 * PHASE S8.1 - Validare date factură (delegat la UBL Core)
 * @param {Object} invoiceData
 */
function validateInvoiceData(invoiceData) {
  // Validation is now done in UBL Core buildUblInvoice
  // This function is kept for backward compatibility
  const required = ['invoiceNumber', 'issueDate', 'supplier', 'customer', 'invoiceLines'];
  
  required.forEach(field => {
    if (!invoiceData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date
 * @returns {string}
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
 * @param {number} amount
 * @returns {string}
 */
function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

/**
 * Generate UBL from database invoice
 * @param {number} invoiceId - ID factură din DB
 * @param {Object} db - Database connection
 * @returns {Promise<string>} XML UBL
 */
async function generateUBLFromDatabase(invoiceId, db) {
  return new Promise((resolve, reject) => {
    // Obține factura din DB
    db.get(`
      SELECT * FROM invoices WHERE id = ?
    `, [invoiceId], (err, invoice) => {
      if (err) return reject(err);
      if (!invoice) return reject(new Error('Invoice not found'));
      
      // Obține liniile facturii
      db.all(`
        SELECT * FROM invoice_lines WHERE invoice_id = ?
      `, [invoiceId], (err, lines) => {
        if (err) return reject(err);
        
        // Obține configurarea companiei
        db.get(`
          SELECT * FROM anaf_config WHERE id = 1
        `, [], (err, config) => {
          if (err) return reject(err);
          
          try {
            // Construiește obiectul pentru UBL
            const invoiceData = {
              invoiceNumber: invoice.invoice_number,
              issueDate: invoice.issue_date,
              dueDate: invoice.due_date,
              documentCurrencyCode: invoice.currency || 'RON',
              
              supplier: {
                name: config.company_name,
                cui: config.cui,
                registrationNumber: config.reg_com,
                address: {
                  street: config.address_street,
                  city: config.address_city,
                  county: config.address_county,
                  countryCode: 'RO',
                  postalCode: config.postal_code
                },
                contact: {
                  telephone: config.phone,
                  email: config.email
                }
              },
              
              customer: {
                name: invoice.customer_name,
                cui: invoice.customer_cui,
                registrationNumber: invoice.customer_reg_com,
                address: {
                  street: invoice.customer_address,
                  city: invoice.customer_city,
                  countryCode: 'RO'
                },
                contact: {
                  telephone: invoice.customer_phone,
                  email: invoice.customer_email
                }
              },
              
              invoiceLines: lines.map(line => ({
                name: line.product_name,
                description: line.description,
                quantity: line.quantity,
                unitCode: line.unit_code || 'C62',
                unitPrice: line.unit_price,
                lineExtensionAmount: line.line_total,
                vatRate: line.vat_rate,
                taxCategoryCode: 'S'
              })),
              
              taxExclusiveAmount: invoice.total_without_vat,
              taxInclusiveAmount: invoice.total_with_vat,
              payableAmount: invoice.total_with_vat,
              
              taxSubtotals: [
                {
                  taxableAmount: invoice.total_without_vat,
                  taxAmount: invoice.vat_amount,
                  percent: invoice.vat_rate || 19,
                  categoryCode: 'S'
                }
              ],
              
              note: invoice.notes
            };
            
            // Generează UBL
            const xml = generateInvoiceUBL(invoiceData);
            resolve(xml);
            
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  });
}

module.exports = {
  generateInvoiceUBL,
  generateUBLFromDatabase,
  validateInvoiceData,
  formatDate,
  formatAmount
};

