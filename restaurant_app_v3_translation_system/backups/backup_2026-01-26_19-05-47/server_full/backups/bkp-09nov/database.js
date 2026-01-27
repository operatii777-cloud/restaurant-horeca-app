// server/database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { initializeDatabaseProtection } = require('./database-protection.js');

// CALE ABSOLUTĂ pentru a evita probleme de current working directory
const DB_PATH = path.join(__dirname, 'restaurant.db');

const dbPromise = new Promise((resolve, reject) => {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Eroare la conectarea la baza de date:', err.message);
      reject(err);
    } else {
      console.log('Conectat la baza de date SQLite. Se inițializează...');
      initializeDb(db)
        .then(() => {
          // Inițializează sistemul de protecție după inițializarea tabelelor
          return initializeDatabaseProtection(db);
        })
        .then(() => resolve(db))
        .catch(reject);
    }
  });
});

function initializeDb(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Creăm direct schema corectă și completă
      db.run(`CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, description TEXT, weight TEXT, is_vegetarian BOOLEAN DEFAULT 0, is_spicy BOOLEAN DEFAULT 0, is_takeout_only BOOLEAN DEFAULT 0, allergens TEXT, name_en TEXT, description_en TEXT, category_en TEXT, allergens_en TEXT, info TEXT, ingredients TEXT, prep_time INTEGER, spice_level INTEGER DEFAULT 0, calories REAL, protein REAL, carbs REAL, fat REAL, fiber REAL, sodium REAL, sugar REAL, salt REAL, image_url TEXT, is_sellable BOOLEAN DEFAULT 1)`);
      db.run(`CREATE TABLE IF NOT EXISTS customization_options (id INTEGER PRIMARY KEY, menu_item_id INTEGER, option_name TEXT, option_type TEXT, extra_price REAL DEFAULT 0, option_name_en TEXT, FOREIGN KEY (menu_item_id) REFERENCES menu (id))`);
      db.run(`CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, type TEXT, isTogether BOOLEAN, items TEXT, status TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, completed_timestamp DATETIME, delivered_timestamp DATETIME, cancelled_timestamp DATETIME, cancelled_reason TEXT, table_number TEXT, client_identifier TEXT, is_paid BOOLEAN DEFAULT 0, paid_timestamp DATETIME, food_notes TEXT, drink_notes TEXT, general_notes TEXT, total REAL, location_id INTEGER DEFAULT 1)`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei orders:', err.message);
        } else {
          // Adaugă coloana location_id dacă nu există (migrare pentru baze de date vechi)
          db.run(`ALTER TABLE orders ADD COLUMN location_id INTEGER DEFAULT 1`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders:', err.message);
            } else if (!err) {
              console.log('✅ Coloană location_id adăugată în orders (migrare)');
            }
          });
        }
      });
      db.run(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY, type TEXT, table_number TEXT, order_id INTEGER, title TEXT, message TEXT, status TEXT DEFAULT 'unread', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, read_at DATETIME)`);
      db.run(`CREATE TABLE IF NOT EXISTS waiters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, pin TEXT NOT NULL, tables TEXT, active BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      db.run(`CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, client_identifier TEXT, table_number TEXT, rating INTEGER NOT NULL, comment TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (order_id) REFERENCES orders (id))`);
      // Tabele pentru sistemul de fidelizare avansat
      db.run(`CREATE TABLE IF NOT EXISTS loyalty_points (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          client_token TEXT UNIQUE, 
          total_points INTEGER DEFAULT 0, 
          used_points INTEGER DEFAULT 0, 
          vip_level TEXT DEFAULT 'Bronze',
          vip_points INTEGER DEFAULT 0,
          total_spent REAL DEFAULT 0,
          visit_count INTEGER DEFAULT 0,
          last_visit DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS rewards (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          name TEXT, 
          description TEXT, 
          reward_type TEXT DEFAULT 'points',
          points_required INTEGER DEFAULT 0,
          discount_percentage REAL DEFAULT 0,
          discount_fixed REAL DEFAULT 0,
          free_product_id INTEGER,
          vip_level_required TEXT DEFAULT 'Bronze',
          is_active BOOLEAN DEFAULT 1, 
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS points_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          client_token TEXT, 
          order_id INTEGER, 
          points_earned INTEGER, 
          points_used INTEGER, 
          action TEXT,
          vip_points_earned INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
          FOREIGN KEY (order_id) REFERENCES orders (id)
      )`);
      
      // Tabelă pentru nivelurile VIP
      db.run(`CREATE TABLE IF NOT EXISTS vip_levels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level_name TEXT UNIQUE NOT NULL,
          min_points INTEGER NOT NULL,
          min_spent REAL DEFAULT 0,
          min_visits INTEGER DEFAULT 0,
          benefits TEXT,
          color TEXT DEFAULT '#8B4513',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabelă pentru recompensele utilizate
      db.run(`CREATE TABLE IF NOT EXISTS reward_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_token TEXT NOT NULL,
          reward_id INTEGER NOT NULL,
          order_id INTEGER,
          points_used INTEGER DEFAULT 0,
          discount_applied REAL DEFAULT 0,
          used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reward_id) REFERENCES rewards (id),
          FOREIGN KEY (order_id) REFERENCES orders (id)
      )`);

      // ==================== SISTEM ROLURI GRANULARE ====================
      
      // Tabelă pentru roluri
      db.run(`CREATE TABLE IF NOT EXISTS user_roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role_name TEXT UNIQUE NOT NULL,
          role_description TEXT,
          is_system_role BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabelă pentru permisiuni
      db.run(`CREATE TABLE IF NOT EXISTS permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          permission_name TEXT UNIQUE NOT NULL,
          permission_description TEXT,
          module TEXT NOT NULL,
          action TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabelă pentru asocierea rol-permisiuni
      db.run(`CREATE TABLE IF NOT EXISTS role_permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role_id INTEGER NOT NULL,
          permission_id INTEGER NOT NULL,
          granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          granted_by INTEGER,
          FOREIGN KEY (role_id) REFERENCES user_roles (id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE,
          FOREIGN KEY (granted_by) REFERENCES waiters (id),
          UNIQUE(role_id, permission_id)
      )`);
      
      // Tabelă pentru utilizatori (extinde waiters)
      db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password_hash TEXT NOT NULL,
          role_id INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_id) REFERENCES user_roles (id)
      )`);
      
      // Tabelă pentru sesiuni active
      db.run(`CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          session_token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`);
      
      // Tabelă pentru audit log
      db.run(`CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          resource_type TEXT,
          resource_id INTEGER,
          old_values TEXT,
          new_values TEXT,
          ip_address TEXT,
          user_agent TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // ==================== SISTEM REZERVĂRI ====================
      
      // Tabelă pentru mesele restaurantului
      db.run(`CREATE TABLE IF NOT EXISTS tables (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_number TEXT UNIQUE NOT NULL,
          capacity INTEGER NOT NULL DEFAULT 2,
          location TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabelă pentru rezervări
      db.run(`CREATE TABLE IF NOT EXISTS reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_id INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT,
          reservation_date DATE NOT NULL,
          reservation_time TIME NOT NULL,
          duration_minutes INTEGER DEFAULT 120,
          party_size INTEGER NOT NULL DEFAULT 2,
          special_requests TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
          confirmation_code TEXT UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (table_id) REFERENCES tables (id)
      )`);
      
      // Tabelă pentru configurarea rezervărilor
      db.run(`CREATE TABLE IF NOT EXISTS reservation_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_name TEXT UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          description TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabelă pentru notificări rezervări
      db.run(`CREATE TABLE IF NOT EXISTS reservation_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reservation_id INTEGER NOT NULL,
          notification_type TEXT NOT NULL CHECK (notification_type IN ('confirmation', 'reminder', 'cancellation', 'modification')),
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed')),
          FOREIGN KEY (reservation_id) REFERENCES reservations (id)
      )`);
      
      // Tabelă pentru disponibilitatea meselor
      db.run(`CREATE TABLE IF NOT EXISTS table_availability (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_id INTEGER NOT NULL,
          date DATE NOT NULL,
          time_slot TIME NOT NULL,
          is_available BOOLEAN DEFAULT 1,
          reservation_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (table_id) REFERENCES tables (id),
          FOREIGN KEY (reservation_id) REFERENCES reservations (id),
          UNIQUE(table_id, date, time_slot)
      )`);

      // ==================== SISTEM E-FACTURA ȘI E-TRANSPORT ====================
      
      // Tabelă pentru configurarea sistemului fiscal
      db.run(`CREATE TABLE IF NOT EXISTS fiscal_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          config_name TEXT UNIQUE NOT NULL,
          config_value TEXT NOT NULL,
          description TEXT,
          is_encrypted BOOLEAN DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabelă pentru documentele fiscale transmise la ANAF
      db.run(`CREATE TABLE IF NOT EXISTS fiscal_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'receipt', 'transport')),
          document_number TEXT UNIQUE NOT NULL,
          order_id INTEGER,
          customer_name TEXT,
          customer_cui TEXT,
          customer_address TEXT,
          total_amount REAL NOT NULL,
          vat_amount REAL NOT NULL,
          net_amount REAL NOT NULL,
          currency TEXT DEFAULT 'RON',
          issue_date DATE NOT NULL,
          due_date DATE,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'cancelled')),
          anaf_response TEXT,
          xml_content TEXT,
          pdf_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id)
      )`);
      
      // Tabelă pentru log-ul transmisiunilor către ANAF
      db.run(`CREATE TABLE IF NOT EXISTS anaf_transmission_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_id INTEGER NOT NULL,
          transmission_type TEXT NOT NULL CHECK (transmission_type IN ('send', 'status_check', 'cancel')),
          request_xml TEXT,
          response_xml TEXT,
          status_code INTEGER,
          status_message TEXT,
          transmission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (document_id) REFERENCES fiscal_documents (id)
      )`);
      
      // Tabelă pentru clienții cu CUI (pentru facturi)
      db.run(`CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_cui TEXT UNIQUE,
          customer_registration_number TEXT,
          customer_address TEXT,
          customer_city TEXT,
          customer_county TEXT,
          customer_postal_code TEXT,
          customer_phone TEXT,
          customer_email TEXT,
          customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company')),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabelă pentru configurarea TVA
      db.run(`CREATE TABLE IF NOT EXISTS vat_rates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rate_name TEXT NOT NULL,
          rate_percentage REAL NOT NULL,
          rate_code TEXT NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tabelă pentru Happy Hour
      db.run(`CREATE TABLE IF NOT EXISTS happy_hour_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          days_of_week TEXT NOT NULL,
          discount_percentage REAL NOT NULL DEFAULT 0,
          discount_fixed REAL NOT NULL DEFAULT 0,
          applicable_categories TEXT,
          applicable_products TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tabelă pentru istoricul Happy Hour
      db.run(`CREATE TABLE IF NOT EXISTS happy_hour_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          happy_hour_id INTEGER NOT NULL,
          original_total REAL NOT NULL,
          discount_amount REAL NOT NULL,
          final_total REAL NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (happy_hour_id) REFERENCES happy_hour_settings (id)
      )`);

      // Tabele pentru Meniul Zilei și Calendar Automat
      db.run(`CREATE TABLE IF NOT EXISTS daily_menu (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          soup_id INTEGER NOT NULL,
          main_course_id INTEGER NOT NULL,
          discount REAL NOT NULL DEFAULT 10.00,
          is_active INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (soup_id) REFERENCES menu (id) ON DELETE CASCADE,
          FOREIGN KEY (main_course_id) REFERENCES menu (id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS daily_menu_schedule (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          soup_id INTEGER NOT NULL,
          main_course_id INTEGER NOT NULL,
          discount REAL NOT NULL DEFAULT 10.00,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (soup_id) REFERENCES menu (id) ON DELETE CASCADE,
          FOREIGN KEY (main_course_id) REFERENCES menu (id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS daily_menu_exceptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          soup_id INTEGER NOT NULL,
          main_course_id INTEGER NOT NULL,
          discount REAL NOT NULL DEFAULT 10.00,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (soup_id) REFERENCES menu (id) ON DELETE CASCADE,
          FOREIGN KEY (main_course_id) REFERENCES menu (id) ON DELETE CASCADE
      )`);

      // Tabele pentru Oferta Zilei (structură complexă)
      db.run(`CREATE TABLE IF NOT EXISTS daily_offers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          title_en TEXT,
          description_en TEXT,
          is_active BOOLEAN DEFAULT 0,
          benefit_type TEXT NOT NULL, -- 'category' sau 'specific'
          benefit_category TEXT,      -- ex: 'Băuturi'
          benefit_quantity INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tabelul pentru CONDIȚIILE ofertei (ex: cumpără 2 x Pizza)
      db.run(`CREATE TABLE IF NOT EXISTS daily_offer_conditions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          offer_id INTEGER NOT NULL,
          category TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          FOREIGN KEY (offer_id) REFERENCES daily_offers (id) ON DELETE CASCADE
      )`);

      // Tabelul pentru BENEFICIILE ofertei (când sunt produse specifice)
      db.run(`CREATE TABLE IF NOT EXISTS daily_offer_benefit_products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          offer_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          FOREIGN KEY (offer_id) REFERENCES daily_offers (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES menu (id) ON DELETE CASCADE
      )`);

      // Adaugă coloana image_url la tabelul menu dacă nu există
      db.run(`ALTER TABLE menu ADD COLUMN image_url TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei image_url:', err);
        }
      });

      // Migrație pentru tabela rewards - schimbă din sistemul de puncte la sistemul de combinații
      db.run(`ALTER TABLE rewards ADD COLUMN product_combinations TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei product_combinations:', err);
        }
      });
      
      db.run(`ALTER TABLE rewards ADD COLUMN free_product_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei free_product_id:', err);
        }
      });

      // Migrație pentru tabela orders - adăugare coloane pentru mentiuni
      db.run(`ALTER TABLE orders ADD COLUMN food_notes TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei food_notes:', err);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN drink_notes TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei drink_notes:', err);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN general_notes TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei general_notes:', err);
        }
      });
      
      // Adaugă coloana paid_timestamp la tabelul orders
      db.run(`ALTER TABLE orders ADD COLUMN paid_timestamp DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei paid_timestamp:', err);
        }
      });

      // Adaugă coloanele pentru anulare la tabelul orders
      db.run(`ALTER TABLE orders ADD COLUMN cancelled_timestamp DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei cancelled_timestamp:', err);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN cancelled_reason TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei cancelled_reason:', err);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN total REAL`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei total:', err);
        }
      });

      // Tabel pentru arhivarea comenzilor vechi
      db.run(`CREATE TABLE IF NOT EXISTS orders_archive (
        id INTEGER PRIMARY KEY,
        type TEXT,
        isTogether BOOLEAN,
        items TEXT,
        status TEXT,
        timestamp DATETIME,
        completed_timestamp DATETIME,
        delivered_timestamp DATETIME,
        table_number TEXT,
        client_identifier TEXT,
        is_paid BOOLEAN,
        archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tabel pentru management stocuri
      db.run(`CREATE TABLE IF NOT EXISTS stock_management (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        daily_stock INTEGER DEFAULT 0,
        current_stock INTEGER DEFAULT 0,
        min_stock_alert INTEGER DEFAULT 5,
        is_available BOOLEAN DEFAULT 1,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu (id)
      )`);

      // ==================== SISTEM MULTI-GESTIUNE (ETAPA 1) ====================
      
      // Tabel pentru gestiuni (locații de stocare/operaționale)
      db.run(`CREATE TABLE IF NOT EXISTS management_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('warehouse', 'operational')),
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        can_receive_deliveries BOOLEAN DEFAULT 0,
        can_transfer_out BOOLEAN DEFAULT 1,
        can_transfer_in BOOLEAN DEFAULT 1,
        can_consume BOOLEAN DEFAULT 0,
        manager_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei management_locations:', err.message);
        } else {
          console.log('✅ Tabelă management_locations creată/verificată cu succes');
        }
      });

      // Tabel pentru consumabile (bunuri care se consumă automat la preparare)
      db.run(`CREATE TABLE IF NOT EXISTS consumables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        unit TEXT NOT NULL,
        current_stock REAL DEFAULT 0,
        min_stock REAL DEFAULT 5,
        cost_per_unit REAL DEFAULT 0,
        category TEXT DEFAULT 'consumable',
        supplier TEXT,
        is_available BOOLEAN DEFAULT 1,
        auto_consume_per_order REAL DEFAULT 0,
        applies_to_categories TEXT,
        location_id INTEGER,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei consumables:', err.message);
        } else {
          console.log('✅ Tabelă consumables creată/verificată cu succes');
        }
      });

      // Tabel pentru template-uri de stoc (pentru inițializare rapidă gestiuni noi)
      db.run(`CREATE TABLE IF NOT EXISTS stock_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_name TEXT NOT NULL,
        description TEXT,
        location_type TEXT CHECK (location_type IN ('warehouse', 'operational')),
        ingredients_config TEXT,
        consumables_config TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei stock_templates:', err.message);
        } else {
          console.log('✅ Tabelă stock_templates creată/verificată cu succes');
        }
      });

      // Inițializare gestiuni implicite (dacă nu există)
      db.get('SELECT COUNT(*) as count FROM management_locations', [], (err, row) => {
        if (!err && row.count === 0) {
          console.log('📦 Inițializare gestiuni implicite...');
          const defaultLocations = [
            { name: 'Depozit Central', type: 'warehouse', description: 'Depozit principal pentru recepție marfă', can_receive_deliveries: 1, can_consume: 0 },
            { name: 'Bar Principal', type: 'operational', description: 'Bar principal - sală', can_receive_deliveries: 0, can_consume: 1 },
            { name: 'Bucătărie', type: 'operational', description: 'Bucătărie - preparare mâncăruri', can_receive_deliveries: 0, can_consume: 1 },
            { name: 'Pizzerie', type: 'operational', description: 'Stație pizza', can_receive_deliveries: 0, can_consume: 1 }
          ];
          
          defaultLocations.forEach(loc => {
            db.run(`INSERT INTO management_locations (name, type, description, can_receive_deliveries, can_consume, can_transfer_out, can_transfer_in) 
                    VALUES (?, ?, ?, ?, ?, 1, 1)`, 
                    [loc.name, loc.type, loc.description, loc.can_receive_deliveries, loc.can_consume],
                    (err) => {
                      if (err) {
                        console.error(`❌ Eroare la inițializare gestiune ${loc.name}:`, err.message);
                      } else {
                        console.log(`✅ Gestiune creată: ${loc.name}`);
                      }
                    });
          });
        }
      });

      // ==================== TRANSFERURI ÎNTRE GESTIUNI (ETAPA 2) ====================
      
      // Tabel pentru transferuri de stocuri între gestiuni
      db.run(`CREATE TABLE IF NOT EXISTS stock_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transfer_number TEXT NOT NULL UNIQUE,
        from_location_id INTEGER NOT NULL,
        to_location_id INTEGER NOT NULL,
        transfer_date DATE NOT NULL,
        requested_by TEXT,
        approved_by TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
        notes TEXT,
        total_items INTEGER DEFAULT 0,
        total_value REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME,
        completed_at DATETIME,
        FOREIGN KEY (from_location_id) REFERENCES management_locations (id),
        FOREIGN KEY (to_location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei stock_transfers:', err.message);
        } else {
          console.log('✅ Tabelă stock_transfers creată/verificată cu succes');
        }
      });

      // Tabel pentru detaliile transferurilor (items)
      db.run(`CREATE TABLE IF NOT EXISTS transfer_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transfer_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        unit_cost REAL DEFAULT 0,
        total_cost REAL DEFAULT 0,
        batch_number TEXT,
        expiry_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transfer_id) REFERENCES stock_transfers (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei transfer_items:', err.message);
        } else {
          console.log('✅ Tabelă transfer_items creată/verificată cu succes');
        }
      });

      console.log('✅ Tabele pentru transferuri între gestiuni verificate');

      // ==========================================
      // ETAPA 6: PORTION CONTROL - Tabele
      // ==========================================
      
      // Tabelă pentru standardele de porții
      db.run(`CREATE TABLE IF NOT EXISTS portion_standards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        standard_quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        tolerance_percentage REAL DEFAULT 5.0,
        notes TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei portion_standards:', err.message);
        } else {
          console.log('✅ Tabelă portion_standards creată/verificată cu succes');
        }
      });

      // Tabelă pentru logul de conformitate porții
      db.run(`CREATE TABLE IF NOT EXISTS portion_compliance_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        expected_quantity REAL NOT NULL,
        actual_quantity REAL NOT NULL,
        variance REAL NOT NULL,
        variance_percentage REAL NOT NULL,
        compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'warning', 'critical')),
        location_id INTEGER,
        notes TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES menu (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei portion_compliance_log:', err.message);
        } else {
          console.log('✅ Tabelă portion_compliance_log creată/verificată cu succes');
        }
      });

      console.log('✅ Tabele pentru Portion Control verificate');

      // ==========================================
      // ETAPA 7: VARIANCE REPORTING - Tabele
      // ==========================================
      
      // Tabelă pentru rapoarte de varianță
      db.run(`CREATE TABLE IF NOT EXISTS variance_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_number TEXT NOT NULL UNIQUE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        location_id INTEGER,
        total_ingredients INTEGER DEFAULT 0,
        critical_variances INTEGER DEFAULT 0,
        total_variance_value REAL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'approved', 'archived')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        created_by TEXT,
        approved_by TEXT,
        approved_at DATETIME,
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei variance_reports:', err.message);
        } else {
          console.log('✅ Tabelă variance_reports creată/verificată cu succes');
        }
      });

      // Tabelă pentru analiza detaliată de varianță per ingredient
      db.run(`CREATE TABLE IF NOT EXISTS variance_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        location_id INTEGER,
        theoretical_consumption REAL NOT NULL,
        actual_consumption REAL NOT NULL,
        variance REAL NOT NULL,
        variance_percentage REAL NOT NULL,
        variance_value REAL DEFAULT 0,
        variance_status TEXT NOT NULL CHECK (variance_status IN ('acceptable', 'warning', 'critical')),
        unit TEXT NOT NULL,
        cost_per_unit REAL DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES variance_reports (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei variance_analysis:', err.message);
        } else {
          console.log('✅ Tabelă variance_analysis creată/verificată cu succes');
        }
      });

      console.log('✅ Tabele pentru Variance Reporting verificate');

      // Tabel pentru ingrediente
      db.run(`CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        unit TEXT NOT NULL,
        current_stock REAL DEFAULT 0,
        min_stock REAL DEFAULT 5,
        cost_per_unit REAL DEFAULT 0,
        supplier TEXT,
        category TEXT,
        is_available BOOLEAN DEFAULT 1,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        code TEXT,
        name_en TEXT,
        category_en TEXT,
        is_hidden BOOLEAN DEFAULT 0,
        description TEXT,
        energy_kcal REAL DEFAULT 0,
        fat REAL DEFAULT 0,
        saturated_fat REAL DEFAULT 0,
        carbs REAL DEFAULT 0,
        sugars REAL DEFAULT 0,
        protein REAL DEFAULT 0,
        salt REAL DEFAULT 0,
        fiber REAL DEFAULT 0,
        additives TEXT,
        allergens TEXT,
        potential_allergens TEXT,
        location_id INTEGER DEFAULT 1,
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei ingredients:', err.message);
        } else {
          console.log('✅ Tabelă ingredients creată/verificată cu succes');
          // Adaugă coloana location_id dacă nu există (migrare pentru baze de date vechi)
          db.run(`ALTER TABLE ingredients ADD COLUMN location_id INTEGER DEFAULT 1`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare ingredients:', err.message);
            } else if (!err) {
              console.log('✅ Coloană location_id adăugată în ingredients (migrare)');
            }
          });
        }
      });

      // Tabel pentru loturi de ingrediente (FIFO și trasabilitate)
      db.run(`CREATE TABLE IF NOT EXISTS ingredient_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        batch_number TEXT NOT NULL,
        barcode TEXT,
        quantity REAL NOT NULL,
        remaining_quantity REAL NOT NULL,
        purchase_date DATE NOT NULL,
        expiry_date DATE,
        supplier TEXT,
        invoice_number TEXT,
        unit_cost REAL DEFAULT 0,
        location_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei ingredient_batches:', err.message);
        } else {
          console.log('✅ Tabelă ingredient_batches creată/verificată cu succes');
          // ETAPA 4: Adăugare coloană location_id pentru multi-gestiune
          db.run(`ALTER TABLE ingredient_batches ADD COLUMN location_id INTEGER DEFAULT 1`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare ingredient_batches.location_id:', err.message);
            } else if (!err) {
              console.log('✅ [ETAPA 4] Coloană location_id adăugată în ingredient_batches');
            }
          });
        }
      });

      // Tabel pentru trasabilitatea produselor vândute
      db.run(`CREATE TABLE IF NOT EXISTS order_ingredient_trace (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        batch_id INTEGER NOT NULL,
        quantity_used REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (batch_id) REFERENCES ingredient_batches (id)
      )`);

      // Tabel pentru facturi furnizori
      db.run(`CREATE TABLE IF NOT EXISTS supplier_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL UNIQUE,
        supplier_name TEXT NOT NULL,
        invoice_date DATE NOT NULL,
        total_amount REAL NOT NULL,
        file_path TEXT,
        file_type TEXT,
        parsed_data TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME
      )`);

      // ==================== BI LAYER - BUSINESS INTELLIGENCE ====================
      
      // Tabel pentru cheltuieli și costuri operaționale
      db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_type TEXT NOT NULL CHECK (expense_type IN ('labor', 'rent', 'utilities', 'marketing', 'maintenance', 'delivery', 'platform_fees', 'supplies', 'other')),
        category TEXT NOT NULL CHECK (category IN ('fixed', 'variable')),
        amount REAL NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        recurring BOOLEAN DEFAULT 0,
        recurring_interval TEXT CHECK (recurring_interval IN ('daily', 'weekly', 'monthly', 'yearly')),
        vendor TEXT,
        payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'other')),
        receipt_url TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        approved_by INTEGER,
        approved_at DATETIME,
        FOREIGN KEY (created_by) REFERENCES users (id),
        FOREIGN KEY (approved_by) REFERENCES users (id)
      )`);

      // Tabel pentru snapshot-uri zilnice (agregate pentru BI)
      db.run(`CREATE TABLE IF NOT EXISTS bi_sales_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_date DATE NOT NULL UNIQUE,
        
        -- Revenue & Orders
        total_orders INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        avg_order_value REAL DEFAULT 0,
        total_items_sold INTEGER DEFAULT 0,
        
        -- Costs
        total_material_cost REAL DEFAULT 0,
        total_labor_cost REAL DEFAULT 0,
        total_fixed_cost REAL DEFAULT 0,
        total_platform_fees REAL DEFAULT 0,
        total_waste_cost REAL DEFAULT 0,
        
        -- Profit
        gross_profit REAL DEFAULT 0,
        net_profit REAL DEFAULT 0,
        
        -- KPIs (%)
        food_cost_pct REAL DEFAULT 0,
        labor_cost_pct REAL DEFAULT 0,
        prime_cost_pct REAL DEFAULT 0,
        net_margin_pct REAL DEFAULT 0,
        gross_margin_pct REAL DEFAULT 0,
        operating_ratio REAL DEFAULT 0,
        
        -- Customer Metrics
        unique_customers INTEGER DEFAULT 0,
        avg_rating REAL DEFAULT 0,
        nps_score REAL DEFAULT 0,
        
        -- Operational
        avg_fulfillment_time_minutes REAL DEFAULT 0,
        delayed_orders INTEGER DEFAULT 0,
        cancellation_rate REAL DEFAULT 0,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tabel pentru performanță categorii (zilnic)
      db.run(`CREATE TABLE IF NOT EXISTS bi_category_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_date DATE NOT NULL,
        category TEXT NOT NULL,
        
        orders_count INTEGER DEFAULT 0,
        items_sold INTEGER DEFAULT 0,
        revenue REAL DEFAULT 0,
        material_cost REAL DEFAULT 0,
        gross_profit REAL DEFAULT 0,
        margin_pct REAL DEFAULT 0,
        
        revenue_pct_of_total REAL DEFAULT 0,
        top_product TEXT,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(snapshot_date, category)
      )`);

      // Tabel pentru performanță personal (zilnic)
      db.run(`CREATE TABLE IF NOT EXISTS bi_staff_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_date DATE NOT NULL,
        waiter_id INTEGER NOT NULL,
        waiter_name TEXT NOT NULL,
        
        total_orders INTEGER DEFAULT 0,
        total_sales REAL DEFAULT 0,
        total_tips REAL DEFAULT 0,
        avg_check REAL DEFAULT 0,
        avg_rating REAL DEFAULT 0,
        
        hours_worked REAL DEFAULT 0,
        sales_per_hour REAL DEFAULT 0,
        tips_per_hour REAL DEFAULT 0,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(snapshot_date, waiter_id),
        FOREIGN KEY (waiter_id) REFERENCES waiters (id)
      )`);

      // Tabel pentru trend-uri inventar (zilnic)
      db.run(`CREATE TABLE IF NOT EXISTS bi_inventory_trends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_date DATE NOT NULL,
        ingredient_id INTEGER NOT NULL,
        ingredient_name TEXT NOT NULL,
        category TEXT,
        
        stock_beginning REAL DEFAULT 0,
        stock_in REAL DEFAULT 0,
        stock_out REAL DEFAULT 0,
        stock_end REAL DEFAULT 0,
        waste_quantity REAL DEFAULT 0,
        waste_cost REAL DEFAULT 0,
        
        consumption_rate REAL DEFAULT 0,
        days_until_stockout INTEGER DEFAULT 0,
        
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(snapshot_date, ingredient_id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

      // Tabel pentru alerte BI (evenimente critice detectate automat)
      db.run(`CREATE TABLE IF NOT EXISTS bi_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold', 'anomaly', 'forecast', 'stockout', 'performance', 'financial')),
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        metric_name TEXT,
        metric_value REAL,
        threshold_value REAL,
        affected_entity TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
        acknowledged_by INTEGER,
        acknowledged_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY (acknowledged_by) REFERENCES users (id)
      )`);

      // Tabel pentru praguri KPI configurabile
      db.run(`CREATE TABLE IF NOT EXISTS bi_kpi_thresholds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kpi_name TEXT UNIQUE NOT NULL,
        target_value REAL NOT NULL,
        warning_threshold REAL NOT NULL,
        critical_threshold REAL NOT NULL,
        comparison_operator TEXT CHECK (comparison_operator IN ('>', '<', '>=', '<=', '=')),
        alert_enabled BOOLEAN DEFAULT 1,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Populare inițială thresholds (doar dacă nu există)
      db.get(`SELECT COUNT(*) as count FROM bi_kpi_thresholds`, [], (err, row) => {
        if (!err && row.count === 0) {
          const thresholds = [
            ['food_cost_pct', 32.0, 35.0, 40.0, '>', 'Food Cost % (ideal: 28-35%)'],
            ['labor_cost_pct', 30.0, 35.0, 40.0, '>', 'Labor Cost % (ideal: 25-35%)'],
            ['prime_cost_pct', 60.0, 65.0, 70.0, '>', 'Prime Cost % (ideal: sub 60%)'],
            ['net_margin_pct', 12.0, 10.0, 5.0, '<', 'Net Profit Margin % (ideal: 10-15%)'],
            ['avg_fulfillment_time_minutes', 25.0, 30.0, 40.0, '>', 'Timp mediu servire (ideal: sub 25 min)'],
            ['cancellation_rate', 2.0, 5.0, 10.0, '>', 'Rata anulări (ideal: sub 2%)'],
            ['avg_rating', 4.5, 4.0, 3.5, '<', 'Rating mediu clienți (ideal: >4.5)']
          ];
          
          thresholds.forEach(([kpi_name, target, warning, critical, operator, description]) => {
            db.run(`INSERT OR IGNORE INTO bi_kpi_thresholds (kpi_name, target_value, warning_threshold, critical_threshold, comparison_operator, description) VALUES (?, ?, ?, ?, ?, ?)`, 
              [kpi_name, target, warning, critical, operator, description]);
          });
          
          console.log('✅ BI KPI Thresholds populați cu succes');
        }
      });

      // Tabel pentru pontaj angajați
      db.run(`CREATE TABLE IF NOT EXISTS staff_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        waiter_id INTEGER NOT NULL,
        clock_in DATETIME NOT NULL,
        clock_out DATETIME,
        shift_type TEXT CHECK (shift_type IN ('morning', 'afternoon', 'night')),
        total_hours REAL,
        hourly_rate REAL,
        total_pay REAL,
        tips_collected REAL DEFAULT 0,
        notes TEXT,
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (waiter_id) REFERENCES waiters (id),
        FOREIGN KEY (approved_by) REFERENCES users (id)
      )`);

      // Tabel pentru calendar evenimente (forecast & planificare)
      db.run(`CREATE TABLE IF NOT EXISTS events_calendar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        event_type TEXT CHECK (event_type IN ('holiday', 'sports', 'concert', 'festival', 'local', 'weather', 'salary_day')),
        event_date DATE NOT NULL,
        impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
        expected_traffic_increase REAL DEFAULT 1.0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Migrație pentru orders - adăugare coloane BI
      db.run(`ALTER TABLE orders ADD COLUMN waiter_id INTEGER REFERENCES waiters(id)`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei waiter_id:', err.message);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN tips REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei tips:', err.message);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN prep_started_at DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei prep_started_at:', err.message);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN prep_completed_at DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei prep_completed_at:', err.message);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN served_at DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei served_at:', err.message);
        }
      });

      console.log('✅ BI Layer - Tabele create cu succes');

      // ==================== WHITE-LABEL MULTI-TENANT SCHEMA ====================
      
      // Tabela principală pentru tenants (restaurante, hoteluri, baruri, etc.)
      db.run(`CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_code TEXT UNIQUE NOT NULL,
        tenant_name TEXT NOT NULL,
        industry TEXT NOT NULL CHECK (industry IN ('restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'cafe', 'club', 'spa')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
        subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise', 'custom')),
        owner_name TEXT,
        owner_email TEXT,
        owner_phone TEXT,
        billing_address TEXT,
        tax_id TEXT,
        currency TEXT DEFAULT 'RON',
        locale TEXT DEFAULT 'ro-RO',
        timezone TEXT DEFAULT 'Europe/Bucharest',
        trial_ends_at DATE,
        subscription_started_at DATE,
        subscription_expires_at DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        last_login_at DATETIME
      )`);

      // Configurare module și features per tenant
      db.run(`CREATE TABLE IF NOT EXISTS tenant_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        modules TEXT NOT NULL,
        features TEXT NOT NULL,
        industry_settings TEXT,
        business_hours TEXT,
        fiscal_year_start TEXT DEFAULT '01-01',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        UNIQUE(tenant_id)
      )`);

      // Configurare KPI-uri active per tenant
      db.run(`CREATE TABLE IF NOT EXISTS tenant_kpi_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        kpi_key TEXT NOT NULL,
        is_enabled BOOLEAN DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        display_label TEXT,
        target_value REAL,
        warning_threshold REAL,
        critical_threshold REAL,
        comparison_operator TEXT CHECK (comparison_operator IN ('>', '<', '>=', '<=', '=')),
        chart_type TEXT CHECK (chart_type IN ('line', 'bar', 'pie', 'gauge', 'number', 'trend')),
        color_scheme TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        UNIQUE(tenant_id, kpi_key)
      )`);

      // Branding & White-Label UI settings per tenant
      db.run(`CREATE TABLE IF NOT EXISTS tenant_branding (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        brand_name TEXT,
        logo_url TEXT,
        favicon_url TEXT,
        colors TEXT NOT NULL,
        font_family TEXT DEFAULT 'Inter, sans-serif',
        font_size_base TEXT DEFAULT '16px',
        layout_type TEXT DEFAULT 'default' CHECK (layout_type IN ('default', 'compact', 'executive', 'operational')),
        dashboard_modules TEXT,
        custom_css TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        UNIQUE(tenant_id)
      )`);

      // KPI Registry (metrice disponibile global)
      db.run(`CREATE TABLE IF NOT EXISTS kpi_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kpi_key TEXT UNIQUE NOT NULL,
        kpi_name TEXT NOT NULL,
        kpi_category TEXT NOT NULL CHECK (kpi_category IN ('financial', 'operational', 'customer', 'hr', 'inventory')),
        description TEXT,
        formula TEXT,
        calculation_function TEXT,
        industries TEXT NOT NULL,
        depends_on TEXT,
        default_target REAL,
        default_chart_type TEXT,
        unit TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Populare KPI Registry cu metrice standard
      db.get(`SELECT COUNT(*) as count FROM kpi_registry`, [], (err, row) => {
        if (!err && row.count === 0) {
          const kpis = [
            ['gross_revenue', 'Gross Revenue', 'financial', 'Total revenue from sales', 'calcGrossRevenue', '["restaurant","hotel","bar","cafe","fast_food","catering"]', 'RON'],
            ['cogs', 'Cost of Goods Sold', 'financial', 'Direct cost of materials/ingredients', 'calcCOGS', '["restaurant","hotel","bar","cafe","fast_food","catering"]', 'RON'],
            ['labor_cost', 'Labor Cost', 'financial', 'Total employee wages', 'calcLaborCost', '["restaurant","hotel","bar","cafe","fast_food","catering","spa"]', 'RON'],
            ['prime_cost', 'Prime Cost', 'financial', 'COGS + Labor Cost', 'calcPrimeCost', '["restaurant","bar","cafe","fast_food","catering"]', 'RON'],
            ['net_profit', 'Net Profit', 'financial', 'Revenue - Total Costs', 'calcNetProfit', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', 'RON'],
            ['food_cost_pct', 'Food Cost %', 'financial', 'COGS / Revenue × 100', 'calcFoodCostPct', '["restaurant","bar","cafe","fast_food","catering"]', '%'],
            ['labor_cost_pct', 'Labor Cost %', 'financial', 'Labor / Revenue × 100', 'calcLaborCostPct', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', '%'],
            ['prime_cost_pct', 'Prime Cost %', 'financial', 'Prime Cost / Revenue × 100', 'calcPrimeCostPct', '["restaurant","bar","cafe","fast_food","catering"]', '%'],
            ['net_margin_pct', 'Net Margin %', 'financial', 'Net Profit / Revenue × 100', 'calcNetMarginPct', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', '%'],
            ['avg_order_value', 'Average Order Value', 'operational', 'Average revenue per transaction', 'calcAvgOrderValue', '["restaurant","bar","cafe","fast_food","catering"]', 'RON'],
            ['orders_count', 'Total Orders', 'operational', 'Number of completed orders', 'calcOrdersCount', '["restaurant","bar","cafe","fast_food","catering"]', ''],
            ['avg_fulfillment_time', 'Avg Fulfillment Time', 'operational', 'Time from order to delivery', 'calcAvgFulfillmentTime', '["restaurant","bar","cafe","fast_food","catering"]', 'minutes'],
            ['cancellation_rate', 'Cancellation Rate', 'operational', 'Percentage of cancelled orders', 'calcCancellationRate', '["restaurant","bar","cafe","fast_food","catering"]', '%'],
            ['unique_customers', 'Unique Customers', 'customer', 'Number of unique clients', 'calcUniqueCustomers', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', ''],
            ['avg_rating', 'Average Rating', 'customer', 'Average satisfaction score', 'calcAvgRating', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', ''],
            ['nps_score', 'Net Promoter Score', 'customer', 'Customer loyalty metric', 'calcNPSScore', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', '']
          ];
          
          kpis.forEach(([kpi_key, kpi_name, kpi_category, description, calculation_function, industries, unit]) => {
            db.run(`INSERT OR IGNORE INTO kpi_registry (kpi_key, kpi_name, kpi_category, description, calculation_function, industries, unit) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
              [kpi_key, kpi_name, kpi_category, description, calculation_function, industries, unit]);
          });
          
          console.log('✅ KPI Registry populat cu 16 metrice standard');
        }
      });

      // Creează primul tenant (Restaurant App)
      db.get(`SELECT COUNT(*) as count FROM tenants WHERE tenant_code = 'trattoria-al-forno'`, [], (err, row) => {
        if (!err && row.count === 0) {
          db.run(`INSERT INTO tenants (
            tenant_code, tenant_name, industry, status, subscription_plan,
            owner_name, owner_email, currency, locale, timezone,
            subscription_started_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`, 
          ['trattoria-al-forno', 'Restaurant App', 'restaurant', 'active', 'enterprise',
           'Florin', 'contact@trattoria.ro', 'RON', 'ro-RO', 'Europe/Bucharest', '2025-01-01'],
          function(err) {
            if (!err) {
              const tenantId = this.lastID;
              
              // Config
              db.run(`INSERT INTO tenant_config (tenant_id, modules, features, industry_settings, business_hours) VALUES (?, ?, ?, ?, ?)`,
                [tenantId, 
                 '{"inventory":true,"delivery":true,"hr":true,"reservations":true,"fiscal":true,"loyalty":true}',
                 '{"ai_insights":true,"forecasting":true,"multi_location":false,"white_label":true}',
                 '{"table_count":200,"room_count":0,"delivery_radius_km":10,"kitchen_stations":3}',
                 '{"open":"08:00","close":"03:00","days":[1,2,3,4,5,6,7]}']);
              
              // KPI Config
              const kpiConfigs = [
                ['gross_revenue', 1, 1, 'line'],
                ['net_profit', 1, 2, 'line'],
                ['food_cost_pct', 1, 3, 'gauge'],
                ['labor_cost_pct', 1, 4, 'gauge'],
                ['prime_cost_pct', 1, 5, 'gauge'],
                ['net_margin_pct', 1, 6, 'gauge'],
                ['avg_order_value', 1, 7, 'trend'],
                ['avg_rating', 1, 8, 'number']
              ];
              
              kpiConfigs.forEach(([kpi_key, is_enabled, display_order, chart_type]) => {
                db.run(`INSERT INTO tenant_kpi_config (tenant_id, kpi_key, is_enabled, display_order, chart_type) VALUES (?, ?, ?, ?, ?)`,
                  [tenantId, kpi_key, is_enabled, display_order, chart_type]);
              });
              
              // Branding
              db.run(`INSERT INTO tenant_branding (tenant_id, brand_name, colors, layout_type) VALUES (?, ?, ?, ?)`,
                [tenantId, 'Restaurant App', 
                 '{"primary":"#667eea","secondary":"#764ba2","accent":"#f59e0b"}', 'executive']);
              
              console.log('✅ Tenant "Restaurant App" creat cu ID:', tenantId);
            }
          });
        }
      });

      console.log('✅ White-Label Multi-Tenant Schema - Tabele create cu succes');

      // Tabel pentru rețete (compoziția produselor)
      db.run(`CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity_needed REAL NOT NULL,
        item_type TEXT DEFAULT 'ingredient' CHECK (item_type IN ('ingredient', 'packaging_restaurant', 'packaging_delivery')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la crearea tabelei recipes:', err.message);
        }
      });

      // Tabel pentru istoricul stocurilor
      db.run(`CREATE TABLE IF NOT EXISTS stock_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        quantity_change INTEGER NOT NULL,
        old_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu (id)
      )`);

      // ==================== TABELE AVANSATE (APLICAȚIE RESTAURANT) ====================

      // 1. Gestiune Intrări în Stoc (NIR - Notă de Intrare-Recepție)
      db.run(`CREATE TABLE IF NOT EXISTS nir_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nir_number TEXT NOT NULL UNIQUE,
          supplier_name TEXT NOT NULL,
          document_date TEXT NOT NULL,
          reception_date TEXT NOT NULL,
          total_value REAL DEFAULT 0,
          total_vat REAL DEFAULT 0,
          currency TEXT DEFAULT 'RON',
          nir_status TEXT DEFAULT 'finalized', -- finalized/draft
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_by INTEGER -- ID user/ospatar care a înregistrat
      )`);

      // 2. Produse/Materii prime adăugate pe NIR
      db.run(`CREATE TABLE IF NOT EXISTS nir_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nir_id INTEGER NOT NULL,
          product_type TEXT NOT NULL, -- 'menu_product' sau 'ingredient'
          product_id INTEGER NOT NULL,
          quantity REAL NOT NULL,
          purchase_price_unit REAL NOT NULL, -- Preț de achiziție per unitate (fără TVA)
          purchase_price_total REAL NOT NULL,
          vat_rate REAL DEFAULT 19.0,
          unit_of_measure TEXT,
          FOREIGN KEY (nir_id) REFERENCES nir_documents (id) ON DELETE CASCADE
      )`);

      // 3. Registrul de Casă (Cash Register)
      db.run(`CREATE TABLE IF NOT EXISTS cash_register (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL, -- 'initial_balance', 'entry', 'exit', 'final_balance'
          document_type TEXT, -- 'receipt', 'invoice', 'payment_note', 'expense_document'
          document_id INTEGER,
          amount REAL NOT NULL,
          description TEXT,
          transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          waiter_id INTEGER,
          FOREIGN KEY (waiter_id) REFERENCES waiters (id)
      )`);

      // 4. Tabele pentru Documente Fiscale (Bonuri, Facturi)
      db.run(`CREATE TABLE IF NOT EXISTS fiscal_receipts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          receipt_number TEXT NOT NULL UNIQUE,
          total_amount REAL NOT NULL,
          vat_amount REAL NOT NULL,
          vat_21 REAL DEFAULT 0,    -- TVA 21% (băuturi alcoolice)
          vat_11 REAL DEFAULT 0,    -- TVA 11% (mâncare și băuturi nealcoolice)
          vat_5 REAL DEFAULT 0,     -- TVA 5% (produse de bază)
          vat_0 REAL DEFAULT 0,     -- TVA 0% (produse scutite)
          issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          payment_method TEXT NOT NULL, -- cash/card/sodexo
          waiter_id INTEGER,
          is_fiscal BOOLEAN DEFAULT 0,
          vat_details TEXT, -- JSON cu detaliile TVA pe cote
          z_report_id INTEGER, -- Cheie externă către raportul Z aferent
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (z_report_id) REFERENCES daily_z_reports (id)
      )`);
      
      // Tabel pentru stocarea Rapoartelor Z (Închideri zilnice)
      db.run(`CREATE TABLE IF NOT EXISTS daily_z_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          z_number INTEGER UNIQUE NOT NULL,
          report_date DATE UNIQUE NOT NULL,
          total_revenue REAL NOT NULL,
          total_vat REAL NOT NULL,
          vat_breakdown TEXT, -- JSON cu defalcarea pe cote (21, 11, 5, 0)
          payment_methods TEXT, -- JSON cu defalcarea pe metode (cash, card)
          total_receipts INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          invoice_series TEXT NOT NULL,
          invoice_number TEXT NOT NULL,
          client_name TEXT NOT NULL,
          client_cui TEXT,
          client_reg_com TEXT,
          total_amount REAL NOT NULL,
          vat_amount REAL NOT NULL,
          issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          waiter_id INTEGER,
          FOREIGN KEY (order_id) REFERENCES orders (id)
      )`);
      
      // Tabel pentru rapoarte Z (stocare permanentă)
      db.run(`CREATE TABLE IF NOT EXISTS z_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          z_number INTEGER NOT NULL UNIQUE,      -- Număr secvențial Z
          report_date TEXT NOT NULL,             -- Data raportului
          total_receipts INTEGER DEFAULT 0,      -- Total bonuri
          total_revenue REAL DEFAULT 0,          -- Total venituri
          total_cash REAL DEFAULT 0,             -- Total cash
          total_card REAL DEFAULT 0,             -- Total card
          total_vat REAL DEFAULT 0,              -- Total TVA
          created_at TEXT NOT NULL,              -- Data generării
          UNIQUE(report_date)                    -- Un singur raport Z pe zi
      )`);
      
      // Tabel pentru rapoarte X (stocare permanentă)
      db.run(`CREATE TABLE IF NOT EXISTS x_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          x_number INTEGER NOT NULL,             -- Număr secvențial X
          report_date TEXT NOT NULL,             -- Data raportului
          total_receipts INTEGER DEFAULT 0,      -- Total bonuri
          total_revenue REAL DEFAULT 0,          -- Total venituri
          total_cash REAL DEFAULT 0,             -- Total cash
          total_card REAL DEFAULT 0,             -- Total card
          total_vat REAL DEFAULT 0,              -- Total TVA
          created_at TEXT NOT NULL               -- Data generării
      )`);
      
      // Tabel pentru rapoarte lunare (stocare permanentă)
      db.run(`CREATE TABLE IF NOT EXISTS monthly_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_month TEXT NOT NULL UNIQUE,     -- Luna raportului (YYYY-MM)
          total_receipts INTEGER DEFAULT 0,      -- Total bonuri
          total_revenue REAL DEFAULT 0,          -- Total venituri
          total_cash REAL DEFAULT 0,             -- Total cash
          total_card REAL DEFAULT 0,             -- Total card
          total_vat REAL DEFAULT 0,              -- Total TVA
          created_at TEXT NOT NULL,              -- Data generării
          UNIQUE(report_month)                   -- Un singur raport lunar pe lună
      )`);
      
      // 5. Costul de Achiziție Mediu Ponderat (CAMP)
      db.run(`CREATE TABLE IF NOT EXISTS product_costs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_type TEXT NOT NULL, -- 'menu_product' sau 'ingredient'
          product_id INTEGER NOT NULL UNIQUE,
          unit_of_measure TEXT,
          camp_unit_cost REAL DEFAULT 0, -- Costul mediu ponderat per unitate (fără TVA)
          last_update DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // 6. Tabele pentru Marketing și Clienti
      db.run(`CREATE TABLE IF NOT EXISTS marketing_campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          discount_type TEXT, -- fixed/percentage
          discount_value REAL,
          target_segment TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS customer_segments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          criteria_json TEXT, -- JSON cu reguli de segmentare (ex: min_orders, avg_spend)
          customer_tokens_json TEXT, -- JSON cu lista de client_token-uri care fac parte din segment
          last_calculated DATETIME
      )`);
      
      // 7. Migrație: Adaugă coloane pentru P&L și Urmărire Fiscalizare
      db.run(`ALTER TABLE menu ADD COLUMN cost_price REAL DEFAULT 0.00`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei cost_price la menu:', err);
        }
      });
      
      db.run(`ALTER TABLE stock_management ADD COLUMN unit_cost REAL DEFAULT 0.00`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei unit_cost la stock_management:', err);
        }
      });
      
      db.run(`ALTER TABLE stock_management ADD COLUMN total_value REAL DEFAULT 0.00`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei total_value la stock_management:', err);
        }
      });
      
      db.run(`ALTER TABLE orders ADD COLUMN fiscal_receipt_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei fiscal_receipt_id:', err);
        }
      });

      // 8. Migrație: Adaugă coloană item_type în tabela recipes pentru ambalaje
      db.run(`ALTER TABLE recipes ADD COLUMN item_type TEXT DEFAULT 'ingredient' CHECK (item_type IN ('ingredient', 'packaging_restaurant', 'packaging_delivery'))`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei item_type la recipes:', err);
        }
      });

      // 9. Migrație F.T.P.: Adaugă coloane pentru Fișa Tehnică de Produs
      db.run(`ALTER TABLE recipes ADD COLUMN unit TEXT DEFAULT 'buc'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei unit la recipes:', err);
        }
      });

      db.run(`ALTER TABLE recipes ADD COLUMN waste_percentage REAL DEFAULT 0.0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei waste_percentage la recipes:', err);
        }
      });

      db.run(`ALTER TABLE recipes ADD COLUMN variable_consumption TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei variable_consumption la recipes:', err);
        }
      });

      // Adaugă coloana is_sellable pentru filtrarea ambalajelor din meniu
      db.run(`ALTER TABLE menu ADD COLUMN is_sellable BOOLEAN DEFAULT 1`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei is_sellable la menu:', err);
        } else {
          console.log('✅ Coloana is_sellable adăugată la tabela menu');
        }
      });

      // Views pentru statistici dashboard
      db.run(`CREATE VIEW IF NOT EXISTS hourly_stats AS
        SELECT 
          strftime('%H', timestamp) as hour,
          COUNT(*) as orders_count,
          AVG(CASE WHEN json_extract(items, '$[0].finalPrice') IS NOT NULL 
              THEN json_extract(items, '$[0].finalPrice') * json_extract(items, '$[0].quantity')
              ELSE 0 END) as avg_order_value
        FROM orders
        WHERE timestamp >= date('now', '-7 days')
        GROUP BY strftime('%H', timestamp)
        ORDER BY hour`);

      db.run(`CREATE VIEW IF NOT EXISTS waiter_performance AS
        SELECT 
          w.id,
          w.name,
          COUNT(o.id) as orders_managed,
          COUNT(DISTINCT o.table_number) as tables_served,
          SUM(CASE WHEN o.is_paid = 1 THEN 1 ELSE 0 END) as paid_orders,
          AVG(CASE WHEN o.completed_timestamp IS NOT NULL AND o.timestamp IS NOT NULL 
              THEN (julianday(o.completed_timestamp) - julianday(o.timestamp)) * 24 * 60 
              ELSE NULL END) as avg_prep_time_minutes
        FROM waiters w
        LEFT JOIN orders o ON w.tables LIKE '%' || o.table_number || '%'
        WHERE o.timestamp >= date('now', '-30 days')
        GROUP BY w.id, w.name
        ORDER BY orders_managed DESC`);

      db.run(`CREATE VIEW IF NOT EXISTS daily_revenue AS
        SELECT 
          date(timestamp) as date,
          COUNT(*) as orders_count,
          AVG(CASE WHEN json_extract(items, '$[0].finalPrice') IS NOT NULL 
              THEN json_extract(items, '$[0].finalPrice') * json_extract(items, '$[0].quantity')
              ELSE 0 END) as avg_order_value
        FROM orders
        WHERE timestamp >= date('now', '-30 days')
        GROUP BY date(timestamp)
        ORDER BY date DESC`);

      // Verificăm dacă setarea pentru limbă există
      db.get('SELECT value FROM app_settings WHERE key = ?', ['app_language'], (err, row) => {
        if (err) return reject(err);
        if (!row) {
          db.run('INSERT INTO app_settings (key, value) VALUES (?, ?)', ['app_language', 'ro']);
        }
      });

      // Migrare coloane noi pentru orders (pentru compatibilitate cu bazele existente)
      db.run('ALTER TABLE orders ADD COLUMN client_identifier TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei client_identifier:', err.message);
        }
      });
      
      db.run('ALTER TABLE orders ADD COLUMN is_paid BOOLEAN DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei is_paid:', err.message);
        }
      });

      // Migrare coloane noi pentru menu (pentru compatibilitate cu bazele existente)
      const menuColumns = [
        'info TEXT',
        'ingredients TEXT', 
        'prep_time INTEGER',
        'spice_level INTEGER DEFAULT 0',
        'calories REAL',
        'protein REAL',
        'carbs REAL',
        'fat REAL',
        'fiber REAL',
        'sodium REAL',
        'sugar REAL',
        'salt REAL'
      ];

      menuColumns.forEach(column => {
        db.run(`ALTER TABLE menu ADD COLUMN ${column}`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error(`Eroare la adăugarea coloanei ${column}:`, err.message);
          }
        });
      });

      // Verifică dacă tabela waiters există și o creează dacă nu
      db.run(`CREATE TABLE IF NOT EXISTS waiters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, pin TEXT NOT NULL, tables TEXT, active BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei waiters:', err.message);
        }
      });

      // Creează tabela pentru stocuri produse
      db.run(`CREATE TABLE IF NOT EXISTS product_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        current_stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 5,
        max_stock INTEGER DEFAULT 100,
        is_auto_managed BOOLEAN DEFAULT 1,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei product_stock:', err.message);
        }
      });

      // Creează tabela pentru istoric modificări stoc
      db.run(`CREATE TABLE IF NOT EXISTS stock_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        change_type TEXT NOT NULL,
        quantity_change INTEGER NOT NULL,
        old_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        order_id INTEGER,
        admin_user TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu (id),
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei stock_history:', err.message);
        }
      });

      // Creează tabela pentru mesajele interne
      db.run(`CREATE TABLE IF NOT EXISTS internal_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_type TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        receiver_type TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        message_type TEXT NOT NULL,
        message_content TEXT NOT NULL,
        table_number TEXT,
        order_id INTEGER,
        is_read BOOLEAN DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei internal_messages:', err.message);
        }
      });

      // Creează tabela pentru mesajele predefinite
      db.run(`CREATE TABLE IF NOT EXISTS predefined_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_role TEXT NOT NULL,
        receiver_role TEXT NOT NULL,
        message_text TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei predefined_messages:', err.message);
        }
      });

      // Creează tabela pentru numărătorile de inventar
      db.run(`CREATE TABLE IF NOT EXISTS inventory_counts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        ingredient_id INTEGER NOT NULL,
        counted_stock REAL,
        location_id INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei inventory_counts:', err.message);
        } else {
          console.log('✅ Tabelă inventory_counts creată/verificată cu succes');
          // ETAPA 3: Adăugare coloană location_id pentru multi-gestiune
          db.run(`ALTER TABLE inventory_counts ADD COLUMN location_id INTEGER`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare inventory_counts.location_id:', err.message);
            } else if (!err) {
              console.log('✅ [ETAPA 3] Coloană location_id adăugată în inventory_counts');
            }
          });
        }
      });

      // Creează tabela pentru sesiuni de inventar (Zilnic/Lunar) - Actualizat pentru multi-gestiune
      db.run(`CREATE TABLE IF NOT EXISTS inventory_sessions (
        id TEXT PRIMARY KEY,
        session_type TEXT NOT NULL CHECK (session_type IN ('daily', 'monthly')),
        status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
        started_at DATETIME NOT NULL,
        completed_at DATETIME,
        started_by TEXT,
        total_items INTEGER DEFAULT 0,
        items_counted INTEGER DEFAULT 0,
        total_difference_value REAL DEFAULT 0,
        notes TEXT,
        location_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei inventory_sessions:', err.message);
        } else {
          console.log('✅ Tabelă inventory_sessions creată/verificată cu succes');
          // Adaugă coloana location_id dacă nu există (migrare)
          db.run(`ALTER TABLE inventory_sessions ADD COLUMN location_id INTEGER DEFAULT 1`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare inventory_sessions:', err.message);
            } else if (!err) {
              console.log('✅ Coloană location_id adăugată în inventory_sessions (migrare)');
            }
          });
          
          // ETAPA 3: Adăugare coloane pentru multi-gestiune
          db.run(`ALTER TABLE inventory_sessions ADD COLUMN scope TEXT DEFAULT 'global'`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare inventory_sessions.scope:', err.message);
            } else if (!err) {
              console.log('✅ [ETAPA 3] Coloană scope adăugată în inventory_sessions');
            }
          });
          
          db.run(`ALTER TABLE inventory_sessions ADD COLUMN selected_locations TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare inventory_sessions.selected_locations:', err.message);
            } else if (!err) {
              console.log('✅ [ETAPA 3] Coloană selected_locations adăugată în inventory_sessions');
            }
          });
        }
      });

      // Creează tabela pentru mișcări stocuri (Audit Trail)
      db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        quantity_change REAL NOT NULL,
        movement_type TEXT NOT NULL CHECK (movement_type IN ('nir', 'inventory_adjustment', 'production', 'waste', 'manual_adjustment', 'order', 'transfer')),
        reference_id TEXT,
        notes TEXT,
        location_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei stock_movements:', err.message);
        } else {
          console.log('✅ Tabelă stock_movements creată/verificată cu succes');
          // Adaugă coloana location_id dacă nu există (migrare)
          db.run(`ALTER TABLE stock_movements ADD COLUMN location_id INTEGER DEFAULT 1`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare stock_movements:', err.message);
            } else if (!err) {
              console.log('✅ Coloană location_id adăugată în stock_movements (migrare)');
            }
          });
        }
      });

      // Tabelă WASTE (Deșeuri) - Pierderi justificate
      db.run(`CREATE TABLE IF NOT EXISTS waste (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_type TEXT NOT NULL CHECK (item_type IN ('ingredient', 'menu_product', 'packaging')),
        item_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT,
        reason TEXT NOT NULL CHECK (reason IN ('cancelled_order', 'expired', 'damaged', 'defective')),
        order_id INTEGER,
        notes TEXT,
        recorded_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recorded_by) REFERENCES waiters (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei waste:', err.message);
        }
      });

      // Tabelă LOSSES (Lipsuri) - Pierderi nejustificate
      db.run(`CREATE TABLE IF NOT EXISTS losses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_type TEXT NOT NULL CHECK (item_type IN ('ingredient', 'menu_product', 'packaging')),
        item_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        expected_quantity REAL NOT NULL,
        actual_quantity REAL NOT NULL,
        difference REAL NOT NULL,
        unit TEXT,
        inventory_session_id TEXT,
        notes TEXT,
        recorded_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recorded_by) REFERENCES waiters (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei losses:', err.message);
        }
      });

      // Migrare pentru tabela recipes - adăugare coloane noi pentru F.T.P.
      db.run(`ALTER TABLE recipes ADD COLUMN unit TEXT DEFAULT 'buc'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei unit la recipes:', err);
        }
      });

      db.run(`ALTER TABLE recipes ADD COLUMN waste_percentage REAL DEFAULT 0.0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei waste_percentage la recipes:', err);
        }
      });

      db.run(`ALTER TABLE recipes ADD COLUMN variable_consumption TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la adăugarea coloanei variable_consumption la recipes:', err);
        }
      });

      // Trecem la popularea meniului
      db.get("SELECT COUNT(*) as count FROM menu", (err, row) => {
        if (err) return reject(err);
        if (row.count === 0) {
          console.log('Meniul este gol. Se adaugă meniul bilingv...');
          insertRealMenu(db).then(() => {
            // Adaugă produsele pentru ambalaje și accesorii
            insertPackagingItems(db).then(() => {
              // Inițializează stocurile pentru toate produsele
              initializeStockForAllProducts(db).then(() => {
                // Inițializează mesajele predefinite
                initializePredefinedMessages(db).then(resolve).catch(reject);
              }).catch(reject);
            }).catch(reject);
          }).catch(reject);
        } else {
          console.log('Meniul conține deja date.');
          // Ambalajele nu se mai adaugă automat - sunt gestionate manual prin F.T.P.
          console.log('📦 Ambalajele sunt gestionate manual prin Fișele Tehnice de Produs (F.T.P.)');
          // Inițializează stocurile pentru produsele existente
          initializeStockForAllProducts(db).then(() => {
            // Inițializează mesajele predefinite
            initializePredefinedMessages(db).then(resolve).catch(reject);
          }).catch(reject);
        }
      });
    });
  });
}

// FUNCȚIA ȘTERSĂ: insertPackagingItems()
// Ambalajele nu mai sunt adăugate automat în meniu.
// Sunt gestionate prin F.T.P. și stocuri (ingrediente).



function insertRealMenu(db) {
  return new Promise((resolve, reject) => {
    const menuItems = [
      // MIC DEJUN (IDs: 1-4)
      { id: 1, name: 'Mic Dejun Trattoria', category: 'Mic Dejun', price: 37.00, description: 'Ouă, bacon, brânză telemea, roșii cherry, cartofi prăjiți', weight: '100/20/50/60/170G', allergens: 'ouă, lapte', name_en: 'Trattoria Breakfast', category_en: 'Breakfast', description_en: 'Eggs, bacon, telemea cheese, cherry tomatoes, french fries', allergens_en: 'eggs, milk' },
      { id: 2, name: 'Omletă Țărănească', category: 'Mic Dejun', price: 33.00, description: 'Ouă, brânză telemea, bacon, ciuperci, ardei kapia, ceapă, mărar', weight: '230G', allergens: 'ouă, lapte', name_en: 'Peasant Omelette', category_en: 'Breakfast', description_en: 'Eggs, telemea cheese, bacon, mushrooms, kapia pepper, onion, dill', allergens_en: 'eggs, milk' },
      { id: 3, name: 'Mic Dejun Francuzesc', category: 'Mic Dejun', price: 39.00, description: 'Ouă poșate, guacamole, somon fume, pâine prăjită', weight: '100/100/100/30G', allergens: 'ouă, pește, gluten', name_en: 'French Breakfast', category_en: 'Breakfast', description_en: 'Poached eggs, guacamole, smoked salmon, toast', allergens_en: 'eggs, fish, gluten' },
      { id: 4, name: 'Omletă cu Șuncă și Mozzarella', category: 'Mic Dejun', price: 31.00, description: 'Omletă clasică cu șuncă și mozzarella', weight: '200G', allergens: 'ouă, lapte', name_en: 'Ham and Mozzarella Omelette', category_en: 'Breakfast', description_en: 'Classic omelette with ham and mozzarella', allergens_en: 'eggs, milk' },
      // APERITIVE RECI (IDs: 5-12)
      { id: 5, name: 'Bruschete cu Roșii și Busuioc', category: 'Aperitive Reci', price: 25.00, description: 'Baghetă, roșii, busuioc, usturoi, ulei de măsline', weight: '200G', is_vegetarian: true, allergens: 'gluten', name_en: 'Bruschetta with Tomatoes and Basil', category_en: 'Cold Appetizers', description_en: 'Baguette, tomatoes, basil, garlic, olive oil', allergens_en: 'gluten' },
      { id: 6, name: 'Bruschete cu Roșii și Anchois', category: 'Aperitive Reci', price: 27.00, description: 'Baghetă, roșii, anchois, busuioc, usturoi, ulei de măsline', weight: '200G', allergens: 'gluten, pește', name_en: 'Bruschetta with Tomatoes and Anchovies', category_en: 'Cold Appetizers', description_en: 'Baguette, tomatoes, anchovies, basil, garlic, olive oil', allergens_en: 'gluten, fish' },
      { id: 7, name: 'Bruschete cu Somon', category: 'Aperitive Reci', price: 34.00, description: 'Baghetă, cremă de brânză, roșii uscate, ceapă roșie, somon fume, icre roșii, capere', weight: '200G', allergens: 'gluten, lapte, pește', name_en: 'Salmon Bruschetta', category_en: 'Cold Appetizers', description_en: 'Baguette, cream cheese, dried tomatoes, red onion, smoked salmon, red caviar, capers', allergens_en: 'gluten, milk, fish' },
      { id: 8, name: 'Bruschete cu Prosciutto Crudo', category: 'Aperitive Reci', price: 34.00, description: 'Baghetă, cremă de brânză, roșii uscate, ceapă roșie, prosciutto crudo, brânză dură', weight: '200G', allergens: 'gluten, lapte', name_en: 'Prosciutto Crudo Bruschetta', category_en: 'Cold Appetizers', description_en: 'Baguette, cream cheese, dried tomatoes, red onion, prosciutto crudo, hard cheese', allergens_en: 'gluten, milk' },
      { id: 9, name: 'Bruschete cu Ton', category: 'Aperitive Reci', price: 33.00, description: 'Baghetă, ton, maioneza, măsline kalamata, capere', weight: '200G', allergens: 'gluten, pește, ouă', name_en: 'Tuna Bruschetta', category_en: 'Cold Appetizers', description_en: 'Baguette, tuna, mayonnaise, kalamata olives, capers', allergens_en: 'gluten, fish, eggs' },
      { id: 10, name: 'Platou Italian', category: 'Aperitive Reci', price: 64.00, description: 'Prosciutto crudo, salam chorizo, mozzarella bocconcini, brânză gorgonzola, roșii uscate, roșii cherry, măsline kalamata, brânză dură', weight: '400G', allergens: 'lapte', name_en: 'Italian Platter', category_en: 'Cold Appetizers', description_en: 'Prosciutto crudo, chorizo salami, mozzarella bocconcini, gorgonzola cheese, dried tomatoes, cherry tomatoes, kalamata olives, hard cheese', allergens_en: 'milk' },
      { id: 11, name: 'Platou Quattro Formaggi', category: 'Aperitive Reci', price: 64.00, description: 'Brânză brie, brânză gorgonzola, parmesan, mozzarella, măr, strugure, miez de nucă, grisine', weight: '550G', allergens: 'lapte, nuci, gluten', name_en: 'Quattro Formaggi Platter', category_en: 'Cold Appetizers', description_en: 'Brie cheese, gorgonzola cheese, parmesan, mozzarella, apple, grapes, walnuts, breadsticks', allergens_en: 'milk, nuts, gluten' },
      { id: 12, name: 'Gustare Vegetariană', category: 'Aperitive Reci', price: 59.00, description: 'Baghetă, cremă de brânză picantă, zacuscă, salată de vinete, humus', weight: '400G', is_vegetarian: true, allergens: 'gluten, lapte, susan', name_en: 'Vegetarian Snack', category_en: 'Cold Appetizers', description_en: 'Baguette, spicy cream cheese, "zacuscă", eggplant salad, hummus', allergens_en: 'gluten, milk, sesame' },
      // APERITIVE CALDE (IDs: 13-18)
      { id: 13, name: 'Măsline Pane', category: 'Aperitive Calde', price: 27.00, description: 'Măsline panate și prăjite', weight: '200G', is_vegetarian: true, allergens: 'gluten, ouă', name_en: 'Breaded Olives', category_en: 'Hot Appetizers', description_en: 'Breaded and fried olives', allergens_en: 'gluten, eggs' },
      { id: 14, name: 'Inele de Ceapă Pane', category: 'Aperitive Calde', price: 25.00, description: 'Inele de ceapă panate', weight: '200G', is_vegetarian: true, allergens: 'gluten, ouă', name_en: 'Breaded Onion Rings', category_en: 'Hot Appetizers', description_en: 'Breaded onion rings', allergens_en: 'gluten, eggs' },
      { id: 15, name: 'Cașcaval Pane', category: 'Aperitive Calde', price: 32.00, description: 'Cașcaval panat și prăjit', weight: '200G', is_vegetarian: true, allergens: 'lapte, gluten, ouă', name_en: 'Breaded Cheese', category_en: 'Hot Appetizers', description_en: 'Breaded and fried cheese', allergens_en: 'milk, gluten, eggs' },
      { id: 16, name: 'Mozzarella Sticks', category: 'Aperitive Calde', price: 40.00, description: 'Băți de mozzarella panați', weight: '200G', is_vegetarian: true, allergens: 'lapte, gluten, ouă', name_en: 'Mozzarella Sticks', category_en: 'Hot Appetizers', description_en: 'Breaded mozzarella sticks', allergens_en: 'milk, gluten, eggs' },
      { id: 17, name: 'Ciuperci Quattro Formaggie', category: 'Aperitive Calde', price: 38.00, description: 'Ciuperci champinion, gorgonzola, parmesan, mozzarella, brie', weight: '250G', is_vegetarian: true, allergens: 'lapte', name_en: 'Quattro Formaggi Mushrooms', category_en: 'Hot Appetizers', description_en: 'Champignon mushrooms, gorgonzola, parmesan, mozzarella, brie', allergens_en: 'milk' },
      { id: 18, name: 'Brânză Feta la Cuptor', category: 'Aperitive Calde', price: 46.00, description: 'Brânză feta, măsline kalamata, roșii cherry', weight: '250G', is_vegetarian: true, allergens: 'lapte', name_en: 'Baked Feta Cheese', category_en: 'Hot Appetizers', description_en: 'Feta cheese, kalamata olives, cherry tomatoes', allergens_en: 'milk' },
      // CIORBE (IDs: 19-23)
      { id: 19, name: 'Ciorbă de Văcuță', category: 'Ciorbe', price: 28.00, description: 'Pulpă de vită, ceapă albă, morcov, mazăre, țelină, ardei kapia, fasole verde, cartofi, borș, pătrunjel', weight: '300ML', allergens: 'țelină', name_en: 'Beef Sour Soup', category_en: 'Soups', description_en: 'Beef leg, white onion, carrot, peas, celery, kapia pepper, green beans, potatoes, "borș", parsley', allergens_en: 'celery' },
      { id: 20, name: 'Ciorbă de Perișoare', category: 'Ciorbe', price: 25.00, description: 'Pulpă de porc, ceapă albă, morcov, țelină, ardei kapia, ou, borș, pătrunjel', weight: '300ML', allergens: 'țelină, ouă', name_en: 'Meatball Sour Soup', category_en: 'Soups', description_en: 'Pork leg, white onion, carrot, celery, kapia pepper, egg, "borș", parsley', allergens_en: 'celery, eggs' },
      { id: 21, name: 'Ciorbă de Burtă', category: 'Ciorbe', price: 30.00, description: 'Burtă de vită, smântână, ou, usturoi, morcov, oțet', weight: '300ML', allergens: 'lapte, ouă', name_en: 'Tripe Soup', category_en: 'Soups', description_en: 'Beef tripe, sour cream, egg, garlic, carrot, vinegar', allergens_en: 'milk, eggs' },
      { id: 22, name: 'Borș de Găină', category: 'Ciorbe', price: 25.00, description: 'Pui, ceapă, morcov, țelină, ardei kapia, tăiței de casă, borș, pătrunjel', weight: '300ML', allergens: 'țelină, gluten', name_en: 'Chicken "Borș"', category_en: 'Soups', description_en: 'Chicken, onion, carrot, celery, kapia pepper, homemade noodles, "borș", parsley', allergens_en: 'celery, gluten' },
      { id: 23, name: 'Supă Cremă de Legume', category: 'Ciorbe', price: 25.00, description: 'Morcov, țelină, ardei kapia, ceapă albă, dovlecel, cartofi, cremă vegetală, crutoane', weight: '300ML', is_vegetarian: true, allergens: 'țelină, gluten', name_en: 'Creamy Vegetable Soup', category_en: 'Soups', description_en: 'Carrot, celery, kapia pepper, white onion, zucchini, potatoes, vegetable cream, croutons', allergens_en: 'celery, gluten' },
      // PASTE FRESCA (IDs: 24-32)
      { id: 24, name: 'Spaghete Carbonara', category: 'Paste Fresca', price: 41.00, description: 'Paste fresh, pancetta, cremă vegetală, ou, brânză dură', weight: '300G', allergens: 'gluten, ouă, lapte', name_en: 'Spaghetti Carbonara', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, pancetta, vegetable cream, egg, hard cheese', allergens_en: 'gluten, eggs, milk' },
      { id: 25, name: 'Spaghete Bolognese', category: 'Paste Fresca', price: 42.00, description: 'Paste fresh, carne de vită, sos de roșii, brânză dură, vin roșu', weight: '350G', allergens: 'gluten, lapte', name_en: 'Spaghetti Bolognese', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, beef, tomato sauce, hard cheese, red wine', allergens_en: 'gluten, milk' },
      { id: 26, name: 'Spaghete AOP', category: 'Paste Fresca', price: 33.00, description: 'Paste fresh, ardei iute, usturoi, roșii cherry, pătrunjel', weight: '250G', is_spicy: true, allergens: 'gluten', name_en: 'Spaghetti AOP', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, chili pepper, garlic, cherry tomatoes, parsley', allergens_en: 'gluten' },
      { id: 27, name: 'Linguini cu Somon', category: 'Paste Fresca', price: 48.00, description: 'Paste fresh, somon proaspăt, zucchini, sos de roșii, cremă vegetală, pătrunjel, unt', weight: '350G', allergens: 'gluten, pește, lapte', name_en: 'Linguine with Salmon', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, fresh salmon, zucchini, tomato sauce, vegetable cream, parsley, butter', allergens_en: 'gluten, fish, milk' },
      { id: 28, name: 'Linguini cu Fructe de Mare', category: 'Paste Fresca', price: 59.00, description: 'Paste fresh, midii în cochilie, carne midii, creveți, calamar inele, sos de roșii, usturoi, vin, pătrunjel, unt', weight: '350G', allergens: 'gluten, moluște, crustacee', name_en: 'Linguine with Seafood', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, mussels in shell, mussel meat, shrimp, calamari rings, tomato sauce, garlic, wine, parsley, butter', allergens_en: 'gluten, molluscs, crustaceans' },
      { id: 29, name: 'Spaghete Primavera', category: 'Paste Fresca', price: 33.00, description: 'Paste fresh, ciuperci, zucchini, vinete, roșii cherry, pătrunjel', weight: '300G', is_vegetarian: true, allergens: 'gluten', name_en: 'Spaghetti Primavera', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, mushrooms, zucchini, eggplant, cherry tomatoes, parsley', allergens_en: 'gluten' },
      { id: 30, name: 'Penne Quattro Formaggi', category: 'Paste Fresca', price: 49.00, description: 'Paste fresh, cremă vegetală, brânză gorgonzola, mozzarella, brânză dură, ceddar', weight: '350G', is_vegetarian: true, allergens: 'gluten, lapte', name_en: 'Penne Quattro Formaggi', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, vegetable cream, gorgonzola cheese, mozzarella, hard cheese, cheddar', allergens_en: 'gluten, milk' },
      { id: 31, name: 'Penne All\'Arrabbiata', category: 'Paste Fresca', price: 33.00, description: 'Paste fresh, sos de roșii, ardei iute, usturoi, pătrunjel', weight: '350G', is_vegetarian: true, is_spicy: true, allergens: 'gluten', name_en: 'Penne All\'Arrabbiata', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, tomato sauce, chili pepper, garlic, parsley', allergens_en: 'gluten' },
      { id: 32, name: 'Linguini AOP cu Creveți', category: 'Paste Fresca', price: 59.00, description: 'Paste fresh, creveți, ardei iute, roșii cherry, usturoi, unt, pătrunjel', weight: '330G', is_spicy: true, allergens: 'gluten, crustacee', name_en: 'Linguine AOP with Shrimp', category_en: 'Fresh Pasta', description_en: 'Fresh pasta, shrimp, chili pepper, cherry tomatoes, garlic, butter, parsley', allergens_en: 'gluten, crustaceans' },
      // PENNE AL FORNO (IDs: 33-35)
      { id: 33, name: 'Penne Trattoria', category: 'Penne Al Forno', price: 51.00, description: 'Paste fresh, mușchi de vită, ciuperci, ardei gras, sos de roșii, cremă vegetală, usturoi, brânză dură, mozzarella, busuioc', weight: '350G', allergens: 'gluten, lapte', name_en: 'Penne Trattoria', category_en: 'Baked Penne', description_en: 'Fresh pasta, beef tenderloin, mushrooms, bell pepper, tomato sauce, vegetable cream, garlic, hard cheese, mozzarella, basil', allergens_en: 'gluten, milk' },
      { id: 34, name: 'Penne Siciliene', category: 'Penne Al Forno', price: 48.00, description: 'Paste fresh, bacon, ciuperci, piept de pui, sos de roșii, cremă vegetală, brânză dură, mozzarella, busuioc', weight: '350G', allergens: 'gluten, lapte', name_en: 'Sicilian Penne', category_en: 'Baked Penne', description_en: 'Fresh pasta, bacon, mushrooms, chicken breast, tomato sauce, vegetable cream, hard cheese, mozzarella, basil', allergens_en: 'gluten, milk' },
      { id: 35, name: 'Lasagna', category: 'Penne Al Forno', price: 51.00, description: 'Foi de lasagna, carne de vită, sos bechamel, ceapă, morcov, țelină, sos de roșii, mozzarella, brânză gorgonzola, ceddar', weight: '400G', allergens: 'gluten, lapte, țelină', name_en: 'Lasagna', category_en: 'Baked Penne', description_en: 'Lasagna sheets, beef, bechamel sauce, onion, carrot, celery, tomato sauce, mozzarella, gorgonzola cheese, cheddar', allergens_en: 'gluten, milk, celery' },
      // PESTE FRUCTE DE MARE (IDs: 36-44)
      { id: 36, name: 'Crap Prăjit cu Mămăligă', category: 'Peste Fructe de Mare', price: 54.00, description: 'Crap proaspăt prăjit servit cu mămăligă', weight: '200/200G', allergens: 'pește', name_en: 'Fried Carp with Polenta', category_en: 'Fish & Seafood', description_en: 'Fresh fried carp served with polenta', allergens_en: 'fish' },
      { id: 37, name: 'Saramură de Crap cu Mămăligă', category: 'Peste Fructe de Mare', price: 55.00, description: 'Crap în saramură cu mămăligă', weight: '200/200/100G', allergens: 'pește', name_en: 'Carp Brine with Polenta', category_en: 'Fish & Seafood', description_en: 'Carp in brine with polenta', allergens_en: 'fish' },
      { id: 38, name: 'File de Dorada la Plită', category: 'Peste Fructe de Mare', price: 68.00, description: 'File de dorada, piure cu ceapă, legume la grătar, lămâie', weight: '180/170/150G', allergens: 'pește', name_en: 'Grilled Sea Bream Fillet', category_en: 'Fish & Seafood', description_en: 'Sea bream fillet, mashed potatoes with onion, grilled vegetables, lemon', allergens_en: 'fish' },
      { id: 39, name: 'Somon la Cuptor', category: 'Peste Fructe de Mare', price: 75.00, description: 'Somon, orez sălbatic, broccoli, lămâie', weight: '180/180/150G', allergens: 'pește', name_en: 'Baked Salmon', category_en: 'Fish & Seafood', description_en: 'Salmon, wild rice, broccoli, lemon', allergens_en: 'fish' },
      { id: 40, name: 'Midii în Sos de Vin Alb', category: 'Peste Fructe de Mare', price: 56.00, description: 'Midii în cochilie, vin alb, ceapă roșie, roșii cherry, unt, usturoi, pătrunjel, pâine de casă', weight: '300G', allergens: 'moluște, lapte, gluten', name_en: 'Mussels in White Wine Sauce', category_en: 'Fish & Seafood', description_en: 'Mussels in shell, white wine, red onion, cherry tomatoes, butter, garlic, parsley, homemade bread', allergens_en: 'molluscs, milk, gluten' },
      { id: 41, name: 'Midii Picante în Sos Roșu', category: 'Peste Fructe de Mare', price: 56.00, description: 'Midii în cochilie, sos de roșii, vin alb, roșii cherry, ardei iute, usturoi, unt, pătrunjel, pâine de casă', weight: '300G', is_spicy: true, allergens: 'moluște, lapte, gluten', name_en: 'Spicy Mussels in Red Sauce', category_en: 'Fish & Seafood', description_en: 'Mussels in shell, tomato sauce, white wine, cherry tomatoes, chili pepper, garlic, butter, parsley, homemade bread', allergens_en: 'molluscs, milk, gluten' },
      { id: 42, name: 'Tigaie cu Fructe de Mare', category: 'Peste Fructe de Mare', price: 72.00, description: 'Creveți, midii, midii în cochilie, inele de calamar, roșii cherry, usturoi, vin, unt, pâine de casă, pătrunjel', weight: '250G', allergens: 'crustacee, moluște, lapte, gluten', name_en: 'Seafood Pan', category_en: 'Fish & Seafood', description_en: 'Shrimp, mussels, mussels in shell, calamari rings, cherry tomatoes, garlic, wine, butter, homemade bread, parsley', allergens_en: 'crustaceans, molluscs, milk, gluten' },
      { id: 43, name: 'Tentacule de Calamar', category: 'Peste Fructe de Mare', price: 69.00, description: 'Tentacule de calamar, roșii cherry, vin, unt', weight: '170/150G', allergens: 'moluște, lapte', name_en: 'Squid Tentacles', category_en: 'Fish & Seafood', description_en: 'Squid tentacles, cherry tomatoes, wine, butter', allergens_en: 'molluscs, milk' },
      { id: 44, name: 'Fritto Misto Tempura', category: 'Peste Fructe de Mare', price: 67.00, description: 'Carne midii, inele de calamar, creveți, tentacule de calamar, lămâie, sos aioli, sweet chilli', weight: '450G', allergens: 'moluște, crustacee, gluten, ouă', name_en: 'Fritto Misto Tempura', category_en: 'Fish & Seafood', description_en: 'Mussel meat, calamari rings, shrimp, squid tentacles, lemon, aioli sauce, sweet chili', allergens_en: 'molluscs, crustaceans, gluten, eggs' },
      // FEL PRINCIPAL (IDs: 45-70)
      { id: 45, name: 'Piept de Pui la Grătar', category: 'Fel Principal', price: 42.00, description: 'Piept de pui, piure', weight: '200/200G', allergens: 'lapte', name_en: 'Grilled Chicken Breast', category_en: 'Main Course', description_en: 'Chicken breast, mashed potatoes', allergens_en: 'milk' },
      { id: 46, name: 'Pulpe de Pui Dezosate', category: 'Fel Principal', price: 42.00, description: 'Pulpe de pui, cartofi prăjiți', weight: '200/200G', name_en: 'Boneless Chicken Thighs', category_en: 'Main Course', description_en: 'Chicken thighs, french fries' },
      { id: 47, name: 'Pui Gorgonzola', category: 'Fel Principal', price: 51.00, description: 'Piept de pui, brânză gorgonzola, cremă vegetală, brânză dură, cartofi la cuptor', weight: '200/200G', allergens: 'lapte', name_en: 'Gorgonzola Chicken', category_en: 'Main Course', description_en: 'Chicken breast, gorgonzola cheese, vegetable cream, hard cheese, baked potatoes', allergens_en: 'milk' },
      { id: 48, name: 'Pui cu Ciuperci', category: 'Fel Principal', price: 51.00, description: 'Piept de pui, ciuperci, cremă vegetală, cartofi la cuptor', weight: '200/200G', allergens: 'lapte', name_en: 'Chicken with Mushrooms', category_en: 'Main Course', description_en: 'Chicken breast, mushrooms, vegetable cream, baked potatoes', allergens_en: 'milk' },
      { id: 49, name: 'Șnițel de Pui Palermo', category: 'Fel Principal', price: 49.00, description: 'Piept de pui, ou, făină, mozzarella, pătrunjel, cartofi prăjiți', weight: '200/200G', allergens: 'ouă, gluten, lapte', name_en: 'Palermo Chicken Schnitzel', category_en: 'Main Course', description_en: 'Chicken breast, egg, flour, mozzarella, parsley, french fries', allergens_en: 'eggs, gluten, milk' },
      { id: 50, name: 'Polo Parmegiano', category: 'Fel Principal', price: 55.00, description: 'Piept de pui, ou, pesmet panko, făină, sos de roșii, mozzarella, cartofi zdrobiți', weight: '400G', allergens: 'ouă, gluten, lapte', name_en: 'Polo Parmigiano', category_en: 'Main Course', description_en: 'Chicken breast, egg, panko breadcrumbs, flour, tomato sauce, mozzarella, smashed potatoes', allergens_en: 'eggs, gluten, milk' },
      { id: 51, name: 'Pui Crispy cu Salată Coleslaw', category: 'Fel Principal', price: 49.00, description: 'Piept de pui, ou, pesmet panko, cartofi prăjiți', weight: '200/200G', allergens: 'ouă, gluten, lapte', name_en: 'Crispy Chicken with Coleslaw', category_en: 'Main Course', description_en: 'Chicken breast, egg, panko breadcrumbs, french fries', allergens_en: 'eggs, gluten, milk' },
      { id: 52, name: 'Jumări de Pui Picante', category: 'Fel Principal', price: 52.00, description: 'Aripioare de pui, pastă de ardei iute, usturoi, cartofi prăjiți', weight: '550G', is_spicy: true, allergens: 'lapte, ouă', name_en: 'Spicy Chicken Wings', category_en: 'Main Course', description_en: 'Chicken wings, hot pepper paste, garlic, french fries', allergens_en: 'milk, eggs' },
      { id: 53, name: 'Carcalete', category: 'Fel Principal', price: 52.00, description: 'Ceafă de porc, cartofi prăjiți, telemea, ou', weight: '200/170/50/30G', allergens: 'lapte, ouă', name_en: 'Carcalete', category_en: 'Main Course', description_en: 'Pork neck, french fries, telemea cheese, egg', allergens_en: 'milk, eggs' },
      { id: 54, name: 'Tigaie Grecească', category: 'Fel Principal', price: 49.00, description: 'Mușchiuleț de porc, ardei kapia, ceapă roșie, peperoncino, usturoi, cimbru, telemea, vin alb, pătrunjel, pâine de casă', weight: '170/50/50/50G', allergens: 'lapte, gluten', name_en: 'Greek Pan', category_en: 'Main Course', description_en: 'Pork tenderloin, kapia pepper, red onion, peperoncino, garlic, thyme, telemea cheese, white wine, parsley, homemade bread', allergens_en: 'milk, gluten' },
      { id: 55, name: 'Ceafă la Grătar', category: 'Fel Principal', price: 44.00, description: 'Ceafă de porc, cartofi prăjiți', weight: '200/200G', name_en: 'Grilled Pork Neck', category_en: 'Main Course', description_en: 'Pork neck, french fries' },
      { id: 56, name: 'Pomana Porcului', category: 'Fel Principal', price: 46.00, description: 'Ceafă de porc, vin alb, usturoi, cimbru, mămăligă la grătar', weight: '200/200G', name_en: 'Traditional Pork Feast', category_en: 'Main Course', description_en: 'Pork neck, white wine, garlic, thyme, grilled polenta' },
      { id: 57, name: 'Coaste de Porc BBQ', category: 'Fel Principal', price: 74.00, description: 'Coaste de porc, sos bbq, usturoi, cimbru, boia, cartofi cu parmesan și usturoi, salată coleslaw', weight: '400/200G', allergens: 'lapte', name_en: 'BBQ Pork Ribs', category_en: 'Main Course', description_en: 'Pork ribs, bbq sauce, garlic, thyme, paprika, potatoes with parmesan and garlic, coleslaw salad', allergens_en: 'milk' },
      { id: 58, name: 'Cotlet de Porc cu Os și Sos de Ciuperci', category: 'Fel Principal', price: 69.00, description: 'Cotlet de porc, cremă vegetală, ciuperci, cartofi la cuptor', weight: '350/200/100G', allergens: 'lapte', name_en: 'Pork Chop with Mushroom Sauce', category_en: 'Main Course', description_en: 'Pork chop, vegetable cream, mushrooms, baked potatoes', allergens_en: 'milk' },
      { id: 59, name: 'Mici cu Cartofi Prăjiți', category: 'Fel Principal', price: 39.00, description: 'Mici 3 buc, cartofi prăjiți, muștar', weight: '200/200G', allergens: 'muștar', name_en: '"Mici" with French Fries', category_en: 'Main Course', description_en: '3 "mici" (grilled minced meat rolls), french fries, mustard', allergens_en: 'mustard' },
      { id: 60, name: 'Cârnaţi cu Cartofi Prăjiți', category: 'Fel Principal', price: 39.00, description: 'Cârnaţi, cartofi, muștar', weight: '250/200G', allergens: 'muștar', name_en: 'Sausages with French Fries', category_en: 'Main Course', description_en: 'Sausages, potatoes, mustard', allergens_en: 'mustard' },
      { id: 61, name: 'Ciolan cu Fasole Roșie', category: 'Fel Principal', price: 77.00, description: 'Stinco casa mondena, fasole roșie, ceapă roșie, peperoncino, sos de roșii', weight: '550/200G', name_en: 'Pork Knuckle with Red Beans', category_en: 'Main Course', description_en: 'Pork knuckle, red beans, red onion, peperoncino, tomato sauce' },
      { id: 62, name: 'Cocoșel la Ceaun', category: 'Fel Principal', price: 65.00, description: 'Cocoșel, cartofi prăjiți', weight: '450/200G', name_en: 'Cauldron-Cooked Cockerel', category_en: 'Main Course', description_en: 'Cockerel, french fries' },
      { id: 63, name: 'Pastramă de Oaie la Tigaie', category: 'Fel Principal', price: 59.00, description: 'Pastramă de oaie, vin alb, roșii cherry, unt, pătrunjel, mămăligă la grătar', weight: '400G', allergens: 'lapte', name_en: 'Pan-fried Mutton Pastrami', category_en: 'Main Course', description_en: 'Mutton pastrami, white wine, cherry tomatoes, butter, parsley, grilled polenta', allergens_en: 'milk' },
      { id: 64, name: 'Mușchi de Vită Gorgonzola', category: 'Fel Principal', price: 100.00, description: 'Mușchi de vită, cremă vegetală, gorgonzola, cartofi la cuptor, sote de ciuperci', weight: '380G', allergens: 'lapte', name_en: 'Beef Tenderloin with Gorgonzola', category_en: 'Main Course', description_en: 'Beef tenderloin, vegetable cream, gorgonzola, baked potatoes, sautéed mushrooms', allergens_en: 'milk' },
      { id: 65, name: 'Mușchi de Vită cu Piper Verde', category: 'Fel Principal', price: 100.00, description: 'Mușchi de vită, piper verde, cognac, cartofi la cuptor', weight: '380G', allergens: 'lapte', name_en: 'Beef Tenderloin with Green Pepper', category_en: 'Main Course', description_en: 'Beef tenderloin, green pepper, cognac, baked potatoes', allergens_en: 'milk' },
      { id: 66, name: 'Antricot de Vită la Grătar', category: 'Fel Principal', price: 92.00, description: 'Antricot de vită, cartofi la cuptor, ciuperci sote', weight: '500G', name_en: 'Grilled Beef Ribeye', category_en: 'Main Course', description_en: 'Beef ribeye, baked potatoes, sautéed mushrooms' },
      { id: 67, name: 'Șnițel Crocant de Vită', category: 'Fel Principal', price: 91.00, description: 'Mușchi de vită, cartofi prăjiți, sos brânzeturi', weight: '200/200/100G', allergens: 'gluten, ouă, lapte', name_en: 'Crispy Beef Schnitzel', category_en: 'Main Course', description_en: 'Beef tenderloin, french fries, cheese sauce', allergens_en: 'gluten, eggs, milk' },
      { id: 68, name: 'Porc Forestier', category: 'Fel Principal', price: 61.00, description: 'Mușchiuleț de porc, funghi porcini, bacon, cremă vegetală, pastă de trufe, cartofi zdrobiți, roșii cherry', weight: '180/200/100G', allergens: 'lapte', name_en: 'Forester\'s Pork', category_en: 'Main Course', description_en: 'Pork tenderloin, porcini mushrooms, bacon, vegetable cream, truffle paste, smashed potatoes, cherry tomatoes', allergens_en: 'milk' },
      { id: 69, name: 'Pulpă de Rață Confiată', category: 'Fel Principal', price: 99.00, description: 'Pulpă de rață, sos de rodie, piure cu trufe', weight: '250/200G', allergens: 'lapte', name_en: 'Duck Leg Confit', category_en: 'Main Course', description_en: 'Duck leg, pomegranate sauce, truffle mashed potatoes', allergens_en: 'milk' },
      { id: 70, name: 'Mușchi de Vită la Grătar', category: 'Fel Principal', price: 95.00, description: 'Mușchi de vită, cartofi zdrobiți și sos chimichurri', weight: '400G', name_en: 'Grilled Beef Tenderloin', category_en: 'Main Course', description_en: 'Beef tenderloin, smashed potatoes and chimichurri sauce' },
      // PLATOURI (IDs: 71-73)
      { id: 71, name: 'Platou Tradițional de 4 Persoane', category: 'Platouri', price: 235.00, description: 'Ceafă de porc, piept de pui, pastramă de berbecuț, mici, cârnaţi, cartofi prăjiți, salată de murături', weight: '400/400/300/250/200/600G', is_takeout_only: 1, allergens: 'muștar', name_en: 'Traditional Platter for 4 People', category_en: 'Platters', description_en: 'Pork neck, chicken breast, mutton pastrami, "mici", sausages, french fries, pickle salad', allergens_en: 'mustard' },
      { id: 72, name: 'Platou cu Fructe de Mare', category: 'Platouri', price: 199.00, description: 'Midii în cochilie, carne midii, tentacule calamar, inele de calamar, creveți, orez sălbatic', weight: '300/300/100/170/100/60G', allergens: 'moluște, crustacee', name_en: 'Seafood Platter', category_en: 'Platters', description_en: 'Mussels in shell, mussel meat, squid tentacles, calamari rings, shrimp, wild rice', allergens_en: 'molluscs, crustaceans' },
      { id: 73, name: 'Platou Crispy de 2 Persoane', category: 'Platouri', price: 155.00, description: 'Pui crispy, cartofi prăjiți, salată coleslaw, sos calypso, sos aioli', weight: '400/200/300G', is_takeout_only: 1, allergens: 'gluten, ouă, lapte', name_en: 'Crispy Platter for 2 People', category_en: 'Platters', description_en: 'Crispy chicken, french fries, coleslaw salad, calypso sauce, aioli sauce', allergens_en: 'gluten, eggs, milk' },
      // BURGERI (IDs: 74-79)
      { id: 74, name: 'Burger de Vită', category: 'Burgeri', price: 60.00, description: 'Chiflă, carne de vită, roșii, salată verde, castraveți murați, ceddar, ceapă roșie, sos calypso, cartofi prăjiți', weight: '180/70/180G', allergens: 'gluten, lapte, ouă', name_en: 'Beef Burger', category_en: 'Burgers', description_en: 'Bun, beef patty, tomatoes, lettuce, pickles, cheddar, red onion, calypso sauce, french fries', allergens_en: 'gluten, milk, eggs' },
      { id: 75, name: 'Burger Picant de Vită', category: 'Burgeri', price: 60.00, description: 'Chiflă, carne de vită, roșii, salată verde, castraveți murați, ceddar, ceapă roșie, ardei jalapeno, sos calypso picant, cartofi prăjiți', weight: '180/70/180G', is_spicy: true, allergens: 'gluten, lapte, ouă', name_en: 'Spicy Beef Burger', category_en: 'Burgers', description_en: 'Bun, beef patty, tomatoes, lettuce, pickles, cheddar, red onion, jalapeno peppers, spicy calypso sauce, french fries', allergens_en: 'gluten, milk, eggs' },
      { id: 76, name: 'Burger Crispy Pui', category: 'Burgeri', price: 56.00, description: 'Chiflă, pui crispy, salată verde, ceddar, roșii, sos calypso, cartofi prăjiți', weight: '180/70/180G', allergens: 'gluten, ouă, lapte', name_en: 'Crispy Chicken Burger', category_en: 'Burgers', description_en: 'Bun, crispy chicken, lettuce, cheddar, tomatoes, calypso sauce, french fries', allergens_en: 'gluten, eggs, milk' },
      { id: 77, name: 'Halloumi Burger', category: 'Burgeri', price: 58.00, description: 'Chiflă, halloumi, roșii, salată verde, sos sweet chilli, cartofi prăjiți', weight: '200/70/180G', is_vegetarian: true, allergens: 'gluten, lapte', name_en: 'Halloumi Burger', category_en: 'Burgers', description_en: 'Bun, halloumi, tomatoes, lettuce, sweet chili sauce, french fries', allergens_en: 'gluten, milk' },
      { id: 78, name: 'Quesadilla de Vită', category: 'Burgeri', price: 59.00, description: 'Ragu, fasole roșie, porumb, ceddar, mozzarella, cartofi prăjiți', weight: '250/200G', allergens: 'gluten, lapte', name_en: 'Beef Quesadilla', category_en: 'Burgers', description_en: 'Ragu, red beans, corn, cheddar, mozzarella, french fries', allergens_en: 'gluten, milk' },
      { id: 79, name: 'Quesadilla de Pui', category: 'Burgeri', price: 53.00, description: 'Piept de pui, ardei kapia, ceapă roșie, fasole roșie, porumb, ceapă verde, mozzarella, ceddar, cartofi prăjiți', weight: '250/200G', allergens: 'gluten, lapte', name_en: 'Chicken Quesadilla', category_en: 'Burgers', description_en: 'Chicken breast, kapia pepper, red onion, red beans, corn, green onion, mozzarella, cheddar, french fries', allergens_en: 'gluten, milk' },
      // SALATE (IDs: 80-85)
      { id: 80, name: 'Salată cu Ton', category: 'Salate', price: 42.00, description: 'Mix salată, ton, avocado, porumb, ceapă roșie, roșii cherry, dressing', weight: '250G', allergens: 'pește', name_en: 'Tuna Salad', category_en: 'Salads', description_en: 'Salad mix, tuna, avocado, corn, red onion, cherry tomatoes, dressing', allergens_en: 'fish' },
      { id: 81, name: 'Salată Caesar', category: 'Salate', price: 41.00, description: 'Salată iceberg, piept de pui, bacon, dressing caesar, anchios, crutoane', weight: '250G', allergens: 'lapte, ouă, pește, gluten', name_en: 'Caesar Salad', category_en: 'Salads', description_en: 'Iceberg lettuce, chicken breast, bacon, caesar dressing, anchovies, croutons', allergens_en: 'milk, eggs, fish, gluten' },
      { id: 82, name: 'Salată cu Pui Crocant', category: 'Salate', price: 41.00, description: 'Mix salată, piept de pui, roșii cherry, ou, brânză telemea, dressing de muștar cu miere', weight: '300G', allergens: 'ouă, lapte, gluten, muștar', name_en: 'Crispy Chicken Salad', category_en: 'Salads', description_en: 'Salad mix, chicken breast, cherry tomatoes, egg, telemea cheese, honey mustard dressing', allergens_en: 'eggs, milk, gluten, mustard' },
      { id: 83, name: 'Salată cu Somon și Avocado', category: 'Salate', price: 46.00, description: 'Mix salată, somon, avocado, ceapă roșie, roșii cherry, lămâie, dressing', weight: '300G', allergens: 'pește', name_en: 'Salmon and Avocado Salad', category_en: 'Salads', description_en: 'Salad mix, salmon, avocado, red onion, cherry tomatoes, lemon, dressing', allergens_en: 'fish' },
      { id: 84, name: 'Salată Grecească', category: 'Salate', price: 39.00, description: 'Roșii, castraveți, brânză telemea, ceapă roșie, ardei kapia, măsline kalamata, foccacia, oregano', weight: '300G', is_vegetarian: true, allergens: 'lapte, gluten', name_en: 'Greek Salad', category_en: 'Salads', description_en: 'Tomatoes, cucumbers, telemea cheese, red onion, kapia pepper, kalamata olives, foccacia, oregano', allergens_en: 'milk, gluten' },
      { id: 85, name: 'Salată Halloumi', category: 'Salate', price: 44.00, description: 'Legume la grătar, halloumi la grătar, dressing', weight: '300G', is_vegetarian: true, allergens: 'lapte', name_en: 'Halloumi Salad', category_en: 'Salads', description_en: 'Grilled vegetables, grilled halloumi, dressing', allergens_en: 'milk' },
      // PIZZA (IDs: 86-100)
      { id: 86, name: 'Pizza Margherita', category: 'Pizza', price: 35.00, description: 'Blat pizza, sos de roșii, mozzarella, busuioc, oregano', weight: '', is_vegetarian: true, allergens: 'gluten, lapte', name_en: 'Pizza Margherita', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, basil, oregano', allergens_en: 'gluten, milk' },
      { id: 87, name: 'Pizza Prosciutto e Funghi', category: 'Pizza', price: 41.00, description: 'Blat pizza, sos de roșii, mozzarella, șuncă, ciuperci', weight: '', allergens: 'gluten, lapte', name_en: 'Pizza Prosciutto e Funghi', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, ham, mushrooms', allergens_en: 'gluten, milk' },
      { id: 88, name: 'Pizza Quattro Stagioni', category: 'Pizza', price: 43.00, description: 'Blat pizza, sos de roșii, mozzarella, șuncă, salam, ciuperci, măsline', weight: '', allergens: 'gluten, lapte', name_en: 'Pizza Quattro Stagioni', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, ham, salami, mushrooms, olives', allergens_en: 'gluten, milk' },
      { id: 89, name: 'Pizza Carnivore', category: 'Pizza', price: 45.00, description: 'Blat pizza, sos de roșii, mozzarella, șuncă, salam, bacon, cârnaţi', weight: '', allergens: 'gluten, lapte', name_en: 'Carnivore Pizza', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, ham, salami, bacon, sausages', allergens_en: 'gluten, milk' },
      { id: 90, name: 'Pizza Quattro Formaggi', category: 'Pizza', price: 46.00, description: 'Blat pizza, cremă vegetală, mozzarella, brânză dură, gorgonzola, brânză brie', weight: '', is_vegetarian: true, allergens: 'gluten, lapte', name_en: 'Pizza Quattro Formaggi', category_en: 'Pizza', description_en: 'Pizza crust, vegetable cream, mozzarella, hard cheese, gorgonzola, brie cheese', allergens_en: 'gluten, milk' },
      { id: 91, name: 'Pizza Rustica', category: 'Pizza', price: 45.00, description: 'Blat pizza, sos de roșii, mozzarella, bacon, salam, cârnaţi, ardei kapia, ceapă, porumb', weight: '', allergens: 'gluten, lapte', name_en: 'Rustica Pizza', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, bacon, salami, sausages, kapia pepper, onion, corn', allergens_en: 'gluten, milk' },
      { id: 92, name: 'Pizza Tonno', category: 'Pizza', price: 47.00, description: 'Blat pizza, sos de roșii, mozzarella, ton, porumb, ceapă roșie, capere', weight: '', allergens: 'gluten, lapte, pește', name_en: 'Pizza Tonno', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, tuna, corn, red onion, capers', allergens_en: 'gluten, milk, fish' },
      { id: 93, name: 'Pizza Restaurant App', category: 'Pizza', price: 47.00, description: 'Blat pizza, sos de roșii, mozzarella buffala, prosciutto crudo, roșii cherry, rucola, brânză dură', weight: '', allergens: 'gluten, lapte', name_en: 'Pizza Restaurant App', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, buffalo mozzarella, prosciutto crudo, cherry tomatoes, arugula, hard cheese', allergens_en: 'gluten, milk' },
      { id: 94, name: 'Pizza Diavola', category: 'Pizza', price: 41.00, description: 'Blat pizza, sos de roșii, mozzarella, salam picant, peperoncino', weight: '', is_spicy: true, allergens: 'gluten, lapte', name_en: 'Pizza Diavola', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, spicy salami, peperoncino', allergens_en: 'gluten, milk' },
      { id: 95, name: 'Pizza Piccante', category: 'Pizza', price: 43.00, description: 'Blat pizza, sos de roșii, mozzarella, salam picant, bacon, gorgonzola', weight: '', is_spicy: true, allergens: 'gluten, lapte', name_en: 'Piccante Pizza', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, spicy salami, bacon, gorgonzola', allergens_en: 'gluten, milk' },
      { id: 96, name: 'Pizza Carbonara', category: 'Pizza', price: 47.00, description: 'Blat pizza, cremă vegetală, mozzarella, bacon, brânză dură, ou', weight: '', allergens: 'gluten, lapte, ouă', name_en: 'Carbonara Pizza', category_en: 'Pizza', description_en: 'Pizza crust, vegetable cream, mozzarella, bacon, hard cheese, egg', allergens_en: 'gluten, milk, eggs' },
      { id: 97, name: 'Pizza Polo e Funghi', category: 'Pizza', price: 41.00, description: 'Blat pizza, sos de roșii, mozzarella, piept de pui, ciuperci, porumb', weight: '', allergens: 'gluten, lapte', name_en: 'Pizza Polo e Funghi', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, chicken breast, mushrooms, corn', allergens_en: 'gluten, milk' },
      { id: 98, name: 'Pizza Vegetariană', category: 'Pizza', price: 37.00, description: 'Blat pizza, sos de roșii, mozzarella, ardei kapia, ciuperci, măsline, porumb', weight: '', is_vegetarian: true, allergens: 'gluten, lapte', name_en: 'Vegetarian Pizza', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, kapia pepper, mushrooms, olives, corn', allergens_en: 'gluten, milk' },
      { id: 99, name: 'Pizza Capriciosa', category: 'Pizza', price: 42.00, description: 'Blat pizza, sos de roșii, mozzarella, șuncă, ciuperci, măsline, ardei', weight: '', allergens: 'gluten, lapte', name_en: 'Pizza Capriciosa', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, mozzarella, ham, mushrooms, olives, pepper', allergens_en: 'gluten, milk' },
      { id: 100, name: 'Pizza Bolognese', category: 'Pizza', price: 46.00, description: 'Blat pizza, sos de roșii, sos ragu, ardei kapia, ceapă roșie', weight: '', allergens: 'gluten, lapte', name_en: 'Bolognese Pizza', category_en: 'Pizza', description_en: 'Pizza crust, tomato sauce, ragu sauce, kapia pepper, red onion', allergens_en: 'gluten, milk' },
      // GARNITURI (IDs: 101-108)
      { id: 101, name: 'Cartofi Trattoria', category: 'Garnituri', price: 26.00, description: 'Cartofi, bacon, ou, sos ceddar, roșii, ceapă verde', weight: '300G', allergens: 'ouă, lapte', name_en: 'Trattoria Potatoes', category_en: 'Side Dishes', description_en: 'Potatoes, bacon, egg, cheddar sauce, tomatoes, green onion', allergens_en: 'eggs, milk' },
      { id: 102, name: 'Cartofi Prăjiți', category: 'Garnituri', price: 16.00, description: 'Cartofi prăjiți clasici', weight: '200G', is_vegetarian: true, name_en: 'French Fries', category_en: 'Side Dishes', description_en: 'Classic french fries' },
      { id: 103, name: 'Piure de Cartofi', category: 'Garnituri', price: 18.00, description: 'Piure de cartofi cremos', weight: '200G', is_vegetarian: true, allergens: 'lapte', name_en: 'Mashed Potatoes', category_en: 'Side Dishes', description_en: 'Creamy mashed potatoes', allergens_en: 'milk' },
      { id: 104, name: 'Cartofi Zdrobiți', category: 'Garnituri', price: 18.00, description: 'Cartofi zdrobiți cu ierburi', weight: '200G', is_vegetarian: true, allergens: 'lapte', name_en: 'Smashed Potatoes', category_en: 'Side Dishes', description_en: 'Smashed potatoes with herbs', allergens_en: 'milk' },
      { id: 105, name: 'Orez cu Legume', category: 'Garnituri', price: 18.00, description: 'Orez, ciuperci, ardei kapia, ceapă roșie, unt', weight: '200G', is_vegetarian: true, allergens: 'lapte', name_en: 'Rice with Vegetables', category_en: 'Side Dishes', description_en: 'Rice, mushrooms, kapia pepper, red onion, butter', allergens_en: 'milk' },
      { id: 106, name: 'Orez Sălbatic', category: 'Garnituri', price: 18.00, description: 'Orez sălbatic aromat', weight: '200G', is_vegetarian: true, name_en: 'Wild Rice', category_en: 'Side Dishes', description_en: 'Aromatic wild rice' },
      { id: 107, name: 'Broccoli Sote', category: 'Garnituri', price: 21.00, description: 'Broccoli sote în unt', weight: '200G', is_vegetarian: true, allergens: 'lapte', name_en: 'Sautéed Broccoli', category_en: 'Side Dishes', description_en: 'Broccoli sautéed in butter', allergens_en: 'milk' },
      { id: 108, name: 'Legume la Grătar', category: 'Garnituri', price: 19.00, description: 'Vinete, dovlecel, roșii, ciuperci, ceapă roșie', weight: '200G', is_vegetarian: true, name_en: 'Grilled Vegetables', category_en: 'Side Dishes', description_en: 'Eggplant, zucchini, tomatoes, mushrooms, red onion' },
      // SALATE ÎNSOȚITOARE (IDs: 109-116)
      { id: 109, name: 'Salată de Varză cu Morcov și Mărar', category: 'Salate Însoțitoare', price: 16.00, description: 'Varză, morcov, mărar', weight: '200G', is_vegetarian: true, name_en: 'Cabbage Salad with Carrot and Dill', category_en: 'Side Salads', description_en: 'Cabbage, carrot, dill' },
      { id: 110, name: 'Salată de Rucola și Roșii Cherry', category: 'Salate Însoțitoare', price: 28.00, description: 'Rucola, roșii cherry, ceapă roșie, brânză dură, dressing balsamic', weight: '200G', is_vegetarian: true, allergens: 'lapte', name_en: 'Arugula and Cherry Tomato Salad', category_en: 'Side Salads', description_en: 'Arugula, cherry tomatoes, red onion, hard cheese, balsamic dressing', allergens_en: 'milk' },
      { id: 111, name: 'Salată Verde', category: 'Salate Însoțitoare', price: 18.00, description: 'Salată verde, ceapă roșie, lămâie', weight: '200G', is_vegetarian: true, name_en: 'Green Salad', category_en: 'Side Salads', description_en: 'Green lettuce, red onion, lemon' },
      { id: 112, name: 'Salată Iceberg', category: 'Salate Însoțitoare', price: 18.00, description: 'Salată iceberg, lămâie', weight: '200G', is_vegetarian: true, name_en: 'Iceberg Salad', category_en: 'Side Salads', description_en: 'Iceberg lettuce, lemon' },
      { id: 113, name: 'Salată Asortată de Vară', category: 'Salate Însoțitoare', price: 18.00, description: 'Roșii, castraveți, ardei kapia, ceapă roșie', weight: '200G', is_vegetarian: true, name_en: 'Assorted Summer Salad', category_en: 'Side Salads', description_en: 'Tomatoes, cucumbers, kapia pepper, red onion' },
      { id: 114, name: 'Salată de Murături', category: 'Salate Însoțitoare', price: 18.00, description: 'Murături asortate', weight: '200G', is_vegetarian: true, name_en: 'Pickle Salad', category_en: 'Side Salads', description_en: 'Assorted pickles' },
      { id: 115, name: 'Salată de Ardei Copt', category: 'Salate Însoțitoare', price: 18.00, description: 'Salată de ardei copt, usturoi, mărar', weight: '200G', is_vegetarian: true, name_en: 'Roasted Pepper Salad', category_en: 'Side Salads', description_en: 'Roasted pepper salad, garlic, dill' },
      { id: 116, name: 'Salată de Roșii', category: 'Salate Însoțitoare', price: 18.00, description: 'Salată de roșii proaspete', weight: '200G', is_vegetarian: true, name_en: 'Tomato Salad', category_en: 'Side Salads', description_en: 'Fresh tomato salad' },
      // DESERTURI (IDs: 117-125)
      { id: 117, name: 'Lava Cake', category: 'Deserturi', price: 33.00, description: 'Tort de ciocolată cu centru lichid', weight: '150/70G', is_vegetarian: true, allergens: 'gluten, ouă, lapte', name_en: 'Lava Cake', category_en: 'Desserts', description_en: 'Chocolate cake with a liquid center', allergens_en: 'gluten, eggs, milk' },
      { id: 118, name: 'Clătite cu Dulceață de Fructe de Pădure', category: 'Deserturi', price: 30.00, description: 'Clătite clasice umplute cu dulceață de fructe de pădure', weight: '170G', is_vegetarian: true, allergens: 'gluten, ouă, lapte', name_en: 'Crepes with Forest Fruit Jam', category_en: 'Desserts', description_en: 'Classic crepes filled with forest fruit jam', allergens_en: 'gluten, eggs, milk' },
      { id: 119, name: 'Clătite cu Dulceață de Vișine', category: 'Deserturi', price: 30.00, description: 'Clătite clasice umplute cu dulceață de vișine', weight: '170G', is_vegetarian: true, allergens: 'gluten, ouă, lapte', name_en: 'Crepes with Sour Cherry Jam', category_en: 'Desserts', description_en: 'Classic crepes filled with sour cherry jam', allergens_en: 'gluten, eggs, milk' },
      { id: 120, name: 'Clătite cu Afine', category: 'Deserturi', price: 30.00, description: 'Clătite clasice umplute cu dulceață de afine', weight: '170G', is_vegetarian: true, allergens: 'gluten, ouă, lapte', name_en: 'Crepes with Blueberry Jam', category_en: 'Desserts', description_en: 'Classic crepes filled with blueberry jam', allergens_en: 'gluten, eggs, milk' },
      { id: 121, name: 'Clătite cu Ciocolată', category: 'Deserturi', price: 30.00, description: 'Clătite clasice umplute cu cremă de ciocolată', weight: '170G', is_vegetarian: true, allergens: 'gluten, ouă, lapte', name_en: 'Crepes with Chocolate', category_en: 'Desserts', description_en: 'Classic crepes filled with chocolate cream', allergens_en: 'gluten, eggs, milk' },
      { id: 122, name: 'Tiramisu cu Fistic', category: 'Deserturi', price: 38.00, description: 'Tiramisu clasic cu fistic', weight: '170G', is_vegetarian: true, allergens: 'gluten, ouă, lapte, nuci', name_en: 'Pistachio Tiramisu', category_en: 'Desserts', description_en: 'Classic tiramisu with pistachio', allergens_en: 'gluten, eggs, milk, nuts' },
      { id: 123, name: 'Cheesecake', category: 'Deserturi', price: 31.00, description: 'Cheesecake clasic', weight: '200G', is_vegetarian: true, allergens: 'gluten, ouă, lapte', name_en: 'Cheesecake', category_en: 'Desserts', description_en: 'Classic cheesecake', allergens_en: 'gluten, eggs, milk' },
      { id: 124, name: 'Papanași', category: 'Deserturi', price: 38.00, description: 'Dulceață fructe de pădure/vișine/afine/ciocolată', weight: '250G', is_vegetarian: true, allergens: 'gluten, ouă, lapte', name_en: 'Papanasi', category_en: 'Desserts', description_en: 'Forest fruit/sour cherry/blueberry/chocolate jam', allergens_en: 'gluten, eggs, milk' },
      { id: 125, name: 'Clătite Africane', category: 'Deserturi', price: 35.00, description: 'Mascarpone, dulceață vișine, nutella, banană, biscuiți', weight: '', is_vegetarian: true, allergens: 'gluten, ouă, lapte, nuci', name_en: 'African Crepes', category_en: 'Desserts', description_en: 'Mascarpone, sour cherry jam, nutella, banana, biscuits', allergens_en: 'gluten, eggs, milk, nuts' },
      // CAFEA/CIOCOLATĂ/CEAI (IDs: 126-144)
      { id: 126, name: 'Ristretto', category: 'Cafea/Ciocolată/Ceai', price: 13.00, description: 'Cafea ristretto', weight: '15ML', name_en: 'Ristretto', category_en: 'Coffee/Chocolate/Tea', description_en: 'Ristretto coffee' },
      { id: 127, name: 'Espresso', category: 'Cafea/Ciocolată/Ceai', price: 13.00, description: 'Cafea espresso', weight: '30ML', name_en: 'Espresso', category_en: 'Coffee/Chocolate/Tea', description_en: 'Espresso coffee' },
      { id: 128, name: 'Espresso Dublu', category: 'Cafea/Ciocolată/Ceai', price: 19.00, description: 'Espresso dublu', weight: '60ML', name_en: 'Double Espresso', category_en: 'Coffee/Chocolate/Tea', description_en: 'Double espresso' },
      { id: 129, name: 'Cafea Decofeinizată', category: 'Cafea/Ciocolată/Ceai', price: 13.00, description: 'Cafea fără cofeină', weight: '30ML', name_en: 'Decaffeinated Coffee', category_en: 'Coffee/Chocolate/Tea', description_en: 'Caffeine-free coffee' },
      { id: 130, name: 'Latte Macchiato', category: 'Cafea/Ciocolată/Ceai', price: 13.00, description: 'Latte macchiato', weight: '40ML', name_en: 'Latte Macchiato', category_en: 'Coffee/Chocolate/Tea', description_en: 'Latte macchiato' },
      { id: 131, name: 'Caffe Latte', category: 'Cafea/Ciocolată/Ceai', price: 17.00, description: 'Cafea cu lapte', weight: '230ML', name_en: 'Caffe Latte', category_en: 'Coffee/Chocolate/Tea', description_en: 'Coffee with milk' },
      { id: 132, name: 'Caffe Latte cu Arome', category: 'Cafea/Ciocolată/Ceai', price: 19.00, description: 'Vanilie/caramel/ciocolată', weight: '230ML', name_en: 'Flavored Caffe Latte', category_en: 'Coffee/Chocolate/Tea', description_en: 'Vanilla/caramel/chocolate' },
      { id: 133, name: 'Caffe Latte Decofeinizată', category: 'Cafea/Ciocolată/Ceai', price: 19.00, description: 'Latte fără cofeină', weight: '150ML', name_en: 'Decaf Caffe Latte', category_en: 'Coffee/Chocolate/Tea', description_en: 'Decaf latte' },
      { id: 134, name: 'Flat White', category: 'Cafea/Ciocolată/Ceai', price: 18.00, description: 'Flat white', weight: '40ML', name_en: 'Flat White', category_en: 'Coffee/Chocolate/Tea', description_en: 'Flat white' },
      { id: 135, name: 'Classic Cappuccino', category: 'Cafea/Ciocolată/Ceai', price: 16.00, description: 'Cappuccino clasic', weight: '150ML', name_en: 'Classic Cappuccino', category_en: 'Coffee/Chocolate/Tea', description_en: 'Classic cappuccino' },
      { id: 136, name: 'Cappuccino Vienez', category: 'Cafea/Ciocolată/Ceai', price: 17.00, description: 'Espresso, lapte, frișcă', weight: '150ML', name_en: 'Viennese Cappuccino', category_en: 'Coffee/Chocolate/Tea', description_en: 'Espresso, milk, whipped cream' },
      { id: 137, name: 'Cappuccino Decofeinizat', category: 'Cafea/Ciocolată/Ceai', price: 18.00, description: 'Cappuccino fără cofeină', weight: '150ML', name_en: 'Decaf Cappuccino', category_en: 'Coffee/Chocolate/Tea', description_en: 'Decaf cappuccino' },
      { id: 138, name: 'Freddo Cappuccino', category: 'Cafea/Ciocolată/Ceai', price: 16.00, description: 'Espresso, cremă de lapte, gheață', weight: '150ML', name_en: 'Freddo Cappuccino', category_en: 'Coffee/Chocolate/Tea', description_en: 'Espresso, milk cream, ice' },
      { id: 139, name: 'Freddo Espresso', category: 'Cafea/Ciocolată/Ceai', price: 13.00, description: 'Espresso, gheață', weight: '150ML', name_en: 'Freddo Espresso', category_en: 'Coffee/Chocolate/Tea', description_en: 'Espresso, ice' },
      { id: 140, name: 'Irish Coffee', category: 'Cafea/Ciocolată/Ceai', price: 22.00, description: 'Espresso, Irish whiskey, zahăr brun, frișcă', weight: '230ML', name_en: 'Irish Coffee', category_en: 'Coffee/Chocolate/Tea', description_en: 'Espresso, Irish whiskey, brown sugar, whipped cream' },
      { id: 141, name: 'Bailey\'s Coffee', category: 'Cafea/Ciocolată/Ceai', price: 22.00, description: 'Espresso, Baileys, zahăr brun, frișcă', weight: '230ML', name_en: 'Bailey\'s Coffee', category_en: 'Coffee/Chocolate/Tea', description_en: 'Espresso, Baileys, brown sugar, whipped cream' },
      { id: 142, name: 'Frappe', category: 'Cafea/Ciocolată/Ceai', price: 27.00, description: 'Classic/vanilie/ciocolată/caramel', weight: '230ML', name_en: 'Frappe', category_en: 'Coffee/Chocolate/Tea', description_en: 'Classic/vanilla/chocolate/caramel' },
      { id: 143, name: 'Ceai Tea Tales', category: 'Cafea/Ciocolată/Ceai', price: 16.00, description: 'Jasmine/Herbal/Spicy Ginger/English Breakfast/Cranberry/Wild Berry', weight: '230ML', name_en: 'Tea Tales Tea', category_en: 'Coffee/Chocolate/Tea', description_en: 'Jasmine/Herbal/Spicy Ginger/English Breakfast/Cranberry/Wild Berry' },
      { id: 144, name: 'Ciocolată Caldă', category: 'Cafea/Ciocolată/Ceai', price: 18.00, description: 'Albă/neagră', weight: '230ML', name_en: 'Hot Chocolate', category_en: 'Coffee/Chocolate/Tea', description_en: 'White/dark' },
      // RĂCORITOARE (IDs: 145-174)
      { id: 145, name: 'Apă Plată', category: 'Răcoritoare', price: 13.00, description: 'Apă minerală', weight: '330ML', name_en: 'Still Water', category_en: 'Soft Drinks', description_en: 'Mineral water' },
      { id: 146, name: 'Apă Carbogazoasă', category: 'Răcoritoare', price: 13.00, description: 'Apă minerală', weight: '330ML', name_en: 'Sparkling Water', category_en: 'Soft Drinks', description_en: 'Mineral water' },
      { id: 147, name: 'Apă Plată Mare', category: 'Răcoritoare', price: 18.00, description: 'Apă minerală', weight: '750ML', name_en: 'Large Still Water', category_en: 'Soft Drinks', description_en: 'Mineral water' },
      { id: 148, name: 'Apă Carbogazoasă Mare', category: 'Răcoritoare', price: 18.00, description: 'Apă minerală', weight: '750ML', name_en: 'Large Sparkling Water', category_en: 'Soft Drinks', description_en: 'Mineral water' },
      { id: 149, name: 'Pepsi', category: 'Răcoritoare', price: 13.00, description: 'Băutură carbogazoasă', weight: '250ML', name_en: 'Pepsi', category_en: 'Soft Drinks', description_en: 'Carbonated drink' },
      { id: 150, name: 'Pepsi Twist', category: 'Răcoritoare', price: 13.00, description: 'Băutură carbogazoasă cu aromă de lămâie', weight: '250ML', name_en: 'Pepsi Twist', category_en: 'Soft Drinks', description_en: 'Lemon flavored carbonated drink' },
      { id: 151, name: 'Pepsi Max', category: 'Răcoritoare', price: 13.00, description: 'Băutură carbogazoasă fără zahăr', weight: '250ML', name_en: 'Pepsi Max', category_en: 'Soft Drinks', description_en: 'Sugar-free carbonated drink' },
      { id: 152, name: 'Mirinda', category: 'Răcoritoare', price: 13.00, description: 'Băutură carbogazoasă', weight: '250ML', name_en: 'Mirinda', category_en: 'Soft Drinks', description_en: 'Carbonated drink' },
      { id: 153, name: 'Evervess Tonic', category: 'Răcoritoare', price: 13.00, description: 'Apă tonică', weight: '250ML', name_en: 'Evervess Tonic', category_en: 'Soft Drinks', description_en: 'Tonic water' },
      { id: 154, name: '7 Up', category: 'Răcoritoare', price: 13.00, description: 'Băutură carbogazoasă', weight: '250ML', name_en: '7 Up', category_en: 'Soft Drinks', description_en: 'Carbonated drink' },
      { id: 155, name: 'Figa', category: 'Răcoritoare', price: 23.00, description: 'Băutură premium', weight: '250ML', name_en: 'Figa', category_en: 'Soft Drinks', description_en: 'Premium drink' },
      { id: 156, name: 'Red Bull', category: 'Răcoritoare', price: 21.00, description: 'Băutură energizantă', weight: '250ML', name_en: 'Red Bull', category_en: 'Soft Drinks', description_en: 'Energy drink' },
      { id: 157, name: 'Prigat Piersică', category: 'Răcoritoare', price: 13.00, description: 'Băutură răcoritoare cu aromă de piersică', weight: '250ML', name_en: 'Prigat Peach', category_en: 'Soft Drinks', description_en: 'Peach flavored soft drink' },
      { id: 158, name: 'Prigat Portocală', category: 'Răcoritoare', price: 13.00, description: 'Băutură răcoritoare cu aromă de portocală', weight: '250ML', name_en: 'Prigat Orange', category_en: 'Soft Drinks', description_en: 'Orange flavored soft drink' },
      { id: 159, name: 'Prigat Căpșuni', category: 'Răcoritoare', price: 13.00, description: 'Băutură răcoritoare cu aromă de căpșuni', weight: '250ML', name_en: 'Prigat Strawberry', category_en: 'Soft Drinks', description_en: 'Strawberry flavored soft drink' },
      { id: 160, name: 'Prigat Banane', category: 'Răcoritoare', price: 13.00, description: 'Băutură răcoritoare cu aromă de banane', weight: '250ML', name_en: 'Prigat Banana', category_en: 'Soft Drinks', description_en: 'Banana flavored soft drink' },
      { id: 161, name: 'Lipton Ice Tea Piersică', category: 'Răcoritoare', price: 13.00, description: 'Ceai rece cu aromă de piersică', weight: '250ML', name_en: 'Lipton Ice Tea Peach', category_en: 'Soft Drinks', description_en: 'Peach flavored ice tea' },
      { id: 162, name: 'Lipton Ice Tea Lămâie', category: 'Răcoritoare', price: 13.00, description: 'Ceai rece cu aromă de lămâie', weight: '250ML', name_en: 'Lipton Ice Tea Lemon', category_en: 'Soft Drinks', description_en: 'Lemon flavored ice tea' },
      { id: 163, name: 'San Benedetto Ice Tea Piersică', category: 'Răcoritoare', price: 18.00, description: 'Ceai rece premium cu aromă de piersică', weight: '330ML', name_en: 'San Benedetto Ice Tea Peach', category_en: 'Soft Drinks', description_en: 'Premium peach flavored ice tea' },
      { id: 164, name: 'San Benedetto Ice Tea Lămâie', category: 'Răcoritoare', price: 18.00, description: 'Ceai rece premium cu aromă de lămâie', weight: '330ML', name_en: 'San Benedetto Ice Tea Lemon', category_en: 'Soft Drinks', description_en: 'Premium lemon flavored ice tea' },
      { id: 165, name: 'San Benedetto Ice Tea Clementine', category: 'Răcoritoare', price: 18.00, description: 'Ceai rece premium cu aromă de clementine', weight: '330ML', name_en: 'San Benedetto Ice Tea Clementine', category_en: 'Soft Drinks', description_en: 'Premium clementine flavored ice tea' },
      { id: 166, name: 'Limonadă Clasică', category: 'Răcoritoare', price: 23.00, description: 'Limonadă proaspătă naturală', weight: '400ML', name_en: 'Classic Lemonade', category_en: 'Soft Drinks', description_en: 'Fresh natural lemonade' },
      { id: 167, name: 'Limonadă cu Mentă', category: 'Răcoritoare', price: 25.00, description: 'Limonadă cu mentă proaspătă', weight: '400ML', name_en: 'Mint Lemonade', category_en: 'Soft Drinks', description_en: 'Lemonade with fresh mint' },
      { id: 168, name: 'Limonadă cu Mango', category: 'Răcoritoare', price: 27.00, description: 'Limonadă cu aromă tropicală de mango', weight: '400ML', name_en: 'Mango Lemonade', category_en: 'Soft Drinks', description_en: 'Lemonade with tropical mango flavor' },
      { id: 169, name: 'Limonadă cu Fructul Pasiunii', category: 'Răcoritoare', price: 27.00, description: 'Limonadă cu aromă exotică de fructul pasiunii', weight: '400ML', name_en: 'Passion Fruit Lemonade', category_en: 'Soft Drinks', description_en: 'Lemonade with exotic passion fruit flavor' },
      { id: 170, name: 'Limonadă cu Căpșuni', category: 'Răcoritoare', price: 27.00, description: 'Limonadă cu aromă dulce de căpșuni', weight: '400ML', name_en: 'Strawberry Lemonade', category_en: 'Soft Drinks', description_en: 'Lemonade with sweet strawberry flavor' },
      { id: 171, name: 'Limonadă cu Zmeură', category: 'Răcoritoare', price: 27.00, description: 'Limonadă cu aromă acidulată de zmeură', weight: '400ML', name_en: 'Raspberry Lemonade', category_en: 'Soft Drinks', description_en: 'Lemonade with tangy raspberry flavor' },
      { id: 172, name: 'Fresh de Portocală', category: 'Răcoritoare', price: 27.00, description: 'Suc proaspăt de portocale', weight: '250ML', name_en: 'Orange Fresh Juice', category_en: 'Soft Drinks', description_en: 'Fresh orange juice' },
      { id: 173, name: 'Fresh de Grapefruit', category: 'Răcoritoare', price: 27.00, description: 'Suc proaspăt de grapefruit', weight: '250ML', name_en: 'Grapefruit Fresh Juice', category_en: 'Soft Drinks', description_en: 'Fresh grapefruit juice' },
      { id: 174, name: 'Fresh Mix', category: 'Răcoritoare', price: 27.00, description: 'Amestec de sucuri proaspete de citrice', weight: '250ML', name_en: 'Mixed Fresh Juice', category_en: 'Soft Drinks', description_en: 'Mix of fresh citrus juices' },
      // BĂUTURI ȘI COCTAILURI (IDs: 175-281)
      { id: 175, name: 'Carlsberg', category: 'Băuturi și Coctailuri', price: 17.00, description: 'Bere sticlă - Premium la sticlă', weight: '330ML', name_en: 'Carlsberg', category_en: 'Drinks & Cocktails', description_en: 'Bottled Beer - Premium bottle' },
      { id: 176, name: 'Tuborg', category: 'Băuturi și Coctailuri', price: 15.00, description: 'Bere sticlă - La sticlă', weight: '330ML', name_en: 'Tuborg', category_en: 'Drinks & Cocktails', description_en: 'Bottled Beer - Bottle' },
      { id: 177, name: 'Tuborg Nonalcoolic', category: 'Băuturi și Coctailuri', price: 15.00, description: 'Bere fără alcool - La sticlă', weight: '330ML', name_en: 'Tuborg Non-alcoholic', category_en: 'Drinks & Cocktails', description_en: 'Non-alcoholic beer - Bottle' },
      { id: 178, name: 'Bucur Blondă', category: 'Băuturi și Coctailuri', price: 16.00, description: 'Bere sticlă - Românească blondă', weight: '350ML', name_en: 'Bucur Blond', category_en: 'Drinks & Cocktails', description_en: 'Bottled Beer - Romanian blond' },
      { id: 179, name: 'Bucur Brună', category: 'Băuturi și Coctailuri', price: 16.00, description: 'Bere sticlă - Românească brună', weight: '350ML', name_en: 'Bucur Dark', category_en: 'Drinks & Cocktails', description_en: 'Bottled Beer - Romanian dark' },
      { id: 180, name: 'Weihenstephaner Blondă Nefiltrată', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Bere sticlă - Germană premium nefiltrată', weight: '330ML', name_en: 'Weihenstephaner Unfiltered Blond', category_en: 'Drinks & Cocktails', description_en: 'Bottled Beer - German premium unfiltered' },
      { id: 181, name: 'Holsten Nefiltrată', category: 'Băuturi și Coctailuri', price: 15.00, description: 'Bere draught - Nefiltrată la robinet', weight: '400ML', name_en: 'Holsten Unfiltered', category_en: 'Drinks & Cocktails', description_en: 'Draught Beer - Unfiltered on tap' },
      { id: 182, name: 'Tuborg Draught', category: 'Băuturi și Coctailuri', price: 15.00, description: 'Bere draught - La robinet', weight: '400ML', name_en: 'Tuborg Draught', category_en: 'Drinks & Cocktails', description_en: 'Draught Beer - On tap' },
      { id: 183, name: 'Carlsberg Draught Mic', category: 'Băuturi și Coctailuri', price: 13.00, description: 'Bere draught - La robinet', weight: '250ML', name_en: 'Small Carlsberg Draught', category_en: 'Drinks & Cocktails', description_en: 'Draught Beer - On tap' },
      { id: 184, name: 'Carlsberg Draught', category: 'Băuturi și Coctailuri', price: 17.00, description: 'Bere draught - La robinet', weight: '400ML', name_en: 'Carlsberg Draught', category_en: 'Drinks & Cocktails', description_en: 'Draught Beer - On tap' },
      { id: 185, name: 'Hugo', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Prosecco, sirop de soc, apă minerală, lime, mentă fresh', weight: '300ML', name_en: 'Hugo', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Prosecco, elderflower syrup, sparkling water, lime, fresh mint' },
      { id: 186, name: 'Aperol Spritz', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Aperol, Prosecco, apă minerală, portocală', weight: '350ML', name_en: 'Aperol Spritz', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Aperol, Prosecco, sparkling water, orange' },
      { id: 187, name: 'Campari Orange', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Campari, suc de portocale, portocală', weight: '300ML', name_en: 'Campari Orange', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Campari, orange juice, orange' },
      { id: 188, name: 'Mai Tai', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Rom, suc de portocale, sirop de migdale, lime', weight: '250ML', name_en: 'Mai Tai', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Rum, orange juice, almond syrup, lime' },
      { id: 189, name: 'Mojito', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Rom, lime, zahăr brun, apă minerală, mentă fresh', weight: '250ML', name_en: 'Mojito', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Rum, lime, brown sugar, sparkling water, fresh mint' },
      { id: 190, name: 'Cuba Libre', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Rom, Pepsi, lime', weight: '250ML', name_en: 'Cuba Libre', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Rum, Pepsi, lime' },
      { id: 191, name: 'Cosmopolitan', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Vodka, triplu sec, suc de merișoare, portocală', weight: '150ML', name_en: 'Cosmopolitan', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Vodka, triple sec, cranberry juice, orange' },
      { id: 192, name: 'Mimosa', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Prosecco, fresh de portocale, triplu sec', weight: '250ML', name_en: 'Mimosa', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Prosecco, fresh orange juice, triple sec' },
      { id: 193, name: 'Tropical Margarita', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail clasic - Tequila, triplu sec, piure căpșuni/zmeură/fructul pasiunii', weight: '150ML', name_en: 'Tropical Margarita', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Tequila, triple sec, strawberry/raspberry/passion fruit puree' },
      { id: 194, name: 'Long Island', category: 'Băuturi și Coctailuri', price: 36.00, description: 'Coctail clasic - Vodka, Rom alb, triplu sec, gin clasic, tequila, Pepsi, lime', weight: '200ML', name_en: 'Long Island', category_en: 'Drinks & Cocktails', description_en: 'Classic cocktail - Vodka, White Rum, triple sec, classic gin, tequila, Pepsi, lime' },
      { id: 195, name: 'Disaronno Fitz', category: 'Băuturi și Coctailuri', price: 28.00, description: 'Coctail - Amaretto disaronno, apă carbogazoasă', weight: '150ML', name_en: 'Disaronno Fitz', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Amaretto disaronno, sparkling water' },
      { id: 196, name: 'Pina Colada', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail - Rom, suc de ananas, piure de cocos, frișcă lichidă', weight: '300ML', name_en: 'Pina Colada', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Rum, pineapple juice, coconut puree, liquid cream' },
      { id: 197, name: 'Orgasm', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail - Vodka, Amaretto, Kahlua, Baileys, frișcă', weight: '150ML', name_en: 'Orgasm', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Vodka, Amaretto, Kahlua, Baileys, whipped cream' },
      { id: 198, name: 'Strawberry Mojito', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail - Rom, lime, zahăr brun, piure de căpșuni, mentă fresh', weight: '150ML', name_en: 'Strawberry Mojito', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Rum, lime, brown sugar, strawberry puree, fresh mint' },
      { id: 199, name: 'Black Amaretto', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail - Amaretto, Rom, lichior de cafea', weight: '150ML', name_en: 'Black Amaretto', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Amaretto, Rum, coffee liqueur' },
      { id: 200, name: 'Espresso Martini', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail - Vodka, lichior de cafea, espresso, sirop de zahăr', weight: '150ML', name_en: 'Espresso Martini', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Vodka, coffee liqueur, espresso, sugar syrup' },
      { id: 201, name: 'Strawberry Caipiroska', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail - Vodka, piure de căpșuni', weight: '150ML', name_en: 'Strawberry Caipiroska', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Vodka, strawberry puree' },
      { id: 202, name: 'Porn Star Martini', category: 'Băuturi și Coctailuri', price: 31.00, description: 'Coctail - Vodka, Prosecco, piure de fructul pasiunii, fresh lămâie, sirop de vanilie', weight: '200ML', name_en: 'Porn Star Martini', category_en: 'Drinks & Cocktails', description_en: 'Cocktail - Vodka, Prosecco, passion fruit puree, fresh lemon, vanilla syrup' },
      { id: 203, name: 'Tanqueray London Dry', category: 'Băuturi și Coctailuri', price: 29.00, description: 'Gin Coctail - Gin, apă tonică, lime', weight: '400ML', name_en: 'Tanqueray London Dry', category_en: 'Drinks & Cocktails', description_en: 'Gin Cocktail - Gin, tonic water, lime' },
      { id: 204, name: 'Tanqueray Grapefruit', category: 'Băuturi și Coctailuri', price: 29.00, description: 'Gin Coctail - Gin, apă tonică, grapefruit', weight: '400ML', name_en: 'Tanqueray Grapefruit', category_en: 'Drinks & Cocktails', description_en: 'Gin Cocktail - Gin, tonic water, grapefruit' },
      { id: 205, name: 'Tanqueray Sevilla', category: 'Băuturi și Coctailuri', price: 29.00, description: 'Gin Coctail - Gin, apă tonică, portocală', weight: '400ML', name_en: 'Tanqueray Sevilla', category_en: 'Drinks & Cocktails', description_en: 'Gin Cocktail - Gin, tonic water, orange' },
      { id: 206, name: 'Tanqueray Rangpur', category: 'Băuturi și Coctailuri', price: 29.00, description: 'Gin Coctail - Gin, apă tonică, lămâie', weight: '400ML', name_en: 'Tanqueray Rangpur', category_en: 'Drinks & Cocktails', description_en: 'Gin Cocktail - Gin, tonic water, lemon' },
      { id: 207, name: 'Mango Sunset', category: 'Băuturi și Coctailuri', price: 29.00, description: 'Gin Coctail - Amaretto, Rom, lichior de cafea', weight: '400ML', name_en: 'Mango Sunset', category_en: 'Drinks & Cocktails', description_en: 'Gin Cocktail - Amaretto, Rum, coffee liqueur' },
      { id: 208, name: 'Violette Gin', category: 'Băuturi și Coctailuri', price: 29.00, description: 'Gin Coctail - Gin, apă tonică, sirop de violete', weight: '400ML', name_en: 'Violette Gin', category_en: 'Drinks & Cocktails', description_en: 'Gin Cocktail - Gin, tonic water, violet syrup' },
      { id: 209, name: 'Virgin Colada', category: 'Băuturi și Coctailuri', price: 25.00, description: 'Coctail fără alcool - Suc de ananas, piure de cocos, frișcă lichidă', weight: '250ML', name_en: 'Virgin Colada', category_en: 'Drinks & Cocktails', description_en: 'Non-alcoholic cocktail - Pineapple juice, coconut puree, liquid cream' },
      { id: 210, name: 'Green Apple', category: 'Băuturi și Coctailuri', price: 25.00, description: 'Coctail fără alcool - Suc de mere verzi, lime, zahăr brun', weight: '250ML', name_en: 'Green Apple', category_en: 'Drinks & Cocktails', description_en: 'Non-alcoholic cocktail - Green apple juice, lime, brown sugar' },
      { id: 211, name: 'Blue Hawaii', category: 'Băuturi și Coctailuri', price: 25.00, description: 'Coctail fără alcool - Suc de ananas, blue curacao, piure de cocos', weight: '250ML', name_en: 'Blue Hawaii', category_en: 'Drinks & Cocktails', description_en: 'Non-alcoholic cocktail - Pineapple juice, blue curacao, coconut puree' },
      { id: 212, name: 'Bumbu', category: 'Băuturi și Coctailuri', price: 34.00, description: 'Rom premium - 40% alc', weight: '40ML', name_en: 'Bumbu', category_en: 'Drinks & Cocktails', description_en: 'Premium rum - 40% alc' },
      { id: 213, name: 'Captain Morgan White', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Rom alb - 37.5% alc', weight: '40ML', name_en: 'Captain Morgan White', category_en: 'Drinks & Cocktails', description_en: 'White rum - 37.5% alc' },
      { id: 214, name: 'Captain Morgan Spiced Gold', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Rom cu mirodenii - 35% alc', weight: '40ML', name_en: 'Captain Morgan Spiced Gold', category_en: 'Drinks & Cocktails', description_en: 'Spiced rum - 35% alc' },
      { id: 215, name: 'Diplomatico', category: 'Băuturi și Coctailuri', price: 34.00, description: 'Rom premium venezuelan - 40% alc', weight: '40ML', name_en: 'Diplomatico', category_en: 'Drinks & Cocktails', description_en: 'Venezuelan premium rum - 40% alc' },
      { id: 216, name: 'Smirnoff Red', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Vodka premium - 40% alc', weight: '40ML', name_en: 'Smirnoff Red', category_en: 'Drinks & Cocktails', description_en: 'Premium vodka - 40% alc' },
      { id: 217, name: 'Ketel One', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Vodka premium olandeză - 40% alc', weight: '40ML', name_en: 'Ketel One', category_en: 'Drinks & Cocktails', description_en: 'Dutch premium vodka - 40% alc' },
      { id: 218, name: 'Grey Goose', category: 'Băuturi și Coctailuri', price: 33.00, description: 'Vodka premium franceză - 40% alc', weight: '40ML', name_en: 'Grey Goose', category_en: 'Drinks & Cocktails', description_en: 'French premium vodka - 40% alc' },
      { id: 219, name: 'Johnnie Walker Red Label', category: 'Băuturi și Coctailuri', price: 25.00, description: 'Whisky scoțian - 40% alc', weight: '40ML', name_en: 'Johnnie Walker Red Label', category_en: 'Drinks & Cocktails', description_en: 'Scotch whisky - 40% alc' },
      { id: 220, name: 'Johnnie Walker Black Label', category: 'Băuturi și Coctailuri', price: 29.00, description: 'Whisky scoțian premium - 40% alc', weight: '40ML', name_en: 'Johnnie Walker Black Label', category_en: 'Drinks & Cocktails', description_en: 'Premium scotch whisky - 40% alc' },
      { id: 221, name: 'Bushmills', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Whisky irlandez - 40% alc', weight: '40ML', name_en: 'Bushmills', category_en: 'Drinks & Cocktails', description_en: 'Irish whiskey - 40% alc' },
      { id: 222, name: 'Chivas 12 YO', category: 'Băuturi și Coctailuri', price: 30.00, description: 'Whisky scoțian 12 ani - 40% alc', weight: '40ML', name_en: 'Chivas 12 YO', category_en: 'Drinks & Cocktails', description_en: '12-year-old scotch whisky - 40% alc' },
      { id: 223, name: 'Chivas 18 YO', category: 'Băuturi și Coctailuri', price: 43.00, description: 'Whisky scoțian 18 ani - 40% alc', weight: '40ML', name_en: 'Chivas 18 YO', category_en: 'Drinks & Cocktails', description_en: '18-year-old scotch whisky - 40% alc' },
      { id: 224, name: 'Jim Beam Bourbon', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Whisky bourbon american - 40% alc', weight: '40ML', name_en: 'Jim Beam Bourbon', category_en: 'Drinks & Cocktails', description_en: 'American bourbon whiskey - 40% alc' },
      { id: 225, name: 'Jack Daniels', category: 'Băuturi și Coctailuri', price: 25.00, description: 'Whisky Tennessee - 40% alc', weight: '40ML', name_en: 'Jack Daniels', category_en: 'Drinks & Cocktails', description_en: 'Tennessee whiskey - 40% alc' },
      { id: 226, name: 'Gordon\'s Pink', category: 'Băuturi și Coctailuri', price: 26.00, description: 'Gin roz premium - 37.5% alc', weight: '40ML', name_en: 'Gordon\'s Pink', category_en: 'Drinks & Cocktails', description_en: 'Premium pink gin - 37.5% alc' },
      { id: 227, name: 'Tanqueray Gin', category: 'Băuturi și Coctailuri', price: 24.00, description: 'Gin premium englez - 43.1% alc', weight: '40ML', name_en: 'Tanqueray Gin', category_en: 'Drinks & Cocktails', description_en: 'English premium gin - 43.1% alc' },
      { id: 228, name: 'Lunazul Blanco', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Tequila albă mexicană - 40% alc', weight: '40ML', name_en: 'Lunazul Blanco', category_en: 'Drinks & Cocktails', description_en: 'Mexican white tequila - 40% alc' },
      { id: 229, name: 'Lunazul Fumee', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Tequila fumată mexicană - 40% alc', weight: '40ML', name_en: 'Lunazul Fumee', category_en: 'Drinks & Cocktails', description_en: 'Mexican smoked tequila - 40% alc' },
      { id: 230, name: 'Jose Cuervo Gold', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Tequila gold mexicană - 38% alc', weight: '40ML', name_en: 'Jose Cuervo Gold', category_en: 'Drinks & Cocktails', description_en: 'Mexican gold tequila - 38% alc' },
      { id: 231, name: 'Brâncoveanu VS', category: 'Băuturi și Coctailuri', price: 26.00, description: 'Brandy românesc premium', weight: '40ML', name_en: 'Brâncoveanu VS', category_en: 'Drinks & Cocktails', description_en: 'Premium Romanian brandy' },
      { id: 232, name: 'Courvoisier VS', category: 'Băuturi și Coctailuri', price: 32.00, description: 'Cognac francez premium - 40% alc', weight: '40ML', name_en: 'Courvoisier VS', category_en: 'Drinks & Cocktails', description_en: 'Premium French cognac - 40% alc' },
      { id: 233, name: 'Jägermeister', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Bitter de plante german - 35% alc', weight: '40ML', name_en: 'Jägermeister', category_en: 'Drinks & Cocktails', description_en: 'German herbal bitter - 35% alc' },
      { id: 234, name: 'Pălincă Bran', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Pălincă românească - 50% alc', weight: '40ML', name_en: 'Pălincă Bran', category_en: 'Drinks & Cocktails', description_en: 'Romanian "pălincă" - 50% alc' },
      { id: 235, name: 'Aperol', category: 'Băuturi și Coctailuri', price: 22.00, description: 'Aperitiv italian - 11% alc', weight: '40ML', name_en: 'Aperol', category_en: 'Drinks & Cocktails', description_en: 'Italian aperitif - 11% alc' },
      { id: 236, name: 'Amaretto Disaronno', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Lichior de migdale - 28% alc', weight: '40ML', name_en: 'Amaretto Disaronno', category_en: 'Drinks & Cocktails', description_en: 'Almond liqueur - 28% alc' },
      { id: 237, name: 'Bailey\'s', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Lichior de whisky cu cremă - 17% alc', weight: '40ML', name_en: 'Bailey\'s', category_en: 'Drinks & Cocktails', description_en: 'Cream whisky liqueur - 17% alc' },
      { id: 238, name: 'Kahlua', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Lichior de cafea - 16% alc', weight: '40ML', name_en: 'Kahlua', category_en: 'Drinks & Cocktails', description_en: 'Coffee liqueur - 16% alc' },
      { id: 239, name: 'Campari', category: 'Băuturi și Coctailuri', price: 21.00, description: 'Bitter italian - 25% alc', weight: '40ML', name_en: 'Campari', category_en: 'Drinks & Cocktails', description_en: 'Italian bitter - 25% alc' },
      { id: 240, name: 'Martini', category: 'Băuturi și Coctailuri', price: 21.00, description: 'Vermut italian - 15% alc', weight: '40ML', name_en: 'Martini', category_en: 'Drinks & Cocktails', description_en: 'Italian vermouth - 15% alc' },
      { id: 241, name: 'Kamikaze Shot', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Shot - Vodka, triplu sec, fresh lămâie', weight: '30ML', name_en: 'Kamikaze Shot', category_en: 'Drinks & Cocktails', description_en: 'Shot - Vodka, triple sec, fresh lemon' },
      { id: 242, name: 'B52 Shot', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Shot - Baileys, lichior cafea, triplu sec', weight: '30ML', name_en: 'B52 Shot', category_en: 'Drinks & Cocktails', description_en: 'Shot - Baileys, coffee liqueur, triple sec' },
      { id: 243, name: 'Blow Job Shot', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Shot - Baileys, lichior cafea, frișcă', weight: '30ML', name_en: 'Blow Job Shot', category_en: 'Drinks & Cocktails', description_en: 'Shot - Baileys, coffee liqueur, whipped cream' },
      { id: 244, name: 'Blue Tequila Shot', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Shot - Tequila, sirop curacao, lămâie', weight: '30ML', name_en: 'Blue Tequila Shot', category_en: 'Drinks & Cocktails', description_en: 'Shot - Tequila, curacao syrup, lemon' },
      { id: 245, name: 'Liliac Sauvignon Blanc', category: 'Băuturi și Coctailuri', price: 120.00, description: 'Vin alb sec - 13% alc, crama Liliac', weight: '750ML', name_en: 'Liliac Sauvignon Blanc', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 13% alc, Liliac winery' },
      { id: 246, name: 'La Plage', category: 'Băuturi și Coctailuri', price: 140.00, description: 'Vin alb sec - 12.5% alc, crama Rașova', weight: '750ML', name_en: 'La Plage', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 12.5% alc, Rașova winery' },
      { id: 247, name: 'Caii de la Letea Vol 1 Aligote', category: 'Băuturi și Coctailuri', price: 100.00, description: 'Vin alb sec - 12.5% alc, crama Sarica Niculițel', weight: '750ML', name_en: 'Caii de la Letea Vol 1 Aligote', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 12.5% alc, Sarica Niculițel winery' },
      { id: 248, name: 'Sarica Aniversarium Aligote', category: 'Băuturi și Coctailuri', price: 90.00, description: 'Vin alb demisec - 12.5% alc, crama Sarica Niculițel', weight: '750ML', name_en: 'Sarica Aniversarium Aligote', category_en: 'Drinks & Cocktails', description_en: 'Semi-dry white wine - 12.5% alc, Sarica Niculițel winery' },
      { id: 249, name: 'Negrini Sauvignon Blanc & Fetească Regală', category: 'Băuturi și Coctailuri', price: 110.00, description: 'Vin alb sec - 12.7% alc, crama Negrini', weight: '750ML', name_en: 'Negrini Sauvignon Blanc & Fetească Regală', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 12.7% alc, Negrini winery' },
      { id: 250, name: 'Purcari Nocturne Sauvignon Blanc', category: 'Băuturi și Coctailuri', price: 130.00, description: 'Vin alb sec - 12.5% alc, crama Purcari', weight: '750ML', name_en: 'Purcari Nocturne Sauvignon Blanc', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 12.5% alc, Purcari winery' },
      { id: 251, name: 'Purcari Nocturne Pinot Grigio', category: 'Băuturi și Coctailuri', price: 130.00, description: 'Vin alb sec - 12.5% alc, crama Purcari', weight: '750ML', name_en: 'Purcari Nocturne Pinot Grigio', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 12.5% alc, Purcari winery' },
      { id: 252, name: 'Purcari Nocturne Chardonnay', category: 'Băuturi și Coctailuri', price: 130.00, description: 'Vin alb sec - 13.5% alc, crama Purcari', weight: '750ML', name_en: 'Purcari Nocturne Chardonnay', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 13.5% alc, Purcari winery' },
      { id: 253, name: 'Solo Quinta Chardonnay', category: 'Băuturi și Coctailuri', price: 180.00, description: 'Vin alb sec - 13% alc, cramele Recaș', weight: '750ML', name_en: 'Solo Quinta Chardonnay', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 13% alc, Recaș winery' },
      { id: 254, name: 'Muse Day', category: 'Băuturi și Coctailuri', price: 160.00, description: 'Vin alb demisec - 13% alc, cramele Recaș', weight: '750ML', name_en: 'Muse Day', category_en: 'Drinks & Cocktails', description_en: 'Semi-dry white wine - 13% alc, Recaș winery' },
      { id: 255, name: 'Sole Chardonnay', category: 'Băuturi și Coctailuri', price: 160.00, description: 'Vin alb sec - 13% alc, cramele Recaș', weight: '750ML', name_en: 'Sole Chardonnay', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine - 13% alc, Recaș winery' },
      { id: 256, name: 'Sole Rose', category: 'Băuturi și Coctailuri', price: 160.00, description: 'Vin roze sec - 12.5% alc, cramele Recaș', weight: '750ML', name_en: 'Sole Rose', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine - 12.5% alc, Recaș winery' },
      { id: 257, name: 'Liliac Rose', category: 'Băuturi și Coctailuri', price: 110.00, description: 'Vin roze sec - 12.5% alc, crama Liliac', weight: '750ML', name_en: 'Liliac Rose', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine - 12.5% alc, Liliac winery' },
      { id: 258, name: 'Negrini Rose', category: 'Băuturi și Coctailuri', price: 110.00, description: 'Vin roze sec - 12.9% alc, crama Negrini', weight: '750ML', name_en: 'Negrini Rose', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine - 12.9% alc, Negrini winery' },
      { id: 259, name: 'Caii de la Letea Vol 1 Rose', category: 'Băuturi și Coctailuri', price: 100.00, description: 'Vin roze sec - 12.5% alc, crama Sarica Niculițel', weight: '750ML', name_en: 'Caii de la Letea Vol 1 Rose', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine - 12.5% alc, Sarica Niculițel winery' },
      { id: 260, name: 'Sarica Aniversarium Rose', category: 'Băuturi și Coctailuri', price: 90.00, description: 'Vin roze demisec - 13% alc, crama Sarica Niculițel', weight: '750ML', name_en: 'Sarica Aniversarium Rose', category_en: 'Drinks & Cocktails', description_en: 'Semi-dry rosé wine - 13% alc, Sarica Niculițel winery' },
      { id: 261, name: 'Purcari Nocturne Rose', category: 'Băuturi și Coctailuri', price: 130.00, description: 'Vin roze sec - 13.5% alc, crama Purcari', weight: '750ML', name_en: 'Purcari Nocturne Rose', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine - 13.5% alc, Purcari winery' },
      { id: 262, name: 'Solo Quinta Rose', category: 'Băuturi și Coctailuri', price: 180.00, description: 'Vin roze sec - 13.5% alc, cramele Recaș', weight: '750ML', name_en: 'Solo Quinta Rose', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine - 13.5% alc, Recaș winery' },
      { id: 263, name: 'La Plage Rose', category: 'Băuturi și Coctailuri', price: 140.00, description: 'Vin roze sec - 12.5% alc, crama Rașova', weight: '750ML', name_en: 'La Plage Rose', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine - 12.5% alc, Rașova winery' },
      { id: 264, name: 'Muse Night Rose', category: 'Băuturi și Coctailuri', price: 160.00, description: 'Vin roze demisec - 12.5% alc, crama Recaș', weight: '750ML', name_en: 'Muse Night Rose', category_en: 'Drinks & Cocktails', description_en: 'Semi-dry rosé wine - 12.5% alc, Recaș winery' },
      { id: 265, name: 'Liliac Red Cuvee', category: 'Băuturi și Coctailuri', price: 120.00, description: 'Vin roșu sec - 13.5% alc, crama Liliac', weight: '750ML', name_en: 'Liliac Red Cuvee', category_en: 'Drinks & Cocktails', description_en: 'Dry red wine - 13.5% alc, Liliac winery' },
      { id: 266, name: 'Negrini Negru de Drăgășani', category: 'Băuturi și Coctailuri', price: 110.00, description: 'Vin roșu sec - 13% alc, crama Negrini', weight: '750ML', name_en: 'Negrini Negru de Drăgășani', category_en: 'Drinks & Cocktails', description_en: 'Dry red wine - 13% alc, Negrini winery' },
      { id: 267, name: 'Purcari Nocturne Rară Neagră', category: 'Băuturi și Coctailuri', price: 130.00, description: 'Vin roșu demisec - 12.5% alc, crama Purcari', weight: '750ML', name_en: 'Purcari Nocturne Rară Neagră', category_en: 'Drinks & Cocktails', description_en: 'Semi-dry red wine - 12.5% alc, Purcari winery' },
      { id: 268, name: 'Caii de la Letea Vol 1 Cabernet & Fetească Neagră', category: 'Băuturi și Coctailuri', price: 100.00, description: 'Vin roșu sec - 13.5% alc, crama Sarica Niculițel', weight: '750ML', name_en: 'Caii de la Letea Vol 1 Cabernet & Fetească Neagră', category_en: 'Drinks & Cocktails', description_en: 'Dry red wine - 13.5% alc, Sarica Niculițel winery' },
      { id: 269, name: 'Sarica Aniversarium Roșu', category: 'Băuturi și Coctailuri', price: 90.00, description: 'Vin roșu sec - 13% alc, crama Sarica Niculițel', weight: '750ML', name_en: 'Sarica Aniversarium Red', category_en: 'Drinks & Cocktails', description_en: 'Dry red wine - 13% alc, Sarica Niculițel winery' },
      { id: 270, name: 'Sarica Aniversarium Alb la Pahar', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Vin alb demisec la pahar - 12.5% alc, crama Sarica Niculițel', weight: '150ML', name_en: 'Sarica Aniversarium White by the Glass', category_en: 'Drinks & Cocktails', description_en: 'Semi-dry white wine by the glass - 12.5% alc, Sarica Niculițel winery' },
      { id: 271, name: 'Negrini Sauvignon Blanc & Fetească Regală la Pahar', category: 'Băuturi și Coctailuri', price: 22.00, description: 'Vin alb sec la pahar - 12.7% alc, crama Negrini', weight: '150ML', name_en: 'Negrini Sauvignon Blanc & Fetească Regală by the Glass', category_en: 'Drinks & Cocktails', description_en: 'Dry white wine by the glass - 12.7% alc, Negrini winery' },
      { id: 272, name: 'Negrini Rose la Pahar', category: 'Băuturi și Coctailuri', price: 22.00, description: 'Vin roze sec la pahar - 12.9% alc, crama Negrini', weight: '150ML', name_en: 'Negrini Rose by the Glass', category_en: 'Drinks & Cocktails', description_en: 'Dry rosé wine by the glass - 12.9% alc, Negrini winery' },
      { id: 273, name: 'Sarica Aniversarium Rose la Pahar', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Vin roze demisec la pahar - 13% alc, crama Sarica Niculițel', weight: '150ML', name_en: 'Sarica Aniversarium Rose by the Glass', category_en: 'Drinks & Cocktails', description_en: 'Semi-dry rosé wine by the glass - 13% alc, Sarica Niculițel winery' },
      { id: 274, name: 'Negrini Negru de Drăgășani la Pahar', category: 'Băuturi și Coctailuri', price: 22.00, description: 'Vin roșu sec la pahar - 13% alc, crama Negrini', weight: '150ML', name_en: 'Negrini Negru de Drăgășani by the Glass', category_en: 'Drinks & Cocktails', description_en: 'Dry red wine by the glass - 13% alc, Negrini winery' },
      { id: 275, name: 'Sarica Aniversarium Roșu la Pahar', category: 'Băuturi și Coctailuri', price: 19.00, description: 'Vin roșu sec la pahar - 13% alc, crama Sarica Niculițel', weight: '150ML', name_en: 'Sarica Aniversarium Red by the Glass', category_en: 'Drinks & Cocktails', description_en: 'Dry red wine by the glass - 13% alc, Sarica Niculițel winery' },
      { id: 276, name: 'Lugana DOC', category: 'Băuturi și Coctailuri', price: 130.00, description: 'Vin alb sec import - 13% alc, crama Otella-Italia', weight: '750ML', name_en: 'Lugana DOC', category_en: 'Drinks & Cocktails', description_en: 'Imported dry white wine - 13% alc, Otella winery-Italy' },
      { id: 277, name: 'Roses Roses', category: 'Băuturi și Coctailuri', price: 130.00, description: 'Vin roze sec import - 12% alc, crama Otella-Italia', weight: '750ML', name_en: 'Roses Roses', category_en: 'Drinks & Cocktails', description_en: 'Imported dry rosé wine - 12% alc, Otella winery-Italy' },
      { id: 278, name: 'Bulgarini Lugana', category: 'Băuturi și Coctailuri', price: 180.00, description: 'Vin alb sec import - 12.5% alc', weight: '750ML', name_en: 'Bulgarini Lugana', category_en: 'Drinks & Cocktails', description_en: 'Imported dry white wine - 12.5% alc' },
      { id: 279, name: 'Bulgarini Lugana 010', category: 'Băuturi și Coctailuri', price: 220.00, description: 'Vin alb sec import - 13.5% alc', weight: '750ML', name_en: 'Bulgarini Lugana 010', category_en: 'Drinks & Cocktails', description_en: 'Imported dry white wine - 13.5% alc' },
      { id: 280, name: 'Asti Martini Dolce', category: 'Băuturi și Coctailuri', price: 121.00, description: 'Spumant dulce italian', weight: '750ML', name_en: 'Asti Martini Dolce', category_en: 'Drinks & Cocktails', description_en: 'Sweet Italian sparkling wine' },
      { id: 281, name: 'Prosecco', category: 'Băuturi și Coctailuri', price: 23.00, description: 'Spumant italian', weight: '150ML', name_en: 'Prosecco', category_en: 'Drinks & Cocktails', description_en: 'Italian sparkling wine' }
    ];

    const stmt = db.prepare(`INSERT INTO menu (name, category, price, description, weight, is_vegetarian, is_spicy, is_takeout_only, allergens, name_en, category_en, description_en, allergens_en) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
    menuItems.forEach(item => {
        stmt.run(
            item.name, 
            item.category, 
            item.price, 
            item.description, 
            item.weight || '', 
            item.is_vegetarian || 0, 
            item.is_spicy || 0,
            item.is_takeout_only || 0,
            item.allergens || null,
            item.name_en,
            item.category_en,
            item.description_en,
            item.allergens_en || null
        );
    });
  
    stmt.finalize((err) => {
        if (!err) {
            console.log('Meniul real al restaurantului a fost adăugat în baza de date.');
            
            const customizations = [
              // Omlete (IDs 2, 4)
              { menu_item_id: 2, option_name: 'Fără bacon', option_type: 'exclude', extra_price: 0, option_name_en: 'No bacon' },
              { menu_item_id: 2, option_name: 'Fără ciuperci', option_type: 'exclude', extra_price: 0, option_name_en: 'No mushrooms' },
              { menu_item_id: 2, option_name: 'Fără ceapă', option_type: 'exclude', extra_price: 0, option_name_en: 'No onion' },
              { menu_item_id: 2, option_name: 'Extra mozzarella', option_type: 'topping', extra_price: 7, option_name_en: 'Extra mozzarella' },
              { menu_item_id: 4, option_name: 'Fără șuncă', option_type: 'exclude', extra_price: 0, option_name_en: 'No ham' },
              { menu_item_id: 4, option_name: 'Extra bacon', option_type: 'topping', extra_price: 8, option_name_en: 'Extra bacon' },

              // Ciorbe (IDs 19-23)
              ...[19, 20, 22].flatMap(id => [
                { menu_item_id: id, option_name: 'Smântână', option_type: 'topping', extra_price: 5, option_name_en: 'Sour Cream' },
                { menu_item_id: id, option_name: 'Ardei iute', option_type: 'topping', extra_price: 3, option_name_en: 'Hot Pepper' },
              ]),
              { menu_item_id: 21, option_name: 'Extra smântână', option_type: 'topping', extra_price: 5, option_name_en: 'Extra Sour Cream' },
              { menu_item_id: 21, option_name: 'Ardei iute', option_type: 'topping', extra_price: 3, option_name_en: 'Hot Pepper' },
              { menu_item_id: 21, option_name: 'Extra oțet', option_type: 'topping', extra_price: 0, option_name_en: 'Extra Vinegar' },
              { menu_item_id: 21, option_name: 'Extra usturoi', option_type: 'topping', extra_price: 0, option_name_en: 'Extra Garlic' },
              { menu_item_id: 23, option_name: 'Fără crutoane', option_type: 'exclude', extra_price: 0, option_name_en: 'No Croutons' },

              // Paste (IDs 24-35)
              ...Array.from({ length: 12 }, (_, i) => i + 24).flatMap(id => [
                { menu_item_id: id, option_name: 'Extra Brânză Dură', option_type: 'topping', extra_price: 7, option_name_en: 'Extra Hard Cheese' }
              ]),
              ...[26, 31, 32].flatMap(id => [
                { menu_item_id: id, option_name: 'Extra picant', option_type: 'topping', extra_price: 3, option_name_en: 'Extra Spicy' }
              ]),

              // Fel Principal - Schimbare garnituri
              { menu_item_id: 45, option_name: 'Înlocuiește piure cu cartofi prăjiți', option_type: 'garnish_swap', extra_price: 0, option_name_en: 'Replace mashed potatoes with french fries' }, // Piept de pui
              { menu_item_id: 46, option_name: 'Înlocuiește cartofii prăjiți cu piure', option_type: 'garnish_swap', extra_price: 2, option_name_en: 'Replace french fries with mashed potatoes' }, // Pulpe
              { menu_item_id: 50, option_name: 'Înlocuiește cartofii zdrobiți cu cartofi prăjiți', option_type: 'garnish_swap', extra_price: 0, option_name_en: 'Replace smashed potatoes with french fries' }, // Polo Parmegiano
              { menu_item_id: 69, option_name: 'Înlocuiește piure cu trufe cu cartofi prăjiți', option_type: 'garnish_swap', extra_price: 0, option_name_en: 'Replace truffle mashed potatoes with french fries' }, // Pulpa de rata
              
              // Fel Principal - Grad de gătire pentru vită (IDs 64, 65, 66, 70)
              ...[64, 65, 66, 70].flatMap(id => [
                { menu_item_id: id, option_name: 'În sânge', option_type: 'cooking_level', extra_price: 0, option_name_en: 'Rare' },
                { menu_item_id: id, option_name: 'Mediu', option_type: 'cooking_level', extra_price: 0, option_name_en: 'Medium' },
                { menu_item_id: id, option_name: 'Bine făcut', option_type: 'cooking_level', extra_price: 0, option_name_en: 'Well-done' },
              ]),

              // Burgeri (IDs 74-77)
              ...[74, 75].flatMap(id => [ // Burger de Vită & Picant
                { menu_item_id: id, option_name: 'Fără roșii', option_type: 'exclude', extra_price: 0, option_name_en: 'No tomatoes' },
                { menu_item_id: id, option_name: 'Fără salată', option_type: 'exclude', extra_price: 0, option_name_en: 'No lettuce' },
                { menu_item_id: id, option_name: 'Fără castraveți murați', option_type: 'exclude', extra_price: 0, option_name_en: 'No pickles' },
                { menu_item_id: id, option_name: 'Fără ceddar', option_type: 'exclude', extra_price: 0, option_name_en: 'No cheddar' },
                { menu_item_id: id, option_name: 'Fără ceapă roșie', option_type: 'exclude', extra_price: 0, option_name_en: 'No red onion' },
                { menu_item_id: id, option_name: 'Extra bacon', option_type: 'topping', extra_price: 8, option_name_en: 'Extra bacon' },
                { menu_item_id: id, option_name: 'Extra ceddar', option_type: 'topping', extra_price: 6, option_name_en: 'Extra cheddar' },
              ]),
              { menu_item_id: 75, option_name: 'Fără jalapeno', option_type: 'exclude', extra_price: 0, option_name_en: 'No jalapeno' },
              { menu_item_id: 75, option_name: 'Extra jalapeno', option_type: 'topping', extra_price: 5, option_name_en: 'Extra jalapeno' },
              { menu_item_id: 76, option_name: 'Fără roșii', option_type: 'exclude', extra_price: 0, option_name_en: 'No tomatoes' }, // Burger Crispy
              { menu_item_id: 76, option_name: 'Fără salată', option_type: 'exclude', extra_price: 0, option_name_en: 'No lettuce' },
              { menu_item_id: 76, option_name: 'Extra bacon', option_type: 'topping', extra_price: 8, option_name_en: 'Extra bacon' },
              { menu_item_id: 77, option_name: 'Fără roșii', option_type: 'exclude', extra_price: 0, option_name_en: 'No tomatoes' }, // Halloumi Burger
              { menu_item_id: 77, option_name: 'Fără salată', option_type: 'exclude', extra_price: 0, option_name_en: 'No lettuce' },

              // Salate (IDs 80-85)
              { menu_item_id: 81, option_name: 'Fără anșoa', option_type: 'exclude', extra_price: 0, option_name_en: 'No anchovies' }, // Caesar
              { menu_item_id: 81, option_name: 'Fără crutoane', option_type: 'exclude', extra_price: 0, option_name_en: 'No croutons' },
              { menu_item_id: 81, option_name: 'Extra piept de pui', option_type: 'topping', extra_price: 10, option_name_en: 'Extra chicken breast' },
              { menu_item_id: 84, option_name: 'Fără ceapă', option_type: 'exclude', extra_price: 0, option_name_en: 'No onion' }, // Greceasca
              { menu_item_id: 84, option_name: 'Fără măsline', option_type: 'exclude', extra_price: 0, option_name_en: 'No olives' },

              // Pizza (IDs 86-100)
              ...Array.from({ length: 15 }, (_, i) => i + 86).flatMap(id => [
                { menu_item_id: id, option_name: 'Extra Mozzarella', option_type: 'topping', extra_price: 7, option_name_en: 'Extra Mozzarella' },
              { menu_item_id: id, option_name: 'Extra Șuncă', option_type: 'topping', extra_price: 8, option_name_en: 'Extra Ham' },
              { menu_item_id: id, option_name: 'Extra Salam', option_type: 'topping', extra_price: 8, option_name_en: 'Extra Salami' },
              { menu_item_id: id, option_name: 'Extra Ciuperci', option_type: 'topping', extra_price: 6, option_name_en: 'Extra Mushrooms' },
              { menu_item_id: id, option_name: 'Extra Măsline', option_type: 'topping', extra_price: 5, option_name_en: 'Extra Olives' },
              { menu_item_id: id, option_name: 'Extra Porumb', option_type: 'topping', extra_price: 5, option_name_en: 'Extra Corn' },
              { menu_item_id: id, option_name: 'Extra Bacon', option_type: 'topping', extra_price: 9, option_name_en: 'Extra Bacon' },
              { menu_item_id: id, option_name: 'Extra Gorgonzola', option_type: 'topping', extra_price: 9, option_name_en: 'Extra Gorgonzola' },
              { menu_item_id: id, option_name: 'Extra Ardei Kapia', option_type: 'topping', extra_price: 5, option_name_en: 'Extra Kapia Pepper' },
              { menu_item_id: id, option_name: 'Extra Ceapă', option_type: 'topping', extra_price: 4, option_name_en: 'Extra Onion' },
              { menu_item_id: id, option_name: 'Extra Ton', option_type: 'topping', extra_price: 10, option_name_en: 'Extra Tuna' },
              { menu_item_id: id, option_name: 'Extra Prosciutto Crudo', option_type: 'topping', extra_price: 12, option_name_en: 'Extra Prosciutto Crudo' },
              { menu_item_id: id, option_name: 'Extra Salam Picant', option_type: 'topping', extra_price: 9, option_name_en: 'Extra Spicy Salami' },
              { menu_item_id: id, option_name: 'Extra Piept de Pui', option_type: 'topping', extra_price: 8, option_name_en: 'Extra Chicken Breast' },
              { menu_item_id: id, option_name: 'Fără Mozzarella', option_type: 'exclude', extra_price: 0, option_name_en: 'No Mozzarella' },
              { menu_item_id: id, option_name: 'Fără Șuncă', option_type: 'exclude', extra_price: 0, option_name_en: 'No Ham' },
              { menu_item_id: id, option_name: 'Fără Salam', option_type: 'exclude', extra_price: 0, option_name_en: 'No Salami' },
              { menu_item_id: id, option_name: 'Fără Ciuperci', option_type: 'exclude', extra_price: 0, option_name_en: 'No Mushrooms' },
              { menu_item_id: id, option_name: 'Fără Măsline', option_type: 'exclude', extra_price: 0, option_name_en: 'No Olives' },
              { menu_item_id: id, option_name: 'Fără Porumb', option_type: 'exclude', extra_price: 0, option_name_en: 'No Corn' },
              { menu_item_id: id, option_name: 'Fără Bacon', option_type: 'exclude', extra_price: 0, option_name_en: 'No Bacon' },
              { menu_item_id: id, option_name: 'Fără Gorgonzola', option_type: 'exclude', extra_price: 0, option_name_en: 'No Gorgonzola' },
              { menu_item_id: id, option_name: 'Fără Ardei', option_type: 'exclude', extra_price: 0, option_name_en: 'No Pepper' },
              { menu_item_id: id, option_name: 'Fără Ceapă', option_type: 'exclude', extra_price: 0, option_name_en: 'No Onion' }
              ]),

              // Deserturi - Papanasi (ID 124)
              { menu_item_id: 124, option_name: 'Topping de Ciocolată', option_type: 'option', extra_price: 0, option_name_en: 'Chocolate Topping' },
              { menu_item_id: 124, option_name: 'Topping de Afine', option_type: 'option', extra_price: 0, option_name_en: 'Blueberry Topping' },
              { menu_item_id: 124, option_name: 'Topping de Vișine', option_type: 'option', extra_price: 0, option_name_en: 'Sour Cherry Topping' },
              { menu_item_id: 124, option_name: 'Topping Fructe de Pădure', option_type: 'option', extra_price: 0, option_name_en: 'Forest Fruit Topping' },

              // Cafele (IDs 126-141)
              ...Array.from({ length: 16 }, (_, i) => i + 126).flatMap(id => [
                { menu_item_id: id, option_name: 'Zahăr alb', option_type: 'topping', extra_price: 0, option_name_en: 'White Sugar' },
                { menu_item_id: id, option_name: 'Zahăr brun', option_type: 'topping', extra_price: 0.5, option_name_en: 'Brown Sugar' },
                { menu_item_id: id, option_name: 'Îndulcitor', option_type: 'topping', extra_price: 1, option_name_en: 'Sweetener' },
              ]),
              ...[131, 132, 133, 134, 135, 136, 137].flatMap(id => [{ menu_item_id: id, option_name: 'Lapte de Ovăz', option_type: 'topping', extra_price: 3, option_name_en: 'Oat Milk' }]), // Cafele cu lapte
              ...[132, 142].flatMap(id => [
                { menu_item_id: id, option_name: 'Aromă Vanilie', option_type: 'option', extra_price: 0, option_name_en: 'Vanilla Flavor' },
              { menu_item_id: id, option_name: 'Aromă Caramel', option_type: 'option', extra_price: 0, option_name_en: 'Caramel Flavor' },
              { menu_item_id: id, option_name: 'Aromă Ciocolată', option_type: 'option', extra_price: 0, option_name_en: 'Chocolate Flavor' }
              ]),

              // Răcoritoare (IDs 149-171)
              ...[149, 150, 151, 152, 153, 154, 157, 158, 159, 160, 161, 162, 163, 164, 165].flatMap(id => [
                  { menu_item_id: id, option_name: 'Cu gheață', option_type: 'option', extra_price: 0, option_name_en: 'With ice' },
                  { menu_item_id: id, option_name: 'Fără gheață', option_type: 'option', extra_price: 0, option_name_en: 'Without ice' },
              ]),
              
              // Limonade (IDs 166-171)
              ...Array.from({ length: 6 }, (_, i) => i + 166).flatMap(id => [
                  { menu_item_id: id, option_name: 'Cu gheață', option_type: 'option', extra_price: 0, option_name_en: 'With ice' },
                  { menu_item_id: id, option_name: 'Fără gheață', option_type: 'option', extra_price: 0, option_name_en: 'Without ice' },
                  { menu_item_id: id, option_name: 'Cu zahăr', option_type: 'option', extra_price: 0, option_name_en: 'With sugar' },
                  { menu_item_id: id, option_name: 'Fără zahăr', option_type: 'option', extra_price: 0, option_name_en: 'Without sugar' },
                  { menu_item_id: id, option_name: 'Cu miere', option_type: 'option', extra_price: 4, option_name_en: 'With honey' },
              ]),

              // Fresh-uri (IDs 172-174)
              ...[172, 173, 174].flatMap(id => [
                { menu_item_id: id, option_name: 'Cu gheață', option_type: 'option', extra_price: 0, option_name_en: 'With ice' },
                { menu_item_id: id, option_name: 'Fără gheață', option_type: 'option', extra_price: 0, option_name_en: 'Without ice' },
              ]),
            ];

            const customStmt = db.prepare(`INSERT INTO customization_options (menu_item_id, option_name, option_type, extra_price, option_name_en) VALUES (?, ?, ?, ?, ?)`);
            customizations.forEach(custom => {
              customStmt.run(custom.menu_item_id, custom.option_name, custom.option_type, custom.extra_price, custom.option_name_en);
            });
            customStmt.finalize((customErr) => {
              if (!customErr) {
                console.log('Personalizările au fost adăugate cu succes.');
                resolve();
              } else {
                reject(customErr);
              }
            });
        } else {
            reject(err);
        }
    });
  });
}

