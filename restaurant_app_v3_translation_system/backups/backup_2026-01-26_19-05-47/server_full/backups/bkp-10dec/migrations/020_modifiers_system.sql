-- MIGRATION 020: MODIFIERS SYSTEM (Extras, Toppings, Combos)
-- Data: 04 Decembrie 2025
-- Funcționalitate critică pentru restaurante moderne

-- ========================================
-- 1. MODIFIER GROUPS
-- ========================================
CREATE TABLE IF NOT EXISTS modifier_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  type TEXT NOT NULL CHECK(type IN ('single','multiple','combo')),
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT NULL,
  is_required BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_type ON modifier_groups(type);
CREATE INDEX IF NOT EXISTS idx_modifier_groups_active ON modifier_groups(is_active);

-- ========================================
-- 2. MODIFIER GROUP ITEMS
-- ========================================
CREATE TABLE IF NOT EXISTS modifier_group_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  price_delta REAL DEFAULT 0,
  is_default BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_modifier_items_group ON modifier_group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_modifier_items_active ON modifier_group_items(is_active);

-- ========================================
-- 3. PRODUCT MODIFIERS (Link Products → Groups)
-- ========================================
CREATE TABLE IF NOT EXISTS product_modifiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  modifier_group_id INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (modifier_group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE,
  UNIQUE(product_id, modifier_group_id)
);

CREATE INDEX IF NOT EXISTS idx_product_modifiers_product ON product_modifiers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_modifiers_group ON product_modifiers(modifier_group_id);

-- ========================================
-- 4. ORDER ITEM MODIFIERS (Selected modifiers per order)
-- ========================================
CREATE TABLE IF NOT EXISTS order_item_modifiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_item_id INTEGER NOT NULL,
  modifier_group_id INTEGER NOT NULL,
  modifier_item_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_delta REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (modifier_group_id) REFERENCES modifier_groups(id),
  FOREIGN KEY (modifier_item_id) REFERENCES modifier_group_items(id)
);

CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_order_item ON order_item_modifiers(order_item_id);

-- ========================================
-- 5. SAMPLE DATA (EXAMPLES)
-- ========================================

-- Exemplu: Extra ingrediente
INSERT OR IGNORE INTO modifier_groups (id, name, name_en, type, min_selections, max_selections, is_required) VALUES
(1, 'Extra Ingrediente', 'Extra Ingredients', 'multiple', 0, 5, 0);

INSERT OR IGNORE INTO modifier_group_items (group_id, name, name_en, price_delta, display_order) VALUES
(1, 'Extra Brânză', 'Extra Cheese', 3.00, 1),
(1, 'Extra Bacon', 'Extra Bacon', 7.00, 2),
(1, 'Extra Carne', 'Extra Meat', 8.00, 3),
(1, 'Extra Legume', 'Extra Vegetables', 2.00, 4);

-- Exemplu: Alege sosul
INSERT OR IGNORE INTO modifier_groups (id, name, name_en, type, min_selections, max_selections, is_required) VALUES
(2, 'Alege Sosul', 'Choose Sauce', 'single', 1, 1, 1);

INSERT OR IGNORE INTO modifier_group_items (group_id, name, name_en, price_delta, is_default, display_order) VALUES
(2, 'Sos BBQ', 'BBQ Sauce', 0, 1, 1),
(2, 'Sos Picant', 'Spicy Sauce', 0, 0, 2),
(2, 'Sos Usturoi', 'Garlic Sauce', 0, 0, 3),
(2, 'Sos Maioneză', 'Mayo Sauce', 0, 0, 4);

-- Exemplu: Dimensiune băutură (pentru combo)
INSERT OR IGNORE INTO modifier_groups (id, name, name_en, type, min_selections, max_selections, is_required) VALUES
(3, 'Dimensiune Băutură', 'Drink Size', 'single', 1, 1, 0);

INSERT OR IGNORE INTO modifier_group_items (group_id, name, name_en, price_delta, is_default, display_order) VALUES
(3, 'Mică (330ml)', 'Small (330ml)', 0, 1, 1),
(3, 'Medie (500ml)', 'Medium (500ml)', 2.00, 0, 2),
(3, 'Mare (750ml)', 'Large (750ml)', 4.00, 0, 3);

-- Exemplu: Tip cartofi
INSERT OR IGNORE INTO modifier_groups (id, name, name_en, type, min_selections, max_selections, is_required) VALUES
(4, 'Tip Cartofi', 'Fries Type', 'single', 1, 1, 1);

INSERT OR IGNORE INTO modifier_group_items (group_id, name, name_en, price_delta, is_default, display_order) VALUES
(4, 'Cartofi clasici', 'Regular Fries', 0, 1, 1),
(4, 'Cartofi wedges', 'Wedges', 2.00, 0, 2),
(4, 'Cartofi dulci', 'Sweet Potato Fries', 3.00, 0, 3);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
SELECT 'Migration 020: Modifiers System - COMPLETE!' as status;

