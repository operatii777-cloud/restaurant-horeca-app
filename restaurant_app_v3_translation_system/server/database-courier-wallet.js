/**
 * Courier cashback wallet (T-CL-020)
 */
function createCourierWalletTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS courier_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courier_id INTEGER NOT NULL UNIQUE,
        balance REAL NOT NULL DEFAULT 0,
        lifetime_earned REAL NOT NULL DEFAULT 0,
        lifetime_redeemed REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'RON',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courier_id) REFERENCES couriers(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS courier_wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courier_id INTEGER NOT NULL,
        wallet_id INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        balance_after REAL NOT NULL,
        reference_type TEXT,
        reference_id INTEGER,
        description TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courier_id) REFERENCES couriers(id),
        FOREIGN KEY (wallet_id) REFERENCES courier_wallets(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS courier_cashback_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        percent REAL NOT NULL DEFAULT 0,
        fixed_amount REAL DEFAULT 0,
        min_delivery_fee REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_courier_wallet_tx_courier ON courier_wallet_transactions(courier_id, created_at DESC)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_courier_wallets_courier ON courier_wallets(courier_id)`, (err) => {
        if (err) {
          console.error('❌ courier wallet tables:', err.message);
          reject(err);
        } else {
          console.log('✅ courier_wallets + transactions + cashback_rules ready');
          resolve();
        }
      });
    });
  });
}

module.exports = { createCourierWalletTables };
