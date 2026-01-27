/**
 * Shift Handover (Jurnal Tură) API Routes
 */
const express = require('express');
const router = express.Router();

const getDB = (req) => req.app.get('db') || req.app.locals.db || global.db;

const initTable = (db) => new Promise((resolve, reject) => {
  db.run(`CREATE TABLE IF NOT EXISTS shift_handover (
    id INTEGER PRIMARY KEY AUTOINCREMENT, date DATETIME DEFAULT CURRENT_TIMESTAMP,
    manager_name TEXT NOT NULL, shift TEXT DEFAULT 'Dinner', notes TEXT, issues TEXT,
    weather TEXT, staff_rating INTEGER DEFAULT 5, sales REAL DEFAULT 0, checklist TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => err ? reject(err) : resolve());
});

router.get('/', async (req, res) => {
  const db = getDB(req);
  if (!db) return res.status(503).json({ error: 'Database not available' });
  const { limit = 30 } = req.query;
  try {
    await initTable(db);
    db.all(`SELECT id, date, manager_name as managerName, shift, notes, issues, weather,
      staff_rating as staffRating, sales, checklist FROM shift_handover ORDER BY date DESC LIMIT ?`,
      [parseInt(limit)], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const parsed = (rows || []).map(r => ({ ...r, checklist: r.checklist ? JSON.parse(r.checklist) : [] }));
        res.json(parsed);
      });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const db = getDB(req);
  if (!db) return res.status(503).json({ error: 'Database not available' });
  const { date = new Date().toISOString(), managerName, shift = 'Dinner', notes, issues, weather, staffRating = 5, sales = 0, checklist = [] } = req.body;
  if (!managerName) return res.status(400).json({ error: 'managerName required' });
  try {
    await initTable(db);
    db.run(`INSERT INTO shift_handover (date, manager_name, shift, notes, issues, weather, staff_rating, sales, checklist)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, managerName, shift, notes, issues, weather, staffRating, sales, JSON.stringify(checklist)],
      function(err) { err ? res.status(500).json({ error: err.message }) : res.status(201).json({ id: this.lastID, message: 'Saved' }); });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  const db = getDB(req);
  if (!db) return res.status(503).json({ error: 'Database not available' });
  try {
    await initTable(db);
    db.run('DELETE FROM shift_handover WHERE id = ?', [req.params.id],
      function(err) { err ? res.status(500).json({ error: err.message }) : res.json({ success: true }); });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
