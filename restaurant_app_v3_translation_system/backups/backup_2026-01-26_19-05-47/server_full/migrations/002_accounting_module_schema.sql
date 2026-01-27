-- ============================================================================
-- MIGRATION 002: ACCOUNTING MODULE v8.0 - COMPLETE SCHEMA
-- ============================================================================
-- Created: 06 Ianuarie 2026
-- Purpose: Schema completă pentru modulul CONTABILITATE v8.0
-- Tables: 13 tabele noi + 1 tabel accounting_accounts
-- Modifications: Folosește ingredient_id în loc de nomenclature_id pentru consistență
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE accounting_accounts TABLE (DEPENDENCY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounting_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_code TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT CHECK(account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')) NOT NULL,
  parent_account_id INTEGER,
  is_active INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_account_id) REFERENCES accounting_accounts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_accounting_accounts_code ON accounting_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_accounting_accounts_type ON accounting_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounting_accounts_parent ON accounting_accounts(parent_account_id);

-- ============================================================================
-- STEP 2: STOCK BALANCE TABLES
-- ============================================================================

-- 2.1 stock_balance_snapshot - Snapshot-uri balanță stocuri
CREATE TABLE IF NOT EXISTS stock_balance_snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT UNIQUE NOT NULL,
  location_id INTEGER NOT NULL,
  report_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  CHECK (report_date <= DATE('now'))
);

