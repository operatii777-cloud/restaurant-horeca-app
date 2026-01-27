/**
 * Restaurant Controller
 * Handles restaurant settings and configuration
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/restaurant/config
 * Get restaurant settings
 */
async function getRestaurantSettings(req, res, next) {
  try {
    const db = await dbPromise;
    const tenantId = req.tenantId || 1;
    
    // Verifică dacă tabela restaurant_settings există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurant_settings'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    if (!tableExists) {
      // Returnează date default dacă tabela nu există
      return res.json({
        success: true,
        restaurant: {
          restaurant_name: 'Restaurant App',
          restaurant_address: '',
          restaurant_phone: '',
          restaurant_email: '',
          restaurant_cui: '',
          restaurant_reg_com: '',
          restaurant_bank: '',
          restaurant_iban: '',
          fiscal_series: 'RC',
          invoice_series: 'INV',
          vat_food: '11',
          vat_drinks: '21'
        }
      });
    }
    
    // Verifică dacă coloana tenant_id există
    const hasTenantId = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM pragma_table_info('restaurant_settings') WHERE name='tenant_id'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    // Verifică dacă are structura key-value sau structura simplă
    const hasSettingKey = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM pragma_table_info('restaurant_settings') WHERE name='setting_key'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    let settings = [];
    
    if (hasSettingKey) {
      // Structura key-value (noua structură)
      const query = hasTenantId 
        ? 'SELECT setting_key, setting_value FROM restaurant_settings WHERE tenant_id = ? OR tenant_id IS NULL'
        : 'SELECT setting_key, setting_value FROM restaurant_settings';
      
      settings = await new Promise((resolve, reject) => {
        db.all(query, hasTenantId ? [tenantId] : [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } else {
      // Structura simplă (veche, de la weather-forecast.js)
      // Încercăm să citim toate coloanele existente
      const singleRow = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM restaurant_settings LIMIT 1', [], (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
      
      if (singleRow) {
        // Convertește structura simplă în key-value
        for (const [key, value] of Object.entries(singleRow)) {
          if (key !== 'id') {
            settings.push({ setting_key: key, setting_value: value });
          }
        }
      }
    }
    
    // Transformă array-ul de setări într-un obiect
    const restaurantData = {};
    settings.forEach(setting => {
      restaurantData[setting.setting_key] = setting.setting_value;
    });
    
    // Returnează date default dacă nu există setări
    if (Object.keys(restaurantData).length === 0) {
      restaurantData.restaurant_name = 'Restaurant App';
      restaurantData.restaurant_address = '';
      restaurantData.restaurant_phone = '';
      restaurantData.restaurant_email = '';
      restaurantData.restaurant_cui = '';
      restaurantData.restaurant_reg_com = '';
      restaurantData.restaurant_bank = '';
      restaurantData.restaurant_iban = '';
      restaurantData.fiscal_series = 'RC';
      restaurantData.invoice_series = 'INV';
      restaurantData.vat_food = '11';
      restaurantData.vat_drinks = '21';
    }
    
    res.json({
      success: true,
      restaurant: restaurantData
    });
  } catch (error) {
    console.error('❌ Error in getRestaurantSettings:', error);
    // Returnează date default în caz de eroare
    res.json({
      success: true,
      restaurant: {
        restaurant_name: 'Restaurant App',
        restaurant_address: '',
        restaurant_phone: '',
        restaurant_email: '',
        restaurant_cui: '',
        restaurant_reg_com: '',
        restaurant_bank: '',
        restaurant_iban: '',
        fiscal_series: 'RC',
        invoice_series: 'INV',
        vat_food: '11',
        vat_drinks: '21'
      }
    });
  }
}

/**
 * POST /api/restaurant/config
 * Save restaurant settings
 */
async function saveRestaurantSettings(req, res, next) {
  try {
    const db = await dbPromise;
    const tenantId = req.tenantId || 1;
    const settings = req.body;
    
    // Verifică dacă tabela restaurant_settings există
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurant_settings'",
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
    
    if (!tableExists) {
      // Creează tabela dacă nu există
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS restaurant_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id INTEGER DEFAULT 1,
            setting_key TEXT NOT NULL,
            setting_value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, setting_key)
          )
        `, [], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Verifică dacă coloana tenant_id există, dacă nu, o adaugă
      const hasTenantId = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM pragma_table_info('restaurant_settings') WHERE name='tenant_id'",
          (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          }
        );
      });
      
      if (!hasTenantId) {
        // Adaugă coloana tenant_id
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE restaurant_settings ADD COLUMN tenant_id INTEGER DEFAULT 1`, [], (err) => {
            // Ignoră eroarea dacă coloana există deja
            resolve();
          });
        });
        
        // Adaugă coloana setting_key dacă nu există
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE restaurant_settings ADD COLUMN setting_key TEXT`, [], (err) => {
            resolve();
          });
        });
        
        // Adaugă coloana setting_value dacă nu există
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE restaurant_settings ADD COLUMN setting_value TEXT`, [], (err) => {
            resolve();
          });
        });
        
        // Adaugă coloana created_at dacă nu există
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE restaurant_settings ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, [], (err) => {
            resolve();
          });
        });
        
        // Adaugă coloana updated_at dacă nu există
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE restaurant_settings ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, [], (err) => {
            resolve();
          });
        });
        
        console.log('✅ [restaurant.controller] Coloane adăugate la restaurant_settings');
      }
    }
    
    // Salvează fiecare setare
    for (const [key, value] of Object.entries(settings)) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR REPLACE INTO restaurant_settings (tenant_id, setting_key, setting_value, updated_at)
          VALUES (?, ?, ?, datetime('now'))
        `, [tenantId, key, value || ''], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({
      success: true,
      message: 'Restaurant settings saved successfully'
    });
  } catch (error) {
    console.error('❌ Error in saveRestaurantSettings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error saving restaurant settings'
    });
  }
}

module.exports = {
  getRestaurantSettings,
  saveRestaurantSettings
};

