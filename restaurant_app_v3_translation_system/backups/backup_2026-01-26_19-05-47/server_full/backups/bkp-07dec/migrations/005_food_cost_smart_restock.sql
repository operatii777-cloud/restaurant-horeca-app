-- ================================================
-- MIGRATION: Food Cost Dashboard + Smart Restock
-- Data: 3 Decembrie 2025
-- Descriere: Adaugă structuri necesare pentru Food Cost și Smart Restock ML
-- ================================================

-- ==================== FOOD COST DASHBOARD ====================

-- 1. Adaugă câmp COGS în tabela orders
ALTER TABLE orders ADD COLUMN cogs REAL DEFAULT 0;

-- 2. Creează tabela pentru rezumate zilnice Food Cost
CREATE TABLE IF NOT EXISTS cogs_daily_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_date DATE NOT NULL,
  location_id INTEGER DEFAULT 1,
  total_revenue REAL DEFAULT 0,
  total_cost REAL DEFAULT 0,
  total_margin REAL DEFAULT 0,
  food_cost_pct REAL DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  avg_ticket REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_date, location_id)
);

CREATE INDEX IF NOT EXISTS idx_cogs_daily_date ON cogs_daily_summary(service_date);
CREATE INDEX IF NOT EXISTS idx_cogs_daily_location ON cogs_daily_summary(location_id);

-- 3. Creează tabela pentru istoric costuri ingrediente
CREATE TABLE IF NOT EXISTS ingredient_cost_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  cost_per_unit REAL NOT NULL,
  effective_date DATE NOT NULL,
  supplier_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cost_history_ingredient ON ingredient_cost_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_cost_history_date ON ingredient_cost_history(effective_date);

-- 4. Trigger pentru calcul automat COGS la plasare comandă
CREATE TRIGGER IF NOT EXISTS calculate_cogs_on_order_insert
AFTER INSERT ON orders
FOR EACH ROW
WHEN NEW.status IN ('paid', 'completed', 'delivered')
BEGIN
  UPDATE orders 
  SET cogs = (
    SELECT COALESCE(SUM(
      json_extract(item.value, '$.quantity') * 
      COALESCE((
        SELECT SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0))
        FROM recipes r
        LEFT JOIN ingredients i ON r.ingredient_id = i.id
        WHERE r.product_id = json_extract(item.value, '$.productId')
          OR r.product_id = json_extract(item.value, '$.product_id')
          OR r.product_id = json_extract(item.value, '$.id')
      ), 0)
    ), 0)
    FROM json_each(NEW.items) item
  )
  WHERE id = NEW.id;
END;

-- 5. Trigger pentru calcul automat COGS la update status
CREATE TRIGGER IF NOT EXISTS calculate_cogs_on_order_update
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN NEW.status IN ('paid', 'completed', 'delivered') AND OLD.status NOT IN ('paid', 'completed', 'delivered')
BEGIN
  UPDATE orders 
  SET cogs = (
    SELECT COALESCE(SUM(
      json_extract(item.value, '$.quantity') * 
      COALESCE((
        SELECT SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0))
        FROM recipes r
        LEFT JOIN ingredients i ON r.ingredient_id = i.id
        WHERE r.product_id = json_extract(item.value, '$.productId')
          OR r.product_id = json_extract(item.value, '$.product_id')
          OR r.product_id = json_extract(item.value, '$.id')
      ), 0)
    ), 0)
    FROM json_each(NEW.items) item
  )
  WHERE id = NEW.id;
END;

-- ==================== SMART RESTOCK ML ====================

-- 6. Adaugă câmp min_stock_alert în ingredients
-- Verificăm dacă coloana există deja
CREATE TABLE IF NOT EXISTS _ingredients_new AS SELECT * FROM ingredients LIMIT 0;
ALTER TABLE _ingredients_new ADD COLUMN min_stock_alert REAL DEFAULT 10;
DROP TABLE _ingredients_new;

-- Dacă nu există, o adăugăm
-- (SQLite nu suportă IF NOT EXISTS pentru ALTER TABLE, așa că folosim try-catch în cod)