// Funcție pentru inițializarea stocurilor pentru toate produsele
function initializeStockForAllProducts(db) {
  return new Promise((resolve, reject) => {
    // Obține toate produsele din meniu
    db.all("SELECT id FROM menu", (err, products) => {
      if (err) {
        console.error('Eroare la obținerea produselor:', err.message);
        return reject(err);
      }

      if (products.length === 0) {
        console.log('Nu există produse în meniu pentru inițializarea stocurilor.');
        return resolve();
      }

      let completed = 0;
      let hasError = false;

      products.forEach(product => {
        // Verifică dacă stocul pentru acest produs există deja
        db.get("SELECT id FROM product_stock WHERE product_id = ?", [product.id], (err, existingStock) => {
          if (err) {
            console.error(`Eroare la verificarea stocului pentru produsul ${product.id}:`, err.message);
            hasError = true;
            return;
          }

          if (!existingStock) {
            // Inițializează stocul pentru produs
            const initialStock = 50; // Stoc inițial pentru toate produsele
            const minStock = 5;
            const maxStock = 100;

            db.run(
              "INSERT INTO product_stock (product_id, current_stock, min_stock, max_stock, is_auto_managed) VALUES (?, ?, ?, ?, ?)",
              [product.id, initialStock, minStock, maxStock, 1],
              (err) => {
                if (err) {
                  console.error(`Eroare la inițializarea stocului pentru produsul ${product.id}:`, err.message);
                  hasError = true;
                } else {
                  console.log(`Stoc inițializat pentru produsul ${product.id}: ${initialStock} bucăți`);
                }

                completed++;
                if (completed === products.length) {
                  if (hasError) {
                    reject(new Error('Erori la inițializarea stocurilor'));
                  } else {
                    console.log('Toate stocurile au fost inițializate cu succes.');
                    resolve();
                  }
                }
              }
            );
          } else {
            completed++;
            if (completed === products.length) {
              if (hasError) {
                reject(new Error('Erori la inițializarea stocurilor'));
              } else {
                console.log('Toate stocurile au fost inițializate cu succes.');
                resolve();
              }
            }
          }
        });
      });
    });
  });
}

