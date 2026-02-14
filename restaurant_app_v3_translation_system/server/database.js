// server/database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// Try to load database-protection.js (optional - may not exist in all environments)
let initializeDatabaseProtection;
try {
  const dbProtection = require('./database-protection.js');
  initializeDatabaseProtection = dbProtection.initializeDatabaseProtection;
  console.log('✅ database-protection.js loaded');
} catch (error) {
  console.warn('⚠️ database-protection.js not found, continuing without it:', error.message);
  initializeDatabaseProtection = async () => {
    console.log('ℹ️ Database protection not available (database-protection.js missing)');
    return Promise.resolve();
  };
}

const { createEnterpriseTables } = require('./database-enterprise-tables.js');
const { createHaccpTables } = require('./database-haccp-tables.js');
const { createDiscountProtocolTables } = require('./database-discount-protocol.js');

const PIN_SALT_BYTES = 16;
const PIN_SCRYPT_KEY_LENGTH = 64;
const PIN_ROTATION_POLICY_VERSION = 1;
const PIN_PATTERN = /^\d{4}$/;

function createPinHash(pin, salt = crypto.randomBytes(PIN_SALT_BYTES).toString('hex')) {
  if (!PIN_PATTERN.test(pin)) {
    throw new Error('PIN invalid - trebuie să conțină exact 4 cifre.');
  }

  const hashBuffer = crypto.scryptSync(pin, salt, PIN_SCRYPT_KEY_LENGTH);
  return {
    salt,
    hash: hashBuffer.toString('hex')
  };
}

function verifyPinHash(pin, hash, salt) {
  if (!hash || !salt) {
    return false;
  }
  try {
    const derived = crypto.scryptSync(pin, salt, PIN_SCRYPT_KEY_LENGTH).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  } catch (error) {
    console.error('Eroare la verificarea hash-ului de PIN:', error);
    return false;
  }
}

