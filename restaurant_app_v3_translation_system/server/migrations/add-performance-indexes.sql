-- Performance Optimization Indexes
-- Created: 2025-12-27
-- Purpose: Optimize frequently queried columns for better performance

-- ==========================================
-- ORDERS TABLE INDEXES
-- ==========================================

-- Index for filtering orders by date (reports, analytics)
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp);

-- Index for filtering orders by status (dashboard, order management)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Composite index for date+status queries (most common filter combination)
CREATE INDEX IF NOT EXISTS idx_orders_status_timestamp ON orders(status, timestamp);

-- Index for delivery orders lookup
CREATE INDEX IF NOT EXISTS idx_orders_order_source ON orders(order_source);

-- Index for table-based order lookup (restaurant floor management)
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);

-- Index for courier assignment queries
CREATE INDEX IF NOT EXISTS idx_orders_courier_id ON orders(courier_id) WHERE courier_id IS NOT NULL;

-- ==========================================
-- ORDER_ITEMS TABLE INDEXES
-- ==========================================

-- Index for joining with orders
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index for product sales analysis
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Composite for sales reports
CREATE INDEX IF NOT EXISTS idx_order_items_product_order ON order_items(product_id, order_id);

-- ==========================================
-- STOCK MOVEMENTS TABLE INDEXES
-- ==========================================

-- Index for ingredient lookup (consumption tracking)
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient_id ON stock_movements(ingredient_id);

-- Index for date-based queries (reports)
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- Index for movement type filtering
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);

-- Composite for ingredient history
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient_date ON stock_movements(ingredient_id, created_at);

-- ==========================================
-- INGREDIENTS TABLE INDEXES
-- ==========================================

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_ingredients_stock_level ON ingredients(current_stock, min_stock);

-- Index for supplier filtering
CREATE INDEX IF NOT EXISTS idx_ingredients_supplier ON ingredients(supplier);

-- Index for barcode lookup (POS/inventory)
CREATE INDEX IF NOT EXISTS idx_ingredients_barcode ON ingredients(barcode) WHERE barcode IS NOT NULL;

-- ==========================================
-- MENU TABLE INDEXES
-- ==========================================

-- Index for category filtering (menu display)
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);

-- Index for active items only
CREATE INDEX IF NOT EXISTS idx_menu_is_active ON menu(is_active);

-- Composite for menu display
CREATE INDEX IF NOT EXISTS idx_menu_category_active ON menu(category, is_active);

-- ==========================================
-- RECIPES TABLE INDEXES
-- ==========================================

-- Index for product recipe lookup
CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON recipes(product_id);

-- Index for ingredient usage tracking
CREATE INDEX IF NOT EXISTS idx_recipes_ingredient_id ON recipes(ingredient_id);

-- ==========================================
-- COMPLIANCE TABLES INDEXES
-- ==========================================

-- Temperature logs by equipment
CREATE INDEX IF NOT EXISTS idx_temp_log_equipment ON compliance_temperature_log(equipment_id);

-- Temperature logs by date
CREATE INDEX IF NOT EXISTS idx_temp_log_date ON compliance_temperature_log(created_at);

-- Cleaning schedule by status
CREATE INDEX IF NOT EXISTS idx_cleaning_status ON compliance_cleaning_schedule(status);

-- Maintenance by equipment
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment ON compliance_equipment_maintenance(equipment_id);

-- HACCP monitoring by CCP
CREATE INDEX IF NOT EXISTS idx_haccp_monitoring_ccp ON haccp_monitoring(ccp_id);

-- ==========================================
-- LOYALTY & GIFT CARDS INDEXES
-- ==========================================

-- Gift card code lookup
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);

-- Loyalty points by client
CREATE INDEX IF NOT EXISTS idx_loyalty_points_client ON loyalty_points(client_token);

-- ==========================================
-- AUDIT & LOGGING INDEXES
-- ==========================================

-- Admin login history by date
CREATE INDEX IF NOT EXISTS idx_admin_login_date ON admin_login_history(login_at);

-- Kiosk actions by date
CREATE INDEX IF NOT EXISTS idx_kiosk_actions_date ON kiosk_actions_log(timestamp);

-- ==========================================
-- DELIVERY RELATED INDEXES
-- ==========================================

-- Delivery assignments by order
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON delivery_assignments(order_id);

-- Delivery assignments by courier
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_courier ON delivery_assignments(courier_id);

-- Delivery zones lookup
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);