// Funcție pentru inițializarea mesajelor predefinite
function initializePredefinedMessages(db) {
  return new Promise((resolve, reject) => {
    // Verifică dacă mesajele predefinite există deja
    db.get("SELECT COUNT(*) as count FROM predefined_messages", (err, row) => {
      if (err) {
        console.error('Eroare la verificarea mesajelor predefinite:', err.message);
        return reject(err);
      }

      if (row.count > 0) {
        console.log('Mesajele predefinite există deja.');
        return resolve();
      }

      console.log('Se inițializează mesajele predefinite...');

      const predefinedMessages = [
        // Ospătar → Bucătărie
        { sender_role: 'waiter', receiver_role: 'kitchen', message_text: 'Grăbește comanda pentru Masa {table}' },
        { sender_role: 'waiter', receiver_role: 'kitchen', message_text: 'Clientul întreabă de comanda Masa {table}' },
        { sender_role: 'waiter', receiver_role: 'kitchen', message_text: 'Anulează produsul {product} din comanda Masa {table}' },
        { sender_role: 'waiter', receiver_role: 'kitchen', message_text: 'Modifică cantitatea produsului {product} la Masa {table}' },
        { sender_role: 'waiter', receiver_role: 'kitchen', message_text: 'Comanda Masa {table} este urgentă' },
        { sender_role: 'waiter', receiver_role: 'kitchen', message_text: 'Clientul vrea să schimbe comanda Masa {table}' },

        // Ospătar → Bar
        { sender_role: 'waiter', receiver_role: 'bar', message_text: 'Grăbește băuturile pentru Masa {table}' },
        { sender_role: 'waiter', receiver_role: 'bar', message_text: 'Clientul întreabă de băuturile Masa {table}' },
        { sender_role: 'waiter', receiver_role: 'bar', message_text: 'Anulează băutura {product} din comanda Masa {table}' },
        { sender_role: 'waiter', receiver_role: 'bar', message_text: 'Comanda de băuturi Masa {table} este urgentă' },

        // Bucătărie → Ospătar
        { sender_role: 'kitchen', receiver_role: 'waiter', message_text: 'Comanda Masa {table} este aproape gata' },
        { sender_role: 'kitchen', receiver_role: 'waiter', message_text: 'Comanda Masa {table} este gata de livrare' },
        { sender_role: 'kitchen', receiver_role: 'waiter', message_text: 'Nu mai avem ingredientul {ingredient}' },
        { sender_role: 'kitchen', receiver_role: 'waiter', message_text: 'Avem nevoie de lămuriri la comanda Masa {table}' },
        { sender_role: 'kitchen', receiver_role: 'waiter', message_text: 'Comanda Masa {table} va întârzia cu {minutes} minute' },
        { sender_role: 'kitchen', receiver_role: 'waiter', message_text: 'Produsul {product} din comanda Masa {table} nu mai este disponibil' },

        // Bar → Ospătar
        { sender_role: 'bar', receiver_role: 'waiter', message_text: 'Băuturile pentru Masa {table} sunt gata' },
        { sender_role: 'bar', receiver_role: 'waiter', message_text: 'Nu mai avem băutura {product}' },
        { sender_role: 'bar', receiver_role: 'waiter', message_text: 'Avem nevoie de lămuriri la băuturile Masa {table}' },
        { sender_role: 'bar', receiver_role: 'waiter', message_text: 'Băuturile Masa {table} vor întârzia cu {minutes} minute' }
      ];

      let completed = 0;
      let hasError = false;

      predefinedMessages.forEach(message => {
        db.run(
          "INSERT INTO predefined_messages (sender_role, receiver_role, message_text, is_active) VALUES (?, ?, ?, ?)",
          [message.sender_role, message.receiver_role, message.message_text, 1],
          (err) => {
            if (err) {
              console.error(`Eroare la adăugarea mesajului predefinit:`, err.message);
              hasError = true;
            }

            completed++;
            if (completed === predefinedMessages.length) {
              if (hasError) {
                reject(new Error('Erori la inițializarea mesajelor predefinite'));
              } else {
                console.log('Toate mesajele predefinite au fost inițializate cu succes.');
                resolve();
              }
            }
          }
        );
      });
    });
  });
}

