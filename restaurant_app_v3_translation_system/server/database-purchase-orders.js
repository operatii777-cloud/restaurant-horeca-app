/**
 * Purchase order draft tables (T-CL-020)
 * Used by auto-purchase-orders + smart-restock-v2
 */
function ensureSupplierNameColumns(db) {
  return new Promise((resolve) => {
    db.all('PRAGMA table_info(suppliers)', [], (err, cols) => {
      if (err || !cols || cols.length === 0) return resolve();
      const names = new Set(cols.map((c) => c.name));
      const steps = [];
      if (!names.has('company_name')) {
        steps.push('ALTER TABLE suppliers ADD COLUMN company_name TEXT');
      }
      if (!names.has('name')) {
        steps.push('ALTER TABLE suppliers ADD COLUMN name TEXT');
      }
      if (steps.length === 0) return resolve();
      let i = 0;
      const next = () => {
        if (i >= steps.length) {
          db.run(`UPDATE suppliers SET company_name = name WHERE (company_name IS NULL OR company_name = '') AND name IS NOT NULL`);
          db.run(`UPDATE suppliers SET name = company_name WHERE (name IS NULL OR name = '') AND company_name IS NOT NULL`, () => resolve());
          return;
        }
        db.run(steps[i++], () => next());
      };
      next();
    });
  });
}

function createPurchaseOrderTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      ensureSupplierNameColumns(db).then(() => {
        db.run(`CREATE TABLE IF NOT EXISTS auto_reorder_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ingredient_id INTEGER NOT NULL,
          supplier_id INTEGER,
          reorder_point REAL DEFAULT 0,
          reorder_quantity REAL DEFAULT 0,
          max_stock_level REAL,
          lead_time_days INTEGER DEFAULT 1,
          is_active INTEGER DEFAULT 1,
          last_triggered DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
          FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS purchase_order_drafts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          supplier_id INTEGER,
          status TEXT NOT NULL DEFAULT 'draft',
          total_value REAL DEFAULT 0,
          expected_delivery DATE,
          notes TEXT,
          created_by INTEGER,
          auto_generated INTEGER DEFAULT 0,
          approved_by INTEGER,
          approved_at DATETIME,
          sent_at DATETIME,
          received_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS purchase_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          ingredient_id INTEGER,
          quantity REAL NOT NULL DEFAULT 0,
          unit TEXT,
          unit_price REAL DEFAULT 0,
          total_price REAL DEFAULT 0,
          received_quantity REAL DEFAULT 0,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES purchase_order_drafts(id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
        )`);

        db.run(`CREATE INDEX IF NOT EXISTS idx_po_drafts_status ON purchase_order_drafts(status)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_po_drafts_supplier ON purchase_order_drafts(supplier_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_po_items_order ON purchase_order_items(order_id)`, (err) => {
          if (err) {
            console.error('❌ purchase order tables:', err.message);
            reject(err);
          } else {
            console.log('✅ purchase_order_drafts + items + auto_reorder_rules ready');
            resolve();
          }
        });
      });
    });
  });
}

module.exports = { createPurchaseOrderTables };
