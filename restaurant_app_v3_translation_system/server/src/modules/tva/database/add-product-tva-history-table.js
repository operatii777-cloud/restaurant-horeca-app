/**
 * PHASE S8.4 - Migration: Create product_tva_history table
 * 
 * Restaurant App V3 powered by QrOMS
 */

const { dbPromise } = require('../../../../database');

async function createProductTvaHistoryTable() {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS product_tva_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        vat_rate REAL NOT NULL,
        valid_from TEXT,
        valid_to TEXT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu(id)
      )`,
      (err) => {
        if (err) {
          console.error('❌ Error creating product_tva_history table:', err.message);
          reject(err);
        } else {
          console.log('✅ product_tva_history table created/verified');
          
          // Create indexes
          db.run(
            `CREATE INDEX IF NOT EXISTS idx_product_tva_history_product ON product_tva_history(product_id)`,
            () => {}
          );
          db.run(
            `CREATE INDEX IF NOT EXISTS idx_product_tva_history_dates ON product_tva_history(valid_from, valid_to)`,
            () => resolve()
          );
        }
      }
    );
  });
}

module.exports = { createProductTvaHistoryTable };


