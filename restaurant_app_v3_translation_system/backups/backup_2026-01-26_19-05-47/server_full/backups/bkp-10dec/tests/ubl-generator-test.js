/**
 * TEST UBL GENERATOR - Exemplu de generare e-Factura
 * Data: 03 Decembrie 2025
 */

const { generateInvoiceUBL } = require('../utils/ubl-generator');
const fs = require('fs');
const path = require('path');

console.log('🧪 UBL GENERATOR TEST');
console.log('====================\n');

// Date factură demo
const invoiceData = {
  // Document info
  invoiceNumber: 'FACT-2025-0001',
  issueDate: new Date('2025-12-03'),
  dueDate: new Date('2025-12-17'), // 14 zile termen plată
  documentCurrencyCode: 'RON',
  
  // Supplier (Furnizor) - Restaurant
  supplier: {
    name: 'SC RESTAURANT DEMO SRL',
    cui: 'RO12345678',
    registrationNumber: 'J40/1234/2020',
    address: {
      street: 'Str. Exemplu Nr. 1',
      city: 'București',
      county: 'Ilfov',
      postalCode: '010101',
      countryCode: 'RO'
    },
    contact: {
      name: 'Ion Popescu',
      telephone: '0212345678',
      email: 'contact@restaurant-demo.ro'
    }
  },
  
  // Customer (Client) - Companie
  customer: {
    name: 'SC CLIENT EXEMPLU SRL',
    cui: 'RO87654321',
    registrationNumber: 'J40/5678/2019',
    address: {
      street: 'Bd. Unirii Nr. 10',
      city: 'București',
      county: 'București',
      postalCode: '030101',
      countryCode: 'RO'
    },
    contact: {
      name: 'Maria Ionescu',
      telephone: '0213456789',
      email: 'comenzi@client-exemplu.ro'
    }
  },
  
  // Invoice lines (Articole)
  invoiceLines: [
    {
      name: 'Pizza Margherita',
      description: 'Pizza cu sos de roșii, mozzarella și busuioc',
      quantity: 2,
      unitCode: 'C62', // Unit (piece)
      unitPrice: 25.00,
      lineExtensionAmount: 50.00,
      vatRate: 9, // TVA 9% pentru restaurant
      taxCategoryCode: 'S'
    },
    {
      name: 'Coca-Cola 0.5L',
      description: 'Băutură răcoritoare',
      quantity: 3,
      unitCode: 'C62',
      unitPrice: 10.00,
      lineExtensionAmount: 30.00,
      vatRate: 19, // TVA 19% pentru băuturi
      taxCategoryCode: 'S'
    },
    {
      name: 'Paste Carbonara',
      description: 'Paste cu sos carbonara, bacon și parmezan',
      quantity: 1,
      unitCode: 'C62',
      unitPrice: 30.00,
      lineExtensionAmount: 30.00,
      vatRate: 9,
      taxCategoryCode: 'S'
    }
  ],
  
  // Totals (calculate from lines)
  taxExclusiveAmount: 110.00, // 50 + 30 + 30
  taxInclusiveAmount: 134.10, // 110 + (50+30)*0.09 + 30*0.19
  payableAmount: 134.10,
  
  // Tax breakdown
  taxSubtotals: [
    {
      taxableAmount: 80.00, // Pizza + Paste (TVA 9%)
      taxAmount: 7.20,      // 80 * 0.09
      percent: 9,
      categoryCode: 'S'
    },
    {
      taxableAmount: 30.00, // Coca-Cola (TVA 19%)
      taxAmount: 5.70,      // 30 * 0.19
      percent: 19,
      categoryCode: 'S'
    }
  ],
  
  // Payment info
  paymentMeansCode: '30', // Credit transfer (virament bancar)
  paymentTerms: '14 zile de la data emiterii facturii',
  
  // Additional info
  note: 'Factura se achită conform termenilor de plată menționați.',
  orderReference: 'CMD-2025-0123'
};

try {
  console.log('📄 Generating UBL XML...\n');
  
  // Generează XML UBL
  const xml = generateInvoiceUBL(invoiceData);
  
  // Salvează XML în fișier
  const outputDir = path.join(__dirname, '../test-results/ubl-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, `${invoiceData.invoiceNumber}.xml`);
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  console.log('✅ UBL XML generated successfully!');
  console.log(`📁 Output file: ${outputPath}`);
  console.log(`📏 File size: ${(xml.length / 1024).toFixed(2)} KB\n`);
  
  // Afișează primele 50 linii din XML
  const lines = xml.split('\n').slice(0, 50);
  console.log('📄 Preview (first 50 lines):');
  console.log('================================\n');
  console.log(lines.join('\n'));
  console.log('\n================================\n');
  
  // Statistici
  console.log('📊 Invoice Statistics:');
  console.log(`  - Invoice Number: ${invoiceData.invoiceNumber}`);
  console.log(`  - Issue Date: ${invoiceData.issueDate.toLocaleDateString('ro-RO')}`);
  console.log(`  - Supplier: ${invoiceData.supplier.name} (${invoiceData.supplier.cui})`);
  console.log(`  - Customer: ${invoiceData.customer.name} (${invoiceData.customer.cui})`);
  console.log(`  - Lines: ${invoiceData.invoiceLines.length}`);
  console.log(`  - Total (excl. VAT): ${invoiceData.taxExclusiveAmount.toFixed(2)} RON`);
  console.log(`  - VAT Amount: ${(invoiceData.taxInclusiveAmount - invoiceData.taxExclusiveAmount).toFixed(2)} RON`);
  console.log(`  - Total (incl. VAT): ${invoiceData.taxInclusiveAmount.toFixed(2)} RON`);
  
  console.log('\n✅ TEST PASSED!\n');
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error(error.stack);
  process.exit(1);
}