function safeJsonParse(value, fallback = null) {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

// CALE ABSOLUTĂ pentru a evita probleme de current working directory
const DB_PATH = path.join(__dirname, 'restaurant.db');

const dbPromise = new Promise((resolve, reject) => {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ [DATABASE ERROR] Eroare la conectarea la baza de date:', err.message);
      console.error('📍 Cod eroare:', err.code);
      reject(err);
    } else {
      console.log('✅ Conectat la baza de date SQLite. Se inițializează...');

      // Gestionare erori pentru baza de date
      db.on('error', (error) => {
        // Ignoră erorile de tip "no such column: status" din trigger-e (sunt rezolvate prin migrare)
        if (error.message && error.message.includes('no such column: status')) {
          console.warn('⚠️ [DATABASE WARNING] Eroare temporară de trigger (va fi rezolvată la următoarea inițializare):', error.message);
          return; // Nu logăm ca eroare critică
        }
        // Ignoră erorile de tip "no such table: order_items" - tabela va fi creată
        if (error.message && error.message.includes('no such table: order_items')) {
          console.warn('⚠️ [DATABASE WARNING] Tabela order_items nu există încă (va fi creată):', error.message);
          return; // Nu logăm ca eroare critică
        }
        console.error('❌ [DATABASE ERROR] Eroare în baza de date:', error.message);
        console.error('📍 Cod:', error.code);
        // Nu oprim serverul - continuă să ruleze
        console.log('⚠️ Serverul continuă să ruleze (eroarea a fost logată)');
      });

      // Configurare timeout pentru a preveni blocarea (mărit pentru high concurrency)
      db.configure('busyTimeout', 10000); // 10 secunde

      // Optimizări pentru high concurrency (200+ clienți simultan)
      db.run("PRAGMA journal_mode = WAL", (err) => {
        if (err) {
          console.warn('⚠️ Error setting WAL mode:', err.message);
        } else {
          console.log('✅ WAL mode enabled for concurrent access');
        }
      });

      db.run("PRAGMA synchronous = NORMAL", (err) => {
        if (err) {
          console.warn('⚠️ Error setting synchronous mode:', err.message);
        } else {
          console.log('✅ Synchronous mode set to NORMAL (optimized for WAL)');
        }
      });

      db.run("PRAGMA cache_size = -64000", (err) => { // 64MB cache
        if (err) {
          console.warn('⚠️ Error setting cache size:', err.message);
        } else {
          console.log('✅ Cache size set to 64MB');
        }
      });

      db.run("PRAGMA temp_store = MEMORY", (err) => {
        if (err) {
          console.warn('⚠️ Error setting temp_store:', err.message);
        } else {
          console.log('✅ Temp store set to MEMORY');
        }
      });

      // Activare foreign keys pentru integritatea bazei de date
      db.run("PRAGMA foreign_keys = ON", (err) => {
        if (err) {
          console.error('⚠️ Eroare la activarea foreign_keys:', err.message);
          // Continuă chiar dacă eșuează
        } else {
          console.log('✅ Foreign keys active pentru integritatea bazei de date');
        }

        // Continuă cu inițializarea după ce foreign keys sunt activate
        initializeDb(db)
          .then(() => {
            // Creează tabelele Enterprise
            return createEnterpriseTables(db);
          })
          .then(() => {
            // Creează tabelele HACCP
            return createHaccpTables(db);
          })
          .then(() => {
            // Creează tabelele pentru Discount & Protocol Sales
            return createDiscountProtocolTables();
          })
          .then(async () => {
            // FIX: Verificare și reparare schemă ingredients (coloana code) - Rulat DUPĂ creare tabele
            try {
              await new Promise((resolveMig, rejectMig) => {
                db.all("PRAGMA table_info(ingredients)", [], (err, cols) => {
                  if (err) {
                    console.warn('⚠️ Nu s-a putut verifica tabelul ingredients:', err.message);
                    return resolveMig();
                  }

                  const hasCode = cols.some(c => c.name === 'code');
                  if (!hasCode && cols.length > 0) {
                    console.log('⚠️ Coloana [code] lipsește din tabelul ingredients. Se adaugă...');
                    db.run("ALTER TABLE ingredients ADD COLUMN code TEXT", (err) => {
                      if (err) console.error('Eroare la adăugarea coloanei code:', err);
                      else console.log('✅ Coloana [code] adăugată cu succes.');
                      // Re-indexăm coloana code
                      db.run("CREATE INDEX IF NOT EXISTS idx_ingredients_code ON ingredients(code)", () => resolveMig());
                    });
                  } else {
                    resolveMig();
                  }
                });
              });

              // Populare coduri lipsă
              await new Promise((resolvePop, rejectPop) => {
                db.all("SELECT id FROM ingredients WHERE code IS NULL OR code = ''", [], (err, rows) => {
                  if (err) return resolvePop();

                  if (rows && rows.length > 0) {
                    console.log(`📝 Se generează coduri pentru ${rows.length} ingrediente...`);
                    db.serialize(() => {
                      db.run("BEGIN TRANSACTION");
                      const stmt = db.prepare("UPDATE ingredients SET code = ? WHERE id = ?");
                      rows.forEach(row => {
                        stmt.run(`ING-${String(row.id).padStart(5, '0')}`, row.id);
                      });
                      stmt.finalize();
                      db.run("COMMIT", (err) => {
                        if (err) console.error('Eroare commit:', err);
                        else console.log('✅ Coduri generate cu succes.');
                        resolvePop();
                      });
                    });
                  } else {
                    resolvePop();
                  }
                });
              });
            } catch (err) {
              console.error('❌ Eroare la repararea schemei ingredients:', err);
            }
          }) // Added this closing brace and parenthesis
          .then(() => {
            // Inițializează sistemul de protecție după inițializarea tabelelor
            return initializeDatabaseProtection(db);
          })
          .then(() => {
            // Creează indexuri de performanță
            return createPerformanceIndexes(db);
          })
          .then(() => {
            // Migrare: Adaugă coloana password_hash în tabelul customers dacă nu există
            return new Promise((resolveMigration, rejectMigration) => {
              db.all("PRAGMA table_info(customers)", [], (err, cols) => {
                if (err) {
                  console.warn('⚠️ Could not check customers table structure:', err.message);
                  return resolveMigration(); // Continuă oricum
                }

                const hasPasswordHash = cols.some(col => col.name === 'password_hash');
                if (!hasPasswordHash) {
                  db.run('ALTER TABLE customers ADD COLUMN password_hash TEXT', (alterErr) => {
                    if (!alterErr) {
                      console.log('✅ Added password_hash column to customers table (migration)');
                    } else if (alterErr.message && !alterErr.message.includes('duplicate column')) {
                      console.error('❌ Error adding password_hash column:', alterErr);
                    }
                    resolveMigration(); // Continuă oricum
                  });
                } else {
                  resolveMigration();
                }
              });
            });
          })
          .then(() => {
            // Promisify database methods for cleaner async/await usage
            const { promisify } = require('util');
            db.allAsync = promisify(db.all).bind(db);
            db.getAsync = promisify(db.get).bind(db);
            db.runAsync = promisify(db.run).bind(db);
            db.execAsync = promisify(db.exec).bind(db);

            // Add legacy compatibility: some modules use await db.all()
            // We'll wrap the original methods to return promises if no callback is provided
            const originalAll = db.all.bind(db);
            db.all = function (sql, params, callback) {
              if (typeof params === 'function') {
                callback = params;
                params = [];
              }
              if (typeof callback === 'function') {
                return originalAll(sql, params, callback);
              }
              return new Promise((resolve, reject) => {
                originalAll(sql, params, (err, rows) => {
                  if (err) reject(err);
                  else resolve(rows || []);
                });
              });
            };

            const originalGet = db.get.bind(db);
            db.get = function (sql, params, callback) {
              if (typeof params === 'function') {
                callback = params;
                params = [];
              }
              if (typeof callback === 'function') {
                return originalGet(sql, params, callback);
              }
              return new Promise((resolve, reject) => {
                originalGet(sql, params, (err, row) => {
                  if (err) reject(err);
                  else resolve(row);
                });
              });
            };

            const originalRun = db.run.bind(db);
            db.run = function (sql, params, callback) {
              if (typeof params === 'function') {
                callback = params;
                params = [];
              }
              if (typeof callback === 'function') {
                return originalRun(sql, params, callback);
              }
              return new Promise((resolve, reject) => {
                originalRun(sql, params, function (err) {
                  if (err) reject(err);
                  else resolve({ lastID: this.lastID, changes: this.changes });
                });
              });
            };

            const originalExec = db.exec.bind(db);
            db.exec = function (sql, callback) {
              if (typeof callback === 'function') {
                return originalExec(sql, callback);
              }
              return new Promise((resolve, reject) => {
                originalExec(sql, (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
            };

            console.log('✅ Baza de date inițializată cu succes (including Enterprise tables and promisified methods)');
            resolve(db);
          })
          .catch((error) => {
            console.error('❌ [DATABASE INIT ERROR] Eroare la inițializarea bazei de date:', error.message);
            reject(error);
          });
      }); // închide callback db.run
    } // închide else
  }); // închide callback Database
}); // închide Promise


dbPromise
  .then((db) => migrateWaiterPinStorage(db))
  .catch((error) => {
    console.error('❌ Migrarea hash-urilor pentru PIN-urile ospătarilor a eșuat:', error);
  });

// Initialize the database
function initializeDb(db) {
  return new Promise((resolve, reject) => {
    // IMPORTANT: Creează order_items înainte de serialize pentru a evita race conditions
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      name TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      total REAL NOT NULL,
      category_id INTEGER,
      station TEXT,
      notes TEXT,
      customizations TEXT,
      status TEXT DEFAULT 'pending', 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES menu (id) ON DELETE SET NULL
    )`, (err) => {
      if (err) {
        console.error('❌ Eroare la crearea tabelei order_items (pre-serialize):', err.message);
      } else {
        console.log('✅ Tabelă order_items creată/verificată (pre-serialize)');
      }
    });

    db.serialize(() => {
      // Șterge trigger-urile vechi înainte de orice altă operație (pentru a evita erorile "no such column: status")
      db.run(`DROP TRIGGER IF EXISTS recalculate_recipe_costs_on_ingredient_update`, () => { });
      db.run(`DROP TRIGGER IF EXISTS recalculate_recipe_costs_on_subrecipe_update`, () => { });
      db.run(`DROP TRIGGER IF EXISTS calculate_cogs_on_order_insert`, () => { });
      db.run(`DROP TRIGGER IF EXISTS calculate_cogs_on_order_update`, () => { });
      db.run(`DROP TRIGGER IF EXISTS record_stock_move_on_order`, () => { });

      // Creăm direct schema corectă și completă
      db.run(`CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, description TEXT, weight TEXT, is_vegetarian BOOLEAN DEFAULT 0, is_spicy BOOLEAN DEFAULT 0, is_takeout_only BOOLEAN DEFAULT 0, allergens TEXT, name_en TEXT, description_en TEXT, category_en TEXT, allergens_en TEXT, info TEXT, ingredients TEXT, prep_time INTEGER, spice_level INTEGER DEFAULT 0, calories REAL, protein REAL, carbs REAL, fat REAL, fiber REAL, sodium REAL, sugar REAL, salt REAL, image_url TEXT, is_sellable BOOLEAN DEFAULT 1, is_active INTEGER DEFAULT 1)`);
      db.run(`CREATE TABLE IF NOT EXISTS customization_options (id INTEGER PRIMARY KEY, menu_item_id INTEGER, option_name TEXT, option_type TEXT, extra_price REAL DEFAULT 0, option_name_en TEXT, FOREIGN KEY (menu_item_id) REFERENCES menu (id))`);
      db.run(`CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, type TEXT, isTogether BOOLEAN, items TEXT, status TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, completed_timestamp DATETIME, delivered_timestamp DATETIME, cancelled_timestamp DATETIME, cancelled_reason TEXT, table_number TEXT, client_identifier TEXT, is_paid BOOLEAN DEFAULT 0, paid_timestamp DATETIME, food_notes TEXT, drink_notes TEXT, general_notes TEXT, total REAL, location_id INTEGER DEFAULT 1, friendsride_order_id TEXT, friendsride_restaurant_id TEXT, delivery_pickup_code TEXT, delivery_pickup_code_verified BOOLEAN DEFAULT 0, delivery_pickup_code_verified_at DATETIME, friendsride_webhook_url TEXT, delivery_address TEXT, payment_method TEXT, customer_phone TEXT, customer_name TEXT, split_bill TEXT)`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei orders:', err.message);
        } else {
          // Adaugă coloana status dacă nu există (migrare pentru baze de date vechi)
          db.run(`ALTER TABLE orders ADD COLUMN status TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders.status:', err.message);
            } else if (!err) {
              console.log('✅ Coloană status adăugată în orders (migrare)');
            }
          });
          // Adaugă coloana location_id dacă nu există (migrare pentru baze de date vechi)
          db.run(`ALTER TABLE orders ADD COLUMN location_id INTEGER DEFAULT 1`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders:', err.message);
            } else if (!err) {
              console.log('✅ Coloană location_id adăugată în orders (migrare)');
            }
          });
          // Adaugă coloana split_bill dacă nu există (migrare pentru split bill avansat)
          db.run(`ALTER TABLE orders ADD COLUMN split_bill TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders split_bill:', err.message);
            } else if (!err) {
              console.log('✅ Coloană split_bill adăugată în orders (migrare)');
            }
          });
          // PHASE S12 - Payment Engine V3: Extindere orders cu total_paid și payment_summary
          db.run(`ALTER TABLE orders ADD COLUMN total_paid REAL DEFAULT 0`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders total_paid:', err.message);
            } else if (!err) {
              console.log('✅ Coloană total_paid adăugată în orders (S12)');
            }
          });
          db.run(`ALTER TABLE orders ADD COLUMN payment_summary TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders payment_summary:', err.message);
            } else if (!err) {
              console.log('✅ Coloană payment_summary adăugată în orders (S12)');
            }
          });
          // 🔴 FIX 1 - Protecție comenzi duplicate: idempotency_key
          db.run(`ALTER TABLE orders ADD COLUMN idempotency_key TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders idempotency_key:', err.message);
            } else if (!err) {
              console.log('✅ Coloană idempotency_key adăugată în orders (FIX 1)');
              // Creează UNIQUE INDEX pentru idempotency_key (după ce coloana este creată)
              db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key)`, (indexErr) => {
                if (indexErr && !indexErr.message.includes('already exists')) {
                  console.error('⚠️ Eroare la crearea indexului idx_orders_idempotency:', indexErr.message);
                } else if (!indexErr) {
                  console.log('✅ Index UNIQUE idempotency_key creat (FIX 1)');
                }
              });
            }
          });
          // FAZA 2.D - Adaugă coloane pentru coordonate delivery (geocoding)
          db.run(`ALTER TABLE orders ADD COLUMN delivery_lat REAL`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders.delivery_lat:', err.message);
            } else if (!err) {
              console.log('✅ Coloană delivery_lat adăugată în orders (FAZA 2.D)');
            }
          });
          db.run(`ALTER TABLE orders ADD COLUMN delivery_lng REAL`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare orders.delivery_lng:', err.message);
            } else if (!err) {
              console.log('✅ Coloană delivery_lng adăugată în orders (FAZA 2.D)');
            }
          });
        }
      });

      // IMPORTANT: order_items trebuie creată IMEDIAT după orders pentru a evita erorile
      // Tabelă order_items (pentru itemi din comenzi clienți) - CREATĂ IMEDIAT DUPĂ ORDERS
      db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        name TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        total REAL NOT NULL,
        category_id INTEGER,
        station TEXT,
        notes TEXT,
        customizations TEXT,
        status TEXT DEFAULT 'pending', 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES menu (id) ON DELETE SET NULL
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei order_items:', err.message);
        } else {
          console.log('✅ Tabelă order_items creată/verificată');
          // Index pentru order_items (după ce ambele tabele sunt create)
          db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`, (err) => {
            if (err && !err.message.includes('already exists')) {
              console.error('Eroare la crearea indexului order_items:', err.message);
            }
          });

          // Migrare: Adaugă coloana status dacă linsește
          db.run(`ALTER TABLE order_items ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
              console.error('⚠️ Notă migrare order_items.status:', err.message);
            } else if (!err) {
              console.log('✅ Coloană status adăugată în order_items (migrare)');
            }
          });
        }
      });

      // PHASE S12 - Payment Engine V3: Tabel payments
      db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        amount NUMERIC NOT NULL,
        currency TEXT NOT NULL DEFAULT 'RON',
        method TEXT NOT NULL,
        provider TEXT NULL,
        reference TEXT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NULL,
        meta TEXT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei payments:', err.message);
        } else {
          console.log('✅ Tabel payments creat (S12)');
          // Indexuri pentru performanță
          db.run(`CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)`, (err) => {
            if (err) console.error('⚠️ Eroare la crearea indexului payments.order_id:', err.message);
          });
          // Verifică dacă coloana status există, apoi adaugă dacă lipsește
          db.all(`PRAGMA table_info(payments)`, (err, columns) => {
            if (err) {
              console.error('⚠️ Eroare la verificarea coloanelor payments:', err.message);
              return;
            }

            const hasStatus = columns && columns.some(col => col.name === 'status');

            if (!hasStatus) {
              // Adaugă coloana status dacă lipsește
              db.run(`ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'PENDING'`, (err) => {
                if (err) {
                  console.error('⚠️ Eroare la adăugarea coloanei payments.status:', err.message);
                } else {
                  console.log('✅ Coloană status adăugată în payments');
                }
                // Creează indexul DUPĂ ce coloana este adăugată
                db.run(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`, (err) => {
                  if (err) {
                    console.error('⚠️ Eroare la crearea indexului payments.status:', err.message);
                  } else {
                    console.log('✅ Index idx_payments_status creat/verificat');
                  }
                });
              });
            } else {
              // Coloana există deja, creează doar indexul
              db.run(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`, (err) => {
                if (err) {
                  console.error('⚠️ Eroare la crearea indexului payments.status:', err.message);
                } else {
                  console.log('✅ Index idx_payments_status creat/verificat');
                }
              });
            }
          });
        }
      });
      db.run(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY, type TEXT, table_number TEXT, order_id INTEGER, title TEXT, message TEXT, status TEXT DEFAULT 'unread', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, read_at DATETIME)`);

      // Migration: Add multilingual support to notifications
      db.run(`ALTER TABLE notifications ADD COLUMN title_en TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration notifications.title_en:', err.message);
        }
      });
      db.run(`ALTER TABLE notifications ADD COLUMN message_en TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Migration notifications.message_en:', err.message);
        } else if (!err) {
          console.log('✅ Added multilingual support to notifications table');
        }
      });

      // PHASE - Idempotency Keys Table pentru Payments
      db.run(`CREATE TABLE IF NOT EXISTS idempotency_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idempotency_key TEXT NOT NULL UNIQUE,
        payment_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        amount NUMERIC NOT NULL,
        method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        payment_data TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei idempotency_keys:', err.message);
        } else {
          console.log('✅ Tabel idempotency_keys creat');
          // Indexuri pentru performanță
          db.run(`CREATE INDEX IF NOT EXISTS idx_idempotency_key ON idempotency_keys(idempotency_key)`, (err) => {
            if (err) console.error('⚠️ Eroare la crearea indexului idempotency_key:', err.message);
          });
          db.run(`CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at)`, (err) => {
            if (err) console.error('⚠️ Eroare la crearea indexului idempotency_expires:', err.message);
          });
        }
      });
      db.run(`CREATE TABLE IF NOT EXISTS waiters (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'waiter',
        pin TEXT,
        pin_hash TEXT,
        pin_salt TEXT,
        pin_policy_version INTEGER DEFAULT 1,
        pin_last_rotated_at DATETIME,
        pin_rotated_by INTEGER,
        tables TEXT,
        active BOOLEAN DEFAULT 1,
        location_id INTEGER,
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME,
        FOREIGN KEY (pin_rotated_by) REFERENCES waiters (id)
      )`);
      const waiterColumnsMigration = [
        `ALTER TABLE waiters ADD COLUMN role TEXT DEFAULT "waiter"`,
        `ALTER TABLE waiters ADD COLUMN pin TEXT`,
        `ALTER TABLE waiters ADD COLUMN pin_hash TEXT`,
        `ALTER TABLE waiters ADD COLUMN pin_salt TEXT`,
        `ALTER TABLE waiters ADD COLUMN pin_policy_version INTEGER DEFAULT 1`,
        `ALTER TABLE waiters ADD COLUMN pin_last_rotated_at DATETIME`,
        `ALTER TABLE waiters ADD COLUMN pin_rotated_by INTEGER`,
        `ALTER TABLE waiters ADD COLUMN updated_at DATETIME`,
        `ALTER TABLE waiters ADD COLUMN last_login_at DATETIME`
      ];
      waiterColumnsMigration.forEach((statement) => {
        db.run(statement, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('⚠️ Notă migrare waiters:', err.message);
          }
        });
      });
      db.run(`CREATE TABLE IF NOT EXISTS waiter_pin_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        waiter_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        actor_id INTEGER,
        actor_name TEXT,
        rotation_reason TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (waiter_id) REFERENCES waiters (id)
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei waiter_pin_audit:', err.message);
        }
      });
      db.run(`CREATE TABLE IF NOT EXISTS user_pins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        pin TEXT,
        role TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME
      )`, (err) => {
        if (err) {
          console.error('Eroare la crearea tabelei user_pins:', err.message);
        } else {
          console.log('✅ Tabelă user_pins creată/verificată');
        }
      });

      // Index pentru order_items
      db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Eroare la crearea indexului order_items:', err.message);
        }
      });

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
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
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

      // Tabelă pentru system alerts
      db.run(`CREATE TABLE IF NOT EXISTS system_alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          severity TEXT NOT NULL,
          message TEXT NOT NULL,
          data TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          acknowledged BOOLEAN DEFAULT 0,
          acknowledged_by INTEGER,
          acknowledged_at DATETIME,
          FOREIGN KEY (acknowledged_by) REFERENCES users (id)
      )`);

      // ==================== MIGRARE MFA & SESSION MANAGEMENT ====================

      // Adaugă câmpuri MFA în users (dacă nu există)
      db.run(`ALTER TABLE users ADD COLUMN mfa_secret TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei mfa_secret:', err);
        } else if (!err) {
          console.log('✅ Coloană mfa_secret adăugată în users');
        }
      });

      db.run(`ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei mfa_enabled:', err);
        } else if (!err) {
          console.log('✅ Coloană mfa_enabled adăugată în users');
        }
      });

      // Adaugă coloana pin în users (pentru autentificare PIN)
      db.run(`ALTER TABLE users ADD COLUMN pin TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei pin:', err);
        } else if (!err) {
          console.log('✅ Coloană pin adăugată în users');
        }
      });

      // Adaugă last_activity în user_sessions (dacă nu există)
      // FIX: SQLite nu permite DEFAULT CURRENT_TIMESTAMP în ALTER TABLE
      db.run(`ALTER TABLE user_sessions ADD COLUMN last_activity DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei last_activity:', err);
        } else if (!err) {
          console.log('✅ Coloană last_activity adăugată în user_sessions');
          // Setează valori default pentru rândurile existente
          db.run(`UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE last_activity IS NULL`);
        }
      });

      // ==================== SISTEM REZERVĂRI ====================

      // Tabelă pentru mesele restaurantului
      db.run(`CREATE TABLE IF NOT EXISTS tables (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_number TEXT UNIQUE NOT NULL,
          capacity INTEGER NOT NULL DEFAULT 2,
          location TEXT,
          is_active BOOLEAN DEFAULT 1,
          location_id INTEGER,
          tenant_id INTEGER,
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
          location_id INTEGER,
          tenant_id INTEGER,
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

      // Tabelă pentru zone restaurant (areas)
      db.run(`CREATE TABLE IF NOT EXISTS areas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          name_en TEXT,
          type TEXT NOT NULL DEFAULT 'indoor',
          description TEXT,
          is_active INTEGER DEFAULT 1,
          display_order INTEGER DEFAULT 0,
          default_bar_location_id INTEGER,
          default_kitchen_location_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (default_bar_location_id) REFERENCES management_locations(id) ON DELETE SET NULL,
          FOREIGN KEY (default_kitchen_location_id) REFERENCES management_locations(id) ON DELETE SET NULL
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei areas:', err.message);
        } else {
          console.log('✅ Tabelă areas creată/verificată cu succes');

          // Verifică dacă coloana is_active există (pentru tabele existente)
          db.all(`PRAGMA table_info(areas)`, [], (err, columns) => {
            if (!err) {
              const hasIsActive = columns.some(col => col.name === 'is_active');
              if (!hasIsActive) {
                db.run(`ALTER TABLE areas ADD COLUMN is_active INTEGER DEFAULT 1`, (err) => {
                  if (err && !err.message.includes('duplicate column name')) {
                    console.error('❌ Eroare la adăugarea coloanei is_active în areas:', err.message);
                  } else if (!err) {
                    console.log('✅ Coloană is_active adăugată în areas');
                    db.run(`UPDATE areas SET is_active = 1 WHERE is_active IS NULL`);
                  }
                });
              }
            }
          });
        }
      });

      // Tabelă pentru notificări rezervări
      db.run(`CREATE TABLE IF NOT EXISTS reservation_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reservation_id INTEGER NOT NULL,
          notification_type TEXT NOT NULL CHECK (notification_type IN ('confirmation', 'reminder', 'cancellation', 'modification')),
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed')),
          FOREIGN KEY (reservation_id) REFERENCES reservations (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS reservation_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reservation_id INTEGER NOT NULL,
          event_type TEXT NOT NULL,
          payload TEXT,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_reservation_events_reservation_id
        ON reservation_events (reservation_id, created_at)`);

      // Migration: Add location_id and tenant_id to reservations if they don't exist
      db.run(`ALTER TABLE reservations ADD COLUMN location_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Could not add location_id to reservations:', err.message);
        }
      });
      db.run(`ALTER TABLE reservations ADD COLUMN tenant_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Could not add tenant_id to reservations:', err.message);
        }
      });

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

      // Tabelă pentru waitlist (listă așteptare mese)
      db.run(`CREATE TABLE IF NOT EXISTS waitlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT,
          party_size INTEGER NOT NULL DEFAULT 2,
          requested_date DATE NOT NULL,
          requested_time TIME NOT NULL,
          preferred_area TEXT,
          special_requests TEXT,
          status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'seated', 'cancelled', 'no_show')),
          position INTEGER DEFAULT 1,
          table_id INTEGER,
          notes TEXT,
          notified_at DATETIME,
          seated_at DATETIME,
          cancelled_at DATETIME,
          location_id INTEGER,
          tenant_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (table_id) REFERENCES tables (id)
      )`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_waitlist_date_status ON waitlist(requested_date, status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_waitlist_location ON waitlist(location_id, tenant_id)`);

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

      // PHASE S8.2 - Tabelă pentru invoices (e-Factura)
      db.run(`CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          invoice_number TEXT NOT NULL UNIQUE,
          xml_content TEXT NOT NULL,
          json_data TEXT,
          dto_data TEXT,
          status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'uploaded', 'rejected', 'confirmed', 'cancelled')),
          spv_id TEXT,
          spv_response TEXT,
          spv_error TEXT,
          cancellation_reason TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei invoices:', err.message);
        } else {
          // Verifică și adaugă coloana status dacă lipsește (pentru baze de date existente)
          db.all(`PRAGMA table_info(invoices)`, (err, columns) => {
            if (err) {
              console.error('⚠️ Eroare la verificarea coloanelor invoices:', err.message);
              return;
            }

            const hasStatus = columns && columns.some(col => col.name === 'status');

            if (!hasStatus) {
              db.run(`ALTER TABLE invoices ADD COLUMN status TEXT NOT NULL DEFAULT 'generated'`, (err) => {
                if (err) {
                  console.error('⚠️ Eroare la adăugarea coloanei invoices.status:', err.message);
                } else {
                  console.log('✅ Coloană status adăugată în invoices');
                }
              });
            }

            // Creează indexurile
            db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id)`, (err) => {
              if (err) console.error('⚠️ Eroare la crearea indexului invoices.order_id:', err.message);
            });
            // Creează indexul status doar dacă coloana există
            if (hasStatus || columns.some(col => col.name === 'status')) {
              db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`, (err) => {
                if (err) console.error('⚠️ Eroare la crearea indexului invoices.status:', err.message);
              });
            }
          });
        }
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number)`);

      // PHASE S7.3 - Tabelă pentru coada de printare bonuri fiscale
      db.run(`CREATE TABLE IF NOT EXISTS fiscal_print_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          receipt_id INTEGER NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          scheduled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

      // Indexuri pentru performanță
      db.run(`CREATE INDEX IF NOT EXISTS idx_fiscal_print_jobs_status
          ON fiscal_print_jobs(status)`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_fiscal_print_jobs_scheduled
          ON fiscal_print_jobs(status, scheduled_at)`);

      // Tabelă pentru clienții cu CUI (pentru facturi)
      // Tabelă pentru utilizatori KIOSK
      db.run(`CREATE TABLE IF NOT EXISTS kiosk_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('waiter', 'supervisor', 'admin')),
          full_name TEXT,
          is_active BOOLEAN DEFAULT 1,
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei kiosk_users:', err.message);
        } else {
          console.log('✅ Tabelă kiosk_users creată/verificată');

          // Inserează utilizatorul admin default dacă nu există
          db.get('SELECT id FROM kiosk_users WHERE username = ?', ['admin'], (err, row) => {
            if (err) {
              console.error('❌ Eroare la verificarea utilizatorului admin:', err.message);
            } else if (!row) {
              // Creează hash pentru parola "admin.5555"
              const crypto = require('crypto');
              const password = 'admin.5555';
              const salt = crypto.randomBytes(16).toString('hex');
              const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
              const password_hash = `${salt}:${hash}`;

              db.run(
                'INSERT INTO kiosk_users (username, password_hash, role, full_name, is_active) VALUES (?, ?, ?, ?, ?)',
                ['admin', password_hash, 'admin', 'Administrator', 1],
                function (err) {
                  if (err) {
                    console.error('❌ Eroare la crearea utilizatorului admin:', err.message);
                  } else {
                    console.log('✅ Utilizator admin KIOSK creat cu succes (username: admin, password: admin.5555)');
                  }
                }
              );
            }
          });
        }
      });

      // Tabele pentru audit KIOSK
      db.run(`CREATE TABLE IF NOT EXISTS kiosk_login_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          username TEXT NOT NULL,
          role TEXT NOT NULL,
          login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          logout_time DATETIME,
          device_id TEXT DEFAULT 'KIOSK_1',
          ip TEXT,
          FOREIGN KEY (user_id) REFERENCES kiosk_users (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei kiosk_login_history:', err.message);
        } else {
          console.log('✅ Tabelă kiosk_login_history creată/verificată');
        }
      });

      // Tabelă pentru login history admin (toți utilizatorii)
      db.run(`CREATE TABLE IF NOT EXISTS admin_login_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          username TEXT NOT NULL,
          role TEXT,
          login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          logout_time DATETIME,
          device_id TEXT,
          ip TEXT,
          user_agent TEXT,
          success BOOLEAN DEFAULT 1,
          failure_reason TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei admin_login_history:', err.message);
        } else {
          console.log('✅ Tabelă admin_login_history creată/verificată');
        }
      });

      // Tabelă pentru reguli de alertare securitate
      db.run(`CREATE TABLE IF NOT EXISTS security_alert_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rule_name TEXT NOT NULL,
          rule_type TEXT NOT NULL,
          threshold INTEGER NOT NULL,
          time_window_minutes INTEGER DEFAULT 60,
          severity TEXT DEFAULT 'medium',
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei security_alert_rules:', err.message);
        } else {
          console.log('✅ Tabelă security_alert_rules creată/verificată');
          // Inserează reguli default dacă nu există
          db.get('SELECT COUNT(*) as count FROM security_alert_rules', (err, row) => {
            if (!err && row.count === 0) {
              db.run(`INSERT INTO security_alert_rules (rule_name, rule_type, threshold, time_window_minutes, severity) VALUES
                ('Multiple Failed Logins', 'failed_logins', 3, 10, 'high'),
                ('Massive Deletions', 'massive_deletions', 10, 60, 'high'),
                ('Unusual IP Access', 'unusual_ip', 1, 60, 'medium'),
                ('Suspicious Activity', 'suspicious_activity', 5, 30, 'medium')`);
            }
          });
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS kiosk_actions_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER,
          username TEXT NOT NULL,
          table_id INTEGER,
          order_id INTEGER,
          action_type TEXT NOT NULL,
          details_json TEXT,
          FOREIGN KEY (user_id) REFERENCES kiosk_users (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei kiosk_actions_log:', err.message);
        } else {
          console.log('✅ Tabelă kiosk_actions_log creată/verificată');
        }
      });

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
          password_hash TEXT,
          customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company')),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Adaugă coloana password_hash dacă tabelul există deja fără ea (migration)
      db.all("PRAGMA table_info(customers)", [], (err, cols) => {
        if (!err) {
          const hasPasswordHash = cols.some(col => col.name === 'password_hash');
          if (!hasPasswordHash) {
            db.run('ALTER TABLE customers ADD COLUMN password_hash TEXT', (alterErr) => {
              if (!alterErr) {
                console.log('✅ Added password_hash column to customers table (migration)');
              } else if (!alterErr.message.includes('duplicate column')) {
                console.error('❌ Error adding password_hash column:', alterErr);
              }
            });
          }
        }
      });

      // Tabelă pentru configurarea TVA
      // COMMENTED OUT: Duplicate table definition - using enterprise multi-tenant version at line ~3612
      // db.run(`CREATE TABLE IF NOT EXISTS vat_rates (
      //     id INTEGER PRIMARY KEY AUTOINCREMENT,
      //     rate_name TEXT NOT NULL,
      //     rate_percentage REAL NOT NULL,
      //     rate_code TEXT NOT NULL,
      //     is_active BOOLEAN DEFAULT 1,
      //     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      // )`);

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

      // ==================== SETĂRI RESTAURANT ====================

      // Tabelă pentru metode de plată
      db.run(`CREATE TABLE IF NOT EXISTS payment_methods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          code TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          display_name_en TEXT,
          icon TEXT,
          is_active BOOLEAN DEFAULT 1,
          fee_percentage DECIMAL(5,2) DEFAULT 0,
          fee_fixed DECIMAL(10,2) DEFAULT 0,
          requires_change BOOLEAN DEFAULT 0,
          requires_receipt BOOLEAN DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          location_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei payment_methods:', err.message);
        else console.log('✅ Tabelă payment_methods creată/verificată');
      });

      // Tabelă pentru program restaurant
      db.run(`CREATE TABLE IF NOT EXISTS restaurant_schedule (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id INTEGER,
          day_of_week INTEGER NOT NULL,
          open_time TIME,
          close_time TIME,
          is_closed BOOLEAN DEFAULT 0,
          break_start TIME,
          break_end TIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES management_locations (id),
          UNIQUE(location_id, day_of_week)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei restaurant_schedule:', err.message);
        else console.log('✅ Tabelă restaurant_schedule creată/verificată');
      });

      // Tabelă pentru sărbători
      db.run(`CREATE TABLE IF NOT EXISTS holidays (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id INTEGER,
          date DATE NOT NULL,
          name TEXT NOT NULL,
          name_en TEXT,
          is_closed BOOLEAN DEFAULT 1,
          special_open_time TIME,
          special_close_time TIME,
          is_recurring BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei holidays:', err.message);
        else console.log('✅ Tabelă holidays creată/verificată');
      });

      // Tabelă pentru imprimante
      db.run(`CREATE TABLE IF NOT EXISTS printers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          location_id INTEGER,
          ip_address TEXT,
          port INTEGER DEFAULT 9100,
          connection_type TEXT DEFAULT 'network',
          is_active BOOLEAN DEFAULT 1,
          auto_print BOOLEAN DEFAULT 1,
          print_categories TEXT,
          paper_width INTEGER DEFAULT 80,
          test_print_count INTEGER DEFAULT 0,
          last_test_print DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei printers:', err.message);
        else console.log('✅ Tabelă printers creată/verificată');
      });

      // Tabelă pentru integrări
      db.run(`CREATE TABLE IF NOT EXISTS integrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          api_key TEXT,
          api_secret TEXT,
          access_token TEXT,
          refresh_token TEXT,
          token_expires_at DATETIME,
          is_active BOOLEAN DEFAULT 0,
          config_json TEXT,
          last_sync_at DATETIME,
          sync_status TEXT DEFAULT 'pending',
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei integrations:', err.message);
        else console.log('✅ Tabelă integrations creată/verificată');
      });

      // Tabelă pentru preferințe notificări
      db.run(`CREATE TABLE IF NOT EXISTS notification_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          notification_type TEXT NOT NULL,
          channel TEXT NOT NULL,
          is_enabled BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(user_id, notification_type, channel)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei notification_preferences:', err.message);
        else console.log('✅ Tabelă notification_preferences creată/verificată');
      });

      // Tabelă pentru setări localizare
      db.run(`CREATE TABLE IF NOT EXISTS localization_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id INTEGER,
          language TEXT DEFAULT 'ro',
          timezone TEXT DEFAULT 'Europe/Bucharest',
          date_format TEXT DEFAULT 'DD/MM/YYYY',
          time_format TEXT DEFAULT '24h',
          currency TEXT DEFAULT 'RON',
          currency_symbol TEXT DEFAULT 'RON',
          currency_position TEXT DEFAULT 'after',
          decimal_separator TEXT DEFAULT ',',
          thousand_separator TEXT DEFAULT '.',
          first_day_of_week INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES management_locations (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei localization_settings:', err.message);
        else console.log('✅ Tabelă localization_settings creată/verificată');
      });

      // Tabelă pentru teme UI
      db.run(`CREATE TABLE IF NOT EXISTS ui_themes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          primary_color TEXT DEFAULT '#007bff',
          secondary_color TEXT DEFAULT '#6c757d',
          background_color TEXT DEFAULT '#ffffff',
          text_color TEXT DEFAULT '#212529',
          accent_color TEXT DEFAULT '#28a745',
          is_active BOOLEAN DEFAULT 0,
          is_default BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei ui_themes:', err.message);
        else console.log('✅ Tabelă ui_themes creată/verificată');
      });

      // Tabelă pentru setări UI
      db.run(`CREATE TABLE IF NOT EXISTS ui_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id INTEGER,
          theme_id INTEGER,
          logo_url TEXT,
          favicon_url TEXT,
          custom_css TEXT,
          custom_js TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES management_locations (id),
          FOREIGN KEY (theme_id) REFERENCES ui_themes (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei ui_settings:', err.message);
        else console.log('✅ Tabelă ui_settings creată/verificată');
      });

      // Tabelă pentru istoric import
      db.run(`CREATE TABLE IF NOT EXISTS import_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          status TEXT DEFAULT 'pending',
          records_total INTEGER DEFAULT 0,
          records_imported INTEGER DEFAULT 0,
          records_failed INTEGER DEFAULT 0,
          errors_json TEXT,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei import_history:', err.message);
        else console.log('✅ Tabelă import_history creată/verificată');
      });

      // Tabelă pentru istoric export
      db.run(`CREATE TABLE IF NOT EXISTS export_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          format TEXT NOT NULL,
          file_path TEXT,
          file_size INTEGER,
          status TEXT DEFAULT 'pending',
          filters_json TEXT,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei export_history:', err.message);
        else console.log('✅ Tabelă export_history creată/verificată');
      });

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
      // Tabelă pentru order_items arhivate (pentru scalabilitate)
      db.run(`CREATE TABLE IF NOT EXISTS order_items_archive (
        id INTEGER PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT,
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        notes TEXT,
        created_at DATETIME,
        archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders_archive (id)
      )`, (err) => {
        if (err) console.error('❌ Eroare la crearea tabelei order_items_archive:', err.message);
        else console.log('✅ Tabelă order_items_archive creată/verificată');
      });

      // Indexuri pentru performanță (orders_archive)
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_archive_timestamp ON orders_archive(timestamp)`, (err) => {
        if (err) console.error('❌ Eroare la crearea indexului orders_archive.timestamp:', err.message);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_archive_status ON orders_archive(status)`, (err) => {
        if (err) console.error('❌ Eroare la crearea indexului orders_archive.status:', err.message);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_archive_is_paid ON orders_archive(is_paid)`, (err) => {
        if (err) console.error('❌ Eroare la crearea indexului orders_archive.is_paid:', err.message);
      });

      // Indexuri pentru performanță (order_items_archive)
      db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_archive_order_id ON order_items_archive(order_id)`, (err) => {
        if (err) console.error('❌ Eroare la crearea indexului order_items_archive.order_id:', err.message);
      });

      db.run(`CREATE TABLE IF NOT EXISTS orders_archive (
        id INTEGER PRIMARY KEY,
        type TEXT,
        isTogether BOOLEAN,
        items TEXT,
        status TEXT,
        timestamp DATETIME,
        completed_timestamp DATETIME,
        delivered_timestamp DATETIME,
        cancelled_timestamp DATETIME,
        cancelled_reason TEXT,
        table_number TEXT,
        client_identifier TEXT,
        is_paid BOOLEAN DEFAULT 0,
        paid_timestamp DATETIME,
        food_notes TEXT,
        drink_notes TEXT,
        general_notes TEXT,
        total REAL,
        location_id INTEGER DEFAULT 1,
        friendsride_order_id TEXT,
        friendsride_restaurant_id TEXT,
        delivery_pickup_code TEXT,
        delivery_pickup_code_verified BOOLEAN DEFAULT 0,
        delivery_pickup_code_verified_at DATETIME,
        friendsride_webhook_url TEXT,
        delivery_address TEXT,
        payment_method TEXT,
        customer_phone TEXT,
        customer_name TEXT,
        split_bill TEXT,
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
        is_active INTEGER DEFAULT 1,
        can_receive_deliveries INTEGER DEFAULT 0,
        can_transfer_out INTEGER DEFAULT 1,
        can_transfer_in INTEGER DEFAULT 1,
        can_consume INTEGER DEFAULT 0,
        manager_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei management_locations:', err.message);
        } else {
          console.log('✅ Tabelă management_locations creată/verificată cu succes');

          // Migrare: Adaugă coloana is_active dacă lipsește (pentru tabele existente)
          db.all(`PRAGMA table_info(management_locations)`, [], (err, columns) => {
            if (!err) {
              const hasIsActive = columns.some(col => col.name === 'is_active');
              if (!hasIsActive) {
                db.run(`ALTER TABLE management_locations ADD COLUMN is_active INTEGER DEFAULT 1`, (err) => {
                  if (err) {
                    console.error('❌ Eroare la adăugarea coloanei is_active:', err.message);
                  } else {
                    console.log('✅ Coloană is_active adăugată la management_locations');
                    // Setează toate locațiile existente ca active
                    db.run(`UPDATE management_locations SET is_active = 1 WHERE is_active IS NULL`, (err) => {
                      if (err) {
                        console.error('❌ Eroare la actualizarea is_active:', err.message);
                      }
                    });
                  }
                });
              }
            }
          });
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

      // Seed date default pentru users, payment_methods, printers (apelat mai jos, după toate tabelele)

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
        official_name TEXT,
        category_id INTEGER,
        subcategory_id INTEGER,
        origin_country TEXT,
        storage_temp_min REAL,
        storage_temp_max REAL,
        haccp_notes TEXT,
        traceability_code TEXT,
        default_supplier_id INTEGER,
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
          const ingredientColumns = [
            ['official_name', 'TEXT'],
            ['category_id', 'INTEGER'],
            ['subcategory_id', 'INTEGER'],
            ['origin_country', 'TEXT'],
            ['storage_temp_min', 'REAL'],
            ['storage_temp_max', 'REAL'],
            ['haccp_notes', 'TEXT'],
            ['traceability_code', 'TEXT'],
            ['default_supplier_id', 'INTEGER']
          ];
          ingredientColumns.forEach(([column, type]) => {
            db.run(`ALTER TABLE ingredients ADD COLUMN ${column} ${type}`, (err) => {
              if (err && !err.message.includes('duplicate column')) {
                console.error(`⚠️ Notă migrare ingredients.${column}:`, err.message);
              }
            });
          });
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS ingredient_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ro TEXT NOT NULL,
        name_en TEXT,
        parent_id INTEGER,
        legal_code TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES ingredient_categories (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS ingredient_category_synonyms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        synonym TEXT NOT NULL,
        locale TEXT DEFAULT 'ro',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES ingredient_categories (id)
      )`);

      // Tabelă pentru vouchers
      db.run(`CREATE TABLE IF NOT EXISTS vouchers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed', 'gift')),
          value REAL NOT NULL,
          start_date DATE,
          expiry_date DATE NOT NULL,
          max_uses INTEGER NOT NULL DEFAULT 1,
          used_count INTEGER NOT NULL DEFAULT 0,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'used', 'expired', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei vouchers:', err.message);
        } else {
          console.log('✅ Tabelă vouchers creată/verificată');
        }
      });

      // Index pentru vouchers
      db.run(`CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code)`, (err) => {
        if (err) console.error('❌ Eroare la crearea index vouchers_code:', err.message);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status)`, (err) => {
        if (err) console.error('❌ Eroare la crearea index vouchers_status:', err.message);
      });

      db.run(`CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        registration_number TEXT,
        vat_code TEXT,
        vet_authorization TEXT,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        zip_code TEXT,
        notes TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS supplier_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        file_path TEXT,
        issue_date DATE,
        expiry_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS ingredient_suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        supplier_id INTEGER NOT NULL,
        is_primary BOOLEAN DEFAULT 0,
        supplier_code TEXT,
        delivery_terms TEXT,
        lead_time_days INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (ingredient_id, supplier_id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS ingredient_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        file_path TEXT,
        issue_date DATE,
        expiry_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

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
        origin_country TEXT,
        temperature_at_receipt REAL,
        vet_document TEXT,
        supplier_id INTEGER,
        document_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (location_id) REFERENCES management_locations (id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
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
          const batchColumns = [
            ['origin_country', 'TEXT'],
            ['temperature_at_receipt', 'REAL'],
            ['vet_document', 'TEXT'],
            ['supplier_id', 'INTEGER'],
            ['document_path', 'TEXT']
          ];
          batchColumns.forEach(([column, type]) => {
            db.run(`ALTER TABLE ingredient_batches ADD COLUMN ${column} ${type}`, (err) => {
              if (err && !err.message.includes('duplicate column')) {
                console.error(`⚠️ Notă migrare ingredient_batches.${column}:`, err.message);
              }
            });
          });
        }
      });

      // ==================== SISTEM NIR & STOCURI ====================
      db.run(`CREATE TABLE IF NOT EXISTS nir_headers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER,
        document_number TEXT NOT NULL,
        document_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_value REAL DEFAULT 0,
        total_tva REAL DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS nir_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nir_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        tva_percent REAL DEFAULT 0,
        total_line REAL DEFAULT 0,
        total_tva_line REAL DEFAULT 0,
        lot_number TEXT,
        FOREIGN KEY (nir_id) REFERENCES nir_headers (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS stock_moves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL CHECK (type IN ('NIR', 'CONSUME', 'ADJUST', 'TRANSFER', 'WASTE', 'AVIZ', 'PROCES_VERBAL', 'RETUR')),
        reference_type TEXT,
        reference_id INTEGER,
        ingredient_id INTEGER NOT NULL,
        quantity_in REAL DEFAULT 0,
        quantity_out REAL DEFAULT 0,
        unit_price REAL DEFAULT 0,
        value_in REAL DEFAULT 0,
        value_out REAL DEFAULT 0,
        tva_percent REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

      const stockMoveColumns = [
        ['reference_type', 'TEXT'],
        ['value_in', 'REAL DEFAULT 0'],
        ['value_out', 'REAL DEFAULT 0'],
        ['tenant_id', 'INTEGER DEFAULT 1'],
        // Extended metadata for unified stock move model
        ['move_reason', 'TEXT'],
        ['move_source', 'TEXT'],
        ['meta_json', 'TEXT']
      ];
      stockMoveColumns.forEach(([column, type]) => {
        db.run(`ALTER TABLE stock_moves ADD COLUMN ${column} ${type}`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error(`⚠️ Notă migrare stock_moves.${column}:`, err.message);
          }
        });
      });

      db.get(
        `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'stock_moves'`,
        (err, row) => {
          if (err || !row?.sql || row.sql.includes('ADJUST')) {
            return;
          }

          if (row.sql.includes('ADJUSTMENT')) {
            console.log('ℹ️ Migrare stock_moves: actualizare schemă (tip ADJUST)');
            const migrationSql = `
              ALTER TABLE stock_moves RENAME TO stock_moves_legacy;
              CREATE TABLE stock_moves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id INTEGER NOT NULL DEFAULT 1,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                type TEXT NOT NULL CHECK (type IN ('NIR', 'CONSUME', 'ADJUST', 'TRANSFER', 'WASTE', 'AVIZ', 'PROCES_VERBAL', 'RETUR')),
                reference_type TEXT,
                reference_id INTEGER,
                ingredient_id INTEGER NOT NULL,
                quantity_in REAL DEFAULT 0,
                quantity_out REAL DEFAULT 0,
                unit_price REAL DEFAULT 0,
                value_in REAL DEFAULT 0,
                value_out REAL DEFAULT 0,
                tva_percent REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
              );
              INSERT INTO stock_moves (
                id,
                tenant_id,
                date,
                type,
                reference_type,
                reference_id,
                ingredient_id,
                quantity_in,
                quantity_out,
                unit_price,
                value_in,
                value_out,
                tva_percent,
                created_at
              )
              SELECT
                id,
                COALESCE(tenant_id, 1) AS tenant_id,
                date,
                CASE WHEN type = 'ADJUSTMENT' THEN 'ADJUST' ELSE type END AS type,
                reference_type,
                reference_id,
                ingredient_id,
                quantity_in,
                quantity_out,
                unit_price,
                COALESCE(value_in, 0),
                COALESCE(value_out, 0),
                tva_percent,
                created_at
              FROM stock_moves_legacy;
              DROP TABLE IF EXISTS stock_moves_legacy;
            `;

            db.exec(migrationSql, (migrationErr) => {
              if (migrationErr) {
                console.error('❌ Migrarea tabelei stock_moves a eșuat:', migrationErr.message);
              } else {
                console.log('✅ Tabela stock_moves a fost actualizată la noua schemă.');
              }
            });
          }
        }
      );

      db.run(`CREATE TABLE IF NOT EXISTS consumption_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_number TEXT NOT NULL,
        date DATE NOT NULL,
        source TEXT,
        destination TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS consumption_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consumption_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL DEFAULT 0,
        tva_percent REAL DEFAULT 0,
        FOREIGN KEY (consumption_id) REFERENCES consumption_notes (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS inventory_headers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        document_number TEXT NOT NULL,
        document_date TEXT NOT NULL,
        location TEXT NOT NULL,
        responsible TEXT NOT NULL,
        notes TEXT,
        created_by INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS inventory_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        inventory_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        unit TEXT,
        stock_system REAL NOT NULL DEFAULT 0,
        stock_counted REAL NOT NULL DEFAULT 0,
        diff_qty REAL NOT NULL DEFAULT 0,
        diff_value REAL NOT NULL DEFAULT 0,
        cost_unit REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (inventory_id) REFERENCES inventory_headers (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_lines_inventory ON inventory_lines (inventory_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_lines_ingredient ON inventory_lines (ingredient_id)`);

      // ==================== TRANSFER DEPOZIT ====================
      db.run(`CREATE TABLE IF NOT EXISTS transfer_headers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        document_number TEXT NOT NULL,
        document_date TEXT NOT NULL,
        source_location TEXT NOT NULL,
        target_location TEXT NOT NULL,
        responsible TEXT NOT NULL,
        notes TEXT,
        created_by INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS transfer_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        transfer_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        unit TEXT,
        quantity REAL NOT NULL DEFAULT 0,
        cost_unit REAL NOT NULL DEFAULT 0,
        value_total REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (transfer_id) REFERENCES transfer_headers(id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_transfer_lines_transfer ON transfer_lines (transfer_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_transfer_lines_ingredient ON transfer_lines (ingredient_id)`);

      // ==================== PRODUCTION BATCHES ====================
      db.run(`CREATE TABLE IF NOT EXISTS production_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        batch_number TEXT NOT NULL UNIQUE,
        batch_date TEXT NOT NULL,
        recipe_id INTEGER,
        recipe_name TEXT,
        status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'in_progress', 'completed', 'cancelled')),
        started_at TEXT,
        completed_at TEXT,
        responsible TEXT,
        location_id INTEGER DEFAULT 1,
        notes TEXT,
        created_by INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id),
        FOREIGN KEY (location_id) REFERENCES locations (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS production_batch_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        batch_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity_planned REAL NOT NULL DEFAULT 0,
        quantity_used REAL NOT NULL DEFAULT 0,
        unit TEXT NOT NULL,
        cost_per_unit REAL NOT NULL DEFAULT 0,
        total_cost REAL NOT NULL DEFAULT 0,
        lot_number TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (batch_id) REFERENCES production_batches (id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS production_batch_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        batch_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity_produced REAL NOT NULL DEFAULT 0,
        unit TEXT NOT NULL,
        cost_per_unit REAL NOT NULL DEFAULT 0,
        total_cost REAL NOT NULL DEFAULT 0,
        lot_number TEXT,
        expiry_date TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (batch_id) REFERENCES production_batches (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES menu (id)
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches (status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_production_batches_date ON production_batches (batch_date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_production_batch_items_batch ON production_batch_items (batch_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_production_batch_items_ingredient ON production_batch_items (ingredient_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_production_batch_results_batch ON production_batch_results (batch_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_production_batch_results_product ON production_batch_results (product_id)`);

      db.run(`CREATE TABLE IF NOT EXISTS stock_lots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        lot_number TEXT NOT NULL UNIQUE,
        quantity_remaining REAL NOT NULL,
        unit_price REAL DEFAULT 0,
        tva_percent REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`);

      db.run(`CREATE INDEX IF NOT EXISTS idx_nir_lines_nir_id ON nir_lines (nir_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_nir_lines_ingredient ON nir_lines (ingredient_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_stock_moves_ingredient ON stock_moves (ingredient_id, date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_consumption_lines_consume_id ON consumption_lines (consumption_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_stock_lots_ingredient ON stock_lots (ingredient_id)`);

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

      db.run(`CREATE INDEX IF NOT EXISTS idx_ingredients_category_id ON ingredients (category_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_ingredients_default_supplier ON ingredients (default_supplier_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_ingredient_batches_supplier_id ON ingredient_batches (supplier_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_ingredient_batches_batch_number ON ingredient_batches (batch_number)`);

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
            function (err) {
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
        ingredient_id INTEGER,
        recipe_id INTEGER,
        quantity_needed REAL NOT NULL,
        item_type TEXT DEFAULT 'ingredient' CHECK (item_type IN ('ingredient', 'packaging_restaurant', 'packaging_delivery', 'recipe')),
        is_semi_finished BOOLEAN DEFAULT 0,
        unit TEXT DEFAULT 'buc',
        waste_percentage REAL DEFAULT 0.0,
        variable_consumption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (recipe_id) REFERENCES menu (id)
      )`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Eroare la crearea tabelei recipes:', err.message);
        }
      });

      // ✅ SĂPTĂMÂNA 1 - ZIUA 2: Adaugă coloane pentru sub-rețete (migrare)
      const recipeSubRecipeColumns = [
        ['recipe_id', 'INTEGER'],
        ['is_semi_finished', 'BOOLEAN DEFAULT 0']
      ];

      recipeSubRecipeColumns.forEach(([column, type]) => {
        db.run(`ALTER TABLE recipes ADD COLUMN ${column} ${type}`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error(`⚠️ Notă migrare recipes.${column}:`, err.message);
          } else if (!err) {
            console.log(`✅ Coloană ${column} adăugată în recipes (migrare)`);
          }
        });
      });

      // ✅ SĂPTĂMÂNA 1 - ZIUA 4: Adaugă coloane pentru Yield & Max Stock
      // 1. Servings în menu (pentru yield/randament)
      db.run(`ALTER TABLE menu ADD COLUMN servings INTEGER DEFAULT 1`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei servings la menu:', err.message);
        } else if (!err) {
          console.log('✅ Coloană servings adăugată în menu (migrare)');
        }
      });

      db.run(`ALTER TABLE menu ADD COLUMN serving_size REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei serving_size la menu:', err.message);
        } else if (!err) {
          console.log('✅ Coloană serving_size adăugată în menu (migrare)');
        }
      });

      db.run(`ALTER TABLE menu ADD COLUMN serving_unit TEXT DEFAULT 'buc'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei serving_unit la menu:', err.message);
        } else if (!err) {
          console.log('✅ Coloană serving_unit adăugată în menu (migrare)');
        }
      });

      // 2. Max stock și safety stock în ingredients
      db.run(`ALTER TABLE ingredients ADD COLUMN max_stock REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei max_stock la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană max_stock adăugată în ingredients (migrare)');
        }
      });

      db.run(`ALTER TABLE ingredients ADD COLUMN safety_stock REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei safety_stock la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană safety_stock adăugată în ingredients (migrare)');
        }
      });

      db.run(`ALTER TABLE ingredients ADD COLUMN reorder_quantity REAL DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei reorder_quantity la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană reorder_quantity adăugată în ingredients (migrare)');
        }
      });

      // ✅ SĂPTĂMÂNA 2 - ZIUA 4: Purchase Units & Conversion Factors
      db.run(`ALTER TABLE ingredients ADD COLUMN purchase_unit TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei purchase_unit la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană purchase_unit adăugată în ingredients (migrare)');
        }
      });

      db.run(`ALTER TABLE ingredients ADD COLUMN recipe_unit TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei recipe_unit la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană recipe_unit adăugată în ingredients (migrare)');
        }
      });

      db.run(`ALTER TABLE ingredients ADD COLUMN inventory_unit TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei inventory_unit la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană inventory_unit adăugată în ingredients (migrare)');
        }
      });

      db.run(`ALTER TABLE ingredients ADD COLUMN purchase_to_inventory_factor REAL DEFAULT 1`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei purchase_to_inventory_factor la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană purchase_to_inventory_factor adăugată în ingredients (migrare)');
        }
      });

      db.run(`ALTER TABLE ingredients ADD COLUMN inventory_to_recipe_factor REAL DEFAULT 1`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei inventory_to_recipe_factor la ingredients:', err.message);
        } else if (!err) {
          console.log('✅ Coloană inventory_to_recipe_factor adăugată în ingredients (migrare)');
        }
      });

      // ✅ SĂPTĂMÂNA 2 - ZIUA 2: Trigger pentru recalculare cost mediu la intrare NIR
      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_average_cost_on_nir
        AFTER INSERT ON ingredient_batches
        BEGIN
          UPDATE ingredients
          SET cost_per_unit = (
            SELECT 
              COALESCE(
                SUM(remaining_quantity * unit_cost) / NULLIF(SUM(remaining_quantity), 0),
                cost_per_unit
              )
            FROM ingredient_batches
            WHERE ingredient_id = NEW.ingredient_id
              AND remaining_quantity > 0
          ),
          last_updated = CURRENT_TIMESTAMP
          WHERE id = NEW.ingredient_id;
        END;
      `, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea trigger update_average_cost_on_nir:', err.message);
        } else if (!err) {
          console.log('✅ Trigger update_average_cost_on_nir creat/verificat');
        }
      });

      // ✅ SĂPTĂMÂNA 2 - ZIUA 2: Trigger pentru recalculare cost mediu la update lot
      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_average_cost_on_batch_update
        AFTER UPDATE OF remaining_quantity, unit_cost ON ingredient_batches
        WHEN NEW.remaining_quantity != OLD.remaining_quantity OR NEW.unit_cost != OLD.unit_cost
        BEGIN
          UPDATE ingredients
          SET cost_per_unit = (
            SELECT 
              COALESCE(
                SUM(remaining_quantity * unit_cost) / NULLIF(SUM(remaining_quantity), 0),
                cost_per_unit
              )
            FROM ingredient_batches
            WHERE ingredient_id = NEW.ingredient_id
              AND remaining_quantity > 0
          ),
          last_updated = CURRENT_TIMESTAMP
          WHERE id = NEW.ingredient_id;
        END;
      `, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea trigger update_average_cost_on_batch_update:', err.message);
        } else if (!err) {
          console.log('✅ Trigger update_average_cost_on_batch_update creat/verificat');
        }
      });

      // ✅ SĂPTĂMÂNA 2 - ZIUA 3: Tabel pentru istoric costuri ingrediente
      db.run(`CREATE TABLE IF NOT EXISTS ingredient_cost_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        old_cost REAL NOT NULL,
        new_cost REAL NOT NULL,
        change_percentage REAL,
        change_reason TEXT,  -- 'manual', 'nir', 'average_recalc', 'auto'
        changed_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
        FOREIGN KEY (changed_by) REFERENCES users (id)
      )`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea tabelei ingredient_cost_history:', err.message);
        } else if (!err) {
          console.log('✅ Tabelă ingredient_cost_history creată/verificată');

          // Indexuri
          db.run(`CREATE INDEX IF NOT EXISTS idx_cost_history_ingredient ON ingredient_cost_history(ingredient_id)`, (err) => {
            if (err && !err.message.includes('duplicate')) {
              console.error('⚠️ Eroare la crearea index idx_cost_history_ingredient:', err.message);
            } else if (!err) {
              console.log('✅ Index idx_cost_history_ingredient creat/verificat');
            }
          });

          db.run(`CREATE INDEX IF NOT EXISTS idx_cost_history_date ON ingredient_cost_history(created_at)`, (err) => {
            if (err && !err.message.includes('duplicate')) {
              console.error('⚠️ Eroare la crearea index idx_cost_history_date:', err.message);
            } else if (!err) {
              console.log('✅ Index idx_cost_history_date creat/verificat');
            }
          });
        }
      });

      // ✅ SĂPTĂMÂNA 2 - ZIUA 3: Trigger pentru logging automat modificări cost
      db.run(`
        CREATE TRIGGER IF NOT EXISTS log_cost_changes
        AFTER UPDATE OF cost_per_unit ON ingredients
        WHEN OLD.cost_per_unit != NEW.cost_per_unit
        BEGIN
          INSERT INTO ingredient_cost_history 
            (ingredient_id, old_cost, new_cost, change_percentage, change_reason)
          VALUES (
            NEW.id,
            OLD.cost_per_unit,
            NEW.cost_per_unit,
            CASE 
              WHEN OLD.cost_per_unit > 0 
              THEN ((NEW.cost_per_unit - OLD.cost_per_unit) / OLD.cost_per_unit * 100)
              ELSE NULL
            END,
            'auto'
          );
        END;
      `, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea trigger log_cost_changes:', err.message);
        } else if (!err) {
          console.log('✅ Trigger log_cost_changes creat/verificat');
        }
      });

      // ✅ SĂPTĂMÂNA 2 - ZIUA 1: Tabel pentru configurare metoda evaluare stoc
      db.run(`CREATE TABLE IF NOT EXISTS stock_valuation_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER,
        ingredient_id INTEGER,  -- NULL = default pentru toate
        method TEXT NOT NULL DEFAULT 'FIFO',  -- FIFO, LIFO, AVERAGE
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES management_locations (id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
      )`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea tabelei stock_valuation_config:', err.message);
        } else if (!err) {
          console.log('✅ Tabelă stock_valuation_config creată/verificată');

          // Inserează default global setting dacă nu există
          db.get('SELECT id FROM stock_valuation_config WHERE ingredient_id IS NULL AND location_id IS NULL', (err, row) => {
            if (!err && !row) {
              db.run(`INSERT INTO stock_valuation_config (method) VALUES ('FIFO')`, (err) => {
                if (err) {
                  console.error('⚠️ Eroare la inserarea default stock valuation:', err);
                } else {
                  console.log('✅ Default stock valuation method (FIFO) inserat');
                }
              });
            }
          });
        }
      });

      // ✅ SĂPTĂMÂNA 1 - ZIUA 5: Tabel pentru queue recalculare cost rețete
      // IMPORTANT: Șterge trigger-urile vechi înainte de crearea tabelei (sincron)
      db.run(`DROP TRIGGER IF EXISTS recalculate_recipe_costs_on_ingredient_update`);
      db.run(`DROP TRIGGER IF EXISTS recalculate_recipe_costs_on_subrecipe_update`);

      db.run(`CREATE TABLE IF NOT EXISTS recipe_recalculation_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        error_message TEXT,
        FOREIGN KEY (product_id) REFERENCES menu (id)
      )`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea tabelei recipe_recalculation_queue:', err.message);
        } else if (!err) {
          console.log('✅ Tabelă recipe_recalculation_queue creată/verificată');
        }

        // Migrare: Adaugă coloana status dacă nu există (pentru baze existente)
        db.run(`ALTER TABLE recipe_recalculation_queue ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            // Ignoră eroarea dacă coloana există deja
            console.log('⚠️ Coloana status există deja sau eroare la adăugare:', err.message);
          } else {
            console.log('✅ Coloană status adăugată/verificată în recipe_recalculation_queue');
          }

          // Verifică dacă coloana status există înainte de a crea indexul și trigger-ele
          db.all(`PRAGMA table_info(recipe_recalculation_queue)`, (err, columns) => {
            if (err) {
              console.error('⚠️ Eroare la verificarea coloanelor recipe_recalculation_queue:', err.message);
              return;
            }

            const hasStatus = columns.some(col => col.name === 'status');
            if (!hasStatus) {
              console.error('❌ Coloana status nu există în recipe_recalculation_queue! Nu se pot crea trigger-ele.');
              return;
            }

            // Index pentru queue
            db.run(`CREATE INDEX IF NOT EXISTS idx_recalc_queue_status ON recipe_recalculation_queue(status, created_at)`, (err) => {
              if (err && !err.message.includes('duplicate')) {
                console.error('⚠️ Eroare la crearea index idx_recalc_queue_status:', err.message);
                return;
              } else if (!err) {
                console.log('✅ Index idx_recalc_queue_status creat/verificat');
              }

              // ✅ Trigger pentru recalculare automată când se modifică cost ingredient
              db.run(`
                CREATE TRIGGER IF NOT EXISTS recalculate_recipe_costs_on_ingredient_update
                AFTER UPDATE OF cost_per_unit ON ingredients
                BEGIN
                  -- Găsește toate produsele care folosesc acest ingredient
                  INSERT INTO recipe_recalculation_queue (product_id, reason, status, created_at)
                  SELECT DISTINCT r.product_id, 'ingredient_cost_changed', 'pending', datetime('now')
                  FROM recipes r
                  WHERE r.ingredient_id = NEW.id
                    AND NOT EXISTS (
                      SELECT 1 FROM recipe_recalculation_queue q
                      WHERE q.product_id = r.product_id 
                        AND q.status = 'pending'
                    );
                END;
              `, (err) => {
                if (err && !err.message.includes('duplicate') && !err.message.includes('no such column')) {
                  console.error('⚠️ Eroare la crearea trigger recalculate_recipe_costs_on_ingredient_update:', err.message);
                } else if (!err) {
                  console.log('✅ Trigger recalculate_recipe_costs_on_ingredient_update creat/verificat');
                }

                // ✅ Trigger pentru recalculare când se modifică o sub-rețetă
                db.run(`
                  CREATE TRIGGER IF NOT EXISTS recalculate_recipe_costs_on_subrecipe_update
                  AFTER UPDATE OF cost_price ON menu
                  WHEN NEW.cost_price IS NOT NULL
                  BEGIN
                    -- Găsește toate produsele care folosesc acest produs ca sub-rețetă
                    INSERT INTO recipe_recalculation_queue (product_id, reason, status, created_at)
                    SELECT DISTINCT r.product_id, 'sub_recipe_cost_changed', 'pending', datetime('now')
                    FROM recipes r
                    WHERE r.recipe_id = NEW.id
                      AND NOT EXISTS (
                        SELECT 1 FROM recipe_recalculation_queue q
                        WHERE q.product_id = r.product_id 
                          AND q.status = 'pending'
                      );
                  END;
                `, (err) => {
                  if (err && !err.message.includes('duplicate') && !err.message.includes('no such column')) {
                    console.error('⚠️ Eroare la crearea trigger recalculate_recipe_costs_on_subrecipe_update:', err.message);
                  } else if (!err) {
                    console.log('✅ Trigger recalculate_recipe_costs_on_subrecipe_update creat/verificat');
                  }
                });
              });
            });
          });
        });
      });

      // Index pentru recipe_id
      db.run(`CREATE INDEX IF NOT EXISTS idx_recipes_recipe_id ON recipes(recipe_id)`, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea index idx_recipes_recipe_id:', err.message);
        } else if (!err) {
          console.log('✅ Index idx_recipes_recipe_id creat/verificat');
        }
      });

      // Trigger pentru validare: doar unul din ingredient_id sau recipe_id
      db.run(`
        CREATE TRIGGER IF NOT EXISTS validate_recipe_ingredient_or_recipe
        BEFORE INSERT ON recipes
        BEGIN
          SELECT CASE
            WHEN (NEW.ingredient_id IS NULL AND NEW.recipe_id IS NULL)
              OR (NEW.ingredient_id IS NOT NULL AND NEW.recipe_id IS NOT NULL)
            THEN RAISE(ABORT, 'Must have exactly one of ingredient_id or recipe_id')
          END;
        END;
      `, (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('⚠️ Eroare la crearea trigger validate_recipe_ingredient_or_recipe:', err.message);
        } else if (!err) {
          console.log('✅ Trigger validate_recipe_ingredient_or_recipe creat/verificat');
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
          vat_rate REAL DEFAULT 21.0,
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

      // PHASE S8.2 - Extended invoices table for e-Factura
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
          -- PHASE S8.2 - e-Factura fields
          xml_content TEXT,
          json_data TEXT,
          dto_data TEXT,
          status TEXT DEFAULT 'generated' CHECK(status IN ('generated', 'uploaded', 'rejected', 'confirmed', 'cancelled')),
          spv_id TEXT,
          spv_response TEXT,
          spv_error TEXT,
          cancellation_reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id)
      )`);

      // ==================== TVA CONFIG (VAT RATES) ====================
      db.run(`CREATE TABLE IF NOT EXISTS vat_rates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER NOT NULL,
          code TEXT,
          name TEXT NOT NULL,
          rate REAL NOT NULL,
          active INTEGER NOT NULL DEFAULT 1,
          is_default_sales INTEGER NOT NULL DEFAULT 0,
          is_default_purchases INTEGER NOT NULL DEFAULT 0,
          valid_from TEXT,
          valid_to TEXT,
          
          -- PHASE S8.4 - TVA System v2 fields
          vat_category TEXT,              -- 'food', 'standard', 'reduced', 'zero'
          description TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`);

      // Migrare: adaugă coloana tenant_id dacă nu există (pentru baze vechi)
      db.run(`ALTER TABLE vat_rates ADD COLUMN tenant_id INTEGER DEFAULT 1`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('⚠️ Notă migrare vat_rates tenant_id:', err.message);
        } else if (!err) {
          console.log('✅ Coloană tenant_id adăugată în vat_rates (migrare)');
          // Actualizează toate înregistrările existente cu tenant_id = 1
          db.run(`UPDATE vat_rates SET tenant_id = 1 WHERE tenant_id IS NULL`, (updateErr) => {
            if (updateErr) {
              console.error('⚠️ Eroare la actualizarea tenant_id:', updateErr.message);
            }
          });
        }
      });

      // Migrare: adaugă coloanele noi dacă nu există
      const vatRatesColumns = [
        'code TEXT',
        'active INTEGER NOT NULL DEFAULT 1',
        'is_default_sales INTEGER NOT NULL DEFAULT 0',
        'is_default_purchases INTEGER NOT NULL DEFAULT 0',
        'valid_from TEXT',
        'valid_to TEXT'
      ];

      vatRatesColumns.forEach(colDef => {
        const colName = colDef.split(' ')[0];
        db.run(`ALTER TABLE vat_rates ADD COLUMN ${colDef}`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            // Ignoră erorile de coloană duplicată
          }
        });
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_vat_rates_tenant ON vat_rates (tenant_id)');

      // ============ MIGRARE TVA 2024: 19%→21%, 9%→11% ============
      // Actualizează ratele TVA în toate tabelele relevante
      console.log('🔄 Verificare migrare cote TVA (19%→21%, 9%→11%)...');

      // Actualizare vat_rates table
      db.run(`UPDATE vat_rates SET rate = 21 WHERE rate = 19`, (err) => {
        if (!err) console.log('   ✅ vat_rates: 19% → 21%');
      });
      db.run(`UPDATE vat_rates SET rate = 11 WHERE rate = 9`, (err) => {
        if (!err) console.log('   ✅ vat_rates: 9% → 11%');
      });

      // Actualizare menu_products / catalog_products / products
      db.run(`UPDATE menu_products SET vat_rate = 21 WHERE vat_rate = 19`, (err) => {
        if (!err) console.log('   ✅ menu_products: 19% → 21%');
      });
      db.run(`UPDATE menu_products SET vat_rate = 11 WHERE vat_rate = 9`, (err) => {
        if (!err) console.log('   ✅ menu_products: 9% → 11%');
      });
      db.run(`UPDATE catalog_products SET vat_rate = 21 WHERE vat_rate = 19`, () => { });
      db.run(`UPDATE catalog_products SET vat_rate = 11 WHERE vat_rate = 9`, () => { });
      db.run(`UPDATE products SET vat_rate = 21 WHERE vat_rate = 19`, () => { });
      db.run(`UPDATE products SET vat_rate = 11 WHERE vat_rate = 9`, () => { });

      // Actualizare ingredients
      db.run(`UPDATE ingredients SET vat_rate = 21 WHERE vat_rate = 19`, () => { });
      db.run(`UPDATE ingredients SET vat_rate = 11 WHERE vat_rate = 9`, () => { });

      // Actualizare fiscal_config
      db.run(`UPDATE fiscal_config SET config_value = '21' WHERE config_name = 'default_vat_rate' AND config_value = '19'`, () => { });
      db.run(`UPDATE fiscal_config SET config_value = '11' WHERE config_name = 'default_vat_rate' AND config_value = '9'`, () => { });

      // Actualizare restaurant_settings
      db.run(`UPDATE restaurant_settings SET setting_value = '21' WHERE setting_key = 'vat_drinks' AND setting_value = '19'`, () => { });
      db.run(`UPDATE restaurant_settings SET setting_value = '11' WHERE setting_key = 'vat_food' AND setting_value = '9'`, () => { });

      console.log('✅ Migrare cote TVA finalizată');
      // ============ END MIGRARE TVA 2024 ============

      // Seed default VAT rates for tenant 1 if table empty
      db.get(`SELECT COUNT(*) as cnt FROM vat_rates WHERE tenant_id = ?`, [1], (err, row) => {
        if (err) {
          console.error('⚠️ Eroare la verificarea vat_rates:', err.message);
        } else if (row && Number(row.cnt) === 0) {
          const stmt = db.prepare(`INSERT INTO vat_rates (tenant_id, code, name, rate, active, is_default_sales, is_default_purchases) VALUES (?, ?, ?, ?, 1, ?, ?)`);
          try {
            stmt.run(1, 'FOOD11', 'Mâncare / Horeca', 11, 1, 1);
            stmt.run(1, 'ALC21', 'Băuturi alcoolice', 21, 0, 0);
            stmt.run(1, 'ZERO', '0% (scutit)', 0, 0, 0);
            stmt.run(1, 'RED5', '5% (reducere)', 5, 0, 0);
            console.log('✅ VAT rates implicite au fost adăugate.');
          } catch (se) {
            console.error('⚠️ Eroare la seed vat_rates:', se.message);
          } finally {
            try { stmt.finalize(); } catch { }
          }
        }
      });

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

      // POS payments (plăți per comandă în POS)
      db.run(`CREATE TABLE IF NOT EXISTS pos_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL DEFAULT 1,
        order_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,  -- 'cash' | 'card' | 'voucher'
        metadata TEXT,       -- JSON opțional (referință tranzacție card, voucher id etc.)
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_pos_payments_order ON pos_payments (order_id)`);

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

      // Tabele Marketing NOI (pentru marketing.controller.js)
      db.run(`CREATE TABLE IF NOT EXISTS marketing_segments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          criteria TEXT, 
          customer_count INTEGER DEFAULT 0,
          last_calculated TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS marketing_segment_customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          segment_id INTEGER NOT NULL,
          customer_token TEXT NOT NULL,
          order_count INTEGER DEFAULT 0,
          last_order_date TEXT,
          first_order_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (segment_id) REFERENCES marketing_segments(id) ON DELETE CASCADE,
          UNIQUE(segment_id, customer_token)
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

      // 🚚 DELIVERY: Migrare coloane FriendsRide pentru orders
      db.run('ALTER TABLE orders ADD COLUMN friendsride_order_id TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei friendsride_order_id:', err.message);
        } else if (!err) {
          console.log('✅ Coloană friendsride_order_id adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN friendsride_restaurant_id TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei friendsride_restaurant_id:', err.message);
        } else if (!err) {
          console.log('✅ Coloană friendsride_restaurant_id adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN delivery_pickup_code TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei delivery_pickup_code:', err.message);
        } else if (!err) {
          console.log('✅ Coloană delivery_pickup_code adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN delivery_pickup_code_verified BOOLEAN DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei delivery_pickup_code_verified:', err.message);
        } else if (!err) {
          console.log('✅ Coloană delivery_pickup_code_verified adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN delivery_pickup_code_verified_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei delivery_pickup_code_verified_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană delivery_pickup_code_verified_at adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN friendsride_webhook_url TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei friendsride_webhook_url:', err.message);
        } else if (!err) {
          console.log('✅ Coloană friendsride_webhook_url adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN delivery_address TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei delivery_address:', err.message);
        } else if (!err) {
          console.log('✅ Coloană delivery_address adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN payment_method TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei payment_method:', err.message);
        } else if (!err) {
          console.log('✅ Coloană payment_method adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN customer_phone TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei customer_phone:', err.message);
        } else if (!err) {
          console.log('✅ Coloană customer_phone adăugată în orders (migrare)');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN customer_name TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei customer_name:', err.message);
        } else if (!err) {
          console.log('✅ Coloană customer_name adăugată în orders (migrare)');
        }
      });

      // Add updated_at column to orders table if it doesn't exist
      // SQLite nu permite DEFAULT CURRENT_TIMESTAMP în ALTER TABLE, folosim DEFAULT (datetime('now'))
      db.run('ALTER TABLE orders ADD COLUMN updated_at DATETIME DEFAULT (datetime(\'now\'))', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          // Dacă nu funcționează, adaugă fără DEFAULT și actualizează manual
          if (err.message && err.message.includes('non-constant default')) {
            db.run('ALTER TABLE orders ADD COLUMN updated_at DATETIME', (err2) => {
              if (err2 && !err2.message.includes('duplicate column name')) {
                console.error('⚠️ Eroare la adăugarea coloanei updated_at:', err2.message);
              } else if (!err2) {
                console.log('✅ Coloană updated_at adăugată în orders (fără DEFAULT)');
                // Actualizează valorile existente
                db.run('UPDATE orders SET updated_at = timestamp WHERE updated_at IS NULL', (err3) => {
                  if (err3) {
                    console.warn('⚠️ Eroare la actualizarea updated_at:', err3.message);
                  }
                });
              }
            });
          } else {
            console.error('⚠️ Eroare la adăugarea coloanei updated_at:', err.message);
          }
        } else if (!err) {
          console.log('✅ Coloană updated_at adăugată în orders (migrare)');
        }
      });

      // ==================== DELIVERY & DRIVE-THRU (05 Dec 2025) ====================

      console.log('🚚 [MIGRATION] Începe migrare Delivery & Drive-Thru schema...');

      // PHASE S8.2 - Migrare e-Factura: Adaugă coloane lipsă în invoices
      db.run('ALTER TABLE invoices ADD COLUMN xml_content TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei xml_content:', err.message);
        } else if (!err) {
          console.log('✅ Coloană xml_content adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN json_data TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei json_data:', err.message);
        } else if (!err) {
          console.log('✅ Coloană json_data adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN dto_data TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei dto_data:', err.message);
        } else if (!err) {
          console.log('✅ Coloană dto_data adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN spv_id TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei spv_id:', err.message);
        } else if (!err) {
          console.log('✅ Coloană spv_id adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN spv_response TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei spv_response:', err.message);
        } else if (!err) {
          console.log('✅ Coloană spv_response adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN spv_error TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei spv_error:', err.message);
        } else if (!err) {
          console.log('✅ Coloană spv_error adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN cancellation_reason TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei cancellation_reason:', err.message);
        } else if (!err) {
          console.log('✅ Coloană cancellation_reason adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN created_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei created_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană created_at adăugată în invoices');
        }
      });

      db.run('ALTER TABLE invoices ADD COLUMN updated_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei updated_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană updated_at adăugată în invoices');
        }
      });

      // Identificare sursă și canal
      db.run('ALTER TABLE orders ADD COLUMN order_source TEXT DEFAULT "POS"', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei order_source:', err.message);
        } else if (!err) {
          console.log('✅ Coloană order_source adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN platform TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei platform:', err.message);
        } else if (!err) {
          console.log('✅ Coloană platform adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN courier_id INTEGER REFERENCES couriers(id)', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei courier_id:', err.message);
        } else if (!err) {
          console.log('✅ Coloană courier_id adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN pickup_type TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei pickup_type:', err.message);
        } else if (!err) {
          console.log('✅ Coloană pickup_type adăugată în orders');
        }
      });

      // Drive-Thru specific
      db.run('ALTER TABLE orders ADD COLUMN car_plate TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei car_plate:', err.message);
        } else if (!err) {
          console.log('✅ Coloană car_plate adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN lane_number TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei lane_number:', err.message);
        } else if (!err) {
          console.log('✅ Coloană lane_number adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN arrived_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei arrived_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană arrived_at adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN ordered_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei ordered_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană ordered_at adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN paid_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei paid_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană paid_at adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN served_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei served_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană served_at adăugată în orders');
        }
      });

      // Timpi estimați vs reali
      db.run('ALTER TABLE orders ADD COLUMN estimated_pickup_time DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei estimated_pickup_time:', err.message);
        } else if (!err) {
          console.log('✅ Coloană estimated_pickup_time adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN actual_pickup_time DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei actual_pickup_time:', err.message);
        } else if (!err) {
          console.log('✅ Coloană actual_pickup_time adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN estimated_delivery_time DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei estimated_delivery_time:', err.message);
        } else if (!err) {
          console.log('✅ Coloană estimated_delivery_time adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN actual_delivery_time DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei actual_delivery_time:', err.message);
        } else if (!err) {
          console.log('✅ Coloană actual_delivery_time adăugată în orders');
        }
      });

      // Business metrics
      db.run('ALTER TABLE orders ADD COLUMN platform_commission REAL DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei platform_commission:', err.message);
        } else if (!err) {
          console.log('✅ Coloană platform_commission adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN packaging_cost REAL DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei packaging_cost:', err.message);
        } else if (!err) {
          console.log('✅ Coloană packaging_cost adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN delivery_fee_charged REAL DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei delivery_fee_charged:', err.message);
        } else if (!err) {
          console.log('✅ Coloană delivery_fee_charged adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN delivery_distance_km REAL', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei delivery_distance_km:', err.message);
        } else if (!err) {
          console.log('✅ Coloană delivery_distance_km adăugată în orders');
        }
      });

      // Bon fiscal tracking
      db.run('ALTER TABLE orders ADD COLUMN fiscal_receipt_printed BOOLEAN DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei fiscal_receipt_printed:', err.message);
        } else if (!err) {
          console.log('✅ Coloană fiscal_receipt_printed adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN fiscal_receipt_printed_at DATETIME', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei fiscal_receipt_printed_at:', err.message);
        } else if (!err) {
          console.log('✅ Coloană fiscal_receipt_printed_at adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN fiscal_receipt_number TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei fiscal_receipt_number:', err.message);
        } else if (!err) {
          console.log('✅ Coloană fiscal_receipt_number adăugată în orders');
        }
      });

      db.run('ALTER TABLE orders ADD COLUMN delivery_zone_id INTEGER REFERENCES delivery_zones(id)', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei delivery_zone_id:', err.message);
        } else if (!err) {
          console.log('✅ Coloană delivery_zone_id adăugată în orders');
        }
      });

      // Migrare date vechi
      db.run('UPDATE orders SET order_source = "POS" WHERE order_source IS NULL', (err) => {
        if (err) {
          console.error('⚠️ Eroare la migrarea order_source:', err.message);
        } else {
          console.log('✅ Date vechi migrate: order_source = POS');
        }
      });

      db.run('UPDATE orders SET platform = "pos" WHERE platform IS NULL AND type = "restaurant"', (err) => {
        if (err) {
          console.error('⚠️ Eroare la migrarea platform:', err.message);
        } else {
          console.log('✅ Date vechi migrate: platform = pos pentru restaurant');
        }
      });

      // ==================== TABELE NOI: DELIVERY & DRIVE-THRU ====================

      // Tabelă: couriers
      db.run(`CREATE TABLE IF NOT EXISTS couriers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        vehicle_type TEXT DEFAULT 'scooter',
        license_plate TEXT,
        status TEXT DEFAULT 'offline',
        current_lat REAL,
        current_lng REAL,
        last_location_update DATETIME,
        rating REAL DEFAULT 5.0,
        total_deliveries INTEGER DEFAULT 0,
        successful_deliveries INTEGER DEFAULT 0,
        failed_deliveries INTEGER DEFAULT 0,
        avg_delivery_time_minutes REAL,
        user_id INTEGER REFERENCES users(id),
        api_token TEXT,
        active_since DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        assigned_zones TEXT,
        max_concurrent_deliveries INTEGER DEFAULT 3,
        payment_type TEXT DEFAULT 'salary',
        commission_percent REAL DEFAULT 0
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei couriers:', err.message);
        } else {
          console.log('✅ Tabelă couriers creată/verificată');
        }
      });

      // Tabelă: delivery_assignments
      db.run(`CREATE TABLE IF NOT EXISTS delivery_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        courier_id INTEGER NOT NULL REFERENCES couriers(id),
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER REFERENCES users(id),
        picked_up_at DATETIME,
        delivered_at DATETIME,
        status TEXT DEFAULT 'assigned',
        reassigned_from INTEGER REFERENCES couriers(id),
        reassigned_to INTEGER REFERENCES couriers(id),
        reassignment_reason TEXT,
        reassignment_timestamp DATETIME,
        delivery_fee REAL DEFAULT 0,
        tip REAL DEFAULT 0,
        fuel_cost REAL DEFAULT 0,
        customer_signature TEXT,
        delivery_photo TEXT,
        delivery_notes TEXT,
        distance_km REAL,
        estimated_time_minutes INTEGER,
        actual_time_minutes INTEGER,
        route_gps_log TEXT
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei delivery_assignments:', err.message);
        } else {
          console.log('✅ Tabelă delivery_assignments creată/verificată');
        }
      });

      // Tabelă: delivery_zones
      db.run(`CREATE TABLE IF NOT EXISTS delivery_zones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        zone_type TEXT DEFAULT 'polygon',
        polygon_coordinates TEXT,
        center_lat REAL,
        center_lng REAL,
        radius_km REAL,
        zip_codes TEXT,
        min_order_value REAL DEFAULT 0,
        delivery_fee_base REAL DEFAULT 0,
        fee_per_km REAL DEFAULT 0,
        max_distance_km REAL,
        eta_default_minutes INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT 1,
        available_from TIME,
        available_to TIME,
        max_concurrent_orders INTEGER DEFAULT 20,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei delivery_zones:', err.message);
        } else {
          console.log('✅ Tabelă delivery_zones creată/verificată');
        }
      });

      // S17.A - Tabelă: delivery_proofs (proof-of-delivery: foto, semnătură)
      db.run(`CREATE TABLE IF NOT EXISTS delivery_proofs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        courier_id INTEGER REFERENCES couriers(id),
        type TEXT NOT NULL CHECK(type IN ('photo', 'signature')),
        file_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei delivery_proofs:', err.message);
        } else {
          console.log('✅ Tabelă delivery_proofs creată/verificată');
        }
      });

      // S17.A - Extindere delivery_assignments: adaugă accepted_at și assigned_by TEXT (dacă nu există)
      // Verificăm dacă coloanele există și le adăugăm doar dacă lipsesc
      db.run(`ALTER TABLE delivery_assignments ADD COLUMN accepted_at DATETIME`, (err) => {
        // Ignorăm eroarea dacă coloana există deja
        if (!err) {
          console.log('✅ Coloană accepted_at adăugată în delivery_assignments');
        }
      });

      // Modificăm assigned_by să fie TEXT (pentru 'DISPATCH', 'AUTO', 'POS', etc.) dacă e INTEGER
      // Notă: SQLite nu suportă ALTER COLUMN, deci vom folosi o abordare compatibilă
      // assigned_by poate rămâne INTEGER pentru backward compatibility, dar vom folosi un câmp text separat
      db.run(`ALTER TABLE delivery_assignments ADD COLUMN assigned_by_text TEXT`, (err) => {
        if (!err) {
          console.log('✅ Coloană assigned_by_text adăugată în delivery_assignments');
        }
      });

      // Tabelă: delivery_cancellations
      db.run(`CREATE TABLE IF NOT EXISTS delivery_cancellations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        cancelled_by TEXT NOT NULL,
        cancelled_by_id INTEGER,
        cancelled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reason_code TEXT NOT NULL,
        reason_details TEXT,
        refund_amount REAL DEFAULT 0,
        refund_method TEXT,
        refund_processed BOOLEAN DEFAULT 0,
        refund_processed_at DATETIME,
        order_status_at_cancellation TEXT,
        courier_id_at_cancellation INTEGER,
        notes TEXT,
        requires_approval BOOLEAN DEFAULT 0,
        approved_by INTEGER REFERENCES users(id),
        approved_at DATETIME
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei delivery_cancellations:', err.message);
        } else {
          console.log('✅ Tabelă delivery_cancellations creată/verificată');
        }
      });

      // FAZA 1 - Tabelă: anaf_tokens (token management pentru ANAF SPV)
      db.run(`CREATE TABLE IF NOT EXISTS anaf_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        encrypted_token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_refreshed_at DATETIME,
        is_active BOOLEAN DEFAULT 1
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei anaf_tokens:', err.message);
        } else {
          console.log('✅ Tabelă anaf_tokens creată/verificată');
        }
      });

      // FAZA 1 - Tabelă: anaf_certificates (certificate management)
      db.run(`CREATE TABLE IF NOT EXISTS anaf_certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        certificate_path TEXT NOT NULL,
        certificate_password_encrypted TEXT,
        expiry_date DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei anaf_certificates:', err.message);
        } else {
          console.log('✅ Tabelă anaf_certificates creată/verificată');
        }
      });

      // FAZA 1 - Tabelă: anaf_submission_logs (logging avansat pentru submissions)
      db.run(`CREATE TABLE IF NOT EXISTS anaf_submission_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_id INTEGER,
        document_type TEXT NOT NULL,
        document_id INTEGER NOT NULL,
        payload TEXT,
        error_code TEXT,
        error_message TEXT,
        state TEXT NOT NULL CHECK(state IN ('QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED', 'DEAD_LETTER')),
        attempts INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei anaf_submission_logs:', err.message);
        } else {
          console.log('✅ Tabelă anaf_submission_logs creată/verificată');
        }
      });

      // FAZA 1 - Tabelă: fiscal_print_queue (queue pentru printer)
      db.run(`CREATE TABLE IF NOT EXISTS fiscal_print_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        receipt_type TEXT NOT NULL CHECK(receipt_type IN ('fiscal', 'non_fiscal', 'duplicate')),
        receipt_data TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PRINTING', 'SUCCESS', 'FAILED')),
        attempts INTEGER DEFAULT 0,
        last_error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        printed_at DATETIME
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei fiscal_print_queue:', err.message);
        } else {
          console.log('✅ Tabelă fiscal_print_queue creată/verificată');
        }
      });

      // FAZA 1.5 - Tabelă: saft_exports (istoric exporturi SAF-T)
      db.run(`CREATE TABLE IF NOT EXISTS saft_exports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month TEXT NOT NULL UNIQUE,
        exported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        file_size INTEGER,
        status TEXT DEFAULT 'SUCCESS' CHECK(status IN ('SUCCESS', 'FAILED', 'PARTIAL')),
        error_message TEXT,
        exported_by INTEGER,
        file_path TEXT
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei saft_exports:', err.message);
        } else {
          console.log('✅ Tabelă saft_exports creată/verificată');
        }
      });

      // Tabelă: saga_export_history (istoric exporturi SAGA)
      db.run(`CREATE TABLE IF NOT EXISTS saga_export_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('nir', 'sales')),
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        rows_count INTEGER NOT NULL,
        debit_account TEXT DEFAULT '371',
        credit_account TEXT DEFAULT '401',
        default_vat_rate REAL DEFAULT 11,
        exported_by TEXT,
        exported_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei saga_export_history:', err.message);
        } else {
          console.log('✅ Tabelă saga_export_history creată/verificată');
        }
      });

      // FAZA 1.6 - Tabelă: fiscal_audit (audit fiscal complet)
      db.run(`CREATE TABLE IF NOT EXISTS fiscal_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER REFERENCES orders(id),
        operation_type TEXT NOT NULL CHECK(operation_type IN ('PRINT', 'ANAF_SUBMIT', 'ANAF_ACK', 'ANAF_REJECT', 'RETRY')),
        status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'FAILED', 'PENDING')),
        fiscal_receipt_id INTEGER,
        anaf_submission_id TEXT,
        error_code TEXT,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei fiscal_audit:', err.message);
        } else {
          console.log('✅ Tabelă fiscal_audit creată/verificată');
        }
      });

      // S17.I - Tabelă: external_delivery_connectors (config pentru Glovo, Bolt, Tazz, Wolt)
      db.run(`CREATE TABLE IF NOT EXISTS external_delivery_connectors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER DEFAULT 1,
        provider TEXT NOT NULL CHECK(provider IN ('GLOVO', 'BOLT_FOOD', 'TAZZ', 'WOLT')),
        api_key TEXT,
        client_id TEXT,
        client_secret TEXT,
        webhook_secret TEXT,
        is_enabled BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei external_delivery_connectors:', err.message);
        } else {
          console.log('✅ Tabelă external_delivery_connectors creată/verificată');
        }
      });

      // S17.I - Extindere orders: adaugă coloane pentru external delivery (dacă nu există)
      db.run(`ALTER TABLE orders ADD COLUMN external_provider TEXT`, (err) => {
        if (!err) {
          console.log('✅ Coloană external_provider adăugată în orders');
        }
      });

      db.run(`ALTER TABLE orders ADD COLUMN external_order_id TEXT`, (err) => {
        if (!err) {
          console.log('✅ Coloană external_order_id adăugată în orders');
        }
      });

      // Tabelă: platform_commissions
      db.run(`CREATE TABLE IF NOT EXISTS platform_commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        platform TEXT NOT NULL,
        order_subtotal REAL,
        commission_rate REAL,
        commission_amount REAL,
        vat_on_commission REAL,
        settlement_date DATE,
        settlement_status TEXT DEFAULT 'pending',
        invoice_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei platform_commissions:', err.message);
        } else {
          console.log('✅ Tabelă platform_commissions creată/verificată');
        }
      });

      // Migrare: Adaugă coloana status la couriers dacă nu există
      // Adaugă coloana api_token dacă nu există
      db.run(`ALTER TABLE couriers ADD COLUMN api_token TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei api_token:', err.message);
        } else if (!err) {
          console.log('✅ Coloană api_token adăugată în couriers');
        }
      });

      // Adaugă coloana password_hash dacă nu există (pentru autentificare securizată)
      db.run(`ALTER TABLE couriers ADD COLUMN password_hash TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei password_hash:', err.message);
        } else if (!err) {
          console.log('✅ Coloană password_hash adăugată în couriers');
        }
      });

      // Adaugă coloana active_since dacă nu există
      db.run(`ALTER TABLE couriers ADD COLUMN active_since DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei active_since:', err.message);
        } else if (!err) {
          console.log('✅ Coloană active_since adăugată în couriers');
        }
      });

      db.run(`ALTER TABLE couriers ADD COLUMN status TEXT DEFAULT 'offline'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei status în couriers:', err.message);
        } else if (!err) {
          console.log('✅ Coloană status adăugată în couriers');
        }
      });

      db.run(`ALTER TABLE couriers ADD COLUMN last_location_update DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('⚠️ Eroare la adăugarea coloanei last_location_update:', err.message);
        } else if (!err) {
          console.log('✅ Coloană last_location_update adăugată în couriers');
        }
      });

      // Date demo pentru testare
      db.run(`INSERT OR IGNORE INTO couriers (code, name, phone, vehicle_type, status, is_active) VALUES
        ('DEL001', 'Ion Popescu', '0722123456', 'scooter', 'offline', 1),
        ('DEL002', 'Maria Ionescu', '0733987654', 'car', 'offline', 1)`, (err) => {
        if (err) {
          console.error('⚠️ Eroare la inserarea curierilor demo:', err.message);
        } else {
          console.log('✅ Curieri demo inserați (DEL001, DEL002)');
        }
      });

      db.run(`INSERT OR IGNORE INTO delivery_zones (name, description, zone_type, radius_km, center_lat, center_lng, min_order_value, delivery_fee_base, is_active) VALUES
        ('Centru', 'Zona centrală București', 'radius', 5, 44.4268, 26.1025, 30, 10, 1)`, (err) => {
        if (err) {
          console.error('⚠️ Eroare la inserarea zonei demo:', err.message);
        } else {
          console.log('✅ Zonă delivery demo inserată (Centru)');
        }
      });

      console.log('✅ [MIGRATION] Migrare Delivery & Drive-Thru finalizată!');

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

      // ==================== CONFORMITATE & HACCP (SIGURANȚĂ ALIMENTARĂ) ====================

      // Tabelă pentru echipamente (frigidere, congelatoare, etc.)
      db.run(`CREATE TABLE IF NOT EXISTS compliance_equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('fridge', 'freezer', 'hot_holding', 'receiving', 'other')),
        location TEXT,
        min_temp DECIMAL(5,2),
        max_temp DECIMAL(5,2),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei compliance_equipment:', err.message);
        } else {
          console.log('✅ Tabelă compliance_equipment creată/verificată');
        }
      });

      // Tabelă pentru jurnal temperaturi
      db.run(`CREATE TABLE IF NOT EXISTS compliance_temperature_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER NOT NULL,
        temperature DECIMAL(5,2) NOT NULL,
        operator_id INTEGER,
        notes TEXT,
        status TEXT NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES compliance_equipment (id),
        FOREIGN KEY (operator_id) REFERENCES waiters (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei compliance_temperature_log:', err.message);
        } else {
          console.log('✅ Tabelă compliance_temperature_log creată/verificată');
        }
      });

      // Tabelă pentru plan curățenie
      db.run(`CREATE TABLE IF NOT EXISTS compliance_cleaning_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
        shift_type TEXT CHECK (shift_type IN ('opening', 'closing', 'both')),
        checklist_items TEXT, -- JSON array
        assigned_to INTEGER,
        due_date DATETIME,
        completed_at DATETIME,
        completed_by INTEGER,
        signature_image TEXT, -- Base64 sau path
        status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES waiters (id),
        FOREIGN KEY (completed_by) REFERENCES waiters (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei compliance_cleaning_schedule:', err.message);
        } else {
          console.log('✅ Tabelă compliance_cleaning_schedule creată/verificată');
        }
      });

      // Tabelă pentru checklist items (pentru task-uri de curățenie)
      db.run(`CREATE TABLE IF NOT EXISTS compliance_cleaning_checklist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cleaning_schedule_id INTEGER NOT NULL,
        item_text TEXT NOT NULL,
        is_checked BOOLEAN DEFAULT 0,
        checked_at DATETIME,
        checked_by INTEGER,
        FOREIGN KEY (cleaning_schedule_id) REFERENCES compliance_cleaning_schedule (id) ON DELETE CASCADE,
        FOREIGN KEY (checked_by) REFERENCES waiters (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei compliance_cleaning_checklist_items:', err.message);
        } else {
          console.log('✅ Tabelă compliance_cleaning_checklist_items creată/verificată');
        }
      });

      // Tabelă pentru mentenanță echipamente
      db.run(`CREATE TABLE IF NOT EXISTS compliance_equipment_maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER NOT NULL,
        maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'repair', 'calibration')),
        scheduled_date DATETIME,
        completed_date DATETIME,
        operator_id INTEGER,
        description TEXT,
        result TEXT CHECK (result IN ('ok', 'needs_repair', 'replaced')),
        cost DECIMAL(10,2),
        documents TEXT, -- JSON array cu paths
        status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES compliance_equipment (id),
        FOREIGN KEY (operator_id) REFERENCES waiters (id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei compliance_equipment_maintenance:', err.message);
        } else {
          console.log('✅ Tabelă compliance_equipment_maintenance creată/verificată');
        }
      });

      // Indexes pentru performanță
      db.run(`CREATE INDEX IF NOT EXISTS idx_temperature_log_equipment ON compliance_temperature_log(equipment_id)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_temperature_log_equipment:', err.message);
        }
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_temperature_log_created ON compliance_temperature_log(created_at)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_temperature_log_created:', err.message);
        }
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_cleaning_schedule_due_date ON compliance_cleaning_schedule(due_date)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_cleaning_schedule_due_date:', err.message);
        }
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_scheduled ON compliance_equipment_maintenance(scheduled_date)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_equipment_maintenance_scheduled:', err.message);
        }
      });

      // ==================== HACCP SYSTEM (SIGURANȚĂ ALIMENTARĂ ISO 22000) ====================

      // Tabelă pentru procese HACCP (recepție, stocare, preparare, servire)
      db.run(`CREATE TABLE IF NOT EXISTS haccp_processes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK (category IN ('receiving', 'storage', 'preparation', 'cooking', 'serving', 'other')),
        flow_chart_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei haccp_processes:', err.message);
        } else {
          console.log('✅ Tabelă haccp_processes creată/verificată');
        }
      });

      // Tabelă pentru Puncte Critice de Control (CCP)
      db.run(`CREATE TABLE IF NOT EXISTS haccp_ccp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        process_id INTEGER NOT NULL,
        ccp_number TEXT NOT NULL, -- 'CCP-1', 'CCP-2', etc.
        hazard_type TEXT NOT NULL CHECK (hazard_type IN ('biological', 'chemical', 'physical')),
        hazard_description TEXT NOT NULL,
        control_measure TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (process_id) REFERENCES haccp_processes(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei haccp_ccp:', err.message);
        } else {
          console.log('✅ Tabelă haccp_ccp creată/verificată');
        }
      });

      // Tabelă pentru Limite Critice pentru fiecare CCP
      db.run(`CREATE TABLE IF NOT EXISTS haccp_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ccp_id INTEGER NOT NULL,
        parameter_name TEXT NOT NULL, -- 'temperature', 'time', 'ph', 'visual', etc.
        min_value REAL,
        max_value REAL,
        unit TEXT NOT NULL, -- '°C', 'minutes', 'pH', etc.
        target_value REAL,
        monitoring_frequency TEXT NOT NULL CHECK (monitoring_frequency IN ('every_batch', 'hourly', 'daily', 'weekly')),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei haccp_limits:', err.message);
        } else {
          console.log('✅ Tabelă haccp_limits creată/verificată');
        }
      });

      // Tabelă pentru Acțiuni Corective (trebuie creată înainte de haccp_monitoring pentru foreign key)
      db.run(`CREATE TABLE IF NOT EXISTS haccp_corrective_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ccp_id INTEGER NOT NULL,
        monitoring_id INTEGER,
        action_taken TEXT NOT NULL,
        taken_by INTEGER,
        taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT 0,
        resolved_at DATETIME,
        verification_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id) ON DELETE CASCADE,
        FOREIGN KEY (taken_by) REFERENCES users(id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei haccp_corrective_actions:', err.message);
        } else {
          console.log('✅ Tabelă haccp_corrective_actions creată/verificată');
        }
      });

      // Tabelă pentru Înregistrări Monitorizare
      db.run(`CREATE TABLE IF NOT EXISTS haccp_monitoring (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ccp_id INTEGER NOT NULL,
        monitored_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        monitored_by INTEGER,
        parameter_name TEXT NOT NULL,
        measured_value REAL NOT NULL,
        unit TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
        notes TEXT,
        corrective_action_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ccp_id) REFERENCES haccp_ccp(id) ON DELETE CASCADE,
        FOREIGN KEY (monitored_by) REFERENCES users(id),
        FOREIGN KEY (corrective_action_id) REFERENCES haccp_corrective_actions(id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei haccp_monitoring:', err.message);
        } else {
          console.log('✅ Tabelă haccp_monitoring creată/verificată');
        }
      });

      // Indexuri pentru performanță HACCP
      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_ccp_process ON haccp_ccp(process_id)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_haccp_ccp_process:', err.message);
        }
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_limits_ccp ON haccp_limits(ccp_id)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_haccp_limits_ccp:', err.message);
        }
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_monitoring_ccp ON haccp_monitoring(ccp_id)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_haccp_monitoring_ccp:', err.message);
        }
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_monitoring_created ON haccp_monitoring(monitored_at)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_haccp_monitoring_created:', err.message);
        }
      });

      db.run(`CREATE INDEX IF NOT EXISTS idx_haccp_monitoring_status ON haccp_monitoring(status)`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('⚠️ Eroare la crearea indexului idx_haccp_monitoring_status:', err.message);
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

      // Tabelă PRODUCTS (pentru alergeni și alte funcționalități)
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_en TEXT,
        price REAL NOT NULL,
        vat_rate REAL DEFAULT 19.0,
        category_id INTEGER,
        gestiune_id INTEGER,
        section_id INTEGER,
        unit TEXT DEFAULT 'buc',
        description TEXT,
        description_en TEXT,
        image TEXT,
        preparation_time INTEGER DEFAULT 0,
        spice_level INTEGER DEFAULT 0,
        allergens TEXT,
        is_available INTEGER DEFAULT 1,
        has_recipe INTEGER DEFAULT 0,
        is_fractional INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei products:', err.message);
        } else {
          console.log('✅ Tabelă products creată/verificată');
        }
      });

      // Tabelă PRODUCT_LABELS (pentru etichete produse)
      db.run(`CREATE TABLE IF NOT EXISTS product_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        barcode TEXT UNIQUE,
        label_template TEXT DEFAULT 'standard' CHECK(label_template IN ('standard', 'minimal', 'premium')),
        additional_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei product_labels:', err.message);
        } else {
          console.log('✅ Tabelă product_labels creată/verificată');
        }
      });

      // Tabelă UNITS_OF_MEASURE (unități de măsură)
      db.run(`CREATE TABLE IF NOT EXISTS units_of_measure (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL CHECK(category IN ('masa', 'volum', 'lungime', 'bucati', 'altul')),
        base_unit INTEGER,
        conversion_factor REAL DEFAULT 1.0,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (base_unit) REFERENCES units_of_measure(id)
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei units_of_measure:', err.message);
        } else {
          console.log('✅ Tabelă units_of_measure creată/verificată');
        }
      });

      // Index pentru units_of_measure
      db.run(`CREATE INDEX IF NOT EXISTS idx_units_category ON units_of_measure(category)`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea indexului units_category:', err.message);
        }
      });

      // Tabelă PRICE_HISTORY (istoric prețuri)
      db.run(`CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        old_price REAL,
        new_price REAL NOT NULL,
        change_reason TEXT,
        change_type TEXT CHECK(change_type IN ('manual', 'bulk_update', 'cost_adjustment', 'margin_target', 'inflation', 'seasonal', 'formula')),
        changed_by TEXT,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES menu(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei price_history:', err.message);
        } else {
          console.log('✅ Tabelă price_history creată/verificată');
        }
      });

      // Index pentru price_history
      db.run(`CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id)`, (err) => {
        if (err) console.error('❌ Eroare la crearea indexului price_history_product:', err.message);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(changed_at)`, (err) => {
        if (err) console.error('❌ Eroare la crearea indexului price_history_date:', err.message);
      });

      // Tabelă PRICE_RULES (reguli automate de preț)
      db.run(`CREATE TABLE IF NOT EXISTS price_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rule_type TEXT NOT NULL CHECK(rule_type IN ('cost_multiplier', 'margin_target', 'percentage_change', 'fixed_change', 'formula')),
        condition_json TEXT,
        action_json TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        priority INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei price_rules:', err.message);
        } else {
          console.log('✅ Tabelă price_rules creată/verificată');
        }
      });

      // Index pentru product_labels
      db.run(`CREATE INDEX IF NOT EXISTS idx_product_labels_product ON product_labels(product_id)`, (err) => {
        if (err) console.error('❌ Eroare la crearea index product_labels_product:', err.message);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_product_labels_barcode ON product_labels(barcode)`, (err) => {
        if (err) console.error('❌ Eroare la crearea index product_labels_barcode:', err.message);
      });

      // Tabelă SUPPLIER_ORDERS (pentru comenzi furnizori)
      db.run(`CREATE TABLE IF NOT EXISTS supplier_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        order_date DATE NOT NULL,
        expected_delivery_date DATE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
        total_amount REAL DEFAULT 0,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES waiters(id) ON DELETE SET NULL
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei supplier_orders:', err.message);
        } else {
          console.log('✅ Tabelă supplier_orders creată/verificată');
        }
      });

      // Tabelă SUPPLIER_ORDER_ITEMS (pentru itemi din comenzi furnizori)
      db.run(`CREATE TABLE IF NOT EXISTS supplier_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        ingredient_id INTEGER,
        item_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES supplier_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei supplier_order_items:', err.message);
        } else {
          console.log('✅ Tabelă supplier_order_items creată/verificată');
        }
      });

      // Tabelă INVENTORY_SESSIONS (pentru inventar multi-gestiune)
      db.run(`CREATE TABLE IF NOT EXISTS inventory_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_type TEXT NOT NULL CHECK(session_type IN ('daily', 'weekly', 'monthly', 'full')),
        scope TEXT NOT NULL CHECK(scope IN ('global', 'location', 'gestiune')),
        location_ids TEXT,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        started_by TEXT NOT NULL,
        notes TEXT,
        item_count INTEGER DEFAULT 0,
        difference_count INTEGER DEFAULT 0
      )`, (err) => {
        if (err) {
          console.error('❌ Eroare la crearea tabelei inventory_sessions:', err.message);
        } else {
          console.log('✅ Tabelă inventory_sessions creată/verificată');
        }
      });

      // Index pentru inventory_sessions
      db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_sessions_status ON inventory_sessions(status)`, (err) => {
        if (err) console.error('❌ Eroare la crearea index inventory_sessions_status:', err.message);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_sessions_type ON inventory_sessions(session_type)`, (err) => {
        if (err) console.error('❌ Eroare la crearea index inventory_sessions_type:', err.message);
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

      // --- MIGRĂRI PENTRU REZOLVARE ERORI SEMNALATE ---

      // 1. Marketing Campaigns (Lipsea type, status, statistics din query-urile controller-ului)
      db.run(`ALTER TABLE marketing_campaigns ADD COLUMN type TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.warn('⚠️ Nota migrare marketing_campaigns.type:', err.message);
      });
      db.run(`ALTER TABLE marketing_campaigns ADD COLUMN status TEXT DEFAULT 'active'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.warn('⚠️ Nota migrare marketing_campaigns.status:', err.message);
      });
      db.run(`ALTER TABLE marketing_campaigns ADD COLUMN statistics TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.warn('⚠️ Nota migrare marketing_campaigns.statistics:', err.message);
      });

      // 2. Inventory Sessions (Lipsea counted_by din log-urile sistemului)
      db.run(`ALTER TABLE inventory_sessions ADD COLUMN counted_by TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.warn('⚠️ Nota migrare inventory_sessions.counted_by:', err.message);
      });

      // 3. Happy Hour (Lipsea day_of_week, start_hour, end_hour din query-ul legacy)
      db.run(`ALTER TABLE happy_hour_settings ADD COLUMN day_of_week INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.warn('⚠️ Nota migrare happy_hour_settings.day_of_week:', err.message);
      });
      db.run(`ALTER TABLE happy_hour_settings ADD COLUMN start_hour INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.warn('⚠️ Nota migrare happy_hour_settings.start_hour:', err.message);
      });
      db.run(`ALTER TABLE happy_hour_settings ADD COLUMN end_hour INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) console.warn('⚠️ Nota migrare happy_hour_settings.end_hour:', err.message);
      });
      // ------------------------------------------------

      // Trecem la popularea meniului
      db.get("SELECT COUNT(*) as count FROM menu", (err, row) => {
        if (err) return reject(err);
        if (row.count === 0) {
          console.log('📦 Meniul este gol. Se adaugă produsele din seed...');

          // Încearcă să folosească seedProducts (produse din seeds/products_seed.js)
          const { seedProducts } = require('./seeds/loadProductsSeeds');

          seedProducts(db)
            .then((insertedCount) => {
              console.log(`✅ ${insertedCount} produse seed-uite cu succes!`);

              // Adaugă produsele pentru ambalaje și accesorii
              // FIXED: Packaging items are managed via FTP system, not auto-inserted
              return Promise.resolve();
            })
            .then(() => {
              // Inițializează stocurile pentru toate produsele
              return initializeStockForAllProducts(db);
            })
            .then(() => {
              // Inițializează mesajele predefinite
              return initializePredefinedMessages(db);
            })
            .then(() => {
              resolve();
            })
            .catch((seedError) => {
              console.warn('⚠️ Eroare la seedProducts, folosim insertRealMenu ca fallback:', seedError.message);
              // Fallback la insertRealMenu dacă seedProducts eșuează
              insertRealMenu(db)
                .then(() => {
                  // FIXED: Packaging items are managed via FTP system, not auto-inserted
                  return Promise.resolve();
                })
                .then(() => {
                  return initializeStockForAllProducts(db);
                })
                .then(() => {
                  return initializePredefinedMessages(db);
                })
                .then(() => {
                  resolve();
                })
                .catch((fallbackError) => {
                  console.error('❌ Eroare la insertRealMenu fallback:', fallbackError);
                  reject(fallbackError);
                });
            });
        } else {
          console.log('Meniul conține deja date.');
          // Ambalajele nu se mai adaugă automat - sunt gestionate manual prin F.T.P.
          console.log('📦 Ambalajele sunt gestionate manual prin Fișele Tehnice de Produs (F.T.P.)');
          // Inițializează stocurile pentru produsele existente
          initializeStockForAllProducts(db).then(() => {
            // Inițializează mesajele predefinite
            initializePredefinedMessages(db).then(() => {
              // Seed date default pentru users, payment_methods, printers
              seedDefaultDataSync(db);
              resolve();
            }).catch(reject);
          }).catch(reject);
        }
      });
    });
  });
}

