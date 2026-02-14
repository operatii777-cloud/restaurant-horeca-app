
// ============================================================================
// CONFIGURARE ENCODING UTF-8 PENTRU BACKEND
// Adaugă acest cod în fișierul principal al serverului (server.js, index.js, etc.)
// ============================================================================

const express = require('express');
const Database = require('better-sqlite3');

const app = express();

// 1. Conexiune SQLite cu UTF-8
const db = new Database('./database.db');
db.pragma('encoding = "UTF-8"');

// Verifică encoding-ul
console.log('📊 Database encoding:', db.pragma('encoding', { simple: true }));

// 2. Middleware pentru JSON cu UTF-8
app.use(express.json({ 
  type: 'application/json; charset=utf-8'
}));

// 3. Header UTF-8 pentru toate răspunsurile
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Export conexiunea pentru folosire în alte module
module.exports = { db, app };