// Funcție pentru inițializarea automată a meniului zilei
async function initializeDailyMenu(db) {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().slice(0, 10);
    
    // Verifică dacă există deja un meniu pentru ziua curentă
    db.get("SELECT * FROM daily_menu WHERE date = ?", [today], (err, existingMenu) => {
      if (err) {
        console.error('Eroare la verificarea meniului zilei:', err.message);
        return reject(err);
      }

      if (existingMenu) {
        console.log('Meniul zilei pentru astăzi există deja.');
        return resolve();
      }

      // Verifică dacă există o excepție pentru ziua curentă
      db.get("SELECT * FROM daily_menu_exceptions WHERE date = ? AND is_active = 1", [today], (err, exception) => {
        if (err) {
          console.error('Eroare la verificarea excepției meniului zilei:', err.message);
          return reject(err);
        }

        if (exception) {
          // Creează meniul zilei pe baza excepției
          db.run(
            "INSERT INTO daily_menu (date, soup_id, main_course_id, discount, is_active) VALUES (?, ?, ?, ?, ?)",
            [today, exception.soup_id, exception.main_course_id, exception.discount, 1],
            (err) => {
              if (err) {
                console.error('Eroare la crearea meniului zilei din excepție:', err.message);
                return reject(err);
              }
              console.log('Meniul zilei a fost creat din excepție pentru astăzi.');
              resolve();
            }
          );
          return;
        }

        // Verifică dacă există o programare activă pentru ziua curentă
        db.get(
          "SELECT * FROM daily_menu_schedule WHERE start_date <= ? AND end_date >= ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
          [today, today],
          (err, schedule) => {
            if (err) {
              console.error('Eroare la verificarea programării meniului zilei:', err.message);
              return reject(err);
            }

            if (schedule) {
              // Creează meniul zilei pe baza programării
              db.run(
                "INSERT INTO daily_menu (date, soup_id, main_course_id, discount, is_active) VALUES (?, ?, ?, ?, ?)",
                [today, schedule.soup_id, schedule.main_course_id, schedule.discount, 1],
                (err) => {
                  if (err) {
                    console.error('Eroare la crearea meniului zilei din programare:', err.message);
                    return reject(err);
                  }
                  console.log('Meniul zilei a fost creat din programare pentru astăzi.');
                  resolve();
                }
              );
            } else {
              console.log('Nu există programare sau excepție pentru meniul zilei astăzi.');
              resolve();
            }
          }
        );
      });
    });

    // 🚀 OPTIMIZARE PERFORMANȚĂ: Adăugare indexuri SQL pentru viteza crescută
    console.log('🔍 Creez indexuri pentru optimizarea performanței...');
    
    // Indexuri pentru tabela orders (cea mai critică pentru performanță)
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)`, (err) => {
      if (err) console.error('Eroare la crearea indexului orders_status:', err.message);
      else console.log('✅ Index orders_status creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders (table_number)`, (err) => {
      if (err) console.error('Eroare la crearea indexului orders_table_number:', err.message);
      else console.log('✅ Index orders_table_number creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders (timestamp)`, (err) => {
      if (err) console.error('Eroare la crearea indexului orders_timestamp:', err.message);
      else console.log('✅ Index orders_timestamp creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_is_paid ON orders (is_paid)`, (err) => {
      if (err) console.error('Eroare la crearea indexului orders_is_paid:', err.message);
      else console.log('✅ Index orders_is_paid creat');
    });
    
    // Indexuri pentru tabela menu (pentru căutări rapide)
    db.run(`CREATE INDEX IF NOT EXISTS idx_menu_category ON menu (category)`, (err) => {
      if (err) console.error('Eroare la crearea indexului menu_category:', err.message);
      else console.log('✅ Index menu_category creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_menu_is_vegetarian ON menu (is_vegetarian)`, (err) => {
      if (err) console.error('Eroare la crearea indexului menu_is_vegetarian:', err.message);
      else console.log('✅ Index menu_is_vegetarian creat');
    });
    
    // Indexuri pentru tabela notifications (pentru notificări rapide)
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (status)`, (err) => {
      if (err) console.error('Eroare la crearea indexului notifications_status:', err.message);
      else console.log('✅ Index notifications_status creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at)`, (err) => {
      if (err) console.error('Eroare la crearea indexului notifications_created_at:', err.message);
      else console.log('✅ Index notifications_created_at creat');
    });
    
    // Indexuri pentru tabela feedback (pentru rapoarte rapide)
    db.run(`CREATE INDEX IF NOT EXISTS idx_feedback_order_id ON feedback (order_id)`, (err) => {
      if (err) console.error('Eroare la crearea indexului feedback_order_id:', err.message);
      else console.log('✅ Index feedback_order_id creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback (timestamp)`, (err) => {
      if (err) console.error('Eroare la crearea indexului feedback_timestamp:', err.message);
      else console.log('✅ Index feedback_timestamp creat');
    });
    
    // Indexuri pentru tabela ingredients (pentru gestionarea stocurilor)
    db.run(`CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients (category)`, (err) => {
      if (err) console.error('Eroare la crearea indexului ingredients_category:', err.message);
      else console.log('✅ Index ingredients_category creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_ingredients_is_available ON ingredients (is_available)`, (err) => {
      if (err) console.error('Eroare la crearea indexului ingredients_is_available:', err.message);
      else console.log('✅ Index ingredients_is_available creat');
    });
    
    // Indexuri pentru tabela recipes (pentru gestionarea rețetelor)
    db.run(`CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON recipes (product_id)`, (err) => {
      if (err) console.error('Eroare la crearea indexului recipes_product_id:', err.message);
      else console.log('✅ Index recipes_product_id creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_recipes_ingredient_id ON recipes (ingredient_id)`, (err) => {
      if (err) console.error('Eroare la crearea indexului recipes_ingredient_id:', err.message);
      else console.log('✅ Index recipes_ingredient_id creat');
    });
    
    // Indexuri pentru tabela product_stock (pentru gestionarea stocurilor produselor)
    db.run(`CREATE INDEX IF NOT EXISTS idx_product_stock_product_id ON product_stock (product_id)`, (err) => {
      if (err) console.error('Eroare la crearea indexului product_stock_product_id:', err.message);
      else console.log('✅ Index product_stock_product_id creat');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_product_stock_is_auto_managed ON product_stock (is_auto_managed)`, (err) => {
      if (err) console.error('Eroare la crearea indexului product_stock_is_auto_managed:', err.message);
      else console.log('✅ Index product_stock_is_auto_managed creat');
    });
    
    console.log('🎯 Toate indexurile au fost create cu succes! Performanța bazei de date a fost optimizată.');
  });
}

/**
 * 🔥 FUNCȚIE CRITICĂ: Scade stocul de materie primă pe baza rețetelor
 * @param {Array} ingredientsToDecrease - Array de obiecte {ingredient_id, quantity}
 * @returns {Promise} - Promisiune care se rezolvă când stocul e actualizat
 * 
 * Exemplu utilizare:
 * await decreaseIngredientStock([
 *   {ingredient_id: 1, quantity: 0.5},
 *   {ingredient_id: 2, quantity: 0.2}
 * ]);
 */
function decreaseIngredientStock(ingredientsToDecrease, orderId = null) {
  console.log(`🔵🔵 [ETAPA 4] decreaseIngredientStock called with ${ingredientsToDecrease ? ingredientsToDecrease.length : 0} ingredients`);
  return dbPromise.then(db => {
    console.log(`🔵🔵 dbPromise resolved in decreaseIngredientStock`);
    return new Promise((resolve, reject) => {
      if (!ingredientsToDecrease || ingredientsToDecrease.length === 0) {
        console.log('⚠️ Nu există ingrediente de scăzut din stoc');
        return resolve();
      }

      console.log(`🔵🔵 Starting transaction for ${ingredientsToDecrease.length} ingredients`);
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('❌ Eroare la începerea tranzacției:', err);
          return reject(err);
        }
        console.log(`✅✅ Transaction BEGIN successful`);

        let decreasePromises = [];

        ingredientsToDecrease.forEach((ing, idx) => {
          // ETAPA 4: Log location_id dacă este specificat
          const locationInfo = ing.location_id ? ` (Location: ${ing.location_id})` : ' (Location: global)';
          console.log(`🔵🔵 Processing ingredient ${idx + 1}/${ingredientsToDecrease.length}: ID ${ing.ingredient_id}, Qty: ${ing.quantity}${locationInfo}`);
          decreasePromises.push(new Promise((res, rej) => {
            // Verificăm stocul curent
            console.log(`🔵🔵 Querying ingredient ${ing.ingredient_id}...`);
            // ETAPA 4: Filtrare după location_id dacă este specificat
            const query = ing.location_id
              ? 'SELECT id, name, current_stock, min_stock, unit, location_id FROM ingredients WHERE id = ? AND location_id = ?'
              : 'SELECT id, name, current_stock, min_stock, unit, location_id FROM ingredients WHERE id = ?';
            const params = ing.location_id ? [ing.ingredient_id, ing.location_id] : [ing.ingredient_id];
            
            db.get(query, params, (selectErr, ingredient) => {
                if (selectErr) {
                  console.error(`❌ Eroare la verificarea ingredient ${ing.ingredient_id}:`, selectErr);
                  return rej(selectErr);
                }

                if (!ingredient) {
                  console.warn(`⚠️ Ingredientul ID ${ing.ingredient_id} nu există în baza de date`);
                  console.log(`✅✅ Resolving promise for missing ingredient ${ing.ingredient_id}`);
                  return res();
                }
                
                console.log(`✅✅ Found ingredient ${ing.ingredient_id}: ${ingredient.name}, Stock: ${ingredient.current_stock}`);

                // Verificăm dacă avem stoc suficient
                if (ingredient.current_stock < ing.quantity) {
                  if (ingredient.name === 'Blat de pizza (standard)') {
                    console.log(`🍕 Stoc insuficient pentru ${ingredient.name}, încerc să produc ${ing.quantity}g...`);
                    producePizzaDough(ing.quantity)
                      .then(() => {
                        console.log(`✅ Blat de pizza produs cu succes: ${ing.quantity}g`);
                        res();
                      })
                      .catch(err => {
                        console.error('❌ Eroare la producerea blatului:', err);
                        rej(err);
                      });
                    return;
                  } else {
                    const error = new Error(
                      `Stoc insuficient pentru ${ingredient.name}: ` +
                      `necesar ${ing.quantity} ${ingredient.unit}, ` +
                      `disponibil ${ingredient.current_stock} ${ingredient.unit}`
                    );
                    console.error(`❌ ${error.message}`);
                    return rej(error);
                  }
                }

                // Scădem stocul folosind sistemul FIFO
                // ETAPA 4: Include location_id în apelul decreaseStockFIFO
                const locationId = ing.location_id || ingredient.location_id || null;
                console.log(`🔵🔵 Calling decreaseStockFIFO for ${ingredient.name} (location: ${locationId})...`);
                decreaseStockFIFO(db, ing.ingredient_id, ing.quantity, orderId, locationId)
                  .then(() => {
                    console.log(`✅✅✅ ${ingredient.name}: scăzut ${ing.quantity} ${ingredient.unit} (FIFO, location: ${locationId})`);
                    res();
                  })
                  .catch(err => {
                    console.error(`❌❌ Eroare la scăderea stocului FIFO pentru ${ingredient.name}:`, err);
                    rej(err);
                  });
              }
            );
          }));
        });

        console.log(`🔵🔵 Waiting for ${decreasePromises.length} decrease promises...`);
        Promise.all(decreasePromises)
          .then(() => {
            console.log(`✅✅ All decrease promises resolved, committing...`);
            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                console.error('❌ Eroare la COMMIT tranzacție:', commitErr);
                return reject(commitErr);
              }
              console.log('✅✅✅ Tranzacție COMMIT: Stocul de ingrediente actualizat cu succes (FIFO)');
              resolve();
            });
          })
          .catch(rollbackErr => {
            console.error(`🔴🔴 Promise.all rejected:`, rollbackErr);
            db.run('ROLLBACK', (rbErr) => {
              if (rbErr) console.error('❌ Eroare la ROLLBACK tranzacție:', rbErr);
              console.error('❌ Tranzacție ROLLBACK: Eroare la scăderea stocului de ingrediente');
              reject(rollbackErr);
            });
          });
      });
    });
  });
}

/**
 * 🔄 FUNCȚIE COMPLEMENTARĂ: Crește stocul de materie primă (pentru anulări/returnări)
 * @param {Array} ingredientsToIncrease - Array de obiecte {ingredient_id, quantity}
 * @returns {Promise} - Promisiune care se rezolvă când stocul e actualizat
 */
function increaseIngredientStock(ingredientsToIncrease) {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      // Verificare input
      if (!ingredientsToIncrease || ingredientsToIncrease.length === 0) {
        console.log('⚠️ Nu există ingrediente de adăugat în stoc');
        return resolve();
      }

      // Începem tranzacția
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('❌ Eroare la începerea tranzacției (increase):', err);
          return reject(err);
        }

        let increasePromises = [];

        // Iterăm peste ingredientele care trebuie adăugate în stoc
        ingredientsToIncrease.forEach(ing => {
          increasePromises.push(new Promise((res, rej) => {
            // Verificăm ingredientul
            db.get('SELECT id, name, current_stock, unit FROM ingredients WHERE id = ?', 
              [ing.ingredient_id], 
              (selectErr, ingredient) => {
                if (selectErr) {
                  console.error(`❌ Eroare la verificarea ingredient ${ing.ingredient_id}:`, selectErr);
                  return rej(selectErr);
                }

                if (!ingredient) {
                  console.warn(`⚠️ Ingredientul ID ${ing.ingredient_id} nu există în baza de date`);
                  return res(); // Nu e eroare critică
                }

                // Creștem stocul
                const sql = `
                  UPDATE ingredients
                  SET current_stock = current_stock + ?,
                      last_updated = CURRENT_TIMESTAMP
                  WHERE id = ?
                `;
                
                db.run(sql, [ing.quantity, ing.ingredient_id], function(updateErr) {
                  if (updateErr) {
                    console.error(`❌ Eroare la creșterea stocului pentru ingredient ${ing.ingredient_id}:`, updateErr);
                    return rej(updateErr);
                  }

                  const newStock = ingredient.current_stock + ing.quantity;
                  console.log(
                    `✅ ${ingredient.name}: ${ingredient.current_stock} → ${newStock} ${ingredient.unit} ` +
                    `(adăugat ${ing.quantity} ${ingredient.unit})`
                  );

                  res();
                });
              }
            );
          }));
        });

        // Așteptăm ca toate promisiunile să fie finalizate
        Promise.all(increasePromises)
          .then(() => {
            // COMMIT tranzacția
            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                console.error('❌ Eroare la COMMIT tranzacție (increase):', commitErr);
                return reject(commitErr);
              }
              console.log('✅ Tranzacție COMMIT: Stocul de ingrediente restituit cu succes');
              resolve();
            });
          })
          .catch(error => {
            // ROLLBACK în caz de eroare
            db.run('ROLLBACK', () => {
              console.error('❌ ROLLBACK tranzacție (increase) din cauza erorii:', error.message);
              reject(error);
            });
          });
      });
    });
  });
}

/**
 * 🍕 FUNCȚIE PENTRU PRODUCȚIA DE BLAT DE PIZZA
 * Când nu mai este blat de pizza pe stoc, bucătăreasa îl face din ingrediente de bază
 * @param {number} quantityNeeded - Cantitatea de blat necesară (în g)
 * @returns {Promise} - Promisiune care se rezolvă când blatul e produs
 */
function producePizzaDough(quantityNeeded) {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      console.log(`🍕 Produc blat de pizza: ${quantityNeeded}g`);
      
      // Rețeta pentru 250g blat de pizza:
      // - Făină: 150g
      // - Apă: 90g  
      // - Drojdie proaspătă: 3g
      // - Sare: 3g
      // - Ulei de măsline: 5g
      
      const doughRecipe = [
        { name: 'Făină', needed: (quantityNeeded * 150) / 250 }, // 150g pentru 250g blat
        { name: 'Apă', needed: (quantityNeeded * 90) / 250 },    // 90g pentru 250g blat
        { name: 'Drojdie proaspătă', needed: (quantityNeeded * 3) / 250 }, // 3g pentru 250g blat
        { name: 'Sare', needed: (quantityNeeded * 3) / 250 },    // 3g pentru 250g blat
        { name: 'Ulei de măsline', needed: (quantityNeeded * 5) / 250 } // 5g pentru 250g blat
      ];
      
      // Începem tranzacția
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('❌ Eroare la începerea tranzacției pentru producția de blat:', err);
          return reject(err);
        }
        
        let productionPromises = [];
        
        // Verificăm și scădem ingredientele necesare
        doughRecipe.forEach(ingredient => {
          productionPromises.push(new Promise((res, rej) => {
            db.get('SELECT id, name, current_stock, unit FROM ingredients WHERE name = ?', 
              [ingredient.name], 
              (selectErr, ing) => {
                if (selectErr) {
                  console.error(`❌ Eroare la verificarea ingredient ${ingredient.name}:`, selectErr);
                  return rej(selectErr);
                }
                
                if (!ing) {
                  console.error(`❌ Ingredientul ${ingredient.name} nu există în baza de date`);
                  return rej(new Error(`Ingredientul ${ingredient.name} nu există`));
                }
                
                // Verificăm dacă avem stoc suficient
                if (ing.current_stock < ingredient.needed) {
                  const error = new Error(
                    `Stoc insuficient pentru ${ingredient.name}: ` +
                    `necesar ${ingredient.needed.toFixed(2)} ${ing.unit}, ` +
                    `disponibil ${ing.current_stock} ${ing.unit}`
                  );
                  console.error(`❌ ${error.message}`);
                  return rej(error);
                }
                
                // Scădem din stoc
                const newStock = ing.current_stock - ingredient.needed;
                db.run('UPDATE ingredients SET current_stock = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
                  [newStock, ing.id],
                  (updateErr) => {
                    if (updateErr) {
                      console.error(`❌ Eroare la actualizarea stocului pentru ${ingredient.name}:`, updateErr);
                      return rej(updateErr);
                    }
                    
                    console.log(`✅ ${ingredient.name}: ${ing.current_stock} → ${newStock.toFixed(2)} ${ing.unit} (scăzut ${ingredient.needed.toFixed(2)} ${ing.unit})`);
                    res();
                  }
                );
              }
            );
          }));
        });
        
        // Așteptăm ca toate ingredientele să fie procesate
        Promise.all(productionPromises)
          .then(() => {
            // Adăugăm blatul produs în stoc
            db.get('SELECT id, current_stock FROM ingredients WHERE name = ?', 
              ['Blat de pizza (standard)'], 
              (selectErr, dough) => {
                if (selectErr) {
                  console.error('❌ Eroare la verificarea stocului de blat:', selectErr);
                  return reject(selectErr);
                }
                
                if (!dough) {
                  console.error('❌ Ingredientul "Blat de pizza (standard)" nu există');
                  return reject(new Error('Blat de pizza (standard) nu există'));
                }
                
                const newDoughStock = dough.current_stock + quantityNeeded;
                db.run('UPDATE ingredients SET current_stock = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
                  [newDoughStock, dough.id],
                  (updateErr) => {
                    if (updateErr) {
                      console.error('❌ Eroare la actualizarea stocului de blat:', updateErr);
                      return reject(updateErr);
                    }
                    
                    console.log(`✅ Blat de pizza (standard): ${dough.current_stock} → ${newDoughStock} g (produs ${quantityNeeded} g)`);
                    
                    // COMMIT tranzacția
                    db.run('COMMIT', (commitErr) => {
                      if (commitErr) {
                        console.error('❌ Eroare la COMMIT tranzacție (producție blat):', commitErr);
                        return reject(commitErr);
                      }
                      console.log('✅ Tranzacție COMMIT: Blat de pizza produs cu succes');
                      resolve();
                    });
                  }
                );
              }
            );
          })
          .catch(error => {
            // ROLLBACK în caz de eroare
            db.run('ROLLBACK', () => {
              console.error('❌ ROLLBACK tranzacție (producție blat) din cauza erorii:', error.message);
              reject(error);
            });
          });
      });
    });
  });
}

// Funcții pentru Happy Hour
async function getActiveHappyHourSettings() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Obține toate Happy Hour-urile active
    const query = `SELECT * FROM happy_hour_settings WHERE is_active = 1`;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const activeSettings = [];
        
        for (const setting of rows || []) {
          // Verifică intervalul orar
          if (currentTime >= setting.start_time && currentTime <= setting.end_time) {
            // Verifică zilele
            let daysArray = setting.days_of_week;
            
            // Parsează days_of_week
            if (typeof daysArray === 'string' && daysArray.startsWith('[')) {
              try { 
                daysArray = JSON.parse(daysArray); 
              } catch(e) { 
                daysArray = [daysArray]; 
              }
            } else if (typeof daysArray === 'string') {
              daysArray = [daysArray.trim()];
            }
            
            // Verifică dacă ziua curentă este în lista de zile
            const dayMappings = {
              '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 0, 
              'luni': 1, 'marti': 2, 'miercuri': 3, 'joi': 4, 'vineri': 5, 'sambata': 6, 'duminica': 0
            };
            
            const isRelevantDay = daysArray.includes('all') || daysArray.some(day => {
              const mappedDay = dayMappings[String(day).toLowerCase().trim()];
              return mappedDay === currentDay;
            });
            
            if (isRelevantDay) {
              activeSettings.push(setting);
            }
          }
        }
        
        resolve(activeSettings);
      }
    });
  });
}

async function applyHappyHourDiscount(orderItems, happyHourSettings) {
  const db = await dbPromise;
  const discountedItems = [];
  let totalDiscount = 0;
  
  for (const item of orderItems) {
    let finalPrice = item.finalPrice;
    let itemDiscount = 0;
    
    for (const setting of happyHourSettings) {
      // Verifică dacă produsul se aplică la Happy Hour
      if (isProductApplicable(item, setting)) {
        if (setting.discount_percentage > 0) {
          itemDiscount = item.finalPrice * (setting.discount_percentage / 100);
        } else if (setting.discount_fixed > 0) {
          itemDiscount = Math.min(setting.discount_fixed, item.finalPrice);
        }
        
        finalPrice = Math.max(0, item.finalPrice - itemDiscount);
        totalDiscount += itemDiscount;
        break; // Aplică doar primul Happy Hour găsit
      }
    }
    
    discountedItems.push({
      ...item,
      originalPrice: item.finalPrice,
      finalPrice: finalPrice,
      discount: itemDiscount
    });
  }
  
  return { discountedItems, totalDiscount };
}

function isProductApplicable(item, setting) {
  // Verifică categorii
  if (setting.applicable_categories) {
    const categories = JSON.parse(setting.applicable_categories);
    if (categories.includes(item.category)) {
      return true;
    }
  }
  
  // Verifică produse specifice
  if (setting.applicable_products) {
    const products = JSON.parse(setting.applicable_products);
    if (products.includes(item.productId)) {
      return true;
    }
  }
  
  return false;
}

async function recordHappyHourUsage(orderId, happyHourId, originalTotal, discountAmount, finalTotal) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO happy_hour_usage (order_id, happy_hour_id, original_total, discount_amount, final_total) VALUES (?, ?, ?, ?, ?)',
      [orderId, happyHourId, originalTotal, discountAmount, finalTotal],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

// Funcții pentru sistemul de fidelizare avansat
async function initializeVipLevels() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    // Verifică dacă nivelurile VIP există deja
    db.get('SELECT COUNT(*) as count FROM vip_levels', (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        // Inserează nivelurile VIP predefinite
        const vipLevels = [
          { name: 'Bronze', min_points: 0, min_spent: 0, min_visits: 0, benefits: 'Acces la oferte speciale', color: '#CD7F32' },
          { name: 'Silver', min_points: 500, min_spent: 500, min_visits: 5, benefits: 'Reducere 5% la toate comenzile', color: '#C0C0C0' },
          { name: 'Gold', min_points: 1500, min_spent: 1500, min_visits: 15, benefits: 'Reducere 10% + produs gratuit ocazional', color: '#FFD700' },
          { name: 'Platinum', min_points: 3000, min_spent: 3000, min_visits: 30, benefits: 'Reducere 15% + prioritate la rezervări', color: '#E5E4E2' },
          { name: 'Diamond', min_points: 5000, min_spent: 5000, min_visits: 50, benefits: 'Reducere 20% + servicii VIP exclusive', color: '#B9F2FF' }
        ];
        
        const insertPromises = vipLevels.map(level => {
          return new Promise((resolveInsert, rejectInsert) => {
            db.run(
              'INSERT INTO vip_levels (level_name, min_points, min_spent, min_visits, benefits, color) VALUES (?, ?, ?, ?, ?, ?)',
              [level.name, level.min_points, level.min_spent, level.min_visits, level.benefits, level.color],
              function(err) {
                if (err) rejectInsert(err);
                else resolveInsert(this.lastID);
              }
            );
          });
        });
        
        Promise.all(insertPromises)
          .then(() => {
            console.log('✅ Nivelurile VIP au fost inițializate cu succes');
            resolve();
          })
          .catch(reject);
      } else {
        console.log('ℹ️ Nivelurile VIP există deja');
        resolve();
      }
    });
  });
}

async function calculateVipLevel(clientToken) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    // Obține datele clientului
    db.get('SELECT * FROM loyalty_points WHERE client_token = ?', [clientToken], (err, client) => {
      if (err) return reject(err);
      
      if (!client) {
        // Creează clientul dacă nu există
        db.run('INSERT INTO loyalty_points (client_token) VALUES (?)', [clientToken], function(err) {
          if (err) return reject(err);
          resolve('Bronze');
        });
        return;
      }
      
      // Găsește nivelul VIP corespunzător
      db.get(`
        SELECT level_name FROM vip_levels 
        WHERE min_points <= ? AND min_spent <= ? AND min_visits <= ?
        ORDER BY min_points DESC, min_spent DESC, min_visits DESC
        LIMIT 1
      `, [client.total_points, client.total_spent, client.visit_count], (err, level) => {
        if (err) return reject(err);
        
        const newLevel = level ? level.level_name : 'Bronze';
        
        // Actualizează nivelul VIP dacă s-a schimbat
        if (client.vip_level !== newLevel) {
          db.run('UPDATE loyalty_points SET vip_level = ?, updated_at = CURRENT_TIMESTAMP WHERE client_token = ?', 
            [newLevel, clientToken], (err) => {
              if (err) return reject(err);
              console.log(`🎖️ Client ${clientToken} promovat la nivelul ${newLevel}`);
              resolve(newLevel);
            });
        } else {
          resolve(newLevel);
        }
      });
    });
  });
}

async function addLoyaltyPoints(clientToken, orderId, orderAmount, pointsMultiplier = 1) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    // Calculează punctele (1 punct per RON, cu multiplicator)
    const pointsEarned = Math.floor(orderAmount * pointsMultiplier);
    
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) return reject(err);
      
      // Actualizează sau creează înregistrarea clientului
      db.run(`
        INSERT INTO loyalty_points (client_token, total_points, total_spent, visit_count, last_visit)
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(client_token) DO UPDATE SET
          total_points = total_points + ?,
          total_spent = total_spent + ?,
          visit_count = visit_count + 1,
          last_visit = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `, [clientToken, pointsEarned, orderAmount, pointsEarned, orderAmount], function(err) {
        if (err) {
          db.run('ROLLBACK', () => reject(err));
          return;
        }
        
        // Înregistrează în istoricul punctelor
        db.run(`
          INSERT INTO points_history (client_token, order_id, points_earned, action)
          VALUES (?, ?, ?, 'order_completed')
        `, [clientToken, orderId, pointsEarned], (err) => {
          if (err) {
            db.run('ROLLBACK', () => reject(err));
            return;
          }
          
          // Calculează și actualizează nivelul VIP
          calculateVipLevel(clientToken).then((vipLevel) => {
            db.run('COMMIT', (err) => {
              if (err) return reject(err);
              console.log(`🎯 Client ${clientToken} a câștigat ${pointsEarned} puncte (nivel: ${vipLevel})`);
              resolve({ pointsEarned, vipLevel });
            });
          }).catch((error) => {
            db.run('ROLLBACK', () => reject(error));
          });
        });
      });
    });
  });
}

async function getAvailableRewards(clientToken) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    // Obține nivelul VIP și punctele clientului
    db.get('SELECT vip_level, total_points FROM loyalty_points WHERE client_token = ?', [clientToken], (err, client) => {
      if (err) return reject(err);
      
      if (!client) {
        resolve([]);
        return;
      }
      
      // Găsește recompensele disponibile
      db.all(`
        SELECT r.*, vl.level_name as vip_level_name, vl.color as vip_color
        FROM rewards r
        LEFT JOIN vip_levels vl ON r.vip_level_required = vl.level_name
        WHERE r.is_active = 1 
        AND (r.points_required <= ? OR r.points_required = 0)
        AND (r.vip_level_required = ? OR r.vip_level_required = 'Bronze')
        ORDER BY r.points_required ASC
      `, [client.total_points, client.vip_level], (err, rewards) => {
        if (err) return reject(err);
        resolve(rewards || []);
      });
    });
  });
}

async function useReward(clientToken, rewardId, orderId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) return reject(err);
      
      // Obține detaliile recompensei și clientului
      db.get('SELECT * FROM rewards WHERE id = ? AND is_active = 1', [rewardId], (err, reward) => {
        if (err || !reward) {
          db.run('ROLLBACK', () => reject(new Error('Recompensa nu este disponibilă')));
          return;
        }
        
        db.get('SELECT * FROM loyalty_points WHERE client_token = ?', [clientToken], (err, client) => {
          if (err || !client) {
            db.run('ROLLBACK', () => reject(new Error('Clientul nu este găsit')));
            return;
          }
          
          if (client.total_points < reward.points_required) {
            db.run('ROLLBACK', () => reject(new Error('Puncte insuficiente')));
            return;
          }
          
          // Calculează discount-ul
          let discountAmount = 0;
          if (reward.discount_percentage > 0) {
            // Va fi calculat la aplicarea comenzii
            discountAmount = reward.discount_percentage;
          } else if (reward.discount_fixed > 0) {
            discountAmount = reward.discount_fixed;
          }
          
          // Actualizează punctele clientului
          db.run(`
            UPDATE loyalty_points 
            SET total_points = total_points - ?, used_points = used_points + ?, updated_at = CURRENT_TIMESTAMP
            WHERE client_token = ?
          `, [reward.points_required, reward.points_required, clientToken], (err) => {
            if (err) {
              db.run('ROLLBACK', () => reject(err));
              return;
            }
            
            // Înregistrează utilizarea recompensei
            db.run(`
              INSERT INTO reward_usage (client_token, reward_id, order_id, points_used, discount_applied)
              VALUES (?, ?, ?, ?, ?)
            `, [clientToken, rewardId, orderId, reward.points_required, discountAmount], (err) => {
              if (err) {
                db.run('ROLLBACK', () => reject(err));
                return;
              }
              
              // Înregistrează în istoricul punctelor
              db.run(`
                INSERT INTO points_history (client_token, order_id, points_used, action)
                VALUES (?, ?, ?, 'reward_used')
              `, [clientToken, orderId, reward.points_required], (err) => {
                if (err) {
                  db.run('ROLLBACK', () => reject(err));
                  return;
                }
                
                db.run('COMMIT', (err) => {
                  if (err) return reject(err);
                  console.log(`🎁 Client ${clientToken} a folosit recompensa "${reward.name}" (${reward.points_required} puncte)`);
                  resolve({ reward, discountAmount });
                });
              });
            });
          });
        });
      });
    });
  });
}

// ==================== FUNCȚII SISTEM ROLURI GRANULARE ====================

async function initializeRolesAndPermissions() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    // Verifică dacă rolurile există deja
    db.get('SELECT COUNT(*) as count FROM user_roles', (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        // Inserează rolurile predefinite
        const roles = [
          { name: 'Super Admin', description: 'Acces complet la toate funcțiile sistemului', is_system: 1 },
          { name: 'Manager', description: 'Gestionare restaurant, rapoarte și personal', is_system: 1 },
          { name: 'Chef', description: 'Gestionare meniu, stocuri și preparate', is_system: 1 },
          { name: 'Waiter', description: 'Gestionare comenzi și mese', is_system: 1 },
          { name: 'Cashier', description: 'Gestionare casă și plăți', is_system: 1 },
          { name: 'Viewer', description: 'Doar vizualizare rapoarte și statistici', is_system: 1 }
        ];
        
        const insertRolePromises = roles.map(role => {
          return new Promise((resolveRole, rejectRole) => {
            db.run(
              'INSERT INTO user_roles (role_name, role_description, is_system_role) VALUES (?, ?, ?)',
              [role.name, role.description, role.is_system],
              function(err) {
                if (err) rejectRole(err);
                else resolveRole(this.lastID);
              }
            );
          });
        });
        
        Promise.all(insertRolePromises)
          .then((roleIds) => {
            // Inserează permisiunile predefinite
            const permissions = [
              // Modulul Orders
              { name: 'orders.view', description: 'Vizualizare comenzi', module: 'orders', action: 'view' },
              { name: 'orders.create', description: 'Creare comenzi noi', module: 'orders', action: 'create' },
              { name: 'orders.update', description: 'Modificare comenzi', module: 'orders', action: 'update' },
              { name: 'orders.delete', description: 'Ștergere comenzi', module: 'orders', action: 'delete' },
              { name: 'orders.complete', description: 'Finalizare comenzi', module: 'orders', action: 'complete' },
              
              // Modulul Menu
              { name: 'menu.view', description: 'Vizualizare meniu', module: 'menu', action: 'view' },
              { name: 'menu.create', description: 'Adăugare produse', module: 'menu', action: 'create' },
              { name: 'menu.update', description: 'Modificare produse', module: 'menu', action: 'update' },
              { name: 'menu.delete', description: 'Ștergere produse', module: 'menu', action: 'delete' },
              
              // Modulul Inventory
              { name: 'inventory.view', description: 'Vizualizare stocuri', module: 'inventory', action: 'view' },
              { name: 'inventory.update', description: 'Actualizare stocuri', module: 'inventory', action: 'update' },
              { name: 'inventory.nir', description: 'Gestionare NIR', module: 'inventory', action: 'nir' },
              
              // Modulul Reports
              { name: 'reports.view', description: 'Vizualizare rapoarte', module: 'reports', action: 'view' },
              { name: 'reports.export', description: 'Export rapoarte', module: 'reports', action: 'export' },
              { name: 'reports.financial', description: 'Rapoarte financiare', module: 'reports', action: 'financial' },
              
              // Modulul Users
              { name: 'users.view', description: 'Vizualizare utilizatori', module: 'users', action: 'view' },
              { name: 'users.create', description: 'Creare utilizatori', module: 'users', action: 'create' },
              { name: 'users.update', description: 'Modificare utilizatori', module: 'users', action: 'update' },
              { name: 'users.delete', description: 'Ștergere utilizatori', module: 'users', action: 'delete' },
              { name: 'users.roles', description: 'Gestionare roluri', module: 'users', action: 'roles' },
              
              // Modulul Settings
              { name: 'settings.view', description: 'Vizualizare setări', module: 'settings', action: 'view' },
              { name: 'settings.update', description: 'Modificare setări', module: 'settings', action: 'update' },
              
              // Modulul Loyalty
              { name: 'loyalty.view', description: 'Vizualizare fidelizare', module: 'loyalty', action: 'view' },
              { name: 'loyalty.manage', description: 'Gestionare fidelizare', module: 'loyalty', action: 'manage' },
              
              // Modulul Marketing
              { name: 'marketing.view', description: 'Vizualizare marketing', module: 'marketing', action: 'view' },
              { name: 'marketing.manage', description: 'Gestionare marketing', module: 'marketing', action: 'manage' }
            ];
            
            const insertPermissionPromises = permissions.map(permission => {
              return new Promise((resolvePerm, rejectPerm) => {
                db.run(
                  'INSERT INTO permissions (permission_name, permission_description, module, action) VALUES (?, ?, ?, ?)',
                  [permission.name, permission.description, permission.module, permission.action],
                  function(err) {
                    if (err) rejectPerm(err);
                    else resolvePerm(this.lastID);
                  }
                );
              });
            });
            
            Promise.all(insertPermissionPromises)
              .then((permissionIds) => {
                // Asociază permisiunile cu rolurile
                const rolePermissionMappings = [
                  // Super Admin - toate permisiunile
                  ...permissionIds.map(permId => ({ roleId: roleIds[0], permissionId: permId })),
                  
                  // Manager - majoritatea permisiunilor (fără users.delete și settings.update)
                  ...permissionIds.filter((_, index) => ![13, 19].includes(index)).map(permId => ({ roleId: roleIds[1], permissionId: permId })),
                  
                  // Chef - orders, menu, inventory
                  ...permissionIds.filter((_, index) => [0,1,2,3,4,5,6,7,8,9,10,11].includes(index)).map(permId => ({ roleId: roleIds[2], permissionId: permId })),
                  
                  // Waiter - orders, menu.view
                  ...permissionIds.filter((_, index) => [0,1,2,3,4,5].includes(index)).map(permId => ({ roleId: roleIds[3], permissionId: permId })),
                  
                  // Cashier - orders.view, orders.complete, reports.view
                  ...permissionIds.filter((_, index) => [0,4,12].includes(index)).map(permId => ({ roleId: roleIds[4], permissionId: permId })),
                  
                  // Viewer - doar vizualizare
                  ...permissionIds.filter((_, index) => [0,5,9,12,16,20,22].includes(index)).map(permId => ({ roleId: roleIds[5], permissionId: permId }))
                ];
                
                const insertRolePermPromises = rolePermissionMappings.map(mapping => {
                  return new Promise((resolveRP, rejectRP) => {
                    db.run(
                      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                      [mapping.roleId, mapping.permissionId],
                      function(err) {
                        if (err) rejectRP(err);
                        else resolveRP(this.lastID);
                      }
                    );
                  });
                });
                
                Promise.all(insertRolePermPromises)
                  .then(() => {
                    console.log('✅ Rolurile și permisiunile au fost inițializate cu succes');
                    resolve();
                  })
                  .catch(reject);
              })
              .catch(reject);
          })
          .catch(reject);
      } else {
        console.log('ℹ️ Rolurile și permisiunile există deja');
        resolve();
      }
    });
  });
}

async function checkPermission(userId, permissionName) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT COUNT(*) as has_permission
      FROM users u
      JOIN role_permissions rp ON u.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ? AND p.permission_name = ? AND u.is_active = 1
    `, [userId, permissionName], (err, row) => {
      if (err) return reject(err);
      resolve(row.has_permission > 0);
    });
  });
}

async function getUserPermissions(userId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT p.permission_name, p.permission_description, p.module, p.action
      FROM users u
      JOIN role_permissions rp ON u.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ? AND u.is_active = 1
      ORDER BY p.module, p.action
    `, [userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function createUser(username, email, passwordHash, roleId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, roleId],
      function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

async function getUserByUsername(username) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT u.*, ur.role_name, ur.role_description
      FROM users u
      JOIN user_roles ur ON u.role_id = ur.id
      WHERE u.username = ? AND u.is_active = 1
    `, [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function createSession(userId, sessionToken, expiresAt) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
      [userId, sessionToken, expiresAt],
      function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

async function validateSession(sessionToken) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT us.*, u.username, u.role_id, ur.role_name
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      JOIN user_roles ur ON u.role_id = ur.id
      WHERE us.session_token = ? AND us.expires_at > datetime('now') AND u.is_active = 1
    `, [sessionToken], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function logAuditEvent(userId, action, resourceType, resourceId, oldValues, newValues, ipAddress, userAgent) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO audit_log (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, action, resourceType, resourceId, oldValues, newValues, ipAddress, userAgent], function(err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

// ==================== FUNCȚII SISTEM REZERVĂRI ====================

async function initializeReservationSystem() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    // Verifică dacă mesele există deja
    db.get('SELECT COUNT(*) as count FROM tables', (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        // Inserează mesele predefinite
        const tables = [
          { number: '1', capacity: 2, location: 'Interior' },
          { number: '2', capacity: 2, location: 'Interior' },
          { number: '3', capacity: 4, location: 'Interior' },
          { number: '4', capacity: 4, location: 'Interior' },
          { number: '5', capacity: 6, location: 'Interior' },
          { number: '6', capacity: 8, location: 'Interior' },
          { number: '7', capacity: 2, location: 'Terasă' },
          { number: '8', capacity: 4, location: 'Terasă' },
          { number: '9', capacity: 6, location: 'Terasă' },
          { number: '10', capacity: 10, location: 'Sala privată' }
        ];
        
        const insertTablePromises = tables.map(table => {
          return new Promise((resolveTable, rejectTable) => {
            db.run(
              'INSERT INTO tables (table_number, capacity, location) VALUES (?, ?, ?)',
              [table.number, table.capacity, table.location],
              function(err) {
                if (err) rejectTable(err);
                else resolveTable(this.lastID);
              }
            );
          });
        });
        
        Promise.all(insertTablePromises)
          .then(() => {
            // Inserează setările predefinite pentru rezervări
            const settings = [
              { name: 'advance_booking_days', value: '30', description: 'Numărul de zile în avans pentru rezervări' },
              { name: 'min_advance_hours', value: '2', description: 'Numărul minim de ore în avans pentru rezervări' },
              { name: 'default_duration_minutes', value: '120', description: 'Durata implicită a rezervării în minute' },
              { name: 'max_party_size', value: '12', description: 'Numărul maxim de persoane per rezervare' },
              { name: 'confirmation_required', value: 'true', description: 'Confirmarea este obligatorie' },
              { name: 'reminder_hours_before', value: '24', description: 'Ore înainte de rezervare pentru notificare' },
              { name: 'auto_confirm_hours', value: '48', description: 'Ore după care rezervarea se confirmă automat' },
              { name: 'cancellation_hours_before', value: '2', description: 'Ore înainte de rezervare pentru anulare gratuită' }
            ];
            
            const insertSettingPromises = settings.map(setting => {
              return new Promise((resolveSetting, rejectSetting) => {
                db.run(
                  'INSERT INTO reservation_settings (setting_name, setting_value, description) VALUES (?, ?, ?)',
                  [setting.name, setting.value, setting.description],
                  function(err) {
                    if (err) rejectSetting(err);
                    else resolveSetting(this.lastID);
                  }
                );
              });
            });
            
            Promise.all(insertSettingPromises)
              .then(() => {
                console.log('✅ Sistemul de rezervări a fost inițializat cu succes');
                resolve();
              })
              .catch(reject);
          })
          .catch(reject);
      } else {
        console.log('ℹ️ Sistemul de rezervări există deja');
        resolve();
      }
    });
  });
}

async function createReservation(reservationData) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const {
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      reservationTime,
      durationMinutes = 120,
      partySize,
      specialRequests
    } = reservationData;
    
    // Generează cod de confirmare
    const confirmationCode = require('crypto').randomBytes(4).toString('hex').toUpperCase();
    
    db.run(`
      INSERT INTO reservations (
        table_id, customer_name, customer_phone, customer_email,
        reservation_date, reservation_time, duration_minutes, party_size,
        special_requests, confirmation_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tableId, customerName, customerPhone, customerEmail,
      reservationDate, reservationTime, durationMinutes, partySize,
      specialRequests, confirmationCode
    ], function(err) {
      if (err) return reject(err);
      
      const reservationId = this.lastID;
      
      // Actualizează disponibilitatea mesei
      updateTableAvailability(tableId, reservationDate, reservationTime, false, reservationId)
        .then(() => resolve({ id: reservationId, confirmationCode }))
        .catch(reject);
    });
  });
}

