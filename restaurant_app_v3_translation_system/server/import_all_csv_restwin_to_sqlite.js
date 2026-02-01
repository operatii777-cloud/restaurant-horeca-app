// import_all_csv_restwin_to_sqlite.js
// Script pentru importul tabelelor CSV extrase din Restwin_converted în SQLite
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'restwin_import.db');
const CSV_DIR = path.join(__dirname, 'Restwin_converted');

const tableSchemas = {
  produse: `CREATE TABLE IF NOT EXISTS produse (
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
  buffer: `CREATE TABLE IF NOT EXISTS buffer (
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
    ORA TEXT,
    MIN TEXT,
    DISCOUNT TEXT,
    TIP_PLATA TEXT,
    IMPRIMAT TEXT
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
  // Adaugă aici și alte tabele după modelul de mai sus dacă există CSV-uri relevante
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
