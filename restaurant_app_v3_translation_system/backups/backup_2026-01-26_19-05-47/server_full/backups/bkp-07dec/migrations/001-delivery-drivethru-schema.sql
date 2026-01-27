-- =====================================================================
-- MIGRATION: Delivery & Drive-Thru Schema
-- Date: 2025-12-05
-- Description: Tabele și coloane noi pentru funcționalitățile delivery și drive-thru
-- =====================================================================

-- =====================================================================
-- 1. COLOANE NOI ÎN TABELA orders
-- =====================================================================

-- Identificare sursă și canal
ALTER TABLE orders ADD COLUMN order_source TEXT DEFAULT 'POS';
-- Valori: POS, KIOSK, QR, DELIVERY, DRIVE_THRU, SUPERVISOR

ALTER TABLE orders ADD COLUMN platform TEXT;
-- Valori: glovo, wolt, bolt_food, friendsride, tazz, phone, online, pos

-- Linkare curier
ALTER TABLE orders ADD COLUMN courier_id INTEGER REFERENCES couriers(id);

-- Tipul ridicării
ALTER TABLE orders ADD COLUMN pickup_type TEXT;
-- Valori: customer_pickup (client ridică), own_courier (curier propriu), platform_courier (curier platformă)

-- Drive-Thru specific
ALTER TABLE orders ADD COLUMN car_plate TEXT;
ALTER TABLE orders ADD COLUMN lane_number TEXT;
ALTER TABLE orders ADD COLUMN arrived_at DATETIME;
ALTER TABLE orders ADD COLUMN ordered_at DATETIME;
ALTER TABLE orders ADD COLUMN paid_at DATETIME;
ALTER TABLE orders ADD COLUMN served_at DATETIME;

-- Timpi estimați vs reali
ALTER TABLE orders ADD COLUMN estimated_pickup_time DATETIME;
ALTER TABLE orders ADD COLUMN actual_pickup_time DATETIME;
ALTER TABLE orders ADD COLUMN estimated_delivery_time DATETIME;
ALTER TABLE orders ADD COLUMN actual_delivery_time DATETIME;

-- Business metrics
ALTER TABLE orders ADD COLUMN platform_commission REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN packaging_cost REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_fee_charged REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_distance_km REAL;

-- Bon fiscal tracking
ALTER TABLE orders ADD COLUMN fiscal_receipt_printed BOOLEAN DEFAULT 0;
ALTER TABLE orders ADD COLUMN fiscal_receipt_printed_at DATETIME;
ALTER TABLE orders ADD COLUMN fiscal_receipt_number TEXT;

-- Zone de livrare
ALTER TABLE orders ADD COLUMN delivery_zone_id INTEGER REFERENCES delivery_zones(id);

-- =====================================================================
-- 2. TABELĂ: couriers
-- =====================================================================

CREATE TABLE IF NOT EXISTS couriers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  vehicle_type TEXT DEFAULT 'scooter',
  license_plate TEXT,
  
  -- Status operațional
  status TEXT DEFAULT 'offline',
  current_lat REAL,
  current_lng REAL,
  last_location_update DATETIME,
  
  -- Metrici
  rating REAL DEFAULT 5.0,
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  avg_delivery_time_minutes REAL,
  
  -- Login și securitate
  user_id INTEGER REFERENCES users(id),
  api_token TEXT,
  
  -- Date temporale
  active_since DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  
  -- Zone și limitări
  assigned_zones TEXT,
  max_concurrent_deliveries INTEGER DEFAULT 3,
  
  -- Financiar
  payment_type TEXT DEFAULT 'salary',
  commission_percent REAL DEFAULT 0
);

-- =====================================================================
-- 3. TABELĂ: delivery_assignments
-- =====================================================================

CREATE TABLE IF NOT EXISTS delivery_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  courier_id INTEGER NOT NULL REFERENCES couriers(id),
  
  -- Timestamps
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER REFERENCES users(id),
  picked_up_at DATETIME,
  delivered_at DATETIME,
  
  -- Status
  status TEXT DEFAULT 'assigned',
  
  -- Re-alocare
  reassigned_from INTEGER REFERENCES couriers(id),
  reassigned_to INTEGER REFERENCES couriers(id),
  reassignment_reason TEXT,
  reassignment_timestamp DATETIME,
  
  -- Financiar
  delivery_fee REAL DEFAULT 0,
  tip REAL DEFAULT 0,
  fuel_cost REAL DEFAULT 0,
  
  -- Dovadă livrare
  customer_signature TEXT,
  delivery_photo TEXT,
  delivery_notes TEXT,
  
  -- Metrici
  distance_km REAL,
  estimated_time_minutes INTEGER,
  actual_time_minutes INTEGER,
  
  -- GPS tracking
  route_gps_log TEXT
);