async function getAvailableTables(date, time, partySize) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT t.*, 
             CASE WHEN ta.is_available IS NULL OR ta.is_available = 1 THEN 1 ELSE 0 END as is_available
      FROM tables t
      LEFT JOIN table_availability ta ON t.id = ta.table_id 
        AND ta.date = ? AND ta.time_slot = ?
      WHERE t.is_active = 1 AND t.capacity >= ?
      ORDER BY t.capacity ASC, t.table_number ASC
    `, [date, time, partySize], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function updateTableAvailability(tableId, date, time, isAvailable, reservationId = null) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT OR REPLACE INTO table_availability 
      (table_id, date, time_slot, is_available, reservation_id)
      VALUES (?, ?, ?, ?, ?)
    `, [tableId, date, time, isAvailable, reservationId], function(err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

async function getReservationsByDate(date) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT r.*, t.table_number, t.capacity, t.location
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      WHERE r.reservation_date = ?
      ORDER BY r.reservation_time ASC
    `, [date], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function updateReservationStatus(reservationId, status) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE reservations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, reservationId], function(err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

async function getReservationSettings() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM reservation_settings ORDER BY setting_name', (err, rows) => {
      if (err) return reject(err);
      
      const settings = {};
      rows.forEach(row => {
        settings[row.setting_name] = {
          value: row.setting_value,
          description: row.description
        };
      });
      resolve(settings);
    });
  });
}

async function updateReservationSettings(settings) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const updatePromises = Object.entries(settings).map(([name, value]) => {
      return new Promise((resolveUpdate, rejectUpdate) => {
        db.run(`
          UPDATE reservation_settings 
          SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
          WHERE setting_name = ?
        `, [value, name], function(err) {
          if (err) rejectUpdate(err);
          else resolveUpdate(this.changes);
        });
      });
    });
    
    Promise.all(updatePromises)
      .then(() => resolve())
      .catch(reject);
  });
}

async function getReservationStats(startDate, endDate) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reservations,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_reservations,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_reservations,
        AVG(party_size) as avg_party_size,
        SUM(party_size) as total_guests
      FROM reservations
      WHERE reservation_date BETWEEN ? AND ?
    `, [startDate, endDate], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// ==================== FUNCȚII SISTEM E-FACTURA ȘI E-TRANSPORT ====================

async function initializeFiscalSystem() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    // Verifică dacă configurația fiscală există deja
    db.get('SELECT COUNT(*) as count FROM fiscal_config', (err, row) => {
      if (err) return reject(err);
      
      if (row.count === 0) {
        // Inserează configurația fiscală predefinită
        const fiscalConfig = [
          { name: 'company_name', value: 'Restaurant Trattoria SRL', description: 'Numele companiei' },
          { name: 'company_cui', value: 'RO12345678', description: 'CUI-ul companiei' },
          { name: 'company_registration_number', value: 'J40/1234/2020', description: 'Numărul de înregistrare' },
          { name: 'company_address', value: 'Strada Principală nr. 1', description: 'Adresa companiei' },
          { name: 'company_city', value: 'București', description: 'Orașul companiei' },
          { name: 'company_county', value: 'București', description: 'Județul companiei' },
          { name: 'company_postal_code', value: '010001', description: 'Codul poștal' },
          { name: 'company_phone', value: '0212345678', description: 'Telefonul companiei' },
          { name: 'company_email', value: 'contact@trattoria.ro', description: 'Email-ul companiei' },
          { name: 'anaf_environment', value: 'test', description: 'Mediul ANAF (test/production)' },
          { name: 'anaf_certificate_path', value: '', description: 'Calea către certificatul ANAF' },
          { name: 'anaf_certificate_password', value: '', description: 'Parola certificatului ANAF', is_encrypted: 1 },
          { name: 'default_vat_rate', value: '19', description: 'Cota TVA implicită (%)' },
          { name: 'invoice_series', value: 'F', description: 'Seria facturilor' },
          { name: 'receipt_series', value: 'B', description: 'Seria bonurilor fiscale' },
          { name: 'auto_send_to_anaf', value: 'false', description: 'Trimitere automată la ANAF' }
        ];
        
        const insertConfigPromises = fiscalConfig.map(config => {
          return new Promise((resolveConfig, rejectConfig) => {
            db.run(
              'INSERT INTO fiscal_config (config_name, config_value, description, is_encrypted) VALUES (?, ?, ?, ?)',
              [config.name, config.value, config.description, config.is_encrypted || 0],
              function(err) {
                if (err) rejectConfig(err);
                else resolveConfig(this.lastID);
              }
            );
          });
        });
        
        Promise.all(insertConfigPromises)
          .then(() => {
            // Inserează ratele TVA predefinite
            const vatRates = [
              { name: 'TVA Standard', percentage: 19, code: 'S' },
              { name: 'TVA Redus', percentage: 9, code: 'R' },
              { name: 'TVA Redus Special', percentage: 5, code: 'RS' },
              { name: 'Fără TVA', percentage: 0, code: 'N' }
            ];
            
            const insertVatPromises = vatRates.map(rate => {
              return new Promise((resolveVat, rejectVat) => {
                db.run(
                  'INSERT INTO vat_rates (rate_name, rate_percentage, rate_code) VALUES (?, ?, ?)',
                  [rate.name, rate.percentage, rate.code],
                  function(err) {
                    if (err) rejectVat(err);
                    else resolveVat(this.lastID);
                  }
                );
              });
            });
            
            Promise.all(insertVatPromises)
              .then(() => {
                console.log('✅ Sistemul fiscal a fost inițializat cu succes');
                resolve();
              })
              .catch(reject);
          })
          .catch(reject);
      } else {
        console.log('ℹ️ Sistemul fiscal există deja');
        resolve();
      }
    });
  });
}

