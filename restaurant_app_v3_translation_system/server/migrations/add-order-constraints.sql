-- MIGRATION: Add constraints for order uniformity
-- Asigură că toate comenzile au platform și order_source setate

-- 1. Actualizează comenzile existente cu NULL platform/order_source
UPDATE orders 
SET platform = 'POS' 
WHERE platform IS NULL;

UPDATE orders 
SET order_source = 'POS' 
WHERE order_source IS NULL;

-- 2. Adaugă index-uri pentru queries rapide
CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform, timestamp);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(order_source, timestamp);
CREATE INDEX IF NOT EXISTS idx_orders_platform_source ON orders(platform, order_source, timestamp);

-- 3. Index pentru stock_movements (pentru verificare uniformitate)
CREATE INDEX IF NOT EXISTS idx_stock_moves_ref ON stock_moves(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_order ON stock_moves(order_id);

-- 4. Index pentru order_items (dacă există tabela)
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Note: SQLite nu suportă ALTER COLUMN SET NOT NULL direct
-- Constraint-urile NOT NULL trebuie verificate în aplicație sau prin trigger-uri
