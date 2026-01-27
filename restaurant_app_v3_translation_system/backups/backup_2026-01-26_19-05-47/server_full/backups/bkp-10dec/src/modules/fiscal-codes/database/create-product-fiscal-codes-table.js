/**
 * PHASE S8.6 - Migration: Create product_fiscal_codes table
 * 
 * Restaurant App V3 powered by QrOMS
 */

const { dbPromise } = require('../../../../database');

async function createProductFiscalCodesTable() {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS product_fiscal_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        ncm_code TEXT,
        cn_code TEXT,
        valid_from TEXT,
        valid_to TEXT,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu(id)
      )`,
      (err) => {
        if (err) {
          console.error('❌ Error creating product_fiscal_codes table:', err.message);
          reject(err);
        } else {
          console.log('✅ product_fiscal_codes table created/verified');
          
          // Create indexes
          db.run(
            `CREATE INDEX IF NOT EXISTS idx_product_fiscal_codes_product ON product_fiscal_codes(product_id)`,
            () => {}
          );
          db.run(
            `CREATE INDEX IF NOT EXISTS idx_product_fiscal_codes_dates ON product_fiscal_codes(valid_from, valid_to)`,
            () => resolve()
          );
        }
      }
    );
  });
}

module.exports = { createProductFiscalCodesTable };