async function getFiscalConfig() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM fiscal_config ORDER BY config_name', (err, rows) => {
      if (err) return reject(err);
      
      const config = {};
      rows.forEach(row => {
        config[row.config_name] = {
          value: row.config_value,
          description: row.description,
          is_encrypted: row.is_encrypted
        };
      });
      resolve(config);
    });
  });
}

async function updateFiscalConfig(configUpdates) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const updatePromises = Object.entries(configUpdates).map(([name, value]) => {
      return new Promise((resolveUpdate, rejectUpdate) => {
        db.run(`
          UPDATE fiscal_config 
          SET config_value = ?, updated_at = CURRENT_TIMESTAMP
          WHERE config_name = ?
        `, [value, name], function(err) {
          if (err) rejectUpdate(err);
          else resolveUpdate(this.changes);
        });
      });
    });
    
    Promise.all(updatePromises)
      .then(() => resolve())
      .catch(reject);
  });
}

async function createFiscalDocument(documentData) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const {
      documentType,
      documentNumber,
      orderId,
      customerName,
      customerCui,
      customerAddress,
      totalAmount,
      vatAmount,
      netAmount,
      currency = 'RON',
      issueDate,
      dueDate,
      xmlContent,
      pdfPath
    } = documentData;
    
    db.run(`
      INSERT INTO fiscal_documents (
        document_type, document_number, order_id, customer_name, customer_cui, customer_address,
        total_amount, vat_amount, net_amount, currency, issue_date, due_date,
        xml_content, pdf_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      documentType, documentNumber, orderId, customerName, customerCui, customerAddress,
      totalAmount, vatAmount, netAmount, currency, issueDate, dueDate,
      xmlContent, pdfPath
    ], function(err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

async function updateFiscalDocumentStatus(documentId, status, anafResponse = null) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE fiscal_documents 
      SET status = ?, anaf_response = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, anafResponse, documentId], function(err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

async function logAnafTransmission(documentId, transmissionType, requestXml, responseXml, statusCode, statusMessage) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO anaf_transmission_log (
        document_id, transmission_type, request_xml, response_xml, 
        status_code, status_message
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [documentId, transmissionType, requestXml, responseXml, statusCode, statusMessage], function(err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

async function getFiscalDocuments(startDate, endDate, documentType = null) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    let query = `
      SELECT fd.*, o.table_number, o.total_amount as order_total
      FROM fiscal_documents fd
      LEFT JOIN orders o ON fd.order_id = o.id
      WHERE fd.issue_date BETWEEN ? AND ?
    `;
    let params = [startDate, endDate];
    
    if (documentType) {
      query += ' AND fd.document_type = ?';
      params.push(documentType);
    }
    
    query += ' ORDER BY fd.issue_date DESC, fd.created_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function getVatRates() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM vat_rates WHERE is_active = 1 ORDER BY rate_percentage DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

async function createCustomer(customerData) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const {
      customerName,
      customerCui,
      customerRegistrationNumber,
      customerAddress,
      customerCity,
      customerCounty,
      customerPostalCode,
      customerPhone,
      customerEmail,
      customerType = 'individual'
    } = customerData;
    
    db.run(`
      INSERT INTO customers (
        customer_name, customer_cui, customer_registration_number, customer_address,
        customer_city, customer_county, customer_postal_code, customer_phone,
        customer_email, customer_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customerName, customerCui, customerRegistrationNumber, customerAddress,
      customerCity, customerCounty, customerPostalCode, customerPhone,
      customerEmail, customerType
    ], function(err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

async function getCustomers() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM customers WHERE is_active = 1 ORDER BY customer_name ASC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// ==================== FUNCȚII INVENTAR AVANSAT ====================

// Obține detaliile inventarului pentru o sesiune
async function getInventoryDetails(sessionId) {
    try {
        console.log(`🔍 Debug: Început getInventoryDetails pentru sesiunea ${sessionId}`);
        const db = await dbPromise;
        console.log(`🔍 Debug: Baza de date obținută, executare query pentru sesiunea ${sessionId}`);
        
        // Test simplu pentru a vedea dacă funcționează
        const testQuery = await new Promise((resolve, reject) => {
            db.all(`SELECT COUNT(*) as count FROM ingredients WHERE is_available = 1`, (err, rows) => {
                if (err) {
                    console.error('❌ Eroare la test query:', err);
                    reject(err);
                } else {
                    console.log(`🔍 Debug: Test query result:`, rows);
                    resolve(rows);
                }
            });
        });
        
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    i.id,
                    i.name,
                    i.current_stock as theoretical_stock,
                    i.unit,
                    ic.counted_stock
                FROM ingredients i
                LEFT JOIN inventory_counts ic ON i.id = ic.ingredient_id AND ic.session_id = ?
                WHERE i.is_available = 1
                ORDER BY i.name
            `, [sessionId], (err, rows) => {
                if (err) {
                    console.error('❌ Eroare la preluarea detaliilor inventarului:', err);
                    reject(err);
                } else {
                    console.log(`✅ Preluate ${rows ? rows.length : 0} ingrediente pentru sesiunea ${sessionId}`);
                    if (rows && rows.length > 0) {
                        console.log(`🔍 Debug: Primul ingredient:`, rows[0]);
                    }
                    resolve(rows || []);
                }
            });
        });
    } catch (err) {
        console.error('❌ Eroare la conectarea la baza de date:', err);
        return [];
    }
}

// Actualizează cantitatea numărată pentru un ingredient într-o sesiune
async function updateInventoryCount(sessionId, itemId, physicalCount) {
    return new Promise((resolve, reject) => {
        dbPromise.then(db => {
            db.run(`
                INSERT OR REPLACE INTO inventory_counts (session_id, ingredient_id, counted_stock, updated_at)
                VALUES (?, ?, ?, datetime('now', 'localtime'))
            `, [sessionId, itemId, physicalCount], function(err) {
                if (err) {
                    console.error('❌ Eroare la actualizarea numărătorii:', err);
                    reject(err);
                } else {
                    console.log(`✅ Actualizat ingredient ${itemId} cu cantitatea ${physicalCount} pentru sesiunea ${sessionId}`);
                    resolve(this.lastID);
                }
            });
        }).catch(err => {
            console.error('❌ Eroare la conectarea la baza de date:', err);
            reject(err);
        });
    });
}

// Creează o sesiune nouă de inventar (Zilnic sau Lunar)
async function createInventorySession(sessionType = 'daily', startedBy = 'Admin') {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await dbPromise;
            
            // Generează ID unic pentru sesiune
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 11);
            const sessionId = `INV_${timestamp}_${randomStr}`;
            
            // Numără ingredientele active
            db.get('SELECT COUNT(*) as total FROM ingredients WHERE is_available = 1', async (err, row) => {
                if (err) {
                    console.error('❌ Eroare la numărarea ingredientelor:', err);
                    reject(err);
                    return;
                }
                
                const totalItems = row.total;
                
                // Creează sesiunea
                db.run(`
                    INSERT INTO inventory_sessions (
                        id, session_type, status, started_at, started_by, total_items, created_at
                    ) VALUES (?, ?, 'in_progress', datetime('now', 'localtime'), ?, ?, datetime('now', 'localtime'))
                `, [sessionId, sessionType, startedBy, totalItems], function(err) {
                    if (err) {
                        console.error('❌ Eroare la crearea sesiunii de inventar:', err);
                        reject(err);
                    } else {
                        console.log(`✅ Sesiune inventar creată: ${sessionId} (${sessionType}), ${totalItems} ingrediente`);
                        resolve({ 
                            sessionId, 
                            sessionType, 
                            totalItems,
                            status: 'in_progress'
                        });
                    }
                });
            });
        } catch (err) {
            console.error('❌ Eroare la conectarea la baza de date:', err);
            reject(err);
        }
    });
}

// Finalizează sesiunea de inventar și actualizează stocurile
async function finalizeInventorySession(sessionId) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await dbPromise;
            
            // START TRANSACTION
            db.run('BEGIN TRANSACTION', async (err) => {
                if (err) {
                    console.error('❌ Eroare la începerea tranzacției:', err);
                    reject(err);
                    return;
                }
                
                try {
                    // PASUL 1: Obține toate numărătorile din sesiune
                    const counts = await new Promise((res, rej) => {
                        db.all(`
                            SELECT 
                                ic.ingredient_id,
                                ic.counted_stock,
                                i.current_stock as theoretical_stock,
                                i.name,
                                i.unit,
                                i.cost_per_unit
                            FROM inventory_counts ic
                            JOIN ingredients i ON ic.ingredient_id = i.id
                            WHERE ic.session_id = ? AND ic.counted_stock IS NOT NULL
                        `, [sessionId], (err, rows) => {
                            if (err) rej(err);
                            else res(rows || []);
                        });
                    });
                    
                    if (counts.length === 0) {
                        db.run('ROLLBACK');
                        reject(new Error('Nu există ingrediente numărate în această sesiune'));
                        return;
                    }
                    
                    let totalDifferenceValue = 0;
                    let itemsProcessed = 0;
                    
                    // PASUL 2: Pentru fiecare ingredient numărat
                    for (const item of counts) {
                        const difference = item.counted_stock - item.theoretical_stock;
                        const differenceValue = difference * (item.cost_per_unit || 0);
                        totalDifferenceValue += differenceValue;
                        
                        // Actualizează stocul real
                        await new Promise((res, rej) => {
                            db.run(`
                                UPDATE ingredients 
                                SET current_stock = ? 
                                WHERE id = ?
                            `, [item.counted_stock, item.ingredient_id], (err) => {
                                if (err) rej(err);
                                else res();
                            });
                        });
                        
                        // Creează înregistrare în stock_movements (audit trail)
                        if (difference !== 0) {
                            await new Promise((res, rej) => {
                                db.run(`
                                    INSERT INTO stock_movements (
                                        ingredient_id, 
                                        quantity_change, 
                                        movement_type, 
                                        notes, 
                                        created_at
                                    ) VALUES (?, ?, 'inventory_adjustment', ?, datetime('now', 'localtime'))
                                `, [
                                    item.ingredient_id, 
                                    difference,
                                    `Inventar ${sessionId}: ${difference > 0 ? 'Plus (Câștig)' : 'Lipsă (Pierdere)'} ${Math.abs(difference).toFixed(2)} ${item.unit}`
                                ], (err) => {
                                    if (err) rej(err);
                                    else res();
                                });
                            });
                        }
                        
                        itemsProcessed++;
                    }
                    
                    // PASUL 3: Actualizează sesiunea ca finalizată
                    await new Promise((res, rej) => {
                        db.run(`
                            UPDATE inventory_sessions 
                            SET 
                                status = 'completed',
                                completed_at = datetime('now', 'localtime'),
                                items_counted = ?,
                                total_difference_value = ?
                            WHERE id = ?
                        `, [itemsProcessed, totalDifferenceValue, sessionId], (err) => {
                            if (err) rej(err);
                            else res();
                        });
                    });
                    
                    // COMMIT TRANSACTION
                    db.run('COMMIT', (commitErr) => {
                        if (commitErr) {
                            console.error('❌ Eroare COMMIT:', commitErr);
                            db.run('ROLLBACK');
                            reject(commitErr);
                        } else {
                            console.log(`✅ Sesiune inventar finalizată: ${sessionId}, ${itemsProcessed} ingrediente, diferență totală: ${totalDifferenceValue.toFixed(2)} RON`);
                            resolve({
                                sessionId,
                                itemsProcessed,
                                totalDifferenceValue,
                                counts: counts.map(c => ({
                                    name: c.name,
                                    theoretical: c.theoretical_stock,
                                    counted: c.counted_stock,
                                    difference: c.counted_stock - c.theoretical_stock,
                                    unit: c.unit
                                }))
                            });
                        }
                    });
                    
                } catch (processingError) {
                    console.error('❌ Eroare la procesarea inventarului:', processingError);
                    db.run('ROLLBACK');
                    reject(processingError);
                }
            });
            
        } catch (err) {
            console.error('❌ Eroare la conectarea la baza de date:', err);
            reject(err);
        }
    });
}

// Obține lista sesiunilor de inventar
async function getInventorySessions(filters = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await dbPromise;
            
            let query = 'SELECT * FROM inventory_sessions WHERE 1=1';
            const params = [];
            
            if (filters.type) {
                query += ' AND session_type = ?';
                params.push(filters.type);
            }
            
            if (filters.status) {
                query += ' AND status = ?';
                params.push(filters.status);
            }
            
            if (filters.dateFrom) {
                query += ' AND started_at >= ?';
                params.push(filters.dateFrom);
            }
            
            if (filters.dateTo) {
                query += ' AND started_at <= ?';
                params.push(filters.dateTo);
            }
            
            query += ' ORDER BY started_at DESC';
            
            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }
            
            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('❌ Eroare la preluarea sesiunilor:', err);
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        } catch (err) {
            console.error('❌ Eroare la conectarea la baza de date:', err);
            reject(err);
        }
    });
}

// Obține detaliile complete ale unei sesiuni de inventar
async function getInventorySessionDetails(sessionId) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await dbPromise;
            
            // Obține sesiunea
            const session = await new Promise((res, rej) => {
                db.get('SELECT * FROM inventory_sessions WHERE id = ?', [sessionId], (err, row) => {
                    if (err) rej(err);
                    else res(row);
                });
            });
            
            if (!session) {
                reject(new Error('Sesiunea nu a fost găsită'));
                return;
            }
            
            // Obține numărătorile
            const items = await new Promise((res, rej) => {
                db.all(`
                    SELECT 
                        i.id,
                        i.name,
                        i.unit,
                        i.current_stock,
                        ic.counted_stock,
                        i.cost_per_unit,
                        (CASE 
                            WHEN ic.counted_stock IS NOT NULL 
                            THEN ic.counted_stock - i.current_stock 
                            ELSE NULL 
                        END) as difference,
                        (CASE 
                            WHEN ic.counted_stock IS NOT NULL 
                            THEN (ic.counted_stock - i.current_stock) * i.cost_per_unit 
                            ELSE NULL 
                        END) as difference_value
                    FROM ingredients i
                    LEFT JOIN inventory_counts ic ON i.id = ic.ingredient_id AND ic.session_id = ?
                    WHERE i.is_available = 1
                    ORDER BY i.name
                `, [sessionId], (err, rows) => {
                    if (err) rej(err);
                    else res(rows || []);
                });
            });
            
            resolve({
                session,
                items
            });
            
        } catch (err) {
            console.error('❌ Eroare la preluarea detaliilor sesiunii:', err);
            reject(err);
        }
    });
}

/**
 * 🧮 FUNCȚIE F.T.P.: Calculează cantitatea brută necesară pentru scăderea stocului
 * @param {Object} recipeItem - Obiectul din rețetă cu toate detaliile
 * @param {string} orderType - Tipul comenzii: 'dine_in', 'delivery', 'takeout'
 * @param {Array} customizations - Array cu customizările comenzii
 * @returns {number} - Cantitatea brută de scăzut din stoc
 */
function calculateGrossQuantity(recipeItem, orderType, customizations = []) {
  let netQuantity = recipeItem.quantity_needed;
  
  // 1. Aplică Variabilitatea (pe baza variable_consumption și customizations)
  if (recipeItem.variable_consumption && customizations.length > 0) {
    try {
      const variableRules = JSON.parse(recipeItem.variable_consumption);
      
      // Caută customizări care se potrivesc cu regulile de variabilitate
      for (let customization of customizations) {
        if (variableRules[customization.name]) {
          const multiplier = variableRules[customization.name];
          netQuantity *= multiplier;
          console.log(`📊 Variabilitate aplicată: ${customization.name} x${multiplier} = ${netQuantity}`);
          break; // Prima potrivire
        }
      }
    } catch (error) {
      console.warn('⚠️ Eroare la parsarea variable_consumption:', error);
    }
  }

  // 2. Aplică Logica Ambalajelor (Condiționalitate existentă în server.js)
  if (recipeItem.item_type && recipeItem.item_type.startsWith('packaging')) {
    const isDelivery = orderType === 'delivery' || orderType === 'takeout';
    const isRestaurant = orderType === 'dine_in';

    if ((recipeItem.item_type === 'packaging_delivery' && isDelivery) ||
        (recipeItem.item_type === 'packaging_restaurant' && isRestaurant)) {
      // Ambalajul se consumă
      console.log(`📦 Ambalaj consumat: ${recipeItem.item_type} pentru ${orderType}`);
      return netQuantity;
    } else {
      // Ambalajul nu se consumă pentru acest tip de comandă
      console.log(`🚫 Ambalaj nu se consumă: ${recipeItem.item_type} pentru ${orderType}`);
      return 0;
    }
  }
  
  // 3. Aplică % Deșeu (Waste) pentru Ingrediente
  if (recipeItem.item_type === 'ingredient' && recipeItem.waste_percentage > 0) {
    const wasteFactor = 1.0 - (recipeItem.waste_percentage / 100);
    const grossQuantity = netQuantity / wasteFactor; // Cantitatea reală de scăzut din stoc
    console.log(`🗑️ Deșeu aplicat: ${netQuantity} ÷ ${wasteFactor} = ${grossQuantity.toFixed(2)} (${recipeItem.waste_percentage}% deșeu)`);
    return grossQuantity;
  }

  return netQuantity; // Returnează Cantitatea Netă în caz contrar
}

// Funcție pentru scăderea stocului folosind sistemul FIFO
function decreaseStockFIFO(db, ingredientId, quantityNeeded, orderId, locationId = null) {
  return new Promise((resolve, reject) => {
    console.log(`🔵🔵🔵 [ETAPA 4] decreaseStockFIFO started for ingredient ${ingredientId}, qty: ${quantityNeeded}, location: ${locationId || 'global'}`);
    // Obținem loturile disponibile ordonate după data de achiziție (FIFO)
    // ETAPA 4: Filtrare după location_id dacă este specificat
    const query = locationId 
      ? `SELECT id, remaining_quantity, purchase_date, expiry_date, batch_number, location_id
         FROM ingredient_batches 
         WHERE ingredient_id = ? AND remaining_quantity > 0 AND location_id = ?
         ORDER BY purchase_date ASC, expiry_date ASC`
      : `SELECT id, remaining_quantity, purchase_date, expiry_date, batch_number, location_id
         FROM ingredient_batches 
         WHERE ingredient_id = ? AND remaining_quantity > 0
         ORDER BY purchase_date ASC, expiry_date ASC`;
    
    const params = locationId ? [ingredientId, locationId] : [ingredientId];
    
    db.all(query, params, (err, batches) => {
      if (err) {
        console.error(`❌❌ Query error for batches:`, err);
        return reject(err);
      }

      console.log(`🔵🔵🔵 Batches found for ingredient ${ingredientId}: ${batches ? batches.length : 0}`);
      
      if (!batches || batches.length === 0) {
        // Dacă nu avem loturi, folosim sistemul vechi
        console.log(`🔵🔵🔵 No batches, using legacy system for ingredient ${ingredientId}`);
        decreaseStockLegacy(db, ingredientId, quantityNeeded, orderId, locationId)
          .then(() => {
            console.log(`✅✅✅ Legacy decrease successful for ingredient ${ingredientId}`);
            resolve();
          })
          .catch((legacyErr) => {
            console.error(`❌❌ Legacy decrease failed for ingredient ${ingredientId}:`, legacyErr);
            reject(legacyErr);
          });
        return;
      }

      let remainingToDecrease = quantityNeeded;
      let traceRecords = [];

      // Scădem din loturi în ordinea FIFO
      for (let batch of batches) {
        if (remainingToDecrease <= 0) break;

        const quantityFromBatch = Math.min(remainingToDecrease, batch.remaining_quantity);
        
        // Actualizăm cantitatea rămasă în lot
        db.run(`
          UPDATE ingredient_batches 
          SET remaining_quantity = remaining_quantity - ?
          WHERE id = ?
        `, [quantityFromBatch, batch.id], (updateErr) => {
          if (updateErr) {
            return reject(updateErr);
          }
        });

        // Adăugăm înregistrare pentru trasabilitate
        if (orderId) {
          traceRecords.push({
            order_id: orderId,
            ingredient_id: ingredientId,
            batch_id: batch.id,
            quantity_used: quantityFromBatch
          });
        }

        remainingToDecrease -= quantityFromBatch;
        console.log(`📦 Lot ${batch.batch_number}: scăzut ${quantityFromBatch} (rămas: ${batch.remaining_quantity - quantityFromBatch})`);
      }

      if (remainingToDecrease > 0) {
        console.warn(`⚠️ Stoc insuficient în loturi pentru ingredient ${ingredientId}, folosind sistemul vechi pentru ${remainingToDecrease}`);
        // Pentru cantitatea rămasă, folosim sistemul vechi
        decreaseStockLegacy(db, ingredientId, remainingToDecrease, orderId, locationId)
          .then(() => {
            // Adăugăm înregistrările de trasabilitate
            if (traceRecords.length > 0) {
              return addTraceRecords(db, traceRecords);
            }
            return Promise.resolve();
          })
          .then(() => resolve())
          .catch(reject);
      } else {
        // Adăugăm înregistrările de trasabilitate
        if (traceRecords.length > 0) {
          addTraceRecords(db, traceRecords)
            .then(() => resolve())
            .catch(reject);
        } else {
          resolve();
        }
      }
    });
  });
}

// Funcție pentru scăderea stocului folosind sistemul vechi (pentru compatibilitate)
function decreaseStockLegacy(db, ingredientId, quantity, orderId, locationId = null) {
  return new Promise((resolve, reject) => {
    // ETAPA 4: Filtrare după location_id dacă este specificat
    const query = locationId
      ? `UPDATE ingredients
         SET current_stock = current_stock - ?,
             last_updated = CURRENT_TIMESTAMP
         WHERE id = ? AND location_id = ?`
      : `UPDATE ingredients
         SET current_stock = current_stock - ?,
             last_updated = CURRENT_TIMESTAMP
         WHERE id = ?`;
    
    const params = locationId ? [quantity, ingredientId, locationId] : [quantity, ingredientId];
    
    db.run(query, params, function(updateErr) {
      if (updateErr) {
        return reject(updateErr);
      }
      
      // Adăugăm înregistrare în trace (cu batch_id = 0 pentru legacy mode)
      if (orderId) {
        db.run(`
          INSERT INTO order_ingredient_trace (order_id, ingredient_id, batch_id, quantity_used)
          VALUES (?, ?, 0, ?)
        `, [orderId, ingredientId, quantity], (traceErr) => {
          // Ignorăm erorile de trace - nu blochează scăderea stocului
          if (traceErr) {
            console.warn(`⚠️ Eroare salvare trace pentru ingredient ${ingredientId}:`, traceErr.message);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

// Funcție pentru adăugarea înregistrărilor de trasabilitate
function addTraceRecords(db, traceRecords) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO order_ingredient_trace (order_id, ingredient_id, batch_id, quantity_used)
      VALUES (?, ?, ?, ?)
    `);

    traceRecords.forEach(record => {
      stmt.run([record.order_id, record.ingredient_id, record.batch_id, record.quantity_used]);
    });

    stmt.finalize((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

// Funcție pentru adăugarea unui lot nou de ingredient
function addIngredientBatch(ingredientId, batchData) {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      const {
        batch_number,
        barcode,
        quantity,
        purchase_date,
        expiry_date,
        supplier,
        invoice_number,
        unit_cost
      } = batchData;

      db.run(`
        INSERT INTO ingredient_batches (
          ingredient_id, batch_number, barcode, quantity, remaining_quantity,
          purchase_date, expiry_date, supplier, invoice_number, unit_cost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ingredientId, batch_number, barcode, quantity, quantity,
        purchase_date, expiry_date, supplier, invoice_number, unit_cost
      ], function(err) {
        if (err) {
          return reject(err);
        }
        
        // Actualizăm și stocul total al ingredientului
        db.run(`
          UPDATE ingredients 
          SET current_stock = current_stock + ?,
              last_updated = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [quantity, ingredientId], (updateErr) => {
          if (updateErr) {
            return reject(updateErr);
          }
          resolve(this.lastID);
        });
      });
    });
  });
}

