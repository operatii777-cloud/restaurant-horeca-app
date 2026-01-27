/**
 * PHASE S8.6 - Fiscal Codes Service (NCM/CN)
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Product → NCM/CN fiscal code mapping and validation
 */

const { dbPromise } = require('../../../database');
const Fuse = require('fuse.js');

/**
 * PHASE S8.6 - Search NCM/CN codes
 */
async function searchFiscalCodes(query: string, limit: number = 20) {
  // TODO S8.6: Load NCM/CN data from CSV and create search index
  // For now, return empty results
  return {
    ncm: [],
    cn: []
  };
}

/**
 * PHASE S8.6 - Get fiscal code for product
 */
async function getFiscalCodeForProduct(productId: number, date: Date = new Date()): Promise<{
  ncmCode: string | null;
  cnCode: string | null;
}> {
  const db = await dbPromise;
  const dateStr = date.toISOString().split('T')[0];
  
  const code = await new Promise((resolve, reject) => {
    db.get(
      `SELECT ncm_code, cn_code 
       FROM product_fiscal_codes 
       WHERE product_id = ? 
         AND (valid_from IS NULL OR valid_from <= ?)
         AND (valid_to IS NULL OR valid_to >= ?)
       ORDER BY valid_from DESC
       LIMIT 1`,
      [productId, dateStr, dateStr],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || { ncmCode: null, cnCode: null });
      }
    );
  });

  return {
    ncmCode: code.ncm_code || null,
    cnCode: code.cn_code || null
  };
}

/**
 * PHASE S8.6 - Assign fiscal code to product
 */
async function assignFiscalCode(productId: number, ncmCode: string | null, cnCode: string | null, validFrom: string | null, validTo: string | null, reason: string | null) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO product_fiscal_codes 
       (product_id, ncm_code, cn_code, valid_from, valid_to, reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))`,
      [productId, ncmCode, cnCode, validFrom, validTo, reason],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, productId, ncmCode, cnCode });
      }
    );
  });
}

/**
 * PHASE S8.6 - Get fiscal code history for product
 */
async function getFiscalCodeHistory(productId: number) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM product_fiscal_codes 
       WHERE product_id = ? 
       ORDER BY valid_from DESC, created_at DESC`,
      [productId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

module.exports = {
  searchFiscalCodes,
  getFiscalCodeForProduct,
  assignFiscalCode,
  getFiscalCodeHistory
};


