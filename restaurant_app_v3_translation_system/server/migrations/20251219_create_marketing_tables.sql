-- Marketing Module - Tables for Customer Segmentation and Campaigns
-- Created: 2025-12-19

-- Tabel pentru segmente clienți
CREATE TABLE IF NOT EXISTS marketing_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  criteria TEXT, -- JSON criteria pentru segmentare
  customer_count INTEGER DEFAULT 0,
  last_calculated TEXT, -- ISO datetime
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tabel pentru relația clienți-segmente
CREATE TABLE IF NOT EXISTS marketing_segment_customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  segment_id INTEGER NOT NULL,
  customer_token TEXT NOT NULL,
  order_count INTEGER DEFAULT 0,
  last_order_date TEXT,
  first_order_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (segment_id) REFERENCES marketing_segments(id) ON DELETE CASCADE,
  UNIQUE(segment_id, customer_token)
);

-- Tabel pentru campanii marketing
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'discount', 'loyalty', 'promotion', etc.
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  statistics TEXT, -- JSON statistics
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_marketing_segment_customers_segment ON marketing_segment_customers(segment_id);
CREATE INDEX IF NOT EXISTS idx_marketing_segment_customers_token ON marketing_segment_customers(customer_token);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);