CREATE INDEX IF NOT EXISTS idx_stock_balance_location ON stock_balance_snapshot(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_balance_date ON stock_balance_snapshot(report_date);

-- 2.2 stock_balance_items - Items din snapshot-uri
CREATE TABLE IF NOT EXISTS stock_balance_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  unit_id INTEGER,
  unit_name TEXT,
  opening_stock DECIMAL(10,3) DEFAULT 0,
  opening_value DECIMAL(12,2) DEFAULT 0,
  entries_qty DECIMAL(10,3) DEFAULT 0,
  entries_value DECIMAL(12,2) DEFAULT 0,
  consumption_qty DECIMAL(10,3) DEFAULT 0,
  consumption_value DECIMAL(12,2) DEFAULT 0,
  waste_qty DECIMAL(10,3) DEFAULT 0,
  waste_value DECIMAL(12,2) DEFAULT 0,
  closing_stock DECIMAL(10,3) DEFAULT 0,
  closing_value DECIMAL(12,2) DEFAULT 0,
  valuation_method TEXT CHECK(valuation_method IN ('fifo', 'lifo', 'weighted_average')) DEFAULT 'weighted_average',
  FOREIGN KEY (snapshot_id) REFERENCES stock_balance_snapshot(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  CHECK (closing_stock = opening_stock + entries_qty - consumption_qty - waste_qty)
);

CREATE INDEX IF NOT EXISTS idx_stock_balance_items_snapshot ON stock_balance_items(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_stock_balance_items_ingredient ON stock_balance_items(ingredient_id);

-- 2.3 stock_variance_detail - Diferențe între stoc teoretic și fizic
CREATE TABLE IF NOT EXISTS stock_variance_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  theoretical_stock DECIMAL(10,3) NOT NULL,
  physical_stock DECIMAL(10,3) NOT NULL,
  variance_qty DECIMAL(10,3) NOT NULL,
  variance_percentage DECIMAL(5,2),
  variance_type TEXT CHECK(variance_type IN ('shortage', 'surplus')) NOT NULL,
  variance_reason TEXT,
  FOREIGN KEY (snapshot_id) REFERENCES stock_balance_snapshot(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  CHECK (variance_qty = physical_stock - theoretical_stock)
);

CREATE INDEX IF NOT EXISTS idx_stock_variance_snapshot ON stock_variance_detail(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_stock_variance_ingredient ON stock_variance_detail(ingredient_id);

-- ============================================================================
-- STEP 3: PRODUCT ACCOUNTING MAPPING TABLES
-- ============================================================================

-- 3.1 product_accounting_mapping - Mapare produse la conturi contabile
CREATE TABLE IF NOT EXISTS product_accounting_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER UNIQUE NOT NULL,
  stock_account_id INTEGER NOT NULL,
  consumption_account_id INTEGER NOT NULL,
  entry_account_id INTEGER,
  cogs_account_id INTEGER,
  sub_account_code TEXT,
  valuation_method TEXT CHECK(valuation_method IN ('fifo', 'lifo', 'weighted_average')) DEFAULT 'weighted_average',
  modified_by INTEGER,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  FOREIGN KEY (stock_account_id) REFERENCES accounting_accounts(id),
  FOREIGN KEY (consumption_account_id) REFERENCES accounting_accounts(id),
  FOREIGN KEY (entry_account_id) REFERENCES accounting_accounts(id),
  FOREIGN KEY (cogs_account_id) REFERENCES accounting_accounts(id),
  CHECK (sub_account_code IS NULL OR sub_account_code GLOB '[0-9][0-9][0-9].[0-9][0-9]')
);

CREATE INDEX IF NOT EXISTS idx_product_mapping_ingredient ON product_accounting_mapping(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_product_mapping_stock_account ON product_accounting_mapping(stock_account_id);

-- 3.2 product_account_history - Istoric modificări conturi contabile
CREATE TABLE IF NOT EXISTS product_account_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  old_account_code TEXT,
  new_account_code TEXT NOT NULL,
  change_reason TEXT NOT NULL,
  changed_by INTEGER,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_history_ingredient ON product_account_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_product_history_date ON product_account_history(changed_at);

-- Trigger pentru audit trail
CREATE TRIGGER IF NOT EXISTS audit_product_account_change
AFTER UPDATE ON product_accounting_mapping
FOR EACH ROW
WHEN OLD.stock_account_id != NEW.stock_account_id OR
     OLD.consumption_account_id != NEW.consumption_account_id OR
     OLD.entry_account_id != NEW.entry_account_id OR
     OLD.cogs_account_id != NEW.cogs_account_id
BEGIN
  INSERT INTO product_account_history (
    ingredient_id,
    old_account_code,
    new_account_code,
    change_reason,
    changed_by
  ) VALUES (
    NEW.ingredient_id,
    (SELECT account_code FROM accounting_accounts WHERE id = OLD.stock_account_id),
    (SELECT account_code FROM accounting_accounts WHERE id = NEW.stock_account_id),
    COALESCE(NEW.modified_by, 'system'),
    NEW.modified_by
  );
END;

-- ============================================================================
-- STEP 4: DAILY BALANCE REPORT TABLES
-- ============================================================================

-- 4.1 daily_balance_report - Raport balanță zilnică
CREATE TABLE IF NOT EXISTS daily_balance_report (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_date DATE NOT NULL,
  report_time TIME,
  location_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_balance_date ON daily_balance_report(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_balance_location ON daily_balance_report(location_id);

-- 4.2 daily_balance_details - Detalii balanță zilnică
CREATE TABLE IF NOT EXISTS daily_balance_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  unit_name TEXT,
  opening_stock DECIMAL(10,3) DEFAULT 0,
  opening_value DECIMAL(12,2) DEFAULT 0,
  entries_today_qty DECIMAL(10,3) DEFAULT 0,
  entries_today_value DECIMAL(12,2) DEFAULT 0,
  consumption_today_qty DECIMAL(10,3) DEFAULT 0,
  consumption_today_value DECIMAL(12,2) DEFAULT 0,
  closing_stock DECIMAL(10,3) DEFAULT 0,
  closing_value DECIMAL(12,2) DEFAULT 0,
  variance_qty DECIMAL(10,3) DEFAULT 0,
  FOREIGN KEY (report_id) REFERENCES daily_balance_report(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  CHECK (closing_stock = opening_stock + entries_today_qty - consumption_today_qty)
);

CREATE INDEX IF NOT EXISTS idx_daily_balance_details_report ON daily_balance_details(report_id);
CREATE INDEX IF NOT EXISTS idx_daily_balance_details_ingredient ON daily_balance_details(ingredient_id);

-- ============================================================================
-- STEP 5: CONSUMPTION SITUATION REPORT TABLES
-- ============================================================================

-- 5.1 consumption_situation_report - Raport situație consumuri
CREATE TABLE IF NOT EXISTS consumption_situation_report (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  location_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_consumption_situation_period ON consumption_situation_report(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_consumption_situation_location ON consumption_situation_report(location_id);

-- 5.2 consumption_situation_details - Detalii consumuri
CREATE TABLE IF NOT EXISTS consumption_situation_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  unit_name TEXT,
  opening_stock DECIMAL(10,3) DEFAULT 0,
  opening_value DECIMAL(12,2) DEFAULT 0,
  purchases_qty DECIMAL(10,3) DEFAULT 0,
  purchases_value DECIMAL(12,2) DEFAULT 0,
  available_qty DECIMAL(10,3) DEFAULT 0,
  available_value DECIMAL(12,2) DEFAULT 0,
  consumption_qty DECIMAL(10,3) DEFAULT 0,
  consumption_value DECIMAL(12,2) DEFAULT 0,
  consumption_percentage DECIMAL(5,2),
  closing_stock DECIMAL(10,3) DEFAULT 0,
  closing_value DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (report_id) REFERENCES consumption_situation_report(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  CHECK (available_qty = opening_stock + purchases_qty),
  CHECK (consumption_percentage = CASE WHEN available_qty > 0 THEN (consumption_qty / available_qty) * 100 ELSE 0 END)
);

CREATE INDEX IF NOT EXISTS idx_consumption_details_report ON consumption_situation_details(report_id);
CREATE INDEX IF NOT EXISTS idx_consumption_details_ingredient ON consumption_situation_details(ingredient_id);

-- 5.3 consumption_by_dish - Consumuri defalcat pe rețete/dieșuri
CREATE TABLE IF NOT EXISTS consumption_by_dish (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  situation_detail_id INTEGER NOT NULL,
  dish_id INTEGER NOT NULL,
  dish_name TEXT NOT NULL,
  consumption_qty DECIMAL(10,3) DEFAULT 0,
  consumption_value DECIMAL(12,2) DEFAULT 0,
  consumption_per_dish DECIMAL(10,3),
  number_of_dishes_sold INTEGER DEFAULT 0,
  FOREIGN KEY (situation_detail_id) REFERENCES consumption_situation_details(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_consumption_by_dish_detail ON consumption_by_dish(situation_detail_id);
CREATE INDEX IF NOT EXISTS idx_consumption_by_dish_dish ON consumption_by_dish(dish_id);

-- ============================================================================
-- STEP 6: ENTRIES BY VAT & ACCOUNTING ACCOUNT TABLES
-- ============================================================================

-- 6.1 entries_by_vat_account_report - Raport intrări după TVA și cont
CREATE TABLE IF NOT EXISTS entries_by_vat_account_report (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  location_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_entries_by_vat_period ON entries_by_vat_account_report(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_entries_by_vat_location ON entries_by_vat_account_report(location_id);

-- 6.2 entries_by_vat_details - Detalii intrări după TVA și cont
CREATE TABLE IF NOT EXISTS entries_by_vat_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  accounting_account_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  quantity_entered DECIMAL(10,3) DEFAULT 0,
  average_cost_per_unit DECIMAL(10,4) DEFAULT 0,
  base_value DECIMAL(12,2) DEFAULT 0,
  vat_percentage DECIMAL(5,2) DEFAULT 0,
  vat_value DECIMAL(12,2) DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  document_type TEXT,
  document_number TEXT,
  document_date DATE,
  supplier_id INTEGER,
  FOREIGN KEY (report_id) REFERENCES entries_by_vat_account_report(id) ON DELETE CASCADE,
  FOREIGN KEY (accounting_account_id) REFERENCES accounting_accounts(id),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  CHECK (total_value = base_value + vat_value),
  CHECK (vat_value = base_value * (vat_percentage / 100))
);

CREATE INDEX IF NOT EXISTS idx_entries_by_vat_details_report ON entries_by_vat_details(report_id);
CREATE INDEX IF NOT EXISTS idx_entries_by_vat_details_account ON entries_by_vat_details(accounting_account_id);
CREATE INDEX IF NOT EXISTS idx_entries_by_vat_details_ingredient ON entries_by_vat_details(ingredient_id);

-- 6.3 vat_summary_by_rate - Rezumat TVA după cote
CREATE TABLE IF NOT EXISTS vat_summary_by_rate (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  vat_percentage DECIMAL(5,2) NOT NULL,
  total_base_value DECIMAL(12,2) DEFAULT 0,
  total_vat_value DECIMAL(12,2) DEFAULT 0,
  total_with_vat DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (report_id) REFERENCES entries_by_vat_account_report(id) ON DELETE CASCADE,
  CHECK (total_with_vat = total_base_value + total_vat_value)
);

CREATE INDEX IF NOT EXISTS idx_vat_summary_report ON vat_summary_by_rate(report_id);
CREATE INDEX IF NOT EXISTS idx_vat_summary_percentage ON vat_summary_by_rate(vat_percentage);

-- ============================================================================
-- INITIAL DATA: Default Accounting Accounts
-- ============================================================================

INSERT OR IGNORE INTO accounting_accounts (account_code, account_name, account_type, is_active) VALUES
('301', 'Materii Prime', 'asset', 1),
('302', 'Produse Finite', 'asset', 1),
('401', 'Achiziții Materii Prime', 'expense', 1),
('602', 'Consumuri Materii Prime', 'expense', 1),
('607', 'Cheltuieli cu Mărfurile', 'expense', 1),
('371', 'Mărfuri', 'asset', 1),
('378', 'Diferențe de Preț la Mărfuri', 'asset', 1);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify all tables created
SELECT 'Migration 002 completed successfully! Tables count: ' || COUNT(*) as result 
FROM sqlite_master 
WHERE type='table' AND name IN (
  'accounting_accounts',
  'stock_balance_snapshot',
  'stock_balance_items',
  'stock_variance_detail',
  'product_accounting_mapping',
  'product_account_history',
  'daily_balance_report',
  'daily_balance_details',
  'consumption_situation_report',
  'consumption_situation_details',
  'consumption_by_dish',
  'entries_by_vat_account_report',
  'entries_by_vat_details',
  'vat_summary_by_rate'
);

