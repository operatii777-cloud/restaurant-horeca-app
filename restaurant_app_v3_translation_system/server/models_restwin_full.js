// models_restwin_full.js
// Modele moderne (SQLite/ORM ready) clonate din TOATE tabelele Restwin (inclusiv tabele rare sau mici)

const Back = {
  NR_MASA: 'TEXT',
  NR_OSP: 'INTEGER',
  COD_PROD: 'INTEGER',
  DEN_PROD: 'TEXT',
  DEP: 'INTEGER',
  GRUPA: 'TEXT',
  CANT: 'REAL',
  PR_UNITAR: 'REAL',
  VALOARE: 'REAL',
  TVA: 'REAL',
  PRAJIT: 'TEXT',
  DATA: 'TEXT',
  ORA: 'INTEGER',
  MIN: 'INTEGER',
  DISCOUNT: 'TEXT',
  TIP_PLATA: 'INTEGER'
};

const Produse = {
  COD_PROD: 'INTEGER PRIMARY KEY',
  DEN_PROD: 'TEXT',
  DEP: 'INTEGER',
  GRUP: 'INTEGER',
  PR_COST: 'REAL',
  PRET1: 'REAL',
  PRET2: 'REAL',
  PRET3: 'REAL',
  TVA: 'REAL',
  IMPRIMANTA: 'INTEGER',
  STATUS: 'INTEGER',
  BARCOD: 'TEXT'
};

const Tempx = {
  NR_MASA: 'INTEGER',
  NR_OSP: 'INTEGER',
  COD_PROD: 'INTEGER',
  DEN_PROD: 'TEXT',
  DEP: 'INTEGER',
  GRUPA: 'INTEGER',
  CANT: 'REAL',
  PR_UNITAR: 'REAL',
  VALOARE: 'REAL',
  TVA: 'REAL',
  PRAJIT: 'TEXT',
  DATA: 'TEXT',
  ORA: 'INTEGER',
  MIN: 'INTEGER',
  DISCOUNT: 'TEXT',
  TIP_PLATA: 'INTEGER',
  IMPRIMAT: 'BOOLEAN',
  BUC_IMPRIM: 'INTEGER'
};

module.exports = {
  Back,
  Produse,
  Tempx
};
