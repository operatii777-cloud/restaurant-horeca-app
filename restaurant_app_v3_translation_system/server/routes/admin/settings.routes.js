const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../database');

// Helper pentru a rula query-uri
async function runExec(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function runGet(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row ?? null);
    });
  });
}

async function runAll(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// ========================================
// LOCALIZATION SETTINGS
// ========================================

// Middleware pentru a asigura că tabela localization_settings există
router.use('/localization', async (req, res, next) => {
  try {
    const db = await dbPromise;
    await runExec(`
      CREATE TABLE IF NOT EXISTS localization_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    next();
  } catch (err) {
    console.error('❌ Eroare la verificarea/crearea tabelei localization_settings:', err.message);
    next(err);
  }
});

// GET /api/settings/localization - Obține setările de localizare
router.get('/localization', async (req, res, next) => {
  try {
    let settings = await runGet('SELECT * FROM localization_settings ORDER BY id DESC LIMIT 1');
    
    // Dacă nu există setări, returnează default-uri
    if (!settings) {
      settings = {
        language: 'ro',
        timezone: 'Europe/Bucharest',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        currency: 'RON',
        currency_symbol: 'RON',
        currency_position: 'after',
        decimal_separator: ',',
        thousand_separator: '.',
        first_day_of_week: 1,
      };
    }
    
    res.json(settings);
  } catch (error) {
    console.error('❌ Error in GET /api/settings/localization:', error);
    next(error);
  }
});

// PUT /api/settings/localization - Actualizează setările de localizare
router.put('/localization', async (req, res, next) => {
  try {
    const {
      language,
      timezone,
      date_format,
      time_format,
      currency,
      currency_symbol,
      currency_position,
      decimal_separator,
      thousand_separator,
      first_day_of_week,
    } = req.body;

    // Verifică dacă există deja setări
    const existing = await runGet('SELECT id FROM localization_settings ORDER BY id DESC LIMIT 1');

    if (existing) {
      // Actualizează setările existente
      await runExec(
        `UPDATE localization_settings SET
          language = ?,
          timezone = ?,
          date_format = ?,
          time_format = ?,
          currency = ?,
          currency_symbol = ?,
          currency_position = ?,
          decimal_separator = ?,
          thousand_separator = ?,
          first_day_of_week = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          language,
          timezone,
          date_format,
          time_format,
          currency,
          currency_symbol,
          currency_position,
          decimal_separator,
          thousand_separator,
          first_day_of_week,
          existing.id,
        ]
      );
    } else {
      // Creează setări noi
      await runExec(
        `INSERT INTO localization_settings (
          language, timezone, date_format, time_format,
          currency, currency_symbol, currency_position,
          decimal_separator, thousand_separator, first_day_of_week
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          language,
          timezone,
          date_format,
          time_format,
          currency,
          currency_symbol,
          currency_position,
          decimal_separator,
          thousand_separator,
          first_day_of_week,
        ]
      );
    }

    const updated = await runGet('SELECT * FROM localization_settings ORDER BY id DESC LIMIT 1');
    res.json(updated);
  } catch (error) {
    console.error('❌ Error in PUT /api/settings/localization:', error);
    next(error);
  }
});

// ========================================
// UI THEMES (trebuie să fie ÎNAINTE de /ui pentru a evita conflicte)
// ========================================

// Middleware pentru a asigura că tabela ui_themes există
router.use('/ui/themes', async (req, res, next) => {
  try {
    const db = await dbPromise;
    await runExec(`
      CREATE TABLE IF NOT EXISTS ui_themes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          primary_color TEXT DEFAULT '#007bff',
          secondary_color TEXT DEFAULT '#6c757d',
          background_color TEXT DEFAULT '#ffffff',
          text_color TEXT DEFAULT '#212529',
          accent_color TEXT DEFAULT '#28a745',
          is_active BOOLEAN DEFAULT 1,
          is_default BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    next();
  } catch (err) {
    console.error('❌ Eroare la verificarea/crearea tabelei ui_themes:', err.message);
    next(err);
  }
});

// GET /api/settings/ui/themes - Obține toate temele
router.get('/ui/themes', async (req, res, next) => {
  try {
    let themes = await runAll('SELECT * FROM ui_themes ORDER BY is_default DESC, name ASC');
    
    // Dacă nu există teme, returnează o temă default
    if (themes.length === 0) {
      themes = [
        {
          id: 1,
          name: 'Default',
          primary_color: '#007bff',
          secondary_color: '#6c757d',
          background_color: '#ffffff',
          text_color: '#212529',
          accent_color: '#28a745',
          is_active: true,
          is_default: true,
        },
      ];
    } else {
      // Convertește boolean-urile
      themes = themes.map((t) => ({
        ...t,
        is_active: Boolean(t.is_active),
        is_default: Boolean(t.is_default),
      }));
    }
    
    res.json(themes);
  } catch (error) {
    console.error('❌ Error in GET /api/settings/ui/themes:', error);
    next(error);
  }
});

// POST /api/settings/ui/themes - Creează o temă nouă
router.post('/ui/themes', async (req, res, next) => {
  try {
    const {
      name,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color,
      is_active,
      is_default,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Numele temei este obligatoriu' });
    }

    // Dacă este setată ca default, dezactivează celelalte default-uri
    if (is_default) {
      await runExec('UPDATE ui_themes SET is_default = 0 WHERE is_default = 1');
    }

    const result = await runExec(
      `INSERT INTO ui_themes (
        name, primary_color, secondary_color, background_color,
        text_color, accent_color, is_active, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        primary_color || '#007bff',
        secondary_color || '#6c757d',
        background_color || '#ffffff',
        text_color || '#212529',
        accent_color || '#28a745',
        is_active !== false ? 1 : 0,
        is_default ? 1 : 0,
      ]
    );

    const newTheme = await runGet('SELECT * FROM ui_themes WHERE id = ?', [result.lastID]);
    res.json({ ...newTheme, is_active: Boolean(newTheme.is_active), is_default: Boolean(newTheme.is_default) });
  } catch (error) {
    console.error('❌ Error in POST /api/settings/ui/themes:', error);
    next(error);
  }
});

// PUT /api/settings/ui/themes/:id - Actualizează o temă
router.put('/ui/themes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color,
      is_active,
      is_default,
    } = req.body;

    // Verifică dacă tema există
    const existing = await runGet('SELECT id FROM ui_themes WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Tema nu a fost găsită' });
    }

    // Dacă este setată ca default, dezactivează celelalte default-uri
    if (is_default) {
      await runExec('UPDATE ui_themes SET is_default = 0 WHERE is_default = 1 AND id != ?', [id]);
    }

    await runExec(
      `UPDATE ui_themes SET
        name = ?,
        primary_color = ?,
        secondary_color = ?,
        background_color = ?,
        text_color = ?,
        accent_color = ?,
        is_active = ?,
        is_default = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        primary_color,
        secondary_color,
        background_color,
        text_color,
        accent_color,
        is_active !== false ? 1 : 0,
        is_default ? 1 : 0,
        id,
      ]
    );

    const updated = await runGet('SELECT * FROM ui_themes WHERE id = ?', [id]);
    res.json({ ...updated, is_active: Boolean(updated.is_active), is_default: Boolean(updated.is_default) });
  } catch (error) {
    console.error('❌ Error in PUT /api/settings/ui/themes/:id:', error);
    next(error);
  }
});

