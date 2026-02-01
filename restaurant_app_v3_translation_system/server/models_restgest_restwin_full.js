// models_restgest_restwin_full.js
// Modele moderne (SQLite/ORM ready) clonate din TOATE tabelele RestGest/Restwin

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

const UnitOfMeasure = {
  from_unit: 'TEXT',        // UM1
  from_coef: 'REAL',        // COEF1
  to_unit: 'TEXT',          // UM2
  to_coef: 'REAL'           // COEF2
};

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

const Supplier = {
  id: 'INTEGER PRIMARY KEY', // COD_CLIENT
  name: 'TEXT',              // DENUMIRE
  reg_com: 'TEXT',           // REG_COM
  address: 'TEXT',           // ADRESA
  county: 'TEXT',            // JUDETUL
  account: 'TEXT',           // CONT
  bank: 'TEXT',              // BANCA
  phone: 'TEXT',             // TELEFON
  mobile: 'TEXT',            // TEL_MOBIL
  fax: 'TEXT',               // TEL_FAX
  contact_person: 'TEXT',    // PERS_CONTA
  bi_series: 'TEXT',         // BI_SERIE
  bi_number: 'TEXT',         // BI_NUMAR
  car: 'TEXT',               // AUTO
  total: 'TEXT',             // TOTAL
  fiscal_code: 'TEXT'        // COD_FISCAL
};

const StockMove = {
  product_code: 'INTEGER',   // PROD_COD
  product_name: 'TEXT',      // PROD_DEN
  product_um: 'TEXT',        // PROD_UM
  product_umi: 'INTEGER',    // PROD_UMI
  quantity: 'REAL',          // CANT_TRANS
  date: 'TEXT',              // DATA_TR
  from_warehouse: 'INTEGER', // DIN_GEST
  to_warehouse: 'INTEGER',   // IN_GEST
  note: 'INTEGER',           // NOTA_TR
  price: 'REAL',             // PROD_PRET
  dollar: 'REAL'             // PROD_DOLAR
};

const Inventory = {
  code: 'TEXT',              // COD
  name: 'TEXT',              // DENUMIRE
  car1: 'TEXT',              // CAR1
  car2: 'TEXT',              // CAR2
  car3: 'TEXT',              // CAR3
  um: 'TEXT',                // UM
  num1: 'REAL',              // NUM1
  num2: 'REAL',              // NUM2
  num3: 'REAL',              // NUM3
  num4: 'REAL',              // NUM4
  num5: 'REAL',              // NUM5
  num6: 'REAL',              // NUM6
  num7: 'REAL',              // NUM7
  num8: 'REAL',              // NUM8
  date: 'TEXT'               // DATA
};

const RestaurantConfig = {
  name: 'TEXT',              // DENUMIRE
  cui: 'TEXT',               // CUI
  address: 'TEXT',           // ADRESA
  account: 'TEXT',           // CONT
  bank: 'TEXT',              // BANCA
  fifo: 'TEXT',              // FIFO
  lifo: 'TEXT',              // LIFO
  average: 'BOOLEAN'         // MEDIU
};

module.exports = {
  Product,
  Sale,
  UnitOfMeasure,
  Recipe,
  Supplier,
  StockMove,
  Inventory,
  RestaurantConfig
};
