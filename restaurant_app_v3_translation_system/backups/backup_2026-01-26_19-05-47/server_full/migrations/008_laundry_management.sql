-- Migration 008: Gestiune Textile (Laundry Management)
-- Data: 5 Decembrie 2025
-- Descriere: Sistem complet gestionare textile restaurant (lenjerie, prosopuri, uniforme)

-- ==================== GESTIUNE TEXTILE ====================

CREATE TABLE IF NOT EXISTS laundry_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- cearșaf, față_masă, șervețel, prosop, uniformă, altele
  category TEXT NOT NULL, -- lenjerie_masă, prosopuri, uniforme, altele
  description TEXT,
  location TEXT, -- Unde se află: Masa 5, Bucătărie, Bar, Depozit, Spălătorie
  status TEXT NOT NULL DEFAULT 'READY', -- READY, IN_USE, AT_LAUNDRY, DAMAGED, RETIRED
  condition TEXT DEFAULT 'GOOD', -- GOOD, FAIR, POOR, DAMAGED
  quantity INTEGER DEFAULT 1,
  last_washed_at DATETIME,
  next_wash_due DATETIME,
  assigned_to_table INTEGER, -- Dacă e în folosință la o masă
  assigned_to_employee INTEGER, -- Dacă e uniformă atribuită unui angajat
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (assigned_to_table) REFERENCES restaurant_tables(id),
  FOREIGN KEY (assigned_to_employee) REFERENCES employees(id)
);

CREATE INDEX IF NOT EXISTS idx_laundry_code ON laundry_items (code);
CREATE INDEX IF NOT EXISTS idx_laundry_status ON laundry_items (status);
CREATE INDEX IF NOT EXISTS idx_laundry_type ON laundry_items (type);
CREATE INDEX IF NOT EXISTS idx_laundry_category ON laundry_items (category);
CREATE INDEX IF NOT EXISTS idx_laundry_location ON laundry_items (location);

-- Tabel pentru istoric spălări
CREATE TABLE IF NOT EXISTS laundry_wash_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  washed_at DATETIME NOT NULL,
  washed_by INTEGER,
  condition_before TEXT,
  condition_after TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES laundry_items(id)
);

CREATE INDEX IF NOT EXISTS idx_wash_history_item ON laundry_wash_history (item_id);
CREATE INDEX IF NOT EXISTS idx_wash_history_date ON laundry_wash_history (washed_at);

