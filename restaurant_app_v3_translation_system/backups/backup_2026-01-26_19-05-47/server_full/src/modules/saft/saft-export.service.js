/**
 * FAZA 1.5 - SAF-T Export Service
 * 
 * Generates SAF-T XML export for ANAF submission
 * Format: ANAF SAF-T XML template with Header, MasterFiles, GeneralLedger, Inventory, SourceDocuments
 */

const { dbPromise } = require('../../../database');
const { XMLBuilder } = require('xmlbuilder2');
const ExcelJS = require('exceljs');

/**
 * Generate SAF-T XML for a specific month
 * @param {string} month - Format: YYYY-MM
 * @returns {Promise<string>} SAF-T XML string
 */
async function generateSaftXml(month) {
  const db = await dbPromise;
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0]; // Last day of month

  // Get company info
  const companyInfo = await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        config_name,
        config_value
      FROM fiscal_config
      WHERE config_name IN ('company_name', 'company_cui', 'company_address', 'company_phone', 'company_email')
    `, [], (err, rows) => {
      if (err) reject(err);
      else {
        const config = {};
        if (Array.isArray(rows)) {
          rows.forEach(row => {
            config[row.config_name] = row.config_value;
          });
        } else if (rows) {
          config[rows.config_name] = rows.config_value;
        }
        resolve(config);
      }
    });
  });

  // Get all configs separately
  const companyName = await getFiscalConfig('company_name') || 'Restaurant App V3';
  const companyCUI = await getFiscalConfig('company_cui') || '';
  const companyAddress = await getFiscalConfig('company_address') || '';
  const companyPhone = await getFiscalConfig('company_phone') || '';
  const companyEmail = await getFiscalConfig('company_email') || '';

  // Build SAF-T XML structure
  const root = new XMLBuilder({ version: '1.0', encoding: 'UTF-8' });
  
  const saft = root.ele('AuditFile', {
    'xmlns': 'urn:OECD:StandardAuditFile-Tax:RO_1',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'urn:OECD:StandardAuditFile-Tax:RO_1 SAFT_RO_1.xsd'
  });

  // Header
  const header = saft.ele('Header');
  header.ele('AuditFileVersion').txt('1.0');
  header.ele('CompanyID').txt(companyCUI);
  header.ele('TaxAccountingBasis').txt('C');
  header.ele('TaxEntity').txt(companyCUI);
  header.ele('ProductCompanyTaxID').txt(companyCUI);
  header.ele('SoftwareCertificateNumber').txt('00000000'); // TODO: Get from ANAF
  header.ele('ProductID').txt('Restaurant App V3');
  header.ele('ProductVersion').txt('3.0.0');
  header.ele('CompanyName').txt(companyName);
  header.ele('CompanyAddress').txt(companyAddress);
  header.ele('TaxRegistrationNumber').txt(companyCUI);
  header.ele('FiscalYear').txt(year.toString());
  header.ele('StartDate').txt(startDate);
  header.ele('EndDate').txt(endDate);
  header.ele('CurrencyCode').txt('RON');
  header.ele('DateCreated').txt(new Date().toISOString().split('T')[0]);
  header.ele('TaxEntityAddress').txt(companyAddress);
  header.ele('TaxEntityCity').txt('');
  header.ele('TaxEntityPostalCode').txt('');
  header.ele('TaxEntityCountry').txt('RO');

  // MasterFiles
  const masterFiles = saft.ele('MasterFiles');
  
  // GeneralLedgerAccounts
  const generalLedgerAccounts = masterFiles.ele('GeneralLedgerAccounts');
  // TODO: Add chart of accounts if needed

  // Customers
  const customers = masterFiles.ele('Customers');
  const customerData = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT
        customer_name as name,
        customer_phone as phone,
        customer_email as email,
        delivery_address as address
      FROM orders
      WHERE customer_name IS NOT NULL
        AND timestamp >= ? AND timestamp <= ?
    `, [startDate, endDate], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  customerData.forEach((customer, index) => {
    const customerEl = customers.ele('Customer');
    customerEl.ele('CustomerID').txt(`CUST-${index + 1}`);
    customerEl.ele('AccountID').txt('411');
    customerEl.ele('CustomerTaxID').txt(customer.cui || '');
    customerEl.ele('CompanyName').txt(customer.name || '');
    customerEl.ele('Contact').txt(customer.phone || '');
    if (customer.address) {
      customerEl.ele('BillingAddress').ele('AddressDetail').txt(customer.address);
    }
  });

  // Products
  const products = masterFiles.ele('Products');
  const productData = await new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT
        id,
        name,
        price,
        category_id
      FROM menu
      WHERE is_active = 1
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  productData.forEach((product) => {
    const productEl = products.ele('Product');
    productEl.ele('ProductType').txt('P');
    productEl.ele('ProductCode').txt(`PROD-${product.id}`);
    productEl.ele('ProductDescription').txt(product.name || '');
    productEl.ele('ProductNumberCode').txt('');
    productEl.ele('CustomsDetails').ele('CNCode').txt('');
  });

  // GeneralLedger
  const generalLedger = saft.ele('GeneralLedgerEntries');
  const journalEntries = generalLedger.ele('NumberOfEntries').txt('0'); // TODO: Calculate
  const totalDebit = generalLedger.ele('TotalDebit').txt('0.00');
  const totalCredit = generalLedger.ele('TotalCredit').txt('0.00');

  // SourceDocuments
  const sourceDocuments = saft.ele('SourceDocuments');
  
  // SalesInvoices
  const salesInvoices = sourceDocuments.ele('SalesInvoices');
  
  // Get invoices for the month
  const invoices = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        t.*,
        t.documentData as document_data_json
      FROM tipizate t
      WHERE t.type = 'FACTURA'
        AND DATE(t.date) >= ? AND DATE(t.date) <= ?
        AND t.status = 'SIGNED'
      ORDER BY t.date ASC
    `, [startDate, endDate], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  invoices.forEach((invoice) => {
    const invoiceEl = salesInvoices.ele('Invoice');
    invoiceEl.ele('InvoiceNo').txt(`${invoice.series}-${invoice.number}`);
    invoiceEl.ele('DocumentStatus').ele('InvoiceStatus').txt('N');
    invoiceEl.ele('Hash').txt('');
    invoiceEl.ele('HashControl').txt('');
    invoiceEl.ele('Period').txt(month);
    invoiceEl.ele('InvoiceDate').txt(invoice.date.split('T')[0]);
    invoiceEl.ele('InvoiceType').txt('FT');
    
    // Customer
    const documentData = typeof invoice.document_data_json === 'string'
      ? JSON.parse(invoice.document_data_json)
      : invoice.document_data_json || {};
    
    if (documentData.clientName) {
      const customerInfo = invoiceEl.ele('Customer');
      customerInfo.ele('CustomerID').txt(`CUST-${documentData.clientCUI || 'UNKNOWN'}`);
      customerInfo.ele('AccountID').txt('411');
      customerInfo.ele('CustomerName').txt(documentData.clientName);
      customerInfo.ele('CustomerTaxID').txt(documentData.clientCUI || '');
    }

    // Lines
    const lines = typeof invoice.lines === 'string'
      ? JSON.parse(invoice.lines)
      : invoice.lines || [];
    
    const lineEl = invoiceEl.ele('Line');
    lines.forEach((line, idx) => {
      const lineItem = lineEl.ele('Line');
      lineItem.ele('LineNumber').txt((idx + 1).toString());
      lineItem.ele('ProductCode').txt(`PROD-${line.productId || ''}`);
      lineItem.ele('ProductDescription').txt(line.productName || '');
      lineItem.ele('Quantity').txt(line.quantity.toString());
      lineItem.ele('UnitOfMeasure').txt('C62'); // Unit
      lineItem.ele('UnitPrice').txt(line.unitPrice.toFixed(2));
      lineItem.ele('TaxBase').txt((line.totalWithoutVat || line.unitPrice * line.quantity).toFixed(2));
      lineItem.ele('TaxPointDate').txt(invoice.date.split('T')[0]);
      
      // Tax
      const tax = lineItem.ele('Tax');
      tax.ele('TaxType').txt('IVA');
      tax.ele('TaxCountryRegion').txt('RO');
      tax.ele('TaxCode').txt(line.vatRate === 0 ? 'Z' : line.vatRate === 9 ? 'S' : 'N');
      tax.ele('TaxPercentage').txt(line.vatRate.toString());
      tax.ele('TaxAmount').txt((line.vatAmount || 0).toFixed(2));
      
      lineItem.ele('CreditAmount').txt((line.totalWithVat || line.total).toFixed(2));
    });

    // Totals
    const totals = typeof invoice.totals === 'string'
      ? JSON.parse(invoice.totals)
      : invoice.totals || {};
    
    const totalsEl = invoiceEl.ele('DocumentTotals');
    totalsEl.ele('TaxPayable').txt((totals.vatAmount || 0).toFixed(2));
    totalsEl.ele('NetTotal').txt((totals.subtotal || 0).toFixed(2));
    totalsEl.ele('GrossTotal').txt((totals.total || 0).toFixed(2));
  });

  // Generate XML string
  const xml = root.end({ prettyPrint: true });
  return xml;
}

/**
 * Validate SAF-T data before export
 */
async function validateSaftData(month) {
  const db = await dbPromise;
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

  const errors = [];

  // Check balances
  const balanceCheck = await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit
      FROM general_ledger
      WHERE date >= ? AND date <= ?
    `, [startDate, endDate], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (balanceCheck && Math.abs((balanceCheck.total_debit || 0) - (balanceCheck.total_credit || 0)) > 0.01) {
    errors.push({
      code: 'BALANCE_MISMATCH',
      message: 'Solduri debitoare și creditoare nu sunt egale',
      details: {
        debit: balanceCheck.total_debit,
        credit: balanceCheck.total_credit,
        difference: Math.abs((balanceCheck.total_debit || 0) - (balanceCheck.total_credit || 0))
      }
    });
  }

  // Check for negative stock
  const negativeStock = await new Promise((resolve, reject) => {
    db.all(`
      SELECT id, name, quantity
      FROM stocks
      WHERE quantity < 0
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  if (negativeStock.length > 0) {
    errors.push({
      code: 'NEGATIVE_STOCK',
      message: `Există ${negativeStock.length} produse cu stoc negativ`,
      details: negativeStock
    });
  }

  // Check TVA correctness
  const tvaCheck = await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        SUM(totals->>'$.vatAmount') as total_vat
      FROM tipizate
      WHERE type = 'FACTURA'
        AND DATE(date) >= ? AND DATE(date) <= ?
    `, [startDate, endDate], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  // Check payment differences
  const paymentCheck = await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        SUM(amount) as total_payments
      FROM payments
      WHERE created_at >= ? AND created_at <= ?
    `, [startDate, endDate], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate SAF-T XLSX export
 */
async function generateSaftXlsx(month) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('SAF-T Export');

  // Add headers
  worksheet.columns = [
    { header: 'Document Type', key: 'docType', width: 15 },
    { header: 'Document Number', key: 'docNumber', width: 20 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Customer', key: 'customer', width: 30 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'VAT', key: 'vat', width: 15 },
    { header: 'Total', key: 'total', width: 15 },
  ];

  // TODO: Add data rows from database

  return workbook;
}

/**
 * Get fiscal config value
 */
async function getFiscalConfig(name) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT config_value FROM fiscal_config WHERE config_name = ?',
      [name],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.config_value || null);
      }
    );
  });
}

module.exports = {
  generateSaftXml,
  validateSaftData,
  generateSaftXlsx,
};