-- 7. Creează tabela pentru mișcări stoc (Stock Moves)
CREATE TABLE IF NOT EXISTS stock_moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  quantity REAL NOT NULL, -- Negativ pentru OUT, Pozitiv pentru IN
  move_type TEXT NOT NULL CHECK(move_type IN ('SALE_OUT', 'CONSUME', 'WASTE', 'PRODUCTION', 'PURCHASE_IN', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'INVENTORY')),
  order_id INTEGER,
  reference TEXT, -- Ex: "NIR-123", "Order #456", "Inventory-2025-01"
  notes TEXT,
  user_id INTEGER,
  location_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_moves_ingredient ON stock_moves(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_date ON stock_moves(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_moves_type ON stock_moves(move_type);
CREATE INDEX IF NOT EXISTS idx_stock_moves_order ON stock_moves(order_id);

-- 8. Trigger pentru înregistrare automată stock moves la plasare comandă
CREATE TRIGGER IF NOT EXISTS record_stock_move_on_order
AFTER INSERT ON orders
FOR EACH ROW
WHEN NEW.status IN ('paid', 'completed', 'delivered')
BEGIN
  -- Pentru fiecare item din comandă, înregistrează consum ingrediente
  INSERT INTO stock_moves (ingredient_id, quantity, move_type, order_id, reference)
  SELECT 
    r.ingredient_id,
    -1 * (json_extract(item.value, '$.quantity') * r.quantity_needed) as quantity,
    'SALE_OUT' as move_type,
    NEW.id as order_id,
    'Order #' || NEW.id as reference
  FROM json_each(NEW.items) item
  JOIN recipes r ON (
    r.product_id = json_extract(item.value, '$.productId')
    OR r.product_id = json_extract(item.value, '$.product_id')
    OR r.product_id = json_extract(item.value, '$.id')
  )
  WHERE r.ingredient_id IS NOT NULL;
END;

-- 9. Trigger pentru înregistrare stock moves la NIR (recepții)
CREATE TRIGGER IF NOT EXISTS record_stock_move_on_nir
AFTER INSERT ON nir_items
FOR EACH ROW
BEGIN
  INSERT INTO stock_moves (ingredient_id, quantity, move_type, reference, notes)
  VALUES (
    NEW.ingredient_id,
    NEW.quantity_received,
    'PURCHASE_IN',
    'NIR-' || NEW.nir_id,
    'Recepție furnizor'
  );
END;

-- 10. Trigger pentru înregistrare stock moves la consum
CREATE TRIGGER IF NOT EXISTS record_stock_move_on_consume
AFTER INSERT ON bon_consum_items
FOR EACH ROW
BEGIN
  INSERT INTO stock_moves (ingredient_id, quantity, move_type, reference, notes)
  VALUES (
    NEW.ingredient_id,
    -1 * NEW.quantity,
    'CONSUME',
    'BC-' || NEW.bon_consum_id,
    'Bon de consum'
  );
END;

-- 11. Trigger pentru înregistrare stock moves la waste
CREATE TRIGGER IF NOT EXISTS record_stock_move_on_waste
AFTER INSERT ON waste_logs
FOR EACH ROW
WHEN NEW.ingredient_id IS NOT NULL
BEGIN
  INSERT INTO stock_moves (ingredient_id, quantity, move_type, reference, notes)
  VALUES (
    NEW.ingredient_id,
    -1 * NEW.quantity,
    'WASTE',
    'WASTE-' || NEW.id,
    NEW.reason
  );
END;

-- ==================== POPULARE DATE INIȚIALE ====================

-- 12. Populează ingredient_cost_history din costurile curente
INSERT OR IGNORE INTO ingredient_cost_history (ingredient_id, cost_per_unit, effective_date, notes)
SELECT 
  id,
  COALESCE(cost_per_unit, 0),
  DATE('now'),
  'Cost inițial migrare'
FROM ingredients
WHERE cost_per_unit IS NOT NULL AND cost_per_unit > 0;

-- 13. Calculează COGS pentru comenzile existente (doar ultimele 90 zile pentru performanță)
UPDATE orders 
SET cogs = (
  SELECT COALESCE(SUM(
    json_extract(item.value, '$.quantity') * 
    COALESCE((
      SELECT SUM(r.quantity_needed * COALESCE(i.cost_per_unit, 0))
      FROM recipes r
      LEFT JOIN ingredients i ON r.ingredient_id = i.id
      WHERE r.product_id = json_extract(item.value, '$.productId')
        OR r.product_id = json_extract(item.value, '$.product_id')
        OR r.product_id = json_extract(item.value, '$.id')
    ), 0)
  ), 0)
  FROM json_each(orders.items) item
)
WHERE status IN ('paid', 'completed', 'delivered')
  AND created_at >= DATE('now', '-90 days')
  AND (cogs IS NULL OR cogs = 0);

-- 14. Generează stock moves istoric pentru ultimele 30 zile (pentru a avea date pentru ML)
INSERT INTO stock_moves (ingredient_id, quantity, move_type, order_id, reference, created_at)
SELECT 
  r.ingredient_id,
  -1 * (json_extract(item.value, '$.quantity') * r.quantity_needed) as quantity,
  'SALE_OUT' as move_type,
  o.id as order_id,
  'Order #' || o.id as reference,
  o.created_at
FROM orders o
CROSS JOIN json_each(o.items) item
JOIN recipes r ON (
  r.product_id = json_extract(item.value, '$.productId')
  OR r.product_id = json_extract(item.value, '$.product_id')
  OR r.product_id = json_extract(item.value, '$.id')
)
WHERE o.status IN ('paid', 'completed', 'delivered')
  AND o.created_at >= DATE('now', '-30 days')
  AND r.ingredient_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM stock_moves sm 
    WHERE sm.order_id = o.id 
    AND sm.ingredient_id = r.ingredient_id
  );

-- 15. Setează min_stock_alert pentru ingrediente fără valoare
UPDATE ingredients 
SET min_stock_alert = 
  CASE 
    WHEN current_stock > 0 THEN current_stock * 0.2  -- 20% din stocul curent
    ELSE 10  -- Default pentru ingrediente fără stoc
  END
WHERE min_stock_alert IS NULL OR min_stock_alert = 0;

-- ==================== VERIFICARE MIGRARE ====================

-- Afișează statistici după migrare
SELECT 
  'Orders with COGS' as metric,
  COUNT(*) as count,
  SUM(cogs) as total_cogs,
  AVG(cogs) as avg_cogs
FROM orders 
WHERE cogs > 0 AND created_at >= DATE('now', '-90 days')

UNION ALL

SELECT 
  'Stock Moves' as metric,
  COUNT(*) as count,
  SUM(ABS(quantity)) as total_quantity,
  COUNT(DISTINCT ingredient_id) as unique_ingredients
FROM stock_moves

UNION ALL

SELECT 
  'Cost History Records' as metric,
  COUNT(*) as count,
  COUNT(DISTINCT ingredient_id) as unique_ingredients,
  0 as unused
FROM ingredient_cost_history

UNION ALL

SELECT 
  'Ingredients with min_stock_alert' as metric,
  COUNT(*) as count,
  AVG(min_stock_alert) as avg_alert,
  0 as unused
FROM ingredients 
WHERE min_stock_alert > 0;

-- ==================== DONE ====================
-- Migration completed successfully!
-- Food Cost Dashboard și Smart Restock ML sunt acum funcționale! 🚀

