// models_restgest_restwin.js
// Modele moderne (SQLite/ORM ready) clonate din structura RestGest/Restwin

// Product model
const Product = {
  id: 'INTEGER PRIMARY KEY', // COD_PROD
  name: 'TEXT',             // DEN_PROD
  department: 'INTEGER',    // DEP
  category: 'TEXT',         // GRUP/GRUPA
  cost_price: 'REAL',       // PR_COST
  price: 'REAL',            // PRET1
  price2: 'REAL',           // PRET2
  price3: 'REAL',           // PRET3
  vat: 'REAL',              // TVA
  printer: 'TEXT',          // IMPRIMANTA
  status: 'INTEGER',        // STATUS
  barcode: 'TEXT'           // BARCOD
};

// Sale/Bon model
const Sale = {
  table_number: 'TEXT',     // NR_MASA
  waiter_id: 'INTEGER',     // NR_OSP
  product_id: 'INTEGER',    // COD_PROD
  product_name: 'TEXT',     // DEN_PROD
  department: 'INTEGER',    // DEP
  category: 'TEXT',         // GRUPA
  quantity: 'REAL',         // CANT
  unit_price: 'REAL',       // PR_UNITAR
  total: 'REAL',            // VALOARE
  vat: 'REAL',              // TVA
  fried: 'TEXT',            // PRAJIT
  timestamp: 'TEXT',        // DATA, ORA, MIN (de combinat)
  discount: 'TEXT',         // DISCOUNT
  payment_type: 'INTEGER'   // TIP_PLATA
};

// Unit of Measure model
const UnitOfMeasure = {
  from_unit: 'TEXT',        // UM1
  from_coef: 'REAL',        // COEF1
  to_unit: 'TEXT',          // UM2
  to_coef: 'REAL'           // COEF2
};

// Recipe model
const Recipe = {
  recipe_id: 'INTEGER',     // COD_RET
  material_id: 'INTEGER',   // COD_MAT
  name: 'TEXT',             // DENUMIRE
  quantity: 'REAL',         // CANT
  unit: 'TEXT',             // UM
  warehouse: 'INTEGER',     // GESTIUNI
  price: 'REAL',            // PRET
  pieces: 'REAL',           // BUC
  coef: 'REAL'              // COEF
};

// Export for use in migration/mapping scripts
module.exports = {
  Product,
  Sale,
  UnitOfMeasure,
  Recipe
};
