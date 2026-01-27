const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../database');

// Helper functions
async function runGet(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row ?? null);
    });
  });
}

async function runExec(query, params = []) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// GET /api/settings/notifications/preferences
router.get('/preferences', async (req, res, next) => {
  try {
    const db = await dbPromise;
    
    // Verifică dacă tabela notification_preferences există
    const tableExists = await runGet(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notification_preferences'"
    );

    const NOTIFICATION_TYPES = ['order', 'reservation', 'stock', 'system'];
    const CHANNELS = ['in_app', 'email', 'sms', 'push'];

    if (!tableExists) {
      // Returnează preferințe default ca array
      const defaultPrefs = [];
      NOTIFICATION_TYPES.forEach(type => {
        CHANNELS.forEach(channel => {
          defaultPrefs.push({
            notification_type: type,
            channel: channel,
            is_enabled: channel === 'in_app', // Doar in_app enabled by default
          });
        });
      });
      return res.json(defaultPrefs);
    }

    // Obține preferințele din baza de date
    const preferences = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM notification_preferences ORDER BY notification_type, channel', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (!preferences || preferences.length === 0) {
      // Returnează preferințe default dacă nu există în DB
      const defaultPrefs = [];
      NOTIFICATION_TYPES.forEach(type => {
        CHANNELS.forEach(channel => {
          defaultPrefs.push({
            notification_type: type,
            channel: channel,
            is_enabled: channel === 'in_app',
          });
        });
      });
      return res.json(defaultPrefs);
    }

    // Returnează array-ul de preferințe
    res.json(preferences.map(p => ({
      id: p.id,
      notification_type: p.notification_type,
      channel: p.channel,
      is_enabled: p.is_enabled === 1 || p.is_enabled === true,
    })));
  } catch (error) {
    console.error('❌ Error in GET /api/settings/notifications/preferences:', error);
    next(error);
  }
});

// PUT /api/settings/notifications/preferences
router.put('/preferences', async (req, res, next) => {
  try {
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        error: 'Preferences must be an array',
      });
    }

    const db = await dbPromise;

    // Verifică dacă tabela există, dacă nu o creează
    const tableExists = await runGet(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notification_preferences'"
    );

    if (!tableExists) {
      await runExec(`
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          notification_type TEXT NOT NULL,
          channel TEXT NOT NULL,
          is_enabled BOOLEAN DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(notification_type, channel)
        )
      `);
    }

    // Șterge toate preferințele existente
    await runExec('DELETE FROM notification_preferences');

    // Inserează noile preferințe
    for (const pref of preferences) {
      await runExec(
        'INSERT INTO notification_preferences (notification_type, channel, is_enabled) VALUES (?, ?, ?)',
        [pref.notification_type, pref.channel, pref.is_enabled ? 1 : 0]
      );
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/settings/notifications/preferences:', error);
    next(error);
  }
});

module.exports = router;
