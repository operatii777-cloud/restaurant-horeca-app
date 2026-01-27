/**
 * SQL VALIDATION HELPERS
 * 
 * Funcții helper pentru validare și sanitizare input SQL
 */

// Lista de tabele permise
const ALLOWED_TABLES = [
  'orders', 'order_items', 'menu', 'products', 'pos_payments',
  'ingredients', 'stock_moves', 'recipes', 'users', 'couriers',
  'suppliers', 'categories', 'allergens', 'fiscal_config'
];

// Lista de coloane permise (pentru ORDER BY, etc.)
const ALLOWED_COLUMNS = {
  orders: ['id', 'timestamp', 'total', 'status', 'table_number', 'client_name'],
  order_items: ['id', 'order_id', 'product_id', 'quantity', 'price'],
  menu: ['id', 'name', 'category', 'price', 'is_available'],
  products: ['id', 'name', 'category_id', 'price', 'stock'],
  ingredients: ['id', 'name', 'category', 'unit', 'current_stock']
};

/**
 * Validează un nume de tabel
 * @param {string} tableName - Numele tabelului de validat
 * @returns {boolean} - true dacă este valid
 */
function validateTableName(tableName) {
  if (!tableName || typeof tableName !== 'string') {
    return false;
  }
  
  // Verifică că conține doar caractere alfanumerice și underscore
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return false;
  }
  
  // Verifică că este în lista de tabele permise
  return ALLOWED_TABLES.includes(tableName.toLowerCase());
}

/**
 * Validează un nume de coloană pentru un tabel
 * @param {string} tableName - Numele tabelului
 * @param {string} columnName - Numele coloanei
 * @returns {boolean} - true dacă este valid
 */
function validateColumnName(tableName, columnName) {
  if (!columnName || typeof columnName !== 'string') {
    return false;
  }
  
  // Verifică că conține doar caractere alfanumerice și underscore
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
    return false;
  }
  
  // Verifică că este în lista de coloane permise pentru tabel
  const allowed = ALLOWED_COLUMNS[tableName?.toLowerCase()];
  if (allowed) {
    return allowed.includes(columnName.toLowerCase());
  }
  
  // Dacă nu avem listă specifică, doar validăm formatul
  return true;
}

/**
 * Sanitizează un string pentru folosire în SQL (doar pentru table/column names)
 * @param {string} input - Input-ul de sanitizat
 * @returns {string|null} - String sanitizat sau null dacă invalid
 */
function sanitizeIdentifier(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  // Elimină caracterele periculoase
  const sanitized = input.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Verifică că începe cu literă sau underscore
  if (!/^[a-zA-Z_]/.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}

module.exports = {
  validateTableName,
  validateColumnName,
  sanitizeIdentifier,
  ALLOWED_TABLES,
  ALLOWED_COLUMNS
};
