-- Migration 007: Hostess Map, Garderobă & Valet, Lost & Found
-- Data: 3 Decembrie 2025
-- Descriere: 3 module Enterprise noi pentru gestionare restaurant complet

-- ==================== HOSTESS MAP ====================

-- Tabela mese restaurant (dacă nu există deja)
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  zone TEXT,
  seats INTEGER NOT NULL DEFAULT 2,
  pos_table_code TEXT,
  position_x INTEGER,
  position_y INTEGER,
  status TEXT NOT NULL DEFAULT 'FREE', -- FREE, RESERVED, OCCUPIED, CLEANING
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sesiuni masă (tracking ocupare)
CREATE TABLE IF NOT EXISTS table_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER NOT NULL,
  started_at DATETIME NOT NULL,
  closed_at DATETIME,
  server_id INTEGER,
  covers INTEGER,
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED
  pos_order_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES restaurant_tables(id)
);

CREATE INDEX IF NOT EXISTS idx_table_sessions_table ON table_sessions (table_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_status ON table_sessions (status);

-- ==================== GARDEROBĂ & VALET ====================

CREATE TABLE IF NOT EXISTS coatroom_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- haină, geantă, umbrelă, etc
  notes TEXT,
  photo_url TEXT,
  customer_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED, LOST
  created_by INTEGER,
  closed_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_coatroom_code ON coatroom_tickets (code);
CREATE INDEX IF NOT EXISTS idx_coatroom_status ON coatroom_tickets (status);

-- ==================== LOST & FOUND ====================

CREATE TABLE IF NOT EXISTS lostfound_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  photo_url TEXT,
  location_found TEXT,
  found_at DATETIME NOT NULL,
  found_by INTEGER,
  status TEXT NOT NULL DEFAULT 'STORED', -- STORED, RETURNED, DISCARDED
  returned_at DATETIME,
  returned_to TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lostfound_status ON lostfound_items (status);
CREATE INDEX IF NOT EXISTS idx_lostfound_found_at ON lostfound_items (found_at);

