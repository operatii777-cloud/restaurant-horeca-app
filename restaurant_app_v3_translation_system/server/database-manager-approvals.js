/**
 * Manager approval journal tables (T-CL-018)
 * order_voids + discount_approval_log
 */
function createManagerApprovalTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS order_voids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        order_item_id INTEGER,
        void_type TEXT NOT NULL DEFAULT 'item',
        reason TEXT,
        amount REAL DEFAULT 0,
        initiated_by INTEGER,
        initiated_by_name TEXT,
        approved_by INTEGER,
        approved_by_name TEXT,
        approved_at DATETIME,
        pin_verified INTEGER DEFAULT 0,
        source TEXT DEFAULT 'POS',
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS discount_approval_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        order_item_id INTEGER,
        order_discount_id INTEGER,
        discount_definition_id INTEGER,
        discount_type TEXT,
        discount_value REAL,
        discount_amount REAL,
        reason TEXT,
        initiated_by INTEGER,
        initiated_by_name TEXT,
        approved_by INTEGER,
        approved_by_name TEXT,
        approved_at DATETIME,
        pin_verified INTEGER DEFAULT 0,
        source TEXT DEFAULT 'POS',
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_order_voids_created ON order_voids(created_at DESC)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_order_voids_order ON order_voids(order_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_discount_approval_created ON discount_approval_log(created_at DESC)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_discount_approval_order ON discount_approval_log(order_id)`, (err) => {
        if (err) {
          console.error('❌ manager approval tables:', err.message);
          reject(err);
        } else {
          console.log('✅ order_voids + discount_approval_log ready');
          resolve();
        }
      });
    });
  });
}

module.exports = { createManagerApprovalTables };
