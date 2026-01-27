-- =====================================================
-- OPTIMIZARE INDEXURI PENTRU RAPOARTE
-- Restaurant App - Optimizare query-uri rapoarte
-- Data: 2025-12-21
-- =====================================================
-- 
-- Acest script creează indexuri compuse pentru îmbunătățirea performanței
-- query-urilor de rapoarte care filtrează comenzi după:
-- - status (paid, completed, delivered)
-- - timestamp (perioadă)
-- - table_number (exclude test orders)
--
-- Indexurile vor accelera semnificativ query-urile din:
-- - reports.controller.js
-- - cogs.reporting.js
-- - financial.service.js
-- - advanced-reports.controller.js

-- Index compus pentru query-urile de rapoarte (status + timestamp)
-- Acoperă pattern-ul: WHERE status IN (...) AND DATE(timestamp) BETWEEN ...
CREATE INDEX IF NOT EXISTS idx_orders_status_timestamp 
ON orders(status, timestamp);

-- Index compus alternativ pentru query-uri cu table_number filtering
-- Acoperă pattern-ul: WHERE status IN (...) AND table_number >= 0 AND DATE(timestamp) BETWEEN ...
CREATE INDEX IF NOT EXISTS idx_orders_status_table_timestamp 
ON orders(status, table_number, timestamp);

-- Index pentru client_identifier (pentru filtrarea comenzilor de test)
-- Util pentru: WHERE client_identifier NOT LIKE '%test%'
-- Note: LIKE cu wildcard la început nu beneficiază mult de index, dar îl creăm pentru completitudine
CREATE INDEX IF NOT EXISTS idx_orders_client_identifier 
ON orders(client_identifier) 
WHERE client_identifier IS NOT NULL;

-- Indexuri pentru stock_moves (folosite în rapoarte COGS)
-- Pentru query-uri: JOIN stock_moves ON orders.id = stock_moves.order_id
CREATE INDEX IF NOT EXISTS idx_stock_moves_order_id 
ON stock_moves(order_id) 
WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stock_moves_type_order 
ON stock_moves(type, order_id) 
WHERE type IN ('SALE_OUT', 'CONSUME');

-- Indexuri pentru json_each queries (orders.items)
-- SQLite nu poate indexa JSON direct, dar indexurile de mai sus vor ajuta
-- când se face JOIN cu json_each(o.items)

-- =====================================================
-- VERIFICARE INDEXURI EXISTENTE
-- =====================================================
-- Pentru a verifica indexurile existente:
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='orders';
--
-- Pentru a analiza utilizarea indexurilor:
-- EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status IN ('paid', 'completed', 'delivered') AND DATE(timestamp) BETWEEN '2025-01-01' AND '2025-12-31';
--
-- =====================================================
-- NOTE IMPORTANTE
-- =====================================================
-- 1. Indexurile compuse trebuie să acopere coloanele în ordinea folosită în WHERE
-- 2. Pentru DATE(timestamp), SQLite va folosi indexul pe timestamp
-- 3. LIKE '%test%' cu wildcard la început nu beneficiază de index
-- 4. Indexurile ocupă spațiu, dar îmbunătățesc semnificativ performanța query-urilor

