// models_restgest_full.js
// Modele moderne (SQLite/ORM ready) clonate din TOATE tabelele RestGest (inclusiv tabele rare sau mici)

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

const Furnizori = {
  COD_CLIENT: 'INTEGER PRIMARY KEY',
  DENUMIRE: 'TEXT',
  REG_COM: 'TEXT',
  ADRESA: 'TEXT',
  JUDETUL: 'TEXT',
  CONT: 'TEXT',
  BANCA: 'TEXT',
  TELEFON: 'TEXT',
  TEL_MOBIL: 'TEXT',
  TEL_FAX: 'TEXT',
  PERS_CONTA: 'TEXT',
  BI_SERIE: 'TEXT',
  BI_NUMAR: 'TEXT',
  AUTO: 'TEXT',
  TOTAL: 'TEXT',
  COD_FISCAL: 'TEXT'
};

const Matprm = {
  COD: 'INTEGER PRIMARY KEY',
  DENUMIRE: 'TEXT',
  GRUPA: 'INTEGER',
  PRET: 'REAL',
  UM: 'TEXT',
  ST_MIN: 'REAL',
  PROCES: 'BOOLEAN',
  COEF: 'REAL',
  ZILE: 'INTEGER',
  TVA: 'REAL'
};

const Matsort = { ...Matprm };

const Prodsort = {
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

const Produse = { ...Prodsort };

const Raport = {
  COD: 'TEXT',
  DENUMIRE: 'TEXT',
  CAR1: 'TEXT',
  CAR2: 'TEXT',
  CAR3: 'TEXT',
  UM: 'TEXT',
  NUM1: 'REAL',
  NUM2: 'REAL',
  NUM3: 'REAL',
  NUM4: 'REAL',
  NUM5: 'REAL',
  NUM6: 'REAL',
  NUM7: 'REAL',
  NUM8: 'REAL',
  DATA: 'TEXT'
};

const Restconf = {
  DENUMIRE: 'TEXT',
  CUI: 'TEXT',
  ADRESA: 'TEXT',
  CONT: 'TEXT',
  BANCA: 'TEXT',
  FIFO: 'TEXT',
  LIFO: 'TEXT',
  MEDIU: 'BOOLEAN'
};

const Retete = {
  COD_RET: 'INTEGER',
  COD_MAT: 'INTEGER',
  DENUMIRE: 'TEXT',
  CANT: 'REAL',
  UM: 'TEXT',
  GESTIUNI: 'INTEGER',
  PRET: 'REAL',
  BUC: 'REAL',
  COEF: 'REAL'
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

const Transfer = {
  PROD_COD: 'INTEGER',
  PROD_DEN: 'TEXT',
  PROD_UM: 'TEXT',
  PROD_UMI: 'INTEGER',
  CANT_TRANS: 'REAL',
  DATA_TR: 'TEXT',
  DIN_GEST: 'INTEGER',
  IN_GEST: 'INTEGER',
  NOTA_TR: 'INTEGER',
  PROD_PRET: 'REAL',
  PROD_DOLAR: 'REAL'
};

const UM = {
  UM1: 'TEXT',
  COEF1: 'REAL',
  UM2: 'TEXT',
  COEF2: 'REAL'
};

module.exports = {
  Back,
  Furnizori,
  Matprm,
  Matsort,
  Prodsort,
  Produse,
  Raport,
  Restconf,
  Retete,
  Tempx,
  Transfer,
  UM
};
