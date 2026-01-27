/**
 * TIPIZATE LEGALE - Migration Script
 * Conform OMFP 2634/2015 și Cod Fiscal Art. 319
 */

const fs = require('fs');
const path = require('path');

async function runLegalTipizateMigrations(db) {
  console.log('🔄 [Legal Tipizate] Starting migrations...');
  
  const migrations = [
    // NIR Extensions
    { table: 'nir_documents', column: 'supplier_cui', type: 'TEXT' },
    { table: 'nir_documents', column: 'supplier_reg_com', type: 'TEXT' },
    { table: 'nir_documents', column: 'supplier_address', type: 'TEXT' },
    { table: 'nir_documents', column: 'supplier_bank', type: 'TEXT' },
    { table: 'nir_documents', column: 'supplier_iban', type: 'TEXT' },
    { table: 'nir_documents', column: 'accompanying_doc_type', type: 'TEXT' },
    { table: 'nir_documents', column: 'accompanying_doc_number', type: 'TEXT' },
    { table: 'nir_documents', column: 'accompanying_doc_date', type: 'TEXT' },
    { table: 'nir_documents', column: 'receiving_warehouse', type: 'TEXT' },
    { table: 'nir_documents', column: 'receiving_warehouse_id', type: 'INTEGER' },
    { table: 'nir_documents', column: 'commission_president', type: 'TEXT' },
    { table: 'nir_documents', column: 'commission_member1', type: 'TEXT' },
    { table: 'nir_documents', column: 'commission_member2', type: 'TEXT' },
    { table: 'nir_documents', column: 'observations', type: 'TEXT' },
    { table: 'nir_documents', column: 'company_name', type: 'TEXT' },
    { table: 'nir_documents', column: 'company_cui', type: 'TEXT' },
    { table: 'nir_documents', column: 'company_reg_com', type: 'TEXT' },
    { table: 'nir_documents', column: 'company_address', type: 'TEXT' },
    
    // NIR Items Extensions
    { table: 'nir_items', column: 'product_code', type: 'TEXT' },
    { table: 'nir_items', column: 'product_name', type: 'TEXT' },
    { table: 'nir_items', column: 'quantity_invoiced', type: 'REAL' },
    { table: 'nir_items', column: 'quantity_received', type: 'REAL' },
    { table: 'nir_items', column: 'difference_quantity', type: 'REAL DEFAULT 0' },
    { table: 'nir_items', column: 'difference_value', type: 'REAL DEFAULT 0' },
    
    // Invoice Extensions
    { table: 'invoices', column: 'supplier_name', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_cui', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_reg_com', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_address', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_city', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_county', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_country', type: "TEXT DEFAULT 'RO'" },
    { table: 'invoices', column: 'supplier_bank', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_iban', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_capital', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_phone', type: 'TEXT' },
    { table: 'invoices', column: 'supplier_email', type: 'TEXT' },
    { table: 'invoices', column: 'client_address', type: 'TEXT' },
    { table: 'invoices', column: 'client_city', type: 'TEXT' },
    { table: 'invoices', column: 'client_county', type: 'TEXT' },
    { table: 'invoices', column: 'client_country', type: "TEXT DEFAULT 'RO'" },
    { table: 'invoices', column: 'client_bank', type: 'TEXT' },
    { table: 'invoices', column: 'client_iban', type: 'TEXT' },
    { table: 'invoices', column: 'client_phone', type: 'TEXT' },
    { table: 'invoices', column: 'client_email', type: 'TEXT' },
    { table: 'invoices', column: 'due_date', type: 'TEXT' },
    { table: 'invoices', column: 'delivery_date', type: 'TEXT' },
    { table: 'invoices', column: 'payment_method', type: "TEXT DEFAULT 'Transfer bancar'" },
    { table: 'invoices', column: 'currency', type: "TEXT DEFAULT 'RON'" },
    { table: 'invoices', column: 'exchange_rate', type: 'REAL DEFAULT 1' },
    { table: 'invoices', column: 'notes', type: 'TEXT' },
    { table: 'invoices', column: 'delegate_name', type: 'TEXT' },
    { table: 'invoices', column: 'delegate_id_series', type: 'TEXT' },
    { table: 'invoices', column: 'delegate_id_number', type: 'TEXT' },
    { table: 'invoices', column: 'transport_means', type: 'TEXT' },
  ];
  
  // Add columns to existing tables
  for (const migration of migrations) {
    await addColumnIfNotExists(db, migration.table, migration.column, migration.type);
  }
  
  // Create new tables
  await createInvoiceLines(db);
  await createReceiptsLegal(db);
  await createDeliveryNotes(db);
  await createConsumptionVouchers(db);
  await createCashRegisterLegal(db);
  await createDocumentSequences(db);
  
  console.log('✅ [Legal Tipizate] Migrations completed successfully!');
}

function addColumnIfNotExists(db, table, column, type) {
  return new Promise((resolve) => {
    db.all(`PRAGMA table_info(${table})`, (err, columns) => {
      if (err) {
        console.warn(`⚠️ Table ${table} does not exist, skipping column ${column}`);
        resolve();
        return;
      }
      
      const columnExists = columns && columns.some(col => col.name === column);
      if (!columnExists) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.warn(`⚠️ Could not add column ${column} to ${table}:`, err.message);
          } else {
            console.log(`  ✓ Added ${table}.${column}`);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

function createInvoiceLines(db) {
  return new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS invoice_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        line_number INTEGER NOT NULL,
        product_code TEXT,
        product_name TEXT NOT NULL,
        description TEXT,
        unit_of_measure TEXT DEFAULT 'buc',
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        discount_percent REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        vat_rate REAL NOT NULL DEFAULT 21,
        vat_amount REAL NOT NULL,
        line_total_without_vat REAL NOT NULL,
        line_total_with_vat REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (!err) console.log('  ✓ Created invoice_lines table');
      resolve();
    });
  });
}

function createReceiptsLegal(db) {
  return new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS receipts_legal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_series TEXT NOT NULL DEFAULT 'CH',
        receipt_number TEXT NOT NULL,
        receipt_date DATE NOT NULL,
        company_name TEXT NOT NULL,
        company_cui TEXT NOT NULL,
        company_reg_com TEXT,
        company_address TEXT,
        payer_name TEXT NOT NULL,
        payer_cui TEXT,
        payer_address TEXT,
        amount REAL NOT NULL,
        amount_in_words TEXT NOT NULL,
        currency TEXT DEFAULT 'RON',
        purpose TEXT NOT NULL,
        payment_method TEXT DEFAULT 'Numerar',
        reference_doc_type TEXT,
        reference_doc_number TEXT,
        reference_doc_date TEXT,
        cashier_name TEXT NOT NULL,
        cashier_signature_confirmed INTEGER DEFAULT 0,
        order_id INTEGER,
        invoice_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      )
    `, (err) => {
      if (!err) console.log('  ✓ Created receipts_legal table');
      resolve();
    });
  });
}

function createDeliveryNotes(db) {
  return new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS delivery_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        series TEXT NOT NULL DEFAULT 'AVZ',
        number TEXT NOT NULL,
        issue_date DATE NOT NULL,
        sender_name TEXT NOT NULL,
        sender_cui TEXT NOT NULL,
        sender_reg_com TEXT,
        sender_address TEXT NOT NULL,
        sender_city TEXT,
        sender_county TEXT,
        sender_bank TEXT,
        sender_iban TEXT,
        recipient_name TEXT NOT NULL,
        recipient_cui TEXT,
        recipient_reg_com TEXT,
        recipient_address TEXT NOT NULL,
        recipient_city TEXT,
        recipient_county TEXT,
        delivery_address TEXT,
        delivery_city TEXT,
        delivery_county TEXT,
        transport_means TEXT,
        vehicle_number TEXT,
        driver_name TEXT,
        delegate_name TEXT,
        delegate_id_type TEXT,
        delegate_id_series TEXT,
        delegate_id_number TEXT,
        delegate_issued_by TEXT,
        invoice_series TEXT,
        invoice_number TEXT,
        invoice_date TEXT,
        total_quantity REAL DEFAULT 0,
        total_value REAL DEFAULT 0,
        currency TEXT DEFAULT 'RON',
        observations TEXT,
        sender_signature_name TEXT,
        sender_signature_confirmed INTEGER DEFAULT 0,
        recipient_signature_name TEXT,
        recipient_signature_confirmed INTEGER DEFAULT 0,
        status TEXT DEFAULT 'emis',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        UNIQUE(series, number)
      )
    `, (err) => {
      if (!err) console.log('  ✓ Created delivery_notes table');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS delivery_note_lines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          delivery_note_id INTEGER NOT NULL,
          line_number INTEGER NOT NULL,
          product_code TEXT,
          product_name TEXT NOT NULL,
          description TEXT,
          unit_of_measure TEXT DEFAULT 'buc',
          quantity REAL NOT NULL,
          unit_price REAL,
          line_value REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id) ON DELETE CASCADE
        )
      `, () => {
        console.log('  ✓ Created delivery_note_lines table');
        resolve();
      });
    });
  });
}

function createConsumptionVouchers(db) {
  return new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS consumption_vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        series TEXT NOT NULL DEFAULT 'BC',
        number TEXT NOT NULL,
        issue_date DATE NOT NULL,
        company_name TEXT NOT NULL,
        company_cui TEXT NOT NULL,
        source_warehouse TEXT NOT NULL,
        source_warehouse_id INTEGER,
        destination TEXT NOT NULL,
        destination_id INTEGER,
        total_value REAL DEFAULT 0,
        requested_by TEXT,
        approved_by TEXT,
        issued_by TEXT,
        received_by TEXT,
        observations TEXT,
        status TEXT DEFAULT 'emis',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        UNIQUE(series, number)
      )
    `, (err) => {
      if (!err) console.log('  ✓ Created consumption_vouchers table');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS consumption_voucher_lines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          voucher_id INTEGER NOT NULL,
          line_number INTEGER NOT NULL,
          product_code TEXT,
          product_name TEXT NOT NULL,
          unit_of_measure TEXT DEFAULT 'buc',
          quantity REAL NOT NULL,
          unit_price REAL NOT NULL,
          line_value REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (voucher_id) REFERENCES consumption_vouchers(id) ON DELETE CASCADE
        )
      `, () => {
        console.log('  ✓ Created consumption_voucher_lines table');
        resolve();
      });
    });
  });
}

function createCashRegisterLegal(db) {
  return new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS cash_register_legal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        register_date DATE NOT NULL,
        company_name TEXT NOT NULL,
        company_cui TEXT NOT NULL,
        opening_balance REAL NOT NULL DEFAULT 0,
        total_receipts REAL DEFAULT 0,
        total_payments REAL DEFAULT 0,
        closing_balance REAL NOT NULL,
        cashier_name TEXT NOT NULL,
        cashier_signature_confirmed INTEGER DEFAULT 0,
        verified_by TEXT,
        verified_signature_confirmed INTEGER DEFAULT 0,
        page_number INTEGER,
        status TEXT DEFAULT 'deschis',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(register_date, company_cui)
      )
    `, (err) => {
      if (!err) console.log('  ✓ Created cash_register_legal table');
      
      db.run(`
        CREATE TABLE IF NOT EXISTS cash_register_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          register_id INTEGER NOT NULL,
          entry_number INTEGER NOT NULL,
          document_type TEXT NOT NULL,
          document_series TEXT,
          document_number TEXT NOT NULL,
          document_date DATE NOT NULL,
          description TEXT NOT NULL,
          partner_name TEXT,
          amount REAL NOT NULL,
          entry_type TEXT NOT NULL,
          reference_type TEXT,
          reference_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (register_id) REFERENCES cash_register_legal(id) ON DELETE CASCADE
        )
      `, () => {
        console.log('  ✓ Created cash_register_entries table');
        resolve();
      });
    });
  });
}

