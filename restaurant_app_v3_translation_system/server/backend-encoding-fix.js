
// ============================================================================
// CONFIGURARE CORECTĂ A CONEXIUNII SQLITE ÎN BACKEND
// ============================================================================

// Dacă folosești better-sqlite3:
const Database = require('better-sqlite3');

// Cale către baza de date
const DB_PATH = path.join(__dirname, 'restaurant.db');

// Creează conexiunea
const db = new Database(DB_PATH, {
  verbose: console.log // Optional: pentru debugging
});

// IMPORTANT: Setează encoding-ul la UTF-8
db.pragma('encoding = "UTF-8"');

// Verifică encoding-ul
const encoding = db.pragma('encoding', { simple: true });
console.log('Database encoding:', encoding); // Ar trebui să fie UTF-8

// ============================================================================
// EXEMPLU DE API ENDPOINT CU ENCODING CORECT
// ============================================================================

const express = require('express');
const app = express();

// Middleware pentru UTF-8
app.use(express.json({ type: 'application/json; charset=utf-8' }));

// Setează header UTF-8 pentru toate răspunsurile
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Exemplu endpoint pentru produse
app.get('/api/products', (req, res) => {
  try {
    // Citește din baza de date
    const products = db.prepare('SELECT * FROM products WHERE activ = 1').all();

    // Log pentru verificare
    console.log('Primul produs:', products[0]?.denumire);

    // Returnează cu encoding corect
    res.json(products);
  } catch (error) {
    console.error('Eroare:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exemplu endpoint pentru meniuri
app.get('/api/menu', (req, res) => {
  try {
    const menu = db.prepare('SELECT * FROM menu WHERE activ = 1').all();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exemplu endpoint pentru vânzări astăzi
app.get('/api/vanzari-astazi', (req, res) => {
  try {
    const vanzari = db.prepare(`
      SELECT
        SUM(total) as total_vanzari,
        COUNT(*) as numar_comenzi
      FROM orders
      WHERE DATE(created_at) = DATE('now')
    `).get();

    // Log pentru verificare
    console.log('Vânzări astăzi:', vanzari);

    res.json(vanzari);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server pornit pe portul 3001');
  console.log('Encoding bază de date:', db.pragma('encoding', { simple: true }));
});

// ============================================================================
// PENTRU INSERARE/UPDATE - ASIGURĂ-TE CĂ PRIMEȘTI UTF-8
// ============================================================================

app.post('/api/products', (req, res) => {
  try {
    const { denumire, pret, descriere } = req.body;

    // Inserare cu parametri pregătiți (protejează împotriva SQL injection)
    const stmt = db.prepare(`
      INSERT INTO products (denumire, pret, descriere, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(denumire, pret, descriere);

    res.json({
      success: true,
      id: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