// Funcție pentru obținerea loturilor unui ingredient
function getIngredientBatches(ingredientId) {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ib.*, i.name as ingredient_name, i.unit
        FROM ingredient_batches ib
        JOIN ingredients i ON ib.ingredient_id = i.id
        WHERE ib.ingredient_id = ?
        ORDER BY ib.purchase_date ASC, ib.expiry_date ASC
      `, [ingredientId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  });
}

// Funcție pentru obținerea trasabilității unei comenzi
function getOrderTraceability(orderId) {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          oit.*,
          i.name as ingredient_name,
          i.unit,
          ib.batch_number,
          ib.purchase_date,
          ib.expiry_date,
          ib.supplier
        FROM order_ingredient_trace oit
        JOIN ingredients i ON oit.ingredient_id = i.id
        JOIN ingredient_batches ib ON oit.batch_id = ib.id
        WHERE oit.order_id = ?
        ORDER BY i.name
      `, [orderId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  });
}

// ==================== FUNCȚII WASTE ȘI LOSSES ====================

/**
 * Adaugă înregistrare în tabela WASTE (deșeuri justificate)
 */
async function addToWaste(itemType, itemId, itemName, quantity, unit, reason, orderId = null, notes = null, recordedBy = null) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO waste (item_type, item_id, item_name, quantity, unit, reason, order_id, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [itemType, itemId, itemName, quantity, unit, reason, orderId, notes, recordedBy], function(err) {
      if (err) return reject(err);
      console.log(`♻️ WASTE: ${itemName} (${quantity} ${unit}) - Motiv: ${reason}`);
      resolve(this.lastID);
    });
  });
}

