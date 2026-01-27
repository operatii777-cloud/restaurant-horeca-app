/**
 * Events Management API Routes
 * Gestionare evenimente: nunți, corporate, conferințe, catering
 */
const express = require('express');
const router = express.Router();

const getDB = (req) => req.app.get('db') || req.app.locals.db || global.db;

const initEventsTable = (db) => new Promise((resolve, reject) => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT DEFAULT 'Other',
    client_name TEXT NOT NULL, client_phone TEXT, client_email TEXT, date TEXT NOT NULL,
    start_time TEXT DEFAULT '12:00', end_time TEXT DEFAULT '20:00', pax INTEGER DEFAULT 50,
    budget_per_pax REAL DEFAULT 100, total_budget REAL DEFAULT 0, deposit_paid REAL DEFAULT 0,
    status TEXT DEFAULT 'Lead', location TEXT DEFAULT 'Salon Principal', beo_number TEXT,
    setup_details TEXT, menu TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => err ? reject(err) : resolve());
});

router.get('/', async (req, res) => {
  const db = getDB(req);
  if (!db) return res.status(503).json({ error: 'Database not available' });
  try {
    await initEventsTable(db);
    db.all(`SELECT id, name, type, client_name as clientName, client_phone as clientPhone,
      date, start_time as startTime, end_time as endTime, pax, budget_per_pax as budgetPerPax,
      total_budget as totalBudget, deposit_paid as depositPaid, status, location,
      beo_number as beoNumber, setup_details as setupDetails, notes FROM events ORDER BY date DESC`, 
      [], (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows || []));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const db = getDB(req);
  if (!db) return res.status(503).json({ error: 'Database not available' });
  const { name, type = 'Other', clientName, clientPhone, date, startTime = '12:00', endTime = '20:00',
    pax = 50, budgetPerPax = 100, depositPaid = 0, location = 'Salon Principal', notes, setupDetails, beoNumber } = req.body;
  if (!name || !clientName || !date) return res.status(400).json({ error: 'name, clientName, date required' });
  const totalBudget = pax * budgetPerPax;
  const beo = beoNumber || `BEO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  try {
    await initEventsTable(db);
    db.run(`INSERT INTO events (name, type, client_name, client_phone, date, start_time, end_time, pax,
      budget_per_pax, total_budget, deposit_paid, status, location, beo_number, setup_details, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Lead', ?, ?, ?, ?)`,
      [name, type, clientName, clientPhone, date, startTime, endTime, pax, budgetPerPax, totalBudget, depositPaid, location, beo, setupDetails, notes],
      function(err) { err ? res.status(500).json({ error: err.message }) : res.status(201).json({ id: this.lastID, name, beoNumber: beo }); });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  const db = getDB(req);
  if (!db) return res.status(503).json({ error: 'Database not available' });
  const { id } = req.params;
  const { status } = req.body;
  try {
    await initEventsTable(db);
    db.run(`UPDATE events SET status = ? WHERE id = ?`, [status, id],
      function(err) { err ? res.status(500).json({ error: err.message }) : res.json({ success: true, id }); });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  const db = getDB(req);
  if (!db) return res.status(503).json({ error: 'Database not available' });
  try {
    await initEventsTable(db);
    db.run('DELETE FROM events WHERE id = ?', [req.params.id],
      function(err) { err ? res.status(500).json({ error: err.message }) : res.json({ success: true }); });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
