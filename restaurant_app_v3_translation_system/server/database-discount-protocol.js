/**
 * DISCOUNT & PROTOCOL SALES - Database Extensions
 * Adds support for:
 * - Granular discounts (per product and per invoice)
 * - Protocol sales (company contracts)
 * - Serving order grouping
 * Data: 14 Februarie 2026
 */

/**
 * Initialize discount and protocol tables
 * @param {Object} db - SQLite database instance (required to avoid circular dependency)
 */
async function createDiscountProtocolTables(db) {
  // Add null check - db can be undefined due to circular dependency
  if (!db || typeof db.serialize !== 'function') {
    console.error('❌ Database connection not available for discount protocol tables');
    return Promise.resolve(); // Skip gracefully
  }
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔧 Initializing discount and protocol tables...');
      
      // TABEL 1: Discount Definitions (template-uri de discounturi)
      db.run(`CREATE TABLE IF NOT EXISTS discount_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'protocol'
        value REAL NOT NULL,
        applies_to TEXT NOT NULL, -- 'product', 'category', 'order'
        target_id INTEGER, -- NULL for order-level, product/category ID otherwise
        protocol_id INTEGER, -- FK to protocols table if type='protocol'
        requires_approval BOOLEAN DEFAULT 0,
        max_amount REAL, -- Maximum discount amount allowed
        min_order_value REAL, -- Minimum order value to apply
        valid_from DATETIME,
        valid_until DATETIME,
        active BOOLEAN DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE SET NULL
      )`, (err) => {
        if (err) console.error('❌ Error creating discount_definitions:', err.message);
        else console.log('✅ Table discount_definitions created');
      });
      
      // TABEL 2: Protocols (contracte cu firme/institutii)
      db.run(`CREATE TABLE IF NOT EXISTS protocols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protocol_number TEXT NOT NULL UNIQUE,
        company_name TEXT NOT NULL,
        company_cui TEXT,
        company_address TEXT,
        contact_person TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        discount_type TEXT DEFAULT 'percentage', -- 'percentage', 'fixed_amount'
        discount_value REAL DEFAULT 0,
        payment_terms TEXT, -- 'immediate', '15_days', '30_days', '60_days', '90_days'
        payment_method TEXT, -- 'bank_transfer', 'cash', 'card'
        notes TEXT,
        contract_start DATE,
        contract_end DATE,
        billing_cycle TEXT DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly'
        credit_limit REAL DEFAULT 0, -- Plafonul de credit
        current_debt REAL DEFAULT 0, -- Datoria curenta
        active BOOLEAN DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('❌ Error creating protocols:', err.message);
        else console.log('✅ Table protocols created');
      });
      
      // TABEL 3: Applied Discounts (discounturi aplicate pe comenzi)
      db.run(`CREATE TABLE IF NOT EXISTS order_discounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        order_item_id INTEGER, -- NULL for order-level discount
        discount_definition_id INTEGER, -- FK to discount_definitions
        protocol_id INTEGER, -- FK to protocols
        type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'protocol'
        value REAL NOT NULL, -- Percentage or amount
        amount REAL NOT NULL, -- Actual discount amount applied
        reason TEXT,
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
        FOREIGN KEY (discount_definition_id) REFERENCES discount_definitions(id) ON DELETE SET NULL,
        FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE SET NULL
      )`, (err) => {
        if (err) console.error('❌ Error creating order_discounts:', err.message);
        else console.log('✅ Table order_discounts created');
      });
      
      // TABEL 4: Protocol Invoices (facturi emise pe protocol)
      db.run(`CREATE TABLE IF NOT EXISTS protocol_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protocol_id INTEGER NOT NULL,
        invoice_number TEXT NOT NULL UNIQUE,
        invoice_date DATE NOT NULL,
        due_date DATE,
        period_start DATE,
        period_end DATE,
        subtotal REAL NOT NULL DEFAULT 0,
        discount_total REAL DEFAULT 0,
        tax_total REAL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'paid', 'overdue', 'cancelled'
        payment_date DATE,
        notes TEXT,
        pdf_path TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error('❌ Error creating protocol_invoices:', err.message);
        else console.log('✅ Table protocol_invoices created');
      });
      
      // TABEL 5: Serving Order Groups (grupare produse dupa ordinea de servire)
      db.run(`CREATE TABLE IF NOT EXISTS serving_order_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sequence INTEGER NOT NULL, -- Order of serving (1=first, 2=second, etc.)
        color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('❌ Error creating serving_order_groups:', err.message);
        else console.log('✅ Table serving_order_groups created');
      });
      
      // Add serving_order_group_id to order_items
      db.run(`ALTER TABLE order_items ADD COLUMN serving_order_group_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration order_items.serving_order_group_id:', err.message);
        } else if (!err) {
          console.log('✅ Column serving_order_group_id added to order_items');
        }
      });
      
      // Add discount fields to order_items
      db.run(`ALTER TABLE order_items ADD COLUMN discount_type TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration order_items.discount_type:', err.message);
        } else if (!err) {
          console.log('✅ Column discount_type added to order_items');
        }
      });
      
      db.run(`ALTER TABLE order_items ADD COLUMN discount_value REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration order_items.discount_value:', err.message);
        } else if (!err) {
          console.log('✅ Column discount_value added to order_items');
        }
      });
      
      db.run(`ALTER TABLE order_items ADD COLUMN discount_amount REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration order_items.discount_amount:', err.message);
        } else if (!err) {
          console.log('✅ Column discount_amount added to order_items');
        }
      });
      
      // Add protocol and discount fields to orders
      db.run(`ALTER TABLE orders ADD COLUMN protocol_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration orders.protocol_id:', err.message);
        } else if (!err) {
          console.log('✅ Column protocol_id added to orders');
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN discount_total REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration orders.discount_total:', err.message);
        } else if (!err) {
          console.log('✅ Column discount_total added to orders');
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN subtotal REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration orders.subtotal:', err.message);
        } else if (!err) {
          console.log('✅ Column subtotal added to orders');
        }
      });
      
      // Create indexes for performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_order_discounts_order ON order_discounts(order_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_order_discounts_item ON order_discounts(order_item_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_protocol_invoices_protocol ON protocol_invoices(protocol_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_protocol_invoices_status ON protocol_invoices(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_serving_order ON order_items(serving_order_group_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_protocol ON orders(protocol_id)`);
      
      // Insert default serving order groups
      const defaultGroups = [
        { name: 'Aperitive', sequence: 1, color: '#f59e0b', icon: '🥗' },
        { name: 'Felul Principal', sequence: 2, color: '#ef4444', icon: '🍝' },
        { name: 'Garnituri', sequence: 3, color: '#10b981', icon: '🥔' },
        { name: 'Desert', sequence: 4, color: '#8b5cf6', icon: '🍰' },
        { name: 'Bauturi', sequence: 5, color: '#3b82f6', icon: '🥤' }
      ];
      
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO serving_order_groups (name, sequence, color, icon) 
        VALUES (?, ?, ?, ?)
      `);
      
      defaultGroups.forEach(group => {
        stmt.run(group.name, group.sequence, group.color, group.icon);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('❌ Error inserting default serving order groups:', err.message);
          reject(err);
        } else {
          console.log('✅ Default serving order groups inserted');
          resolve();
        }
      });
    });
  });
}

module.exports = {
  createDiscountProtocolTables
};
