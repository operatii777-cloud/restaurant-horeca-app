// import_all_csv_to_sqlite.js
// Script pentru importul tuturor tabelelor CSV extrase din RestGest_converted în SQLite
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'restgest_import.db');
const CSV_DIR = path.join(__dirname, 'RestGest_converted');

// Mapare: nume fisier CSV -> instructiune CREATE TABLE (fara extensie)
const tableSchemas = {
  produse: `CREATE TABLE IF NOT EXISTS produse (
    COD_PROD INTEGER PRIMARY KEY,
    DEN_PROD TEXT,
    DEP INTEGER,
    GRUP TEXT,
    PR_COST REAL,
    PRET1 REAL,
    PRET2 REAL,
    PRET3 REAL,
    TVA REAL,
    IMPRIMANTA TEXT,
    STATUS TEXT,
    BARCOD TEXT
  )`,
  back: `CREATE TABLE IF NOT EXISTS back (
    NR_MASA TEXT,
    NR_OSP INTEGER,
    COD_PROD INTEGER,
    DEN_PROD TEXT,
    DEP INTEGER,
    GRUPA TEXT,
    CANT REAL,
    PR_UNITAR REAL,
    VALOARE REAL,
    TVA REAL,
    PRAJIT TEXT,
    DATA TEXT,
    ORA INTEGER,
    MIN INTEGER,
    DISCOUNT TEXT,
    TIP_PLATA INTEGER
  )`,
  um: `CREATE TABLE IF NOT EXISTS um (
    UM1 TEXT,
    COEF1 REAL,
    UM2 TEXT,
    COEF2 REAL
  )`,
  matprm: `CREATE TABLE IF NOT EXISTS matprm (
    COD INTEGER PRIMARY KEY,
    DENUMIRE TEXT,
    GRUPA INTEGER,
    PRET REAL,
    UM TEXT,
    ST_MIN REAL,
    PROCES BOOLEAN,
    COEF REAL,
    ZILE INTEGER,
    TVA REAL
  )`,
  matsort: `CREATE TABLE IF NOT EXISTS matsort (
    COD INTEGER PRIMARY KEY,
    DENUMIRE TEXT,
    GRUPA INTEGER,
    PRET REAL,
    UM TEXT,
    ST_MIN REAL,
    PROCES BOOLEAN,
    COEF REAL,
    ZILE INTEGER,
    TVA REAL
  )`,
  prodsort: `CREATE TABLE IF NOT EXISTS prodsort (
    COD_PROD INTEGER PRIMARY KEY,
    DEN_PROD TEXT,
    DEP INTEGER,
    GRUP INTEGER,
    PR_COST REAL,
    PRET1 REAL,
    PRET2 REAL,
    PRET3 REAL,
    TVA REAL,
    IMPRIMANTA INTEGER,
    STATUS INTEGER,
    BARCOD TEXT
  )`,
  raport: `CREATE TABLE IF NOT EXISTS raport (
    COD TEXT,
    DENUMIRE TEXT,
    CAR1 TEXT,
    CAR2 TEXT,
    CAR3 TEXT,
    UM TEXT,
    NUM1 REAL,
    NUM2 REAL,
    NUM3 REAL,
    NUM4 REAL,
    NUM5 REAL,
    NUM6 REAL,
    NUM7 REAL,
    NUM8 REAL,
    DATA TEXT
  )`,
  furnizori: `CREATE TABLE IF NOT EXISTS furnizori (
    COD_CLIENT INTEGER PRIMARY KEY,
    DENUMIRE TEXT,
    REG_COM TEXT,
    ADRESA TEXT,
    JUDETUL TEXT,
    CONT TEXT,
    BANCA TEXT,
    TELEFON TEXT,
    TEL_MOBIL TEXT,
    TEL_FAX TEXT,
    PERS_CONTA TEXT,
    BI_SERIE TEXT,
    BI_NUMAR TEXT,
    AUTO TEXT,
    TOTAL TEXT,
    COD_FISCAL TEXT
  )`,
  tempx: `CREATE TABLE IF NOT EXISTS tempx (
    NR_MASA INTEGER,
    NR_OSP INTEGER,
    COD_PROD INTEGER,
    DEN_PROD TEXT,
    DEP INTEGER,
    GRUPA INTEGER,
    CANT REAL,
    PR_UNITAR REAL,
    VALOARE REAL,
    TVA REAL,
    PRAJIT TEXT,
    DATA TEXT,
    ORA INTEGER,
    MIN INTEGER,
    DISCOUNT TEXT,
    TIP_PLATA INTEGER,
    IMPRIMAT BOOLEAN,
    BUC_IMPRIM INTEGER
  )`,
  transfer: `CREATE TABLE IF NOT EXISTS transfer (
    PROD_COD INTEGER,
    PROD_DEN TEXT,
    PROD_UM TEXT,
    PROD_UMI INTEGER,
    CANT_TRANS REAL,
    DATA_TR TEXT,
    DIN_GEST INTEGER,
    IN_GEST INTEGER,
    NOTA_TR INTEGER,
    PROD_PRET REAL,
    PROD_DOLAR REAL
  )`,
  restconf: `CREATE TABLE IF NOT EXISTS restconf (
    DENUMIRE TEXT,
    CUI TEXT,
    ADRESA TEXT,
    CONT TEXT,
    BANCA TEXT,
    FIFO TEXT,
    LIFO TEXT,
    MEDIU BOOLEAN
  )`,
  retete: `CREATE TABLE IF NOT EXISTS retete (
    COD_RET INTEGER,
    COD_MAT INTEGER,
    DENUMIRE TEXT,
    CANT REAL,
    UM TEXT,
    GESTIUNI INTEGER,
    PRET REAL,
    BUC REAL,
    COEF REAL
  )`,
  // Poți adăuga și alte tabele după același model
};

function parseCSV(data) {
  const lines = data.trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.match(/("[^"]*"|[^,]+)/g).map(v => v.replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i] ? values[i].trim() : null);
    return obj;
  });
}

function importTable(db, table, schema, csvPath) {
  db.run(schema);
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csvData);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const placeholders = headers.map(() => '?').join(',');
  const stmt = db.prepare(`INSERT INTO ${table} (${headers.join(',')}) VALUES (${placeholders})`);
  rows.forEach(row => {
    stmt.run(headers.map(h => row[h]));
  });
  stmt.finalize();
  console.log(`Import ${table} finalizat!`);
}

function importAll() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    Object.entries(tableSchemas).forEach(([table, schema]) => {
      const csvPath = path.join(CSV_DIR, table + '.csv');
      if (fs.existsSync(csvPath)) {
        importTable(db, table, schema, csvPath);
      }
    });
  });
  db.close();
}

importAll();