function createDocumentSequences(db) {
  return new Promise((resolve) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS document_sequences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_type TEXT NOT NULL,
        series TEXT NOT NULL,
        current_number INTEGER NOT NULL DEFAULT 0,
        year INTEGER NOT NULL,
        prefix TEXT,
        suffix TEXT,
        format TEXT DEFAULT '{SERIES}-{YEAR}-{NUMBER:6}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(document_type, series, year)
      )
    `, (err) => {
      if (!err) console.log('  ✓ Created document_sequences table');
      
      const year = new Date().getFullYear();
      const sequences = [
        ['NIR', 'NIR', year],
        ['FACTURA', 'F', year],
        ['CHITANTA', 'CH', year],
        ['AVIZ', 'AVZ', year],
        ['BON_CONSUM', 'BC', year],
      ];
      
      let completed = 0;
      sequences.forEach(([docType, series, yr]) => {
        db.run(
          `INSERT OR IGNORE INTO document_sequences (document_type, series, current_number, year) VALUES (?, ?, 0, ?)`,
          [docType, series, yr],
          () => {
            completed++;
            if (completed === sequences.length) {
              console.log('  ✓ Initialized document sequences');
              resolve();
            }
          }
        );
      });
    });
  });
}

module.exports = { runLegalTipizateMigrations };