// ========================================
// UI SETTINGS
// ========================================

// Middleware pentru a asigura că tabela ui_settings există
// Skip middleware dacă este pentru /ui/themes (deja procesat)
router.use('/ui', async (req, res, next) => {
  // Skip middleware dacă este pentru /ui/themes (deja procesat)
  // Verificăm req.url sau req.originalUrl pentru a detecta /themes
  if (req.url.startsWith('/themes') || req.originalUrl?.includes('/ui/themes')) {
    return next();
  }
  try {
    console.log('🔍 [Middleware /ui] Creating ui_settings table...');
    const db = await dbPromise;
    // Removed FOREIGN KEY constraint temporarily to avoid issues if ui_themes doesn't exist
    await runExec(`
      CREATE TABLE IF NOT EXISTS ui_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          theme_id INTEGER,
          logo_url TEXT,
          favicon_url TEXT,
          custom_css TEXT,
          custom_js TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ [Middleware /ui] ui_settings table created/verified');
    next();
  } catch (err) {
    console.error('❌ Eroare la verificarea/crearea tabelei ui_settings:', err.message);
    console.error('❌ Error stack:', err.stack);
    next(err);
  }
});

// GET /api/settings/ui - Obține setările UI
router.get('/ui', async (req, res, next) => {
  try {
    console.log('🔍 [GET /api/settings/ui] Starting query...');
    
    // Asigură-te că tabela există înainte de query
    await runExec(`
      CREATE TABLE IF NOT EXISTS ui_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          theme_id INTEGER,
          logo_url TEXT,
          favicon_url TEXT,
          custom_css TEXT,
          custom_js TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ [GET /api/settings/ui] Table verified');
    
    let settings = await runGet('SELECT * FROM ui_settings ORDER BY id DESC LIMIT 1');
    console.log('🔍 [GET /api/settings/ui] Query result:', settings);
    
    // Dacă nu există setări, returnează default-uri
    if (!settings) {
      settings = {
        theme_id: null,
        logo_url: null,
        favicon_url: null,
        custom_css: null,
        custom_js: null,
      };
      console.log('🔍 [GET /api/settings/ui] No settings found, returning defaults');
    }
    
    res.json(settings);
  } catch (error) {
    console.error('❌ Error in GET /api/settings/ui:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Eroare la încărcarea setărilor UI',
      details: error.message 
    });
  }
});

// PUT /api/settings/ui - Actualizează setările UI
router.put('/ui', async (req, res, next) => {
  try {
    const { theme_id, logo_url, favicon_url, custom_css, custom_js } = req.body;

    // Verifică dacă există deja setări
    const existing = await runGet('SELECT id FROM ui_settings ORDER BY id DESC LIMIT 1');

    if (existing) {
      // Actualizează setările existente
      await runExec(
        `UPDATE ui_settings SET
          theme_id = ?,
          logo_url = ?,
          favicon_url = ?,
          custom_css = ?,
          custom_js = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [theme_id || null, logo_url || null, favicon_url || null, custom_css || null, custom_js || null, existing.id]
      );
    } else {
      // Creează setări noi
      await runExec(
        `INSERT INTO ui_settings (theme_id, logo_url, favicon_url, custom_css, custom_js)
         VALUES (?, ?, ?, ?, ?)`,
        [theme_id || null, logo_url || null, favicon_url || null, custom_css || null, custom_js || null]
      );
    }

    const updated = await runGet('SELECT * FROM ui_settings ORDER BY id DESC LIMIT 1');
    res.json(updated);
  } catch (error) {
    console.error('❌ Error in PUT /api/settings/ui:', error);
    next(error);
  }
});

module.exports = router;
