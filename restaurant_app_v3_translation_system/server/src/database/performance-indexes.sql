-- ============================================
-- ENTERPRISE PERFORMANCE INDEXES
-- Critical indexes for top-tier HoReCa performance
-- Based on query patterns from Lightspeed, Toast, Square
-- ============================================

-- ============================================
-- ORDERS - Most queried table
-- ============================================

-- Primary queries: by date, status, table
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_source ON orders(order_source);
CREATE INDEX IF NOT EXISTS idx_orders_is_paid ON orders(is_paid);
CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(DATE(timestamp), status);
CREATE INDEX IF NOT EXISTS idx_orders_source_status ON orders(order_source, status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_date ON orders(tenant_id, DATE(timestamp));

-- Order items - JOIN performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_station ON order_items(station);

-- ============================================
-- MENU & PRODUCTS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);
CREATE INDEX IF NOT EXISTS idx_menu_is_active ON menu(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_category_active ON menu(category, is_active);
CREATE INDEX IF NOT EXISTS idx_menu_name ON menu(name);

-- ============================================
-- INGREDIENTS & STOCK
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_supplier_id ON ingredients(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_current_stock ON ingredients(current_stock);
CREATE INDEX IF NOT EXISTS idx_ingredients_min_stock ON ingredients(min_stock);

-- Low stock alerts query
CREATE INDEX IF NOT EXISTS idx_ingredients_stock_alert ON ingredients(current_stock, min_stock);

-- Stock movements
CREATE INDEX IF NOT EXISTS idx_stock_moves_date ON stock_moves(date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_moves_type ON stock_moves(type);
CREATE INDEX IF NOT EXISTS idx_stock_moves_ingredient ON stock_moves(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_reference ON stock_moves(reference_type, reference_id);

-- Ingredient batches (FIFO/FEFO)
CREATE INDEX IF NOT EXISTS idx_ingredient_batches_ingredient ON ingredient_batches(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_batches_expiry ON ingredient_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_ingredient_batches_remaining ON ingredient_batches(remaining_quantity);

-- ============================================
-- RECIPES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipes_menu_id ON recipes(menu_id);
CREATE INDEX IF NOT EXISTS idx_recipes_ingredient_id ON recipes(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipes_recipe_id ON recipes(recipe_id);

-- ============================================
-- SUPPLIERS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);

-- ============================================
-- INVOICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issue_date DESC);

-- ============================================
-- DELIVERY
-- ============================================

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_courier ON delivery_assignments(courier_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON delivery_assignments(status);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON delivery_assignments(order_id);

-- ============================================
-- RESERVATIONS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_table ON reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(phone);

-- ============================================
-- TIPIZATE DOCUMENTS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tipizate_type ON tipizate_documents(type);
CREATE INDEX IF NOT EXISTS idx_tipizate_status ON tipizate_documents(status);
CREATE INDEX IF NOT EXISTS idx_tipizate_date ON tipizate_documents(date DESC);
CREATE INDEX IF NOT EXISTS idx_tipizate_series_number ON tipizate_documents(series, number);
CREATE INDEX IF NOT EXISTS idx_tipizate_location ON tipizate_documents(location_id);

-- ============================================
-- COMPLIANCE / HACCP
-- ============================================

CREATE INDEX IF NOT EXISTS idx_temperature_log_equipment ON compliance_temperature_log(equipment_id);
CREATE INDEX IF NOT EXISTS idx_temperature_log_date ON compliance_temperature_log(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_log_alert ON compliance_temperature_log(is_alert);

-- ============================================
-- AUDIT & LOGGING
-- ============================================

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- ============================================
-- WEBHOOKS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event_type);

-- ============================================
-- CUSTOMERS & LOYALTY
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);

-- ============================================
-- TEXT SEARCH OPTIMIZATION (FTS5 if available)
-- ============================================

-- Note: FTS5 requires special handling in SQLite
-- These are standard LIKE optimization indexes
CREATE INDEX IF NOT EXISTS idx_menu_name_search ON menu(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_ingredients_name_search ON ingredients(name COLLATE NOCASE);

-- ============================================
-- COVERING INDEXES for common read patterns
-- ============================================

-- Dashboard metrics - avoid table scan
CREATE INDEX IF NOT EXISTS idx_orders_dashboard ON orders(
  DATE(timestamp), 
  status, 
  total, 
  is_paid
);

-- Stock valuation
CREATE INDEX IF NOT EXISTS idx_ingredients_valuation ON ingredients(
  id,
  name,
  current_stock,
  cost_per_unit
);

-- ============================================
-- ANALYZE for query planner optimization
-- ============================================
ANALYZE;