/**
 * Adaugă înregistrare în tabela LOSSES (lipsuri nejustificate)
 */
async function addToLosses(itemType, itemId, itemName, expectedQuantity, actualQuantity, difference, unit, inventorySessionId = null, notes = null, recordedBy = null) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO losses (item_type, item_id, item_name, expected_quantity, actual_quantity, difference, unit, inventory_session_id, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [itemType, itemId, itemName, expectedQuantity, actualQuantity, difference, unit, inventorySessionId, notes, recordedBy], function(err) {
      if (err) return reject(err);
      console.log(`📉 LOSSES: ${itemName} - Diferență: ${difference} ${unit} (Așteptat: ${expectedQuantity}, Găsit: ${actualQuantity})`);
      resolve(this.lastID);
    });
  });
}

/**
 * Obține înregistrările WASTE cu filtrare
 */
async function getWasteRecords(startDate = null, endDate = null, itemType = null, reason = null) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM waste WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }
    if (itemType) {
      query += ' AND item_type = ?';
      params.push(itemType);
    }
    if (reason) {
      query += ' AND reason = ?';
      params.push(reason);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Obține înregistrările LOSSES cu filtrare
 */
async function getLossesRecords(startDate = null, endDate = null, itemType = null) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM losses WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }
    if (itemType) {
      query += ' AND item_type = ?';
      params.push(itemType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// ==================== FUNCȚII PENTRU RAPOARTE FISCALE ====================

/**
 * Obține ultimul număr de Raport Z (z_number)
 * @returns {number}
 */
async function getLastZReportNumber() {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        db.get('SELECT MAX(z_number) as max_z FROM daily_z_reports', [], (err, row) => {
            if (err) return reject(err);
            resolve(row?.max_z || 0);
        });
    });
}

/**
 * Salvează un Raport Z în baza de date și marchează bonurile ca închise.
 * @param {object} reportData - Datele agregate ale raportului.
 * @param {string[]} receiptIds - ID-urile bonurilor incluse în raport.
 * @returns {object} ID-ul și numărul noului raport Z.
 */
async function saveZReport(reportData, receiptIds) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) return reject(err);
            
            // 1. Obține noul număr Z
            getLastZReportNumber().then(lastZ => {
                const newZNumber = lastZ + 1;
                const reportDate = new Date().toISOString().split('T')[0];

                // 2. Inserează Raportul Z
                db.run(`INSERT INTO daily_z_reports (z_number, report_date, total_revenue, total_vat, vat_breakdown, payment_methods, total_receipts) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                    [newZNumber, reportDate, reportData.totalRevenue, reportData.totalVat, JSON.stringify(reportData.vatBreakdown), JSON.stringify(reportData.paymentMethods), reportData.count], 
                    function (err) {
                        if (err) { db.run('ROLLBACK', () => reject(err)); return; }
                        const zReportId = this.lastID;

                        // 3. Marchează bonurile fiscale ca închise
                        if (receiptIds.length > 0) {
                            const placeholders = receiptIds.map(() => '?').join(',');
                            db.run(`UPDATE fiscal_receipts SET z_report_id = ? WHERE id IN (${placeholders})`, 
                                [zReportId, ...receiptIds], 
                                (err) => {
                                    if (err) { db.run('ROLLBACK', () => reject(err)); return; }
                                    db.run('COMMIT', (err) => {
                                        if (err) return reject(err);
                                        resolve({ zReportId, zNumber: newZNumber });
                                    });
                                }
                            );
                        } else {
                            // Cazul în care se închide ziua fără vânzări
                            db.run('COMMIT', (err) => {
                                if (err) return reject(err);
                                resolve({ zReportId, zNumber: newZNumber });
                            });
                        }
                    }
                );
            }).catch(error => {
                db.run('ROLLBACK', () => reject(error));
            });
        });
    });
}

// Export database protection functions
const { protectedWrite, checkDatabaseIntegrity, createAutoBackup } = require('./database-protection.js');

module.exports = {
  // Database protection exports
  protectedWrite,
  checkDatabaseIntegrity,
  createAutoBackup, 
  dbPromise, 
  initializeDailyMenu, 
  decreaseIngredientStock, 
  increaseIngredientStock, 
  producePizzaDough,
  getActiveHappyHourSettings,
  applyHappyHourDiscount,
  recordHappyHourUsage,
  initializeVipLevels,
  calculateVipLevel,
  addLoyaltyPoints,
  getAvailableRewards,
  useReward,
  initializeRolesAndPermissions,
  checkPermission,
  getUserPermissions,
  createUser,
  getUserByUsername,
  createSession,
  validateSession,
  logAuditEvent,
  initializeReservationSystem,
  createReservation,
  getAvailableTables,
  updateTableAvailability,
  getReservationsByDate,
  updateReservationStatus,
  getReservationSettings,
  updateReservationSettings,
  getReservationStats,
  initializeFiscalSystem,
  getFiscalConfig,
  updateFiscalConfig,
  createFiscalDocument,
  updateFiscalDocumentStatus,
  logAnafTransmission,
  getFiscalDocuments,
  getVatRates,
  createCustomer,
  getCustomers,
  calculateGrossQuantity,
  getInventoryDetails,
  updateInventoryCount,
  createInventorySession,
  finalizeInventorySession,
  getInventorySessions,
  getInventorySessionDetails,
  decreaseStockFIFO,
  decreaseStockLegacy,
  addTraceRecords,
  addIngredientBatch,
  getIngredientBatches,
  getOrderTraceability,
  addToWaste,
  
  // FUNCȚII NOI PENTRU RAPOARTE FISCALE:
  getLastZReportNumber, 
  saveZReport,
  addToLosses,
  getWasteRecords,
  getLossesRecords,
  
  // Export dbPromise pentru helpers (Multi-Gestiune, Transferuri)
  dbPromise
};