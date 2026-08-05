-- T-CL-018 / T-CL-020 schema (also created at runtime via database-*.js)
-- Manager approval journal
CREATE TABLE IF NOT EXISTS order_voids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  order_item_id INTEGER,
  void_type TEXT NOT NULL DEFAULT 'item',
  reason TEXT,
  amount REAL DEFAULT 0,
  initiated_by INTEGER,
  initiated_by_name TEXT,
  approved_by INTEGER,
  approved_by_name TEXT,
  approved_at DATETIME,
  pin_verified INTEGER DEFAULT 0,
  source TEXT DEFAULT 'POS',
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discount_approval_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  order_item_id INTEGER,
  order_discount_id INTEGER,
  discount_definition_id INTEGER,
  discount_type TEXT,
  discount_value REAL,
  discount_amount REAL,
  reason TEXT,
  initiated_by INTEGER,
  initiated_by_name TEXT,
  approved_by INTEGER,
  approved_by_name TEXT,
  approved_at DATETIME,
  pin_verified INTEGER DEFAULT 0,
  source TEXT DEFAULT 'POS',
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS auto_reorder_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  supplier_id INTEGER,
  reorder_point REAL DEFAULT 0,
  reorder_quantity REAL DEFAULT 0,
  max_stock_level REAL,
  lead_time_days INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  last_triggered DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  total_value REAL DEFAULT 0,
  expected_delivery DATE,
  notes TEXT,
  created_by INTEGER,
  auto_generated INTEGER DEFAULT 0,
  approved_by INTEGER,
  approved_at DATETIME,
  sent_at DATETIME,
  received_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  ingredient_id INTEGER,
  quantity REAL NOT NULL DEFAULT 0,
  unit TEXT,
  unit_price REAL DEFAULT 0,
  total_price REAL DEFAULT 0,
  received_quantity REAL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courier cashback wallet
CREATE TABLE IF NOT EXISTS courier_wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courier_id INTEGER NOT NULL UNIQUE,
  balance REAL NOT NULL DEFAULT 0,
  lifetime_earned REAL NOT NULL DEFAULT 0,
  lifetime_redeemed REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RON',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courier_wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  courier_id INTEGER NOT NULL,
  wallet_id INTEGER,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  reference_type TEXT,
  reference_id INTEGER,
  description TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courier_cashback_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  percent REAL NOT NULL DEFAULT 0,
  fixed_amount REAL DEFAULT 0,
  min_delivery_fee REAL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
