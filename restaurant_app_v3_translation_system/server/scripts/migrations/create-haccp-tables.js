/**
 * Script pentru creare tabele HACCP (dacă nu există deja)
 * Acest script creează tabelele manual dacă serverul nu a fost pornit încă
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Eroare la conectarea la baza de date:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectat la baza de date');
});

db.serialize(() => {
  // Tabelă pentru procese HACCP
  db.run(`CREATE TABLE IF NOT EXISTS haccp_processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('receiving', 'storage', 'preparation', 'cooking', 'serving', 'other')),
    flow_chart_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ haccp_processes:', err.message);
    else console.log('✅ Tabelă haccp_processes creată/verificată');
  });

  // Tabelă pentru Puncte Critice de Control
  db.run(`CREATE TABLE IF NOT EXISTS haccp_ccp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    process_id INTEGER NOT NULL,
    ccp_number TEXT NOT NULL,
    hazard_type TEXT NOT NULL CHECK (hazard_type IN ('biological', 'chemical', 'physical')),
    hazard_description TEXT NOT NULL,
    control_measure TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (process_id) REFERENCES haccp_processes(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('❌ haccp_ccp:', err.message);
    else console.log('✅ Tabelă haccp_ccp creată/verificată');
  });

  // Tabelă pentru Acțiuni Corective (trebuie creată înainte de haccp_monitoring)
  db.run(`CREATE TABLE IF NOT EXISTS haccp_corrective_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ccp_id INTEGER NOT NULL,
    monitoring_id INTEGER,
    action_taken TEXT NOT NULL,
    taken_by INTEGER,
    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT 0,
    resolved_at DATETIME,
    verification_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id) ON DELETE CASCADE,
    FOREIGN KEY (taken_by) REFERENCES users(id)
  )`, (err) => {
    if (err) console.error('❌ haccp_corrective_actions:', err.message);
    else console.log('✅ Tabelă haccp_corrective_actions creată/verificată');
  });

  // Tabelă pentru Limite Critice
  db.run(`CREATE TABLE IF NOT EXISTS haccp_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ccp_id INTEGER NOT NULL,
    parameter_name TEXT NOT NULL,
    min_value REAL,
    max_value REAL,
    unit TEXT NOT NULL,
    target_value REAL,
    monitoring_frequency TEXT NOT NULL CHECK (monitoring_frequency IN ('every_batch', 'hourly', 'daily', 'weekly')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('❌ haccp_limits:', err.message);
    else console.log('✅ Tabelă haccp_limits creată/verificată');
  });

  // Tabelă pentru Înregistrări Monitorizare
  db.run(`CREATE TABLE IF NOT EXISTS haccp_monitoring (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ccp_id INTEGER NOT NULL,
    monitored_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    monitored_by INTEGER,
    parameter_name TEXT NOT NULL,
    measured_value REAL NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
    notes TEXT,
    corrective_action_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id) ON DELETE CASCADE,
    FOREIGN KEY (monitored_by) REFERENCES users(id),
    FOREIGN KEY (corrective_action_id) REFERENCES haccp_corrective_actions(id)
  )`, (err) => {
    if (err) {
      console.error('❌ haccp_monitoring:', err.message);
      db.close();
    } else {
      console.log('✅ Tabelă haccp_monitoring creată/verificată');
      
      // Indexuri
      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_ccp_process ON haccp_ccp(process_id)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_limits_ccp ON haccp_limits(ccp_id)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_monitoring_ccp ON haccp_monitoring(ccp_id)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_monitoring_created ON haccp_monitoring(monitored_at)`, () => {});
      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_monitoring_status ON haccp_monitoring(status)`, () => {
        console.log('\n✅ TOATE TABELELE AU FOST CREATE CU SUCCES!\n');
        db.close();
      });
    }
  });
});