/**
 * Seed date default pentru users, payment_methods, printers
 * Apelat la finalul inițializării bazei de date
 */
function seedDefaultDataSync(db) {
  // 1. Seed Payment Methods (dacă nu există)
  db.get('SELECT COUNT(*) as count FROM payment_methods', [], (err, row) => {
    if (!err && row && row.count === 0) {
      console.log('💳 Seeding payment_methods...');
      const paymentMethods = [
        ['cash', 'cash', 'Numerar', 'Cash', '💵', 1, 0, 0, 1, 0, 1],
        ['card', 'card', 'Card', 'Card', '💳', 1, 0.5, 0, 0, 1, 2],
        ['ticket', 'ticket', 'Tichet Masa', 'Meal Ticket', '🎫', 1, 0, 0, 0, 1, 3],
        ['voucher', 'voucher', 'Voucher', 'Voucher', '🎁', 1, 0, 0, 0, 1, 4],
        ['transfer', 'transfer', 'Transfer Bancar', 'Bank Transfer', '🏦', 1, 0, 0, 0, 1, 5]
      ];

      paymentMethods.forEach(method => {
        db.run(
          `INSERT INTO payment_methods (name, code, display_name, display_name_en, icon, is_active, fee_percentage, fee_fixed, requires_change, requires_receipt, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          method,
          (err) => {
            if (err) console.error(`❌ Eroare la seed payment_method ${method[0]}:`, err.message);
            else console.log(`✅ Payment method creat: ${method[0]}`);
          }
        );
      });
    }
  });

  // 2. Seed Printers (dacă nu există)
  db.get('SELECT COUNT(*) as count FROM printers', [], (err, row) => {
    if (!err && row && row.count === 0) {
      console.log('🖨️ Seeding printers...');
      const printers = [
        ['Imprimantă Bar', 'kitchen', null, '192.168.1.100', 9100, 'network', 1, 1, JSON.stringify(['bauturi', 'bar']), 80],
        ['Imprimantă Bucătărie', 'kitchen', null, '192.168.1.101', 9100, 'network', 1, 1, JSON.stringify(['mancare', 'bucatarie']), 80],
        ['Imprimantă Casă', 'receipt', null, '192.168.1.102', 9100, 'network', 1, 1, JSON.stringify(['receipt']), 80]
      ];

      printers.forEach(printer => {
        db.run(
          `INSERT INTO printers (name, type, location_id, ip_address, port, connection_type, is_active, auto_print, print_categories, paper_width) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          printer,
          (err) => {
            if (err) console.error(`❌ Eroare la seed printer ${printer[0]}:`, err.message);
            else console.log(`✅ Printer creat: ${printer[0]}`);
          }
        );
      });
    }
  });

  // 3. Seed Users (dacă nu există și dacă user_roles există)
  db.get('SELECT COUNT(*) as count FROM users', [], (err, userRow) => {
    if (!err && userRow && userRow.count === 0) {
      db.get('SELECT id FROM user_roles WHERE role_name = ? OR role_name = ? LIMIT 1', ['Super Admin', 'admin'], (err, roleRow) => {
        if (!err && roleRow) {
          console.log('👥 Seeding users...');
          const passwordHash = crypto.createHash('sha256').update('admin123').digest('hex');

          db.run(
            `INSERT INTO users (username, email, password_hash, role_id, is_active) 
             VALUES (?, ?, ?, ?, ?)`,
            ['admin', 'admin@restaurant.ro', passwordHash, roleRow.id, 1],
            (err) => {
              if (err) console.error('❌ Eroare la seed user admin:', err.message);
              else console.log('✅ User creat: admin');
            }
          );
        }
      });
    }
  });
}

