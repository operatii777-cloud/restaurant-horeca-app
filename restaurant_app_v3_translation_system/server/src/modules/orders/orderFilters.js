/**
 * ORDER FILTERS HELPER
 * 
 * Helper functions pentru filtrarea comenzilor în query-uri SQL
 * Asigură consistența în toate rapoartele și query-urile
 * 
 * Usage:
 *   const { buildOrderFilters } = require('./orderFilters');
 *   const { whereClause, params } = buildOrderFilters({ dateFrom, dateTo, tablePrefix: 'o' });
 *   const sql = `SELECT * FROM orders ${whereClause}`;
 */

const { dbPromise } = require('../../../database');

/**
 * Construiește WHERE clause și params pentru filtrarea comenzilor
 * 
 * @param {Object} options
 * @param {string} options.dateFrom - Data de început (YYYY-MM-DD)
 * @param {string} options.dateTo - Data de sfârșit (YYYY-MM-DD)
 * @param {string} options.tablePrefix - Prefix pentru tabel (default: 'orders', use 'o' pentru alias)
 * @param {boolean} options.checkColumnExists - Verifică dacă coloanele există (default: false, pentru performanță)
 * @returns {Promise<{whereClause: string, params: Array}>}
 */
async function buildOrderFilters(options = {}) {
  const {
    dateFrom,
    dateTo,
    tablePrefix = 'orders',
    checkColumnExists = false
  } = options;

  const where = [];
  const params = [];

  // Filtru dată
  if (dateFrom) {
    if (tablePrefix === 'orders') {
      where.push(`DATE(${tablePrefix}.timestamp) >= DATE(?)`);
    } else {
      where.push(`DATE(${tablePrefix}.timestamp) >= DATE(?)`);
    }
    params.push(dateFrom);
  }
  if (dateTo) {
    if (tablePrefix === 'orders') {
      where.push(`DATE(${tablePrefix}.timestamp) <= DATE(?)`);
    } else {
      where.push(`DATE(${tablePrefix}.timestamp) <= DATE(?)`);
    }
    params.push(dateTo);
  }

  // Filtrare status: doar comenzile plătite/completate/livrate
  // Nu includem NULL pentru consistență în rapoarte
  where.push(`${tablePrefix}.status IN ('paid', 'completed', 'delivered')`);

  // Excludem comenzile de test
  // table_number >= 0 (exclude negative test table numbers)
  where.push(`(${tablePrefix}.table_number IS NULL OR ${tablePrefix}.table_number >= 0)`);
  
  // client_identifier nu conține 'test'
  where.push(`(${tablePrefix}.client_identifier IS NULL OR LOWER(${tablePrefix}.client_identifier) NOT LIKE '%test%')`);

  // Dacă e necesar, verificăm existența coloanelor (pentru compatibilitate cu baze vechi)
  if (checkColumnExists) {
    try {
      const db = await dbPromise;
      const tableInfo = await new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(orders)`, [], (err, result) => {
          if (err) reject(err);
          else resolve(result || []);
        });
      });
      
      const columnNames = tableInfo.map(col => col.name);
      
      // Dacă status nu există, înlocuim cu is_paid
      if (!columnNames.includes('status')) {
        // Remove status filter and use is_paid instead
        where.pop(); // Remove last status filter
        const statusIndex = where.findIndex(w => w.includes('status IN'));
        if (statusIndex !== -1) {
          where.splice(statusIndex, 1);
        }
        where.push(`${tablePrefix}.is_paid = 1`);
      }
      
      // Dacă table_number nu există, eliminăm filtrul
      if (!columnNames.includes('table_number')) {
        const tableNumIndex = where.findIndex(w => w.includes('table_number'));
        if (tableNumIndex !== -1) {
          where.splice(tableNumIndex, 1);
        }
      }
      
      // Dacă client_identifier nu există, eliminăm filtrul
      if (!columnNames.includes('client_identifier')) {
        const clientIdIndex = where.findIndex(w => w.includes('client_identifier'));
        if (clientIdIndex !== -1) {
          where.splice(clientIdIndex, 1);
        }
      }
    } catch (err) {
      console.warn('[Order Filters] Nu s-a putut verifica coloanele, folosim filtrele default');
    }
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  
  return { whereClause, params };
}

/**
 * Helper pentru adăugarea filtrelor de comandă la un query existent
 * 
 * @param {string} existingWhere - WHERE clause existent (fără WHERE keyword)
 * @param {Object} options - Opțiuni pentru buildOrderFilters
 * @returns {Promise<{whereClause: string, params: Array}>}
 */
async function addOrderFilters(existingWhere, options = {}) {
  const { whereClause: newWhereClause, params: newParams } = await buildOrderFilters(options);
  
  if (!existingWhere) {
    return { whereClause: newWhereClause, params: newParams };
  }
  
  const existingWhereClean = existingWhere.trim().replace(/^WHERE\s+/i, '');
  const newWhereClean = newWhereClause.trim().replace(/^WHERE\s+/i, '');
  
  const combinedWhere = existingWhereClean 
    ? `${existingWhereClean} AND ${newWhereClean}`
    : newWhereClean;
  
  return {
    whereClause: combinedWhere ? `WHERE ${combinedWhere}` : '',
    params: newParams
  };
}

module.exports = {
  buildOrderFilters,
  addOrderFilters
};