-- =====================================================================
-- 4. TABELĂ: delivery_zones
-- =====================================================================

CREATE TABLE IF NOT EXISTS delivery_zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Geo-fence
  zone_type TEXT DEFAULT 'polygon',
  polygon_coordinates TEXT,
  center_lat REAL,
  center_lng REAL,
  radius_km REAL,
  zip_codes TEXT,
  
  -- Restricții
  min_order_value REAL DEFAULT 0,
  delivery_fee_base REAL DEFAULT 0,
  fee_per_km REAL DEFAULT 0,
  max_distance_km REAL,
  eta_default_minutes INTEGER DEFAULT 30,
  
  -- Disponibilitate
  is_active BOOLEAN DEFAULT 1,
  available_from TIME,
  available_to TIME,
  
  -- Capacitate
  max_concurrent_orders INTEGER DEFAULT 20,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 5. TABELĂ: delivery_cancellations
-- =====================================================================

CREATE TABLE IF NOT EXISTS delivery_cancellations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  
  -- Cine și când
  cancelled_by TEXT NOT NULL,
  cancelled_by_id INTEGER,
  cancelled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Motiv
  reason_code TEXT NOT NULL,
  reason_details TEXT,
  
  -- Financiar
  refund_amount REAL DEFAULT 0,
  refund_method TEXT,
  refund_processed BOOLEAN DEFAULT 0,
  refund_processed_at DATETIME,
  
  -- Stadiul comenzii
  order_status_at_cancellation TEXT,
  courier_id_at_cancellation INTEGER,
  
  -- Audit
  notes TEXT,
  requires_approval BOOLEAN DEFAULT 0,
  approved_by INTEGER REFERENCES users(id),
  approved_at DATETIME
);

-- =====================================================================
-- 6. TABELĂ: platform_commissions
-- =====================================================================

CREATE TABLE IF NOT EXISTS platform_commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  platform TEXT NOT NULL,
  
  -- Comisioane
  order_subtotal REAL,
  commission_rate REAL,
  commission_amount REAL,
  vat_on_commission REAL,
  
  -- Settlement
  settlement_date DATE,
  settlement_status TEXT DEFAULT 'pending',
  invoice_number TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 7. INDEXURI NOI (PERFORMANCE)
-- =====================================================================

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_order_source ON orders(order_source);
CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform);
CREATE INDEX IF NOT EXISTS idx_orders_courier_id ON orders(courier_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone ON orders(delivery_zone_id);
CREATE INDEX IF NOT EXISTS idx_orders_source_status ON orders(order_source, status);
CREATE INDEX IF NOT EXISTS idx_orders_fiscal_printed ON orders(fiscal_receipt_printed);

-- delivery_assignments
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON delivery_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_courier ON delivery_assignments(courier_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON delivery_assignments(status);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_assigned_at ON delivery_assignments(assigned_at);

-- couriers
CREATE INDEX IF NOT EXISTS idx_couriers_status ON couriers(status);
CREATE INDEX IF NOT EXISTS idx_couriers_user_id ON couriers(user_id);
CREATE INDEX IF NOT EXISTS idx_couriers_api_token ON couriers(api_token);

-- delivery_zones
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);

-- platform_commissions
CREATE INDEX IF NOT EXISTS idx_platform_commissions_order ON platform_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_platform ON platform_commissions(platform);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_settlement ON platform_commissions(settlement_date, settlement_status);

-- =====================================================================
-- 8. MIGRARE DATE VECHI
-- =====================================================================

-- Populează order_source pentru comenzi existente
UPDATE orders SET order_source = 'POS' WHERE order_source IS NULL;

-- Populează platform bazat pe type
UPDATE orders SET platform = 'pos' WHERE platform IS NULL AND type = 'restaurant';
UPDATE orders SET platform = 'phone' WHERE platform IS NULL AND type = 'delivery';
UPDATE orders SET platform = 'phone' WHERE platform IS NULL AND type = 'takeout';

-- =====================================================================
-- 9. DATE DEMO (OPȚIONAL - PENTRU TESTARE)
-- =====================================================================

-- Inserează 2 curieri demo
INSERT OR IGNORE INTO couriers (code, name, phone, vehicle_type, status, is_active) VALUES
  ('DEL001', 'Ion Popescu', '0722123456', 'scooter', 'offline', 1),
  ('DEL002', 'Maria Ionescu', '0733987654', 'car', 'offline', 1);

-- Inserează 1 zonă de livrare demo
INSERT OR IGNORE INTO delivery_zones (name, description, zone_type, radius_km, center_lat, center_lng, min_order_value, delivery_fee_base, is_active) VALUES
  ('Centru', 'Zona centrală București', 'radius', 5, 44.4268, 26.1025, 30, 10, 1);

-- =====================================================================
-- FIN MIGRATION
-- =====================================================================

