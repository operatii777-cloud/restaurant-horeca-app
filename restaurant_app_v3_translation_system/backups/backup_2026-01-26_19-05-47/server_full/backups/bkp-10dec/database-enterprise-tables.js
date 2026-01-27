/**
 * ENTERPRISE TABLES - Tabele noi pentru upgrade la Enterprise Grade
 * Data: 03 Decembrie 2025
 * Include în database.js pentru crearea automată
 */

function createEnterpriseTables(db) {
  return new Promise((resolve, reject) => {
    console.log('\n🏗️ Creating Enterprise Tables...\n');
    
    const tables = [];
    let completed = 0;
    
    // Counter pentru progres
    const checkComplete = () => {
      completed++;
      if (completed === tables.length) {
        console.log(`\n✅ Enterprise tables created: ${completed}/${tables.length}\n`);
        resolve();
      }
    };
    
    // ========== INGREDIENT CATALOG GLOBAL ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS ingredient_catalog_global (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ro TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_scientific TEXT,
        category TEXT NOT NULL,
        subcategory TEXT,
        food_group TEXT,
        standard_unit TEXT DEFAULT 'kg',
        standard_package TEXT,
        package_type TEXT,
        allergens TEXT,
        allergen_category TEXT,
        allergen_traces TEXT,
        allergen_free_certified INTEGER DEFAULT 0,
        additives TEXT,
        preservatives TEXT,
        energy_kcal REAL,
        energy_kj REAL,
        protein REAL,
        carbs REAL,
        sugars REAL,
        fat REAL,
        saturated_fat REAL,
        monounsaturated_fat REAL,
        polyunsaturated_fat REAL,
        fiber REAL,
        salt REAL,
        sodium REAL,
        cholesterol REAL,
        vitamin_a REAL,
        vitamin_c REAL,
        vitamin_d REAL,
        calcium REAL,
        iron REAL,
        source TEXT NOT NULL,
        source_id TEXT,
        source_url TEXT,
        last_verified DATE,
        is_verified INTEGER DEFAULT 1,
        verification_notes TEXT,
        is_organic INTEGER DEFAULT 0,
        is_local INTEGER DEFAULT 0,
        is_seasonal INTEGER DEFAULT 0,
        seasonal_months TEXT,
        estimated_cost_ron_per_kg REAL,
        cost_category TEXT,
        storage_temperature TEXT,
        shelf_life_days INTEGER,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('❌ ingredient_catalog_global:', err.message);
        else console.log('✅ ingredient_catalog_global created');
        checkComplete();
      });
    });
    
    // ========== TECHNICAL SHEETS ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS technical_sheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL UNIQUE,
        recipe_id INTEGER,
        name_ro TEXT NOT NULL,
        name_en TEXT,
        category TEXT NOT NULL,
        description_ro TEXT,
        description_en TEXT,
        ingredients_ordered TEXT NOT NULL,
        allergens TEXT NOT NULL,
        allergens_traces TEXT,
        allergens_visual_markup TEXT,
        allergen_free_certified INTEGER DEFAULT 0,
        additives TEXT,
        portion_size_grams REAL NOT NULL,
        energy_kcal REAL,
        energy_kj REAL,
        fat REAL,
        saturated_fat REAL,
        monounsaturated_fat REAL,
        polyunsaturated_fat REAL,
        carbs REAL,
        sugars REAL,
        protein REAL,
        salt REAL,
        fiber REAL,
        sodium REAL,
        cholesterol REAL,
        vitamin_a REAL,
        vitamin_c REAL,
        vitamin_d REAL,
        calcium REAL,
        iron REAL,
        cost_per_portion REAL,
        cost_per_portion_min REAL,
        cost_per_portion_max REAL,
        cost_calculation_method TEXT DEFAULT 'FIFO',
        last_cost_update DATETIME,
        suggested_price REAL,
        current_price REAL,
        margin_percentage REAL,
        markup_factor REAL,
        serving_temperature TEXT,
        serving_temperature_min INTEGER,
        serving_temperature_max INTEGER,
        storage_conditions TEXT,
        storage_temperature_min INTEGER,
        storage_temperature_max INTEGER,
        shelf_life TEXT,
        shelf_life_hours INTEGER,
        preparation_time_minutes INTEGER,
        cooking_temperature INTEGER,
        cooking_time_minutes INTEGER,
        reheating_allowed INTEGER DEFAULT 0,
        reheating_instructions TEXT,
        status TEXT DEFAULT 'draft',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_by_chef TEXT,
        approved_by_chef_at DATETIME,
        chef_notes TEXT,
        approved_by_manager TEXT,
        approved_by_manager_at DATETIME,
        manager_notes TEXT,
        locked_at DATETIME,
        locked_by TEXT,
        locked_reason TEXT,
        archived_at DATETIME,
        archived_by TEXT,
        archived_reason TEXT,
        version INTEGER DEFAULT 1,
        previous_version_id INTEGER,
        change_log TEXT,
        pdf_path TEXT,
        pdf_generated_at DATETIME,
        qr_code TEXT,
        qr_code_url TEXT,
        view_count INTEGER DEFAULT 0,
        last_viewed_at DATETIME,
        print_count INTEGER DEFAULT 0,
        last_printed_at DATETIME,
        tags TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
        FOREIGN KEY (previous_version_id) REFERENCES technical_sheets(id)
      )`, (err) => {
        if (err) console.error('❌ technical_sheets:', err.message);
        else console.log('✅ technical_sheets created');
        checkComplete();
      });
    });
    
    // ========== PRODUCT PORTIONS ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS product_portions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        size_code TEXT NOT NULL,
        size_name TEXT NOT NULL,
        size_name_en TEXT,
        size_description TEXT,
        portion_multiplier REAL NOT NULL,
        portion_grams REAL NOT NULL,
        price REAL NOT NULL,
        cost_per_portion REAL,
        margin_percentage REAL,
        markup_factor REAL,
        is_default INTEGER DEFAULT 0,
        is_available INTEGER DEFAULT 1,
        sort_order INTEGER,
        order_count INTEGER DEFAULT 0,
        last_ordered_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error('❌ product_portions:', err.message);
        else console.log('✅ product_portions created');
        checkComplete();
      });
    });
    
    // ========== ALLERGEN CROSS CONTAMINATION ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS allergen_cross_contamination (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER NOT NULL,
        location_name TEXT,
        allergen TEXT NOT NULL,
        allergen_en TEXT,
        risk_level TEXT DEFAULT 'medium',
        risk_description TEXT,
        mitigation_steps TEXT,
        mitigation_frequency TEXT,
        responsible_person TEXT,
        last_training_date DATE,
        next_training_due DATE,
        training_participants TEXT,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES management_locations(id)
      )`, (err) => {
        if (err) console.error('❌ allergen_cross_contamination:', err.message);
        else console.log('✅ allergen_cross_contamination created');
        checkComplete();
      });
    });
    
    // ========== PRODUCT RECALLS ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS product_recalls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recall_number TEXT UNIQUE NOT NULL,
        recall_date DATE NOT NULL,
        recall_type TEXT NOT NULL,
        ingredient_id INTEGER,
        product_id INTEGER,
        supplier_id INTEGER,
        batch_numbers TEXT,
        severity TEXT NOT NULL,
        health_risk TEXT,
        reason TEXT NOT NULL,
        description TEXT,
        affected_products_count INTEGER DEFAULT 0,
        affected_orders_count INTEGER DEFAULT 0,
        affected_customers_count INTEGER DEFAULT 0,
        affected_products_list TEXT,
        affected_orders_list TEXT,
        action_taken TEXT NOT NULL,
        notification_sent INTEGER DEFAULT 0,
        notification_sent_at DATETIME,
        notification_method TEXT,
        ansvsa_notified INTEGER DEFAULT 0,
        ansvsa_notification_date DATE,
        ansvsa_case_number TEXT,
        resolved INTEGER DEFAULT 0,
        resolved_at DATETIME,
        resolved_by TEXT,
        resolution_notes TEXT,
        financial_loss REAL,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )`, (err) => {
        if (err) console.error('❌ product_recalls:', err.message);
        else console.log('✅ product_recalls created');
        checkComplete();
      });
    });
    
    // ========== EXPIRY ALERTS ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS expiry_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        ingredient_name TEXT NOT NULL,
        batch_number TEXT NOT NULL,
        expiry_date DATE NOT NULL,
        days_until_expiry INTEGER NOT NULL,
        alert_level TEXT NOT NULL,
        remaining_quantity REAL NOT NULL,
        unit TEXT,
        value_at_risk REAL,
        location_id INTEGER NOT NULL,
        location_name TEXT,
        action_recommended TEXT,
        action_taken TEXT,
        action_taken_by TEXT,
        action_taken_at DATETIME,
        notified INTEGER DEFAULT 0,
        notified_at DATETIME,
        notified_to TEXT,
        resolved INTEGER DEFAULT 0,
        resolved_at DATETIME,
        resolution_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES ingredient_batches(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        FOREIGN KEY (location_id) REFERENCES management_locations(id)
      )`, (err) => {
        if (err) console.error('❌ expiry_alerts:', err.message);
        else console.log('✅ expiry_alerts created');
        checkComplete();
      });
    });
    
    // ========== STOCK VARIANCE ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS stock_variance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        variance_date DATE NOT NULL,
        location_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        ingredient_name TEXT NOT NULL,
        theoretical_usage REAL NOT NULL,
        theoretical_cost REAL NOT NULL,
        actual_usage REAL NOT NULL,
        actual_cost REAL NOT NULL,
        variance_quantity REAL NOT NULL,
        variance_percentage REAL NOT NULL,
        variance_cost REAL NOT NULL,
        variance_type TEXT,
        acceptable_threshold REAL DEFAULT 5.0,
        requires_investigation INTEGER DEFAULT 0,
        investigated INTEGER DEFAULT 0,
        investigated_by TEXT,
        investigated_at DATETIME,
        investigation_findings TEXT,
        investigation_action TEXT,
        possible_causes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        FOREIGN KEY (location_id) REFERENCES management_locations(id)
      )`, (err) => {
        if (err) console.error('❌ stock_variance:', err.message);
        else console.log('✅ stock_variance created');
        checkComplete();
      });
    });
    
    // ========== RECIPE VERSIONS ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS recipe_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        version_number INTEGER NOT NULL,
        recipe_snapshot TEXT NOT NULL,
        changed_by TEXT NOT NULL,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        change_description TEXT,
        change_reason TEXT,
        cost_before REAL,
        cost_after REAL,
        cost_difference_percentage REAL,
        is_active INTEGER DEFAULT 0,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error('❌ recipe_versions:', err.message);
        else console.log('✅ recipe_versions created');
        checkComplete();
      });
    });
    
    // ========== TECHNICAL SHEET HISTORY ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS technical_sheet_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        technical_sheet_id INTEGER NOT NULL,
        snapshot_data TEXT NOT NULL,
        changed_by TEXT NOT NULL,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        change_type TEXT NOT NULL,
        change_description TEXT,
        fields_changed TEXT,
        old_values TEXT,
        new_values TEXT,
        FOREIGN KEY (technical_sheet_id) REFERENCES technical_sheets(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error('❌ technical_sheet_history:', err.message);
        else console.log('✅ technical_sheet_history created');
        checkComplete();
      });
    });
    
    // ========== LAUNDRY MANAGEMENT (Gestiune Textile) ==========
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS laundry_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        location TEXT,
        status TEXT NOT NULL DEFAULT 'READY',
        condition TEXT DEFAULT 'GOOD',
        quantity INTEGER DEFAULT 1,
        last_washed_at DATETIME,
        next_wash_due DATETIME,
        assigned_to_table INTEGER,
        assigned_to_employee INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (assigned_to_table) REFERENCES restaurant_tables(id),
        FOREIGN KEY (assigned_to_employee) REFERENCES employees(id)
      )`, (err) => {
        if (err) console.error('❌ laundry_items:', err.message);
        else console.log('✅ laundry_items created');
        checkComplete();
      });
    });
    
    tables.push(() => {
      db.run(`CREATE TABLE IF NOT EXISTS laundry_wash_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        washed_at DATETIME NOT NULL,
        washed_by INTEGER,
        condition_before TEXT,
        condition_after TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES laundry_items(id)
      )`, (err) => {
        if (err) console.error('❌ laundry_wash_history:', err.message);
        else console.log('✅ laundry_wash_history created');
        checkComplete();
      });
    });
    
    // Create indexes for laundry
    tables.push(() => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_laundry_code ON laundry_items (code)`, (err) => {
        if (err) console.error('❌ idx_laundry_code:', err.message);
        else console.log('✅ idx_laundry_code created');
        checkComplete();
      });
    });
    
    tables.push(() => {
      // Verifică dacă tabela și coloana există înainte de a crea indexul
      db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='laundry_items'`, (err, row) => {
        if (err || !row) {
          console.warn('⚠️ Tabela laundry_items nu există încă, indexul va fi creat la următoarea inițializare');
          checkComplete();
          return;
        }
        // Verifică dacă coloana status există
        db.all(`PRAGMA table_info(laundry_items)`, (err, columns) => {
          if (err) {
            console.error('❌ Eroare la verificarea coloanelor laundry_items:', err.message);
            checkComplete();
            return;
          }
          const hasStatus = columns.some(col => col.name === 'status');
          if (!hasStatus) {
            console.warn('⚠️ Coloana status nu există în laundry_items, indexul va fi creat la următoarea inițializare');
            checkComplete();
            return;
          }
          db.run(`CREATE INDEX IF NOT EXISTS idx_laundry_status ON laundry_items (status)`, (err) => {
            if (err && !err.message.includes('no such column')) {
              console.error('❌ idx_laundry_status:', err.message);
            } else if (!err) {
              console.log('✅ idx_laundry_status created');
            }
            checkComplete();
          });
        });
      });
    });
    
    tables.push(() => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_wash_history_item ON laundry_wash_history (item_id)`, (err) => {
        if (err) console.error('❌ idx_wash_history_item:', err.message);
        else console.log('✅ idx_wash_history_item created');
        checkComplete();
      });
    });
    
    // Rulează toate
    tables.forEach(fn => fn());
  });
}

module.exports = { createEnterpriseTables };

