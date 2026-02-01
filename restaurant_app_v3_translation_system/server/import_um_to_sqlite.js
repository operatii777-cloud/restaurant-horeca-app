// Script pentru importul datelor din UM.csv în tabela um din SQLite
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const CSV_PATH = path.join(__dirname, 'RestGest_converted', 'UM.csv');
const DB_PATH = path.join(__dirname, 'um_demo.db'); // Poți schimba cu baza ta de date

function parseCSV(data) {
  const lines = data.trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    // Suportă valori între ghilimele și fără
    const values = line.match(/("[^"]*"|[^,]+)/g).map(v => v.replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i] ? values[i].trim() : null);
    return obj;
  });
}

function importUM() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS um (
      UM1 TEXT,
      COEF1 REAL,
      UM2 TEXT,
      COEF2 REAL
    )`);

    const csvData = fs.readFileSync(CSV_PATH, 'utf8');
    const rows = parseCSV(csvData);
    const stmt = db.prepare('INSERT INTO um (UM1, COEF1, UM2, COEF2) VALUES (?, ?, ?, ?)');
    rows.forEach(row => {
      stmt.run(row.UM1, row.COEF1, row.UM2, row.COEF2);
    });
    stmt.finalize();
    console.log('Import UM.csv finalizat!');
  });
  db.close();
}

importUM();