async function migrateWaiterPinStorage(db) {
  return new Promise((resolve) => {
    db.all('SELECT id, pin, pin_hash, pin_salt FROM waiters', async (err, rows) => {
      if (err) {
        console.error('Eroare la migrarea hash-urilor pentru waiters:', err);
        return resolve();
      }

      if (!rows || rows.length === 0) {
        return resolve();
      }

      const updatePromises = rows
        .filter((row) => row && PIN_PATTERN.test(row.pin || '') && (!row.pin_hash || !row.pin_salt))
        .map((row) => {
          const { hash, salt } = createPinHash(row.pin);
          return new Promise((res) => {
            db.run(
              `UPDATE waiters
                 SET pin_hash = ?,
                     pin_salt = ?,
                     pin_policy_version = COALESCE(pin_policy_version, ?),
                     pin_last_rotated_at = COALESCE(pin_last_rotated_at, CURRENT_TIMESTAMP),
                     pin = NULL,
                     updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [hash, salt, PIN_ROTATION_POLICY_VERSION, row.id],
              (updateErr) => {
                if (updateErr) {
                  console.error(`Eroare la actualizarea hash-ului pentru waiter ${row.id}:`, updateErr);
                } else {
                  console.log(`🔐 Migrat PIN ospătar ID ${row.id} la hash.`);
                }
                res();
              }
            );
          });
        });

      Promise.all(updatePromises).then(() => resolve());
    });
  });
}

function logWaiterPinAudit({ waiterId, action, actorId = null, actorName = null, rotationReason = null, metadata = {} }) {
  if (!waiterId || !action) {
    return Promise.reject(new Error('Parametri insuficienți pentru logWaiterPinAudit'));
  }

  return dbPromise.then((db) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO waiter_pin_audit (waiter_id, action, actor_id, actor_name, rotation_reason, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          waiterId,
          action,
          actorId,
          actorName,
          rotationReason,
          JSON.stringify(metadata ?? {})
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  });
}

function getWaiterPinAudit(waiterId, limit = 50) {
  if (!waiterId) {
    return Promise.reject(new Error('waiterId este obligatoriu pentru getWaiterPinAudit'));
  }

  return dbPromise.then((db) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, waiter_id, action, actor_id, actor_name, rotation_reason, metadata, created_at
           FROM waiter_pin_audit
          WHERE waiter_id = ?
          ORDER BY datetime(created_at) DESC, id DESC
          LIMIT ?`,
        [waiterId, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              (rows || []).map((row) => ({
                ...row,
                metadata: safeJsonParse(row.metadata, {})
              }))
            );
          }
        }
      );
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

          // Fel Principal - Schimbare garnituri (DOAR pentru produse care au efectiv cartofi/piure în descriere)
          // NOTĂ: Aceste customizations sunt valide DOAR dacă produsul are cartofi/piure în descriere
          // { menu_item_id: 45, option_name: 'Înlocuiește piure cu cartofi prăjiți', option_type: 'garnish_swap', extra_price: 0, option_name_en: 'Replace mashed potatoes with french fries' }, // Piept de pui - VERIFICAT: nu are piure în descriere, ȘTERS
          // { menu_item_id: 46, option_name: 'Înlocuiește cartofii prăjiți cu piure', option_type: 'garnish_swap', extra_price: 2, option_name_en: 'Replace french fries with mashed potatoes' }, // Pulpe - VERIFICAT: nu are cartofi prăjiți în descriere, ȘTERS
          { menu_item_id: 50, option_name: 'Înlocuiește cartofii zdrobiți cu cartofi prăjiți', option_type: 'garnish_swap', extra_price: 0, option_name_en: 'Replace smashed potatoes with french fries' }, // Polo Parmegiano - ARE cartofi zdrobiți în descriere, VALID
          { menu_item_id: 69, option_name: 'Înlocuiește piure cu trufe cu cartofi prăjiți', option_type: 'garnish_swap', extra_price: 0, option_name_en: 'Replace truffle mashed potatoes with french fries' }, // Pulpa de rata - ARE piure cu trufe în descriere, VALID

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

    // ==================== INDEXURI DELIVERY & DRIVE-THRU (05 Dec 2025) ====================

    console.log('🚚 [INDEX] Creez indexuri pentru Delivery & Drive-Thru...');

    // Indexuri orders - delivery & drive-thru
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_order_source ON orders(order_source)`, (err) => {
      if (err) console.error('Eroare idx_orders_order_source:', err.message);
      else console.log('✅ Index idx_orders_order_source creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform)`, (err) => {
      if (err) console.error('Eroare idx_orders_platform:', err.message);
      else console.log('✅ Index idx_orders_platform creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_courier_id ON orders(courier_id)`, (err) => {
      if (err) console.error('Eroare idx_orders_courier_id:', err.message);
      else console.log('✅ Index idx_orders_courier_id creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone ON orders(delivery_zone_id)`, (err) => {
      if (err) console.error('Eroare idx_orders_delivery_zone:', err.message);
      else console.log('✅ Index idx_orders_delivery_zone creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_source_status ON orders(order_source, status)`, (err) => {
      if (err) console.error('Eroare idx_orders_source_status:', err.message);
      else console.log('✅ Index idx_orders_source_status (composite) creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_fiscal_printed ON orders(fiscal_receipt_printed)`, (err) => {
      if (err) console.error('Eroare idx_orders_fiscal_printed:', err.message);
      else console.log('✅ Index idx_orders_fiscal_printed creat');
    });

    // ==================== INDEXURI OPTIMIZARE RAPOARTE (21 Dec 2025) ====================

    console.log('📊 [INDEX] Creez indexuri compuse pentru optimizare rapoarte...');

    // Index compus pentru query-urile de rapoarte (status + timestamp)
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status_timestamp ON orders(status, timestamp)`, (err) => {
      if (err) console.error('Eroare idx_orders_status_timestamp:', err.message);
      else console.log('✅ Index idx_orders_status_timestamp (composite) creat');
    });

    // Index compus pentru query-uri cu table_number filtering
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status_table_timestamp ON orders(status, table_number, timestamp)`, (err) => {
      if (err) console.error('Eroare idx_orders_status_table_timestamp:', err.message);
      else console.log('✅ Index idx_orders_status_table_timestamp (composite) creat');
    });

    // Index pentru client_identifier (pentru filtrarea comenzilor de test)
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_client_identifier ON orders(client_identifier) WHERE client_identifier IS NOT NULL`, (err) => {
      if (err) console.error('Eroare idx_orders_client_identifier:', err.message);
      else console.log('✅ Index idx_orders_client_identifier creat');
    });

    // Indexuri delivery_assignments
    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON delivery_assignments(order_id)`, (err) => {
      if (err) console.error('Eroare idx_delivery_assignments_order:', err.message);
      else console.log('✅ Index idx_delivery_assignments_order creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_assignments_courier ON delivery_assignments(courier_id)`, (err) => {
      if (err) console.error('Eroare idx_delivery_assignments_courier:', err.message);
      else console.log('✅ Index idx_delivery_assignments_courier creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON delivery_assignments(status)`, (err) => {
      if (err) console.error('Eroare idx_delivery_assignments_status:', err.message);
      else console.log('✅ Index idx_delivery_assignments_status creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_assignments_assigned_at ON delivery_assignments(assigned_at)`, (err) => {
      if (err) console.error('Eroare idx_delivery_assignments_assigned_at:', err.message);
      else console.log('✅ Index idx_delivery_assignments_assigned_at creat');
    });

    // S17.A - Indexuri delivery_proofs
    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_proofs_order ON delivery_proofs(order_id)`, (err) => {
      if (err) console.error('Eroare idx_delivery_proofs_order:', err.message);
      else console.log('✅ Index idx_delivery_proofs_order creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_proofs_courier ON delivery_proofs(courier_id)`, (err) => {
      if (err) console.error('Eroare idx_delivery_proofs_courier:', err.message);
      else console.log('✅ Index idx_delivery_proofs_courier creat');
    });

    // Indexuri couriers
    db.run(`CREATE INDEX IF NOT EXISTS idx_couriers_status ON couriers(status)`, (err) => {
      if (err) console.error('Eroare idx_couriers_status:', err.message);
      else console.log('✅ Index idx_couriers_status creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_couriers_user_id ON couriers(user_id)`, (err) => {
      if (err) console.error('Eroare idx_couriers_user_id:', err.message);
      else console.log('✅ Index idx_couriers_user_id creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_couriers_api_token ON couriers(api_token)`, (err) => {
      if (err) console.error('Eroare idx_couriers_api_token:', err.message);
      else console.log('✅ Index idx_couriers_api_token creat');
    });

    // Indexuri delivery_zones
    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active)`, (err) => {
      if (err) console.error('Eroare idx_delivery_zones_active:', err.message);
      else console.log('✅ Index idx_delivery_zones_active creat');
    });

    // Indexuri platform_commissions
    db.run(`CREATE INDEX IF NOT EXISTS idx_platform_commissions_order ON platform_commissions(order_id)`, (err) => {
      if (err) console.error('Eroare idx_platform_commissions_order:', err.message);
      else console.log('✅ Index idx_platform_commissions_order creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_platform_commissions_platform ON platform_commissions(platform)`, (err) => {
      if (err) console.error('Eroare idx_platform_commissions_platform:', err.message);
      else console.log('✅ Index idx_platform_commissions_platform creat');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_platform_commissions_settlement ON platform_commissions(settlement_date, settlement_status)`, (err) => {
      if (err) console.error('Eroare idx_platform_commissions_settlement:', err.message);
      else console.log('✅ Index idx_platform_commissions_settlement (composite) creat');
    });

    console.log('✅ [INDEX] Toate indexurile Delivery & Drive-Thru create!');

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

                db.run(sql, [ing.quantity, ing.ingredient_id], function (updateErr) {
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
              } catch (e) {
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
      function (err) {
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
              function (err) {
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
        db.run('INSERT INTO loyalty_points (client_token) VALUES (?)', [clientToken], function (err) {
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
      `, [clientToken, pointsEarned, orderAmount, pointsEarned, orderAmount], function (err) {
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
          { name: 'Viewer', description: 'Doar vizualizare rapoarte și statistici', is_system: 1 },
          // === ROLURI DELIVERY & DRIVE-THRU (05 Dec 2025) ===
          { name: 'Dispatcher', description: 'Dispecer livrări - Alocă curieri', is_system: 0 },
          { name: 'Courier', description: 'Curier - App mobil livrare', is_system: 0 },
          { name: 'Drive-Thru Operator', description: 'Operator drive-thru', is_system: 0 }
        ];

        const insertRolePromises = roles.map(role => {
          return new Promise((resolveRole, rejectRole) => {
            db.run(
              'INSERT INTO user_roles (role_name, role_description, is_system_role) VALUES (?, ?, ?)',
              [role.name, role.description, role.is_system],
              function (err) {
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
              { name: 'marketing.manage', description: 'Gestionare marketing', module: 'marketing', action: 'manage' },

              // === MODULUL DELIVERY & DRIVE-THRU (05 Dec 2025) ===
              { name: 'delivery.view', description: 'Vizualizare comenzi delivery', module: 'delivery', action: 'view' },
              { name: 'delivery.create', description: 'Creare comenzi delivery (telefonic)', module: 'delivery', action: 'create' },
              { name: 'delivery.edit', description: 'Modificare comenzi delivery', module: 'delivery', action: 'edit' },
              { name: 'delivery.cancel', description: 'Anulare comenzi delivery', module: 'delivery', action: 'cancel' },
              { name: 'delivery.dispatch', description: 'Alocare curieri (Dispatcher)', module: 'delivery', action: 'dispatch' },
              { name: 'delivery.reassign', description: 'Re-alocare curier', module: 'delivery', action: 'reassign' },
              { name: 'delivery.zones.manage', description: 'Gestionare zone livrare', module: 'delivery', action: 'zones_manage' },
              { name: 'couriers.view', description: 'Vizualizare curieri', module: 'couriers', action: 'view' },
              { name: 'couriers.manage', description: 'Gestionare curieri (CRUD)', module: 'couriers', action: 'manage' },
              { name: 'couriers.track', description: 'Tracking live curieri', module: 'couriers', action: 'track' },
              { name: 'drive_thru.view', description: 'Vizualizare comenzi drive-thru', module: 'drive_thru', action: 'view' },
              { name: 'drive_thru.create', description: 'Creare comenzi drive-thru', module: 'drive_thru', action: 'create' },
              { name: 'drive_thru.complete', description: 'Finalizare comenzi drive-thru', module: 'drive_thru', action: 'complete' },
              { name: 'reports.delivery', description: 'Rapoarte delivery & drive-thru', module: 'reports', action: 'delivery' }
            ];

            const insertPermissionPromises = permissions.map(permission => {
              return new Promise((resolvePerm, rejectPerm) => {
                db.run(
                  'INSERT INTO permissions (permission_name, permission_description, module, action) VALUES (?, ?, ?, ?)',
                  [permission.name, permission.description, permission.module, permission.action],
                  function (err) {
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
                  ...permissionIds.filter((_, index) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(index)).map(permId => ({ roleId: roleIds[2], permissionId: permId })),

                  // Waiter - orders, menu.view
                  ...permissionIds.filter((_, index) => [0, 1, 2, 3, 4, 5].includes(index)).map(permId => ({ roleId: roleIds[3], permissionId: permId })),

                  // Cashier - orders.view, orders.complete, reports.view
                  ...permissionIds.filter((_, index) => [0, 4, 12].includes(index)).map(permId => ({ roleId: roleIds[4], permissionId: permId })),

                  // Viewer - doar vizualizare
                  ...permissionIds.filter((_, index) => [0, 5, 9, 12, 16, 20, 22].includes(index)).map(permId => ({ roleId: roleIds[5], permissionId: permId })),

                  // === ROLURI DELIVERY & DRIVE-THRU (05 Dec 2025) ===
                  // Dispatcher (roleIds[6]) - delivery.*, couriers.*, reports.delivery
                  // Permisiuni: 24-30, 35 (delivery.view, delivery.dispatch, delivery.reassign, couriers.view, couriers.track, reports.delivery)
                  ...permissionIds.filter((_, index) => [24, 28, 29, 31, 33, 38].includes(index)).map(permId => ({ roleId: roleIds[6], permissionId: permId })),

                  // Courier (roleIds[7]) - doar delivery.view (pentru comenzile sale)
                  ...permissionIds.filter((_, index) => [24].includes(index)).map(permId => ({ roleId: roleIds[7], permissionId: permId })),

                  // Drive-Thru Operator (roleIds[8]) - drive_thru.*
                  ...permissionIds.filter((_, index) => [34, 35, 36].includes(index)).map(permId => ({ roleId: roleIds[8], permissionId: permId }))
                ];

                const insertRolePermPromises = rolePermissionMappings.map(mapping => {
                  return new Promise((resolveRP, rejectRP) => {
                    db.run(
                      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                      [mapping.roleId, mapping.permissionId],
                      function (err) {
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

async function createUser(username, email, password, roleId) {
  const db = await dbPromise;
  // ✅ SECURITATE: Hash parolă cu bcrypt înainte de salvare
  const bcrypt = require('bcrypt');
  const password_hash = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, roleId],
      function (err) {
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
      function (err) {
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
    `, [userId, action, resourceType, resourceId, oldValues, newValues, ipAddress, userAgent], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

// ==================== FUNCȚII MFA (Multi-Factor Authentication) ====================

async function setMfaSecret(userId, secret) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET mfa_secret = ? WHERE id = ?',
      [secret, userId],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

async function enableMfa(userId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET mfa_enabled = 1 WHERE id = ?',
      [userId],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

async function disableMfa(userId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET mfa_enabled = 0, mfa_secret = NULL WHERE id = ?',
      [userId],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

async function getUserMfaSecret(userId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT mfa_secret, mfa_enabled FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

async function updateSessionActivity(sessionToken) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_token = ?',
      [sessionToken],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
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
              function (err) {
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
                  function (err) {
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
      specialRequests,
      locationId,
      tenantId
    } = reservationData;

    // Generează cod de confirmare
    const confirmationCode = require('crypto').randomBytes(4).toString('hex').toUpperCase();

    db.run(`
      INSERT INTO reservations (
        table_id, customer_name, customer_phone, customer_email,
        reservation_date, reservation_time, duration_minutes, party_size,
        special_requests, confirmation_code, location_id, tenant_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tableId, customerName, customerPhone, customerEmail,
      reservationDate, reservationTime, durationMinutes, partySize,
      specialRequests, confirmationCode, locationId || null, tenantId || null
    ], function (err) {
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
    `, [tableId, date, time, isAvailable, reservationId], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

/**
 * Calculează numărul de mese necesare pentru un număr de persoane
 * Fiecare masă are minim 4 locuri, deci calculăm: partySize / 4 rotunjit în sus
 */
function calculateRequiredTables(partySize) {
  const MIN_CAPACITY_PER_TABLE = 4;
  return Math.ceil(partySize / MIN_CAPACITY_PER_TABLE);
}

/**
 * Găsește mese apropiate disponibile pentru o rezervare
 * Caută mese în aceeași zonă (location) sau mese consecutive
 * @param {number} partySize - Numărul de persoane
 * @param {string} date - Data rezervării
 * @param {string} time - Ora rezervării
 * @param {number} requiredTables - Numărul de mese necesare
 * @returns {Promise<Array>} - Array cu mesele alocate
 */
async function findNearbyAvailableTables(partySize, date, time, requiredTables) {
  const db = await dbPromise;

  return new Promise((resolve, reject) => {
    // Obține toate mesele disponibile pentru data și ora specificată
    db.all(`
      SELECT t.*, 
             CASE WHEN ta.is_available IS NULL OR ta.is_available = 1 THEN 1 ELSE 0 END as is_available
      FROM tables t
      LEFT JOIN table_availability ta ON t.id = ta.table_id 
        AND ta.date = ? AND ta.time_slot = ?
      WHERE t.is_active = 1
      ORDER BY t.location, t.table_number ASC
    `, [date, time], (err, allTables) => {
      if (err) return reject(err);

      // Filtrează doar mesele disponibile
      const availableTables = allTables.filter(t => t.is_available === 1);

      if (availableTables.length < requiredTables) {
        // Nu sunt suficiente mese disponibile
        return resolve([]);
      }

      // Strategie 1: Caută mese în aceeași zonă (location)
      const tablesByLocation = {};
      availableTables.forEach(table => {
        const location = table.location || 'default';
        if (!tablesByLocation[location]) {
          tablesByLocation[location] = [];
        }
        tablesByLocation[location].push(table);
      });

      // Caută o zonă cu suficiente mese
      for (const location in tablesByLocation) {
        if (tablesByLocation[location].length >= requiredTables) {
          // Returnează primele N mese din această zonă
          return resolve(tablesByLocation[location].slice(0, requiredTables));
        }
      }

      // Strategie 2: Dacă nu găsim în aceeași zonă, caută mese consecutive
      // Sortăm mesele după număr și căutăm secvențe consecutive
      const sortedTables = availableTables.sort((a, b) => {
        const numA = parseInt(a.table_number) || 0;
        const numB = parseInt(b.table_number) || 0;
        return numA - numB;
      });

      // Caută o secvență de mese consecutive
      for (let i = 0; i <= sortedTables.length - requiredTables; i++) {
        const sequence = sortedTables.slice(i, i + requiredTables);
        const isConsecutive = sequence.every((table, idx) => {
          if (idx === 0) return true;
          const prevNum = parseInt(sequence[idx - 1].table_number) || 0;
          const currNum = parseInt(table.table_number) || 0;
          // Considerăm consecutive dacă diferența este <= 2 (permite mese apropiate)
          return currNum - prevNum <= 2;
        });

        if (isConsecutive) {
          return resolve(sequence);
        }
      }

      // Strategie 3: Dacă nu găsim mese consecutive, returnăm primele N mese disponibile
      return resolve(sortedTables.slice(0, requiredTables));
    });
  });
}

/**
 * Alocă automat mesele pentru o rezervare confirmată
 * @param {number} reservationId - ID-ul rezervării
 * @param {number} partySize - Numărul de persoane
 * @param {string} date - Data rezervării
 * @param {string} time - Ora rezervării
 * @returns {Promise<Array>} - Array cu ID-urile meselor alocate
 */
async function autoAllocateTablesForReservation(reservationId, partySize, date, time) {
  const requiredTables = calculateRequiredTables(partySize);
  const allocatedTables = await findNearbyAvailableTables(partySize, date, time, requiredTables);

  if (allocatedTables.length === 0) {
    throw new Error(`Nu sunt suficiente mese disponibile pentru ${partySize} persoane.`);
  }

  // Actualizează disponibilitatea pentru fiecare masă alocată
  const tableIds = [];
  for (const table of allocatedTables) {
    await updateTableAvailability(table.id, date, time, false, reservationId);
    tableIds.push(table.id);
  }

  // Dacă sunt mai multe mese, actualizează rezervarea cu prima masă (pentru compatibilitate)
  // și salvăm celelalte mese într-o tabelă de legătură
  if (tableIds.length > 0) {
    // Actualizează rezervarea cu prima masă
    const db = await dbPromise;
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE reservations
        SET table_id = ?
        WHERE id = ?
      `, [tableIds[0], reservationId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Salvează celelalte mese într-o tabelă de legătură (dacă există mai mult de o masă)
    if (tableIds.length > 1) {
      // Creează tabela de legătură dacă nu există
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS reservation_tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reservation_id INTEGER NOT NULL,
            table_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reservation_id) REFERENCES reservations (id),
            FOREIGN KEY (table_id) REFERENCES tables (id),
            UNIQUE(reservation_id, table_id)
          )
        `, [], (err) => {
          if (err && !err.message.includes('already exists')) return reject(err);
          resolve();
        });
      });

      // Inserează toate mesele (inclusiv prima, pentru consistență)
      for (const tableId of tableIds) {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT OR IGNORE INTO reservation_tables (reservation_id, table_id)
            VALUES (?, ?)
          `, [reservationId, tableId], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }
  }

  return tableIds;
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
    `, [status, reservationId], function (err) {
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
        `, [value, name], function (err) {
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

async function addReservationEvent(reservationId, eventType, payload = {}, createdBy = 'admin.v4') {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO reservation_events (reservation_id, event_type, payload, created_by)
        VALUES (?, ?, ?, ?)
      `,
      [reservationId, eventType, JSON.stringify(payload ?? {}), createdBy],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      },
    );
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
          { name: 'default_vat_rate', value: '21', description: 'Cota TVA implicită (%)' },
          { name: 'invoice_series', value: 'F', description: 'Seria facturilor' },
          { name: 'receipt_series', value: 'B', description: 'Seria bonurilor fiscale' },
          { name: 'auto_send_to_anaf', value: 'false', description: 'Trimitere automată la ANAF' }
        ];

        const insertConfigPromises = fiscalConfig.map(config => {
          return new Promise((resolveConfig, rejectConfig) => {
            db.run(
              'INSERT INTO fiscal_config (config_name, config_value, description, is_encrypted) VALUES (?, ?, ?, ?)',
              [config.name, config.value, config.description, config.is_encrypted || 0],
              function (err) {
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
              { name: 'TVA Standard', percentage: 21, code: 'S' },
              { name: 'TVA Redus', percentage: 11, code: 'R' },
              { name: 'TVA Redus Special', percentage: 5, code: 'RS' },
              { name: 'Fără TVA', percentage: 0, code: 'N' }
            ];

            const insertVatPromises = vatRates.map(rate => {
              return new Promise((resolveVat, rejectVat) => {
                db.run(
                  'INSERT INTO vat_rates (rate_name, rate_percentage, rate_code) VALUES (?, ?, ?)',
                  [rate.name, rate.percentage, rate.code],
                  function (err) {
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
        `, [value, name], function (err) {
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
    ], function (err) {
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
    `, [status, anafResponse, documentId], function (err) {
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
    `, [documentId, transmissionType, requestXml, responseXml, statusCode, statusMessage], function (err) {
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
  const { encrypt } = require('./encryption');

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

    // ✅ ENCRYPTION: Encrypt PII (phone, email)
    const encryptedPhone = customerPhone ? encrypt(customerPhone) : null;
    const encryptedEmail = customerEmail ? encrypt(customerEmail) : null;

    db.run(`
      INSERT INTO customers (
        customer_name, customer_cui, customer_registration_number, customer_address,
        customer_city, customer_county, customer_postal_code, customer_phone,
        customer_email, customer_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customerName, customerCui, customerRegistrationNumber, customerAddress,
      customerCity, customerCounty, customerPostalCode, encryptedPhone,
      encryptedEmail, customerType
    ], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

async function getCustomers() {
  const db = await dbPromise;
  const { decrypt } = require('./encryption');

  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM customers WHERE is_active = 1 ORDER BY customer_name ASC', (err, rows) => {
      if (err) return reject(err);

      // ✅ ENCRYPTION: Decrypt PII (phone, email) pentru fiecare customer
      const decryptedRows = (rows || []).map(customer => {
        const decrypted = { ...customer };
        if (decrypted.customer_phone) {
          decrypted.customer_phone = decrypt(decrypted.customer_phone);
        }
        if (decrypted.customer_email) {
          decrypted.customer_email = decrypt(decrypted.customer_email);
        }
        return decrypted;
      });

      resolve(decryptedRows);
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
            `, [sessionId, itemId, physicalCount], function (err) {
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
                `, [sessionId, sessionType, startedBy, totalItems], function (err) {
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

  // 2. Aplică Logica Ambalajelor (05 Dec 2025 - extins pentru drive-thru)
  if (recipeItem.item_type && recipeItem.item_type.startsWith('packaging')) {
    // Toate comenzile takeaway, delivery și drive-thru folosesc packaging_delivery
    const needsDeliveryPackaging = orderType === 'delivery' || orderType === 'takeout' || orderType === 'drive_thru';
    const isRestaurant = orderType === 'dine_in';

    if ((recipeItem.item_type === 'packaging_delivery' && needsDeliveryPackaging) ||
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

// ✅ SĂPTĂMÂNA 2 - ZIUA 2: Funcție pentru scăderea stocului folosind sistemul AVERAGE
function decreaseStockAverage(db, ingredientId, quantityNeeded, orderId, locationId = null) {
  return new Promise((resolve, reject) => {
    console.log(`🟢🟢🟢 [AVERAGE] decreaseStockAverage started for ingredient ${ingredientId}, qty: ${quantityNeeded}, location: ${locationId || 'global'}`);

    // Average Cost: scade din toate loturile proporțional
    const query = locationId
      ? `SELECT id, remaining_quantity, unit_cost, batch_number
         FROM ingredient_batches
         WHERE ingredient_id = ? AND remaining_quantity > 0 AND location_id = ?
         ORDER BY id ASC`
      : `SELECT id, remaining_quantity, unit_cost, batch_number
         FROM ingredient_batches
         WHERE ingredient_id = ? AND remaining_quantity > 0
         ORDER BY id ASC`;

    const params = locationId ? [ingredientId, locationId] : [ingredientId];

    db.all(query, params, (err, batches) => {
      if (err) {
        console.error(`❌❌ Query error for batches (AVERAGE):`, err);
        return reject(err);
      }

      console.log(`🟢🟢🟢 [AVERAGE] Batches found for ingredient ${ingredientId}: ${batches ? batches.length : 0}`);

      if (!batches || batches.length === 0) {
        // Dacă nu avem loturi, folosim sistemul vechi
        console.log(`🟢🟢🟢 [AVERAGE] No batches, using legacy system for ingredient ${ingredientId}`);
        decreaseStockLegacy(db, ingredientId, quantityNeeded, orderId, locationId)
          .then(() => {
            console.log(`✅✅✅ [AVERAGE] Legacy decrease successful for ingredient ${ingredientId}`);
            resolve();
          })
          .catch((legacyErr) => {
            console.error(`❌❌ [AVERAGE] Legacy decrease failed for ingredient ${ingredientId}:`, legacyErr);
            reject(legacyErr);
          });
        return;
      }

      // Calculează total disponibil
      const totalAvailable = batches.reduce((sum, b) => sum + (b.remaining_quantity || 0), 0);

      if (totalAvailable < quantityNeeded) {
        console.warn(`⚠️ [AVERAGE] Stoc insuficient pentru ingredient ${ingredientId}: necesar ${quantityNeeded}, disponibil ${totalAvailable}`);
        // Folosim sistemul vechi pentru cantitatea rămasă
        decreaseStockLegacy(db, ingredientId, quantityNeeded, orderId, locationId)
          .then(() => resolve())
          .catch(reject);
        return;
      }

      let remainingToDecrease = quantityNeeded;
      let traceRecords = [];

      // Scădem proporțional din toate loturile
      for (let batch of batches) {
        if (remainingToDecrease <= 0) break;

        const proportion = batch.remaining_quantity / totalAvailable;
        const quantityFromBatch = Math.min(remainingToDecrease, quantityNeeded * proportion);
        const newRemaining = Math.max(0, batch.remaining_quantity - quantityFromBatch);

        // Actualizăm cantitatea rămasă în lot
        db.run(`
          UPDATE ingredient_batches 
          SET remaining_quantity = ?
          WHERE id = ?
        `, [newRemaining, batch.id], (updateErr) => {
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
            quantity_used: quantityFromBatch,
            method: 'AVERAGE'
          });
        }

        remainingToDecrease -= quantityFromBatch;
        console.log(`📦 [AVERAGE] Lot ${batch.batch_number}: scăzut ${quantityFromBatch.toFixed(4)} (rămas: ${newRemaining.toFixed(4)})`);
      }

      // Adăugăm înregistrările de trasabilitate
      if (traceRecords.length > 0) {
        addTraceRecords(db, traceRecords)
          .then(() => resolve())
          .catch(reject);
      } else {
        resolve();
      }
    });
  });
}

// ✅ SĂPTĂMÂNA 2 - ZIUA 1: Funcție pentru scăderea stocului folosind sistemul LIFO
function decreaseStockLIFO(db, ingredientId, quantityNeeded, orderId, locationId = null) {
  return new Promise((resolve, reject) => {
    console.log(`🟡🟡🟡 [LIFO] decreaseStockLIFO started for ingredient ${ingredientId}, qty: ${quantityNeeded}, location: ${locationId || 'global'}`);
    // Obținem loturile disponibile ordonate invers (LIFO - Last In First Out)
    const query = locationId
      ? `SELECT id, remaining_quantity, purchase_date, expiry_date, batch_number, location_id, unit_cost
         FROM ingredient_batches 
         WHERE ingredient_id = ? AND remaining_quantity > 0 AND location_id = ?
         ORDER BY purchase_date DESC, expiry_date DESC, id DESC`
      : `SELECT id, remaining_quantity, purchase_date, expiry_date, batch_number, location_id, unit_cost
         FROM ingredient_batches 
         WHERE ingredient_id = ? AND remaining_quantity > 0
         ORDER BY purchase_date DESC, expiry_date DESC, id DESC`;

    const params = locationId ? [ingredientId, locationId] : [ingredientId];

    db.all(query, params, (err, batches) => {
      if (err) {
        console.error(`❌❌ Query error for batches (LIFO):`, err);
        return reject(err);
      }

      console.log(`🟡🟡🟡 [LIFO] Batches found for ingredient ${ingredientId}: ${batches ? batches.length : 0}`);

      if (!batches || batches.length === 0) {
        // Dacă nu avem loturi, folosim sistemul vechi
        console.log(`🟡🟡🟡 [LIFO] No batches, using legacy system for ingredient ${ingredientId}`);
        decreaseStockLegacy(db, ingredientId, quantityNeeded, orderId, locationId)
          .then(() => {
            console.log(`✅✅✅ [LIFO] Legacy decrease successful for ingredient ${ingredientId}`);
            resolve();
          })
          .catch((legacyErr) => {
            console.error(`❌❌ [LIFO] Legacy decrease failed for ingredient ${ingredientId}:`, legacyErr);
            reject(legacyErr);
          });
        return;
      }

      let remainingToDecrease = quantityNeeded;
      let traceRecords = [];

      // Scădem din loturi în ordinea LIFO (ultimul intrat, primul ieșit)
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
            quantity_used: quantityFromBatch,
            method: 'LIFO'
          });
        }

        remainingToDecrease -= quantityFromBatch;
        console.log(`📦 [LIFO] Lot ${batch.batch_number}: scăzut ${quantityFromBatch} (rămas: ${batch.remaining_quantity - quantityFromBatch})`);
      }

      if (remainingToDecrease > 0) {
        console.warn(`⚠️ [LIFO] Stoc insuficient în loturi pentru ingredient ${ingredientId}, folosind sistemul vechi pentru ${remainingToDecrease}`);
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

    db.run(query, params, function (updateErr) {
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
        unit_cost,
        origin_country,
        temperature_at_receipt,
        vet_document,
        supplier_id,
        document_path
      } = batchData;

      db.run(`
        INSERT INTO ingredient_batches (
          ingredient_id, batch_number, barcode, quantity, remaining_quantity,
          purchase_date, expiry_date, supplier, invoice_number, unit_cost,
          origin_country, temperature_at_receipt, vet_document, supplier_id, document_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ingredientId, batch_number, barcode, quantity, quantity,
        purchase_date, expiry_date, supplier, invoice_number, unit_cost,
        origin_country || null,
        typeof temperature_at_receipt === 'number' ? temperature_at_receipt : null,
        vet_document || null,
        supplier_id || null,
        document_path || null
      ], function (err) {
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

function getIngredientTraceability(ingredientId) {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          oit.order_id,
          oit.batch_id,
          oit.quantity_used,
          oit.created_at,
          o.timestamp AS order_timestamp,
          o.status AS order_status,
          o.is_paid,
          ib.batch_number,
          ib.purchase_date,
          ib.expiry_date,
          ib.supplier
        FROM order_ingredient_trace oit
        JOIN orders o ON o.id = oit.order_id
        JOIN ingredient_batches ib ON ib.id = oit.batch_id
        WHERE oit.ingredient_id = ?
        ORDER BY o.timestamp DESC, oit.created_at DESC
      `, [ingredientId], (err, rows) => {
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
    `, [itemType, itemId, itemName, quantity, unit, reason, orderId, notes, recordedBy], function (err) {
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
    `, [itemType, itemId, itemName, expectedQuantity, actualQuantity, difference, unit, inventorySessionId, notes, recordedBy], function (err) {
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

// ==================== FUNCȚII NOI: CATEGORII & FURNIZORI INGREDIENTE ====================

async function getIngredientCategories(options = {}) {
  const { includeSynonyms = true, hierarchical = false, activeOnly = false } = options;
  const db = await dbPromise;

  const categories = await new Promise((resolve, reject) => {
    db.all(
      `
        SELECT id, name_ro, name_en, parent_id, legal_code, sort_order, created_at, updated_at
        FROM ingredient_categories
        ${activeOnly ? 'WHERE sort_order >= 0' : ''}
        ORDER BY COALESCE(sort_order, 0), name_ro COLLATE NOCASE
      `,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });

  let synonyms = [];
  if (includeSynonyms && categories.length) {
    const placeholders = categories.map(() => '?').join(',');
    synonyms = await new Promise((resolve, reject) => {
      db.all(
        `
          SELECT id, category_id, synonym, locale
          FROM ingredient_category_synonyms
          WHERE category_id IN (${placeholders})
        `,
        categories.map((cat) => cat.id),
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  const enriched = categories.map((category) => ({
    ...category,
    synonyms: includeSynonyms
      ? synonyms.filter((syn) => syn.category_id === category.id)
      : []
  }));

  if (!hierarchical) {
    return enriched;
  }

  const map = new Map();
  enriched.forEach((category) => {
    map.set(category.id, { ...category, children: [] });
  });

  const tree = [];
  map.forEach((category) => {
    if (category.parent_id && map.has(category.parent_id)) {
      map.get(category.parent_id).children.push(category);
    } else {
      tree.push(category);
    }
  });

  return tree;
}

async function createIngredientCategory(categoryData) {
  const db = await dbPromise;
  const {
    name_ro,
    name_en = null,
    parent_id = null,
    legal_code = null,
    sort_order = null,
    synonyms = []
  } = categoryData;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `
          INSERT INTO ingredient_categories (name_ro, name_en, parent_id, legal_code, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `,
        [name_ro, name_en, parent_id, legal_code, sort_order],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          const categoryId = this.lastID;

          if (synonyms && synonyms.length > 0) {
            const stmt = db.prepare(
              `
                INSERT INTO ingredient_category_synonyms (category_id, synonym, locale)
                VALUES (?, ?, ?)
              `
            );

            synonyms.forEach((synonymEntry) => {
              if (!synonymEntry) return;
              const value =
                typeof synonymEntry === 'string' ? synonymEntry : synonymEntry.value;
              const locale =
                typeof synonymEntry === 'object' && synonymEntry.locale
                  ? synonymEntry.locale
                  : 'ro';
              if (value) {
                stmt.run([categoryId, value.trim(), locale]);
              }
            });

            stmt.finalize((finalizeErr) => {
              if (finalizeErr) {
                reject(finalizeErr);
                return;
              }
              resolve({ id: categoryId });
            });
          } else {
            resolve({ id: categoryId });
          }
        }
      );
    });
  });
}

async function updateIngredientCategory(categoryId, categoryData) {
  const db = await dbPromise;
  const {
    name_ro,
    name_en,
    parent_id,
    legal_code,
    sort_order,
    synonyms
  } = categoryData;

  await new Promise((resolve, reject) => {
    db.run(
      `
        UPDATE ingredient_categories
        SET name_ro = COALESCE(?, name_ro),
            name_en = COALESCE(?, name_en),
            parent_id = ?,
            legal_code = ?,
            sort_order = ?
        WHERE id = ?
      `,
      [name_ro, name_en, parent_id || null, legal_code || null, sort_order || null, categoryId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  if (Array.isArray(synonyms)) {
    await new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM ingredient_category_synonyms WHERE category_id = ?`,
        [categoryId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    if (synonyms.length > 0) {
      const stmt = db.prepare(
        `
          INSERT INTO ingredient_category_synonyms (category_id, synonym, locale)
          VALUES (?, ?, ?)
        `
      );

      synonyms.forEach((synonymEntry) => {
        if (!synonymEntry) return;
        const value =
          typeof synonymEntry === 'string' ? synonymEntry : synonymEntry.value;
        const locale =
          typeof synonymEntry === 'object' && synonymEntry.locale
            ? synonymEntry.locale
            : 'ro';
        if (value) {
          stmt.run([categoryId, value.trim(), locale]);
        }
      });

      await new Promise((resolve, reject) => {
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  return { id: categoryId };
}

async function deleteIngredientCategory(categoryId) {
  const db = await dbPromise;

  const ingredientCount = await new Promise((resolve, reject) => {
    db.get(
      `
        SELECT COUNT(*) as cnt
        FROM ingredients
        WHERE category_id = ? OR subcategory_id = ?
      `,
      [categoryId, categoryId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.cnt : 0);
      }
    );
  });

  if (ingredientCount > 0) {
    const error = new Error(
      'Categoria nu poate fi ștearsă deoarece are ingrediente asociate'
    );
    error.code = 'CATEGORY_IN_USE';
    error.count = ingredientCount;
    throw error;
  }

  await new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM ingredient_category_synonyms WHERE category_id = ?`,
      [categoryId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  await new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM ingredient_categories WHERE id = ?`,
      [categoryId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  return true;
}

async function getSuppliers(options = {}) {
  const { activeOnly = false } = options;
  const db = await dbPromise;

  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT
          id,
          company_name AS name,
          cui,
          reg_com,
          contact_person_name AS contact_person,
          phone,
          email,
          address_street,
          address_number,
          address_city,
          address_county,
          address_postal_code,
          address_country,
          categories,
          payment_terms,
          notes,
          is_active,
          is_preferred,
          created_at,
          updated_at
        FROM suppliers
        ${activeOnly ? 'WHERE is_active = 1' : ''}
        ORDER BY company_name COLLATE NOCASE
      `,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows?.map(row => ({
          ...row,
          name: row.name ?? '',
          categories: (() => {
            try {
              return row.categories ? JSON.parse(row.categories) : [];
            } catch {
              return [];
            }
          })(),
        })) || []);
      }
    );
  });
}

async function createSupplier(supplierData) {
  const db = await dbPromise;
  const {
    company_name,
    name,
    cui = null,
    reg_com = null,
    contact_person = null,
    phone = null,
    email = null,
    categories = [],
    payment_terms = 30,
    notes = null,
    is_active = 1,
    is_preferred = 0,
  } = supplierData;

  const resolvedName = company_name || name;
  if (!resolvedName) {
    throw new Error('company_name este obligatoriu');
  }

  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO suppliers (
          company_name,
          cui,
          reg_com,
          contact_person_name,
          phone,
          email,
          categories,
          payment_terms,
          notes,
          is_active,
          is_preferred
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        resolvedName,
        cui,
        reg_com,
        contact_person,
        phone,
        email,
        JSON.stringify(categories || []),
        payment_terms ?? 30,
        notes,
        is_active ? 1 : 0,
        is_preferred ? 1 : 0,
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

async function updateSupplier(supplierId, supplierData) {
  const db = await dbPromise;
  const allowedFields = {
    company_name: 'company_name',
    name: 'company_name',
    cui: 'cui',
    reg_com: 'reg_com',
    contact_person_name: 'contact_person_name',
    phone: 'phone',
    email: 'email',
    categories: 'categories',
    payment_terms: 'payment_terms',
    notes: 'notes',
    is_active: 'is_active',
    is_preferred: 'is_preferred',
  };

  const updates = [];
  const params = [];

  Object.entries(allowedFields).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(supplierData, key)) {
      let value = supplierData[key];
      if (column === 'company_name' && !value) {
        return;
      }
      if (column === 'categories') {
        value = JSON.stringify(value || []);
      }
      if (column === 'is_active' || column === 'is_preferred') {
        value = value ? 1 : 0;
      }
      updates.push(`${column} = ?`);
      params.push(value);
    }
  });

  if (!updates.length) {
    return { id: supplierId };
  }

  params.push(supplierId);

  return new Promise((resolve, reject) => {
    db.run(
      `
        UPDATE suppliers
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      params,
      (err) => {
        if (err) reject(err);
        else resolve({ id: supplierId });
      }
    );
  });
}

async function deleteSupplier(supplierId) {
  const db = await dbPromise;

  const linkCount = await new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as cnt FROM ingredient_suppliers WHERE supplier_id = ?`,
      [supplierId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.cnt : 0);
      }
    );
  });

  if (linkCount > 0) {
    const error = new Error('Există ingrediente asociate acestui furnizor');
    error.code = 'SUPPLIER_IN_USE';
    error.count = linkCount;
    throw error;
  }

  await new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM supplier_documents WHERE supplier_id = ?`,
      [supplierId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  await new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM suppliers WHERE id = ?`,
      [supplierId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  return true;
}

async function addSupplierDocument(supplierId, documentData) {
  const db = await dbPromise;
  const { document_type, file_path, issue_date, expiry_date, notes } = documentData;

  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO supplier_documents (supplier_id, document_type, file_path, issue_date, expiry_date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [supplierId, document_type, file_path, issue_date, expiry_date, notes],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

async function getSupplierDocuments(supplierId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT id, supplier_id, document_type, file_path, issue_date, expiry_date, notes, created_at
        FROM supplier_documents
        WHERE supplier_id = ?
        ORDER BY issue_date DESC, created_at DESC
      `,
      [supplierId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

async function deleteSupplierDocument(documentId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM supplier_documents WHERE id = ?`,
      [documentId],
      (err) => {
        if (err) reject(err);
        else resolve(true);
      }
    );
  });
}

async function linkIngredientSupplier(ingredientId, supplierId, data = {}) {
  const db = await dbPromise;
  const {
    is_primary = 0,
    supplier_code = null,
    delivery_terms = null,
    lead_time_days = null,
    notes = null
  } = data;

  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO ingredient_suppliers (
          ingredient_id, supplier_id, is_primary, supplier_code, delivery_terms, lead_time_days, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ingredientId,
        supplierId,
        is_primary ? 1 : 0,
        supplier_code,
        delivery_terms,
        lead_time_days,
        notes
      ],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

async function unlinkIngredientSupplier(linkId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM ingredient_suppliers WHERE id = ?`,
      [linkId],
      (err) => {
        if (err) reject(err);
        else resolve(true);
      }
    );
  });
}

async function getIngredientSuppliers(ingredientId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT
          isup.id,
          isup.is_primary,
          isup.supplier_code,
          isup.delivery_terms,
          isup.lead_time_days,
          isup.notes,
          sup.id as supplier_id,
          sup.company_name AS name,
          sup.cui,
          sup.reg_com,
          sup.phone,
          sup.email,
          sup.is_active
        FROM ingredient_suppliers isup
        JOIN suppliers sup ON sup.id = isup.supplier_id
        WHERE isup.ingredient_id = ?
        ORDER BY isup.is_primary DESC, sup.company_name COLLATE NOCASE
      `,
      [ingredientId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

async function addIngredientDocumentRecord(ingredientId, documentData) {
  const db = await dbPromise;
  const { document_type, file_path, issue_date, expiry_date, notes } = documentData;

  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO ingredient_documents (ingredient_id, document_type, file_path, issue_date, expiry_date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [ingredientId, document_type, file_path, issue_date, expiry_date, notes],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

async function getIngredientDocumentsRecords(ingredientId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT id, ingredient_id, document_type, file_path, issue_date, expiry_date, notes, created_at
        FROM ingredient_documents
        WHERE ingredient_id = ?
        ORDER BY issue_date DESC, created_at DESC
      `,
      [ingredientId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

async function deleteIngredientDocumentRecord(documentId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM ingredient_documents WHERE id = ?`,
      [documentId],
      (err) => {
        if (err) reject(err);
        else resolve(true);
      }
    );
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

// Export database protection functions (optional - may not exist in all environments)
let protectedWrite, checkDatabaseIntegrity, createAutoBackup;
try {
  const dbProtection = require('./database-protection.js');
  protectedWrite = dbProtection.protectedWrite;
  checkDatabaseIntegrity = dbProtection.checkDatabaseIntegrity;
  createAutoBackup = dbProtection.createAutoBackup;
  console.log('✅ database-protection.js functions loaded');
} catch (error) {
  console.warn('⚠️ database-protection.js not found for exports, using fallbacks:', error.message);
  protectedWrite = (db, query, params, callback) => {
    // Fallback: direct query execution
    if (callback) {
      db.run(query, params, callback);
    } else {
      return db.run(query, params);
    }
  };
  checkDatabaseIntegrity = async () => ({ valid: true, message: 'Protection not available' });
  createAutoBackup = async () => ({ success: true, message: 'Protection not available' });
}

// ========================================
// 📦 FUNCȚIE: Calculare ambalaje necesare pentru comenzi (05 Dec 2025)
// ========================================
/**
 * Calculează ambalajele necesare pentru o comandă (takeaway, delivery, drive-thru)
 * Include: ambalaje per produs (din fișele tehnice) + punga (mică/mare)
 * NOTĂ: Ambalajele per produs (din recipes cu item_type='packaging_delivery') 
 *       sunt deja gestionate prin logica de scădere a stocurilor.
 *       Această funcție calculează doar punga (mică/mare) în funcție de cantitatea totală.
 * @param {Array} items - Array de items din comandă
 * @param {String} orderType - Tipul comenzii: 'takeaway', 'delivery', 'drive_thru', etc.
 * @returns {Object} - Object cu numele ambalajului ca key și cantitatea ca value
 */
async function getRequiredPackagingForOrder(items, orderType) {
  const packaging = {};
  const db = await dbPromise;

  // Normalizează tipul comenzii
  const normalizedType = (orderType || '').toString().toLowerCase();
  const isTakeaway = ['takeout', 'pick-up', 'pickup', 'takeaway', 'delivery', 'drive_thru', 'drive-thru', 'drivethru'].includes(normalizedType);

  // Dacă nu e takeaway/delivery/drive-thru, nu adăugăm ambalaje
  if (!isTakeaway) {
    return packaging;
  }

  // Calculează totalul de produse (exclude ambalajele existente)
  let totalItems = 0;

  items.forEach(item => {
    // Skip dacă e deja un ambalaj
    if (item.isPackaging) {
      return;
    }

    totalItems += item.quantity || 0;

    // NOTĂ: Ambalajele per produs (din fișele tehnice cu item_type='packaging_delivery')
    //       sunt deja gestionate prin logica de scădere a stocurilor în calculateGrossQuantity()
    //       și nu trebuie adăugate manual aici, deoarece sunt deja în recipes.
  });

  // Adaugă punga (mică sau mare) în funcție de cantitatea totală
  // Punga mică: până la 3 produse
  // Punga mare: peste 3 produse
  if (totalItems > 0) {
    if (totalItems <= 3) {
      packaging['Punga Mică'] = 1;
    } else {
      // Pentru peste 3 produse, calculăm câte pungi mari sunt necesare
      // O pungă mare poate ține ~5-6 produse (ajustabil)
      const itemsPerLargeBag = 5;
      const largeBagsNeeded = Math.ceil(totalItems / itemsPerLargeBag);
      packaging['Punga Mare'] = largeBagsNeeded;
    }
  }

  return packaging;
}

/**
 * FAZA MT.2 - Query Isolation Layer
 * 
 * Universal wrappers for tenant and location filtering.
 * All services should use these wrappers instead of direct db.all/db.get.
 */

/**
 * Execute query with automatic tenant_id filtering
 * 
 * @param {Object} req - Express request object (must have req.tenantId)
 * @param {string} sql - SQL query (should not include WHERE tenant_id)
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function tenantQuery(req, sql, params = []) {
  const db = await dbPromise;

  // Fallback: if no tenantId, execute query without filtering (with warning)
  if (!req || !req.tenantId) {
    console.warn('⚠️ [tenantQuery] No tenantId found in request. Query executed without tenant filtering.');
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Check if SQL already has WHERE clause
  const hasWhere = /WHERE/i.test(sql);
  const separator = hasWhere ? ' AND' : ' WHERE';

  // Inject tenant_id filter
  const filteredSql = `${sql}${separator} tenant_id = ?`;
  const filteredParams = [...params, req.tenantId];

  return new Promise((resolve, reject) => {
    db.all(filteredSql, filteredParams, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Execute query with automatic location_id filtering
 * 
 * @param {Object} req - Express request object (must have req.locationId)
 * @param {string} sql - SQL query (should not include WHERE location_id)
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function locationQuery(req, sql, params = []) {
  const db = await dbPromise;

  // Fallback: if no locationId, execute query without filtering (with warning)
  if (!req || !req.locationId) {
    console.warn('⚠️ [locationQuery] No locationId found in request. Query executed without location filtering.');
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Check if SQL already has WHERE clause
  const hasWhere = /WHERE/i.test(sql);
  const separator = hasWhere ? ' AND' : ' WHERE';

  // Inject location_id filter
  const filteredSql = `${sql}${separator} location_id = ?`;
  const filteredParams = [...params, req.locationId];

  return new Promise((resolve, reject) => {
    db.all(filteredSql, filteredParams, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Execute query with both tenant_id and location_id filtering
 * 
 * @param {Object} req - Express request object (must have req.tenantId and req.locationId)
 * @param {string} sql - SQL query (should not include WHERE clauses)
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function tenantLocationQuery(req, sql, params = []) {
  const db = await dbPromise;

  // Fallback: if missing tenantId or locationId, execute query without filtering (with warning)
  if (!req || !req.tenantId || !req.locationId) {
    console.warn('⚠️ [tenantLocationQuery] Missing tenantId or locationId. Query executed without filtering.');
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Check if SQL already has WHERE clause
  const hasWhere = /WHERE/i.test(sql);
  const separator = hasWhere ? ' AND' : ' WHERE';

  // Inject both filters
  const filteredSql = `${sql}${separator} tenant_id = ? AND location_id = ?`;
  const filteredParams = [...params, req.tenantId, req.locationId];

  return new Promise((resolve, reject) => {
    db.all(filteredSql, filteredParams, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Get single row with tenant_id filtering
 */
async function tenantQueryOne(req, sql, params = []) {
  const rows = await tenantQuery(req, sql, params);
  return rows[0] || null;
}

/**
 * Get single row with location_id filtering
 */
async function locationQueryOne(req, sql, params = []) {
  const rows = await locationQuery(req, sql, params);
  return rows[0] || null;
}

/**
 * Get single row with both tenant_id and location_id filtering
 */
async function tenantLocationQueryOne(req, sql, params = []) {
  const rows = await tenantLocationQuery(req, sql, params);
  return rows[0] || null;
}

/**
 * Create performance indexes for frequently queried columns
 * These indexes improve query performance for reports, analytics, and dashboard
 */
function createPerformanceIndexes(db) {
  return new Promise((resolve) => {
    console.log('\n🚀 Creating performance indexes...');

    const indexes = [
      // Orders indexes
      { name: 'idx_orders_timestamp', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp)' },
      { name: 'idx_orders_status', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)' },
      { name: 'idx_orders_status_timestamp', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_status_timestamp ON orders(status, timestamp)' },
      { name: 'idx_orders_order_source', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_order_source ON orders(order_source)' },
      { name: 'idx_orders_table_number', sql: 'CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number)' },

      // Order items indexes
      { name: 'idx_order_items_order_id', sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)' },
      { name: 'idx_order_items_product_id', sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)' },

      // Stock movements indexes
      { name: 'idx_stock_movements_ingredient_id', sql: 'CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient_id ON stock_movements(ingredient_id)' },
      { name: 'idx_stock_movements_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at)' },
      { name: 'idx_stock_movements_type', sql: 'CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type)' },

      // Ingredients indexes
      { name: 'idx_ingredients_category', sql: 'CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category)' },
      { name: 'idx_ingredients_stock_level', sql: 'CREATE INDEX IF NOT EXISTS idx_ingredients_stock_level ON ingredients(current_stock, min_stock)' },

      // Menu indexes
      { name: 'idx_menu_category', sql: 'CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category)' },
      { name: 'idx_menu_is_active', sql: 'CREATE INDEX IF NOT EXISTS idx_menu_is_active ON menu(is_active)' },

      // Recipes indexes
      { name: 'idx_recipes_product_id_perf', sql: 'CREATE INDEX IF NOT EXISTS idx_recipes_product_id_perf ON recipes(product_id)' },
      { name: 'idx_recipes_ingredient_id', sql: 'CREATE INDEX IF NOT EXISTS idx_recipes_ingredient_id ON recipes(ingredient_id)' },

      // Compliance indexes
      { name: 'idx_temp_log_equipment', sql: 'CREATE INDEX IF NOT EXISTS idx_temp_log_equipment ON compliance_temperature_log(equipment_id)' },
      { name: 'idx_cleaning_status', sql: 'CREATE INDEX IF NOT EXISTS idx_cleaning_status ON compliance_cleaning_schedule(status)' },

      // Gift cards indexes
      { name: 'idx_gift_cards_code', sql: 'CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code)' },
    ];

    let completed = 0;
    let errors = 0;

    indexes.forEach(({ name, sql }) => {
      db.run(sql, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error(`⚠️ Index ${name} error:`, err.message);
          errors++;
        }
        completed++;

        if (completed === indexes.length) {
          console.log(`✅ Performance indexes created: ${indexes.length - errors}/${indexes.length}`);
          resolve();
        }
      });
    });
  });
}

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
  setMfaSecret,
  enableMfa,
  disableMfa,
  getUserMfaSecret,
  updateSessionActivity,
  initializeReservationSystem,
  createReservation,
  getAvailableTables,
  updateTableAvailability,
  getReservationsByDate,
  updateReservationStatus,
  calculateRequiredTables,
  findNearbyAvailableTables,
  autoAllocateTablesForReservation,
  getReservationSettings,
  updateReservationSettings,
  getReservationStats,
  addReservationEvent,
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
  getIngredientTraceability,
  addToWaste,
  getIngredientCategories,
  createIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addSupplierDocument,
  getSupplierDocuments,
  deleteSupplierDocument,
  linkIngredientSupplier,
  unlinkIngredientSupplier,
  getIngredientSuppliers,
  addIngredientDocumentRecord,
  getIngredientDocumentsRecords,
  deleteIngredientDocumentRecord,

  // FUNCȚII NOI PENTRU RAPOARTE FISCALE:
  getLastZReportNumber,
  saveZReport,
  addToLosses,
  getWasteRecords,
  getLossesRecords,

  // PIN helpers
  createPinHash,
  verifyPinHash,
  PIN_PATTERN,
  PIN_ROTATION_POLICY_VERSION,
  logWaiterPinAudit,
  getWaiterPinAudit,

  // ✅ SĂPTĂMÂNA 2 - ZIUA 1 & 2: Stock valuation functions
  decreaseStockFIFO,
  decreaseStockLIFO,
  decreaseStockAverage,

  // 📦 Packaging functions (05 Dec 2025)
  getRequiredPackagingForOrder,

  // FAZA MT.2 - Query Isolation Layer
  tenantQuery,
  locationQuery,
  tenantLocationQuery,
  tenantQueryOne,
  locationQueryOne,
  tenantLocationQueryOne,
